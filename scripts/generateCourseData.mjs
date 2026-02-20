import * as sap from './SAPClient.mjs';
import { getMedian } from './HistogramsClient.mjs';

export function getAbout(courseSapInfo) {
    return courseSapInfo.StudyContentDescription;
}

export function getPoints(courseSapInfo) {
    if (courseSapInfo.Points === undefined) {
        return undefined;
    }
    return Number.parseFloat(courseSapInfo.Points);
}

export function getName(courseSapInfo) {
    return courseSapInfo.Name;
}

export function getTests(courseSapInfo) {
    const exams = courseSapInfo.Exams.results.filter(
        (exam) => exam.ExamDate !== null
    );

    if (exams.length === 0) {
        return undefined;
    }

    const tests = exams
        .map((exam) => {
            const epoch = exam.ExamDate.slice(6, -2);
            const date = new Date(Number.parseInt(epoch, 10));
            return {
                category: exam.CategoryCode,
                year: date.getFullYear(),
                monthIndex: date.getMonth(),
                day: date.getDate(),
            };
        })
        .sort((left, right) => {
            if (left.year !== right.year) {
                return left.year - right.year;
            }
            if (left.monthIndex !== right.monthIndex) {
                return left.monthIndex - right.monthIndex;
            }
            return left.day - right.day;
        });

    const first = tests.filter((test) => test.category === 'FI')[0];
    const second = tests.filter((test) => test.category === 'FB')[0];

    function buildTest(test) {
        return {
            year: test.year,
            monthIndex: test.monthIndex,
            day: test.day,
        };
    }

    if (first === undefined) {
        return undefined;
    }

    if (second === undefined) {
        return [buildTest(first), undefined];
    }

    return [buildTest(first), buildTest(second)];
}

export function getConnections(courseSapInfo) {
    const dependencies = [];
    let dependencyGroup = [];

    for (const prereq of courseSapInfo.SmPrereq.results) {
        if (prereq.Bracket === '(') {
            if (dependencyGroup.length > 0) {
                dependencies.push(dependencyGroup);
            }

            dependencyGroup = [];
        }

        if (prereq.ModuleId.trim().replace(/0/g, '') === '') {
            continue;
        }

        dependencyGroup.push(prereq.ModuleId);
    }

    if (dependencyGroup.length > 0) {
        dependencies.push(dependencyGroup);
    }

    const exclusive = [];
    for (const relation of courseSapInfo.SmRelations.results) {
        const relationType = relation.ZzRelationshipKey;
        if (relationType === 'AZEC') {
            exclusive.push(relation.Otjid.slice(2));
        }
    }

    return {
        dependencies,
        adjacent: [],
        exclusive,
    };
}

function getSeasons(courseSapInfo) {
    const seasons = courseSapInfo.ZzOfferpattern;

    switch (seasons) {
        case 'WSSS':
            return ['Winter', 'Spring', 'Summer'];
        case 'WI':
            return ['Winter'];
        case 'WISP':
            return ['Winter', 'Spring'];
        case 'SP':
            return ['Spring'];
        default:
            return undefined;
    }
}

function getCurrent(course, current) {
    if (current === undefined) {
        return undefined;
    }

    const offers = course.SmOfferedPeriodSet.results;
    for (const { Peryr, Perid } of offers) {
        if (Peryr === current.PiqYear && Perid === current.PiqSession) {
            return true;
        }
    }

    return false;
}

async function parseCourse(course, current) {
    const code = course.Otjid;

    const retries = 5;
    const sleepMs = 1000;

    for (let attempt = 1; attempt <= retries; attempt += 1) {
        const errors = [];
        async function handleField(fieldName, fn) {
            try {
                return await fn();
            } catch (error) {
                errors.push({ field: fieldName, error });
                return undefined;
            }
        }

        const parsedCourse = {
            code: code.slice(2),
            median: await handleField('median', async () => getMedian(code)),
            about: await handleField('about', () => getAbout(course)),
            points: await handleField('points', () => getPoints(course)),
            name: await handleField('name', () => getName(course)),
            tests: await handleField('tests', () => getTests(course)),
            connections: await handleField('connections', () =>
                getConnections(course)
            ),
            seasons: await handleField('seasons', () => getSeasons(course)),
            faculty: course.OrgText,
            current: await handleField('current', () =>
                getCurrent(course, current)
            ),
        };

        if (errors.length === 0) {
            return parsedCourse;
        }

        const msg = JSON.stringify(errors);
        console.error(msg);

        if (attempt === retries) {
            throw new Error(
                `Failed to parse course ${code} after ${retries} attempts: ${msg}\n${JSON.stringify(
                    course
                )}`
            );
        }

        console.error(
            `Failed to parse course ${code}, retrying (${attempt}/${retries}): ${msg}`
        );

        await new Promise((resolve) => setTimeout(resolve, sleepMs));
    }
}

async function main(top) {
    const semesterYears = await sap.getSemesterYears();
    console.error(
        semesterYears.length,
        `Semester years: ${semesterYears
            .map(
                ({ PiqSession, PiqYear }) =>
                    `${sap.getSemesterName(PiqSession).en} ${PiqYear}`
            )
            .join(', ')}`
    );
    const currentYear = semesterYears.find(
        ({ IsCurrent, PiqSession }) => IsCurrent >= 0 && PiqSession !== '202'
    );
    if (currentYear === undefined) {
        console.error('Current year not found');
    } else {
        console.error(
            `Current year: ${currentYear.PiqYear} ${sap.getSemesterName(currentYear.PiqSession).en}`
        );
    }

    let courseHeaders = (await sap.getCourses(semesterYears, top)).flat();
    console.error(courseHeaders.length, 'Total course IDs');

    const codesMap = new Map();
    for (const header of courseHeaders) {
        const value = codesMap.get(header.Otjid);
        if (value === undefined) {
            codesMap.set(header.Otjid, header);
        } else {
            const { Peryr: currentHeaderYear, Perid: currentSession } = value;
            if (
                currentHeaderYear < header.Peryr ||
                (currentHeaderYear === header.Peryr &&
                    currentSession < header.Perid)
            ) {
                codesMap.set(header.Otjid, header);
            }
        }
    }
    courseHeaders = Array.from(codesMap.values());

    console.error(
        courseHeaders.length,
        `Unique course IDs: ${courseHeaders
            .map(({ Otjid }) => Otjid)
            .join(', ')}`
    );

    const rawData = (await sap.getCourseData(courseHeaders)).flat();

    const courseData = [];
    for (const raw of rawData) {
        const course = await parseCourse(raw, currentYear);
        courseData.push(course);
    }

    console.error(
        courseData.length,
        `Parsed courses: ${courseData.map(({ code }) => code).join(', ')}`
    );

    console.error('SAP Usage:', JSON.stringify(sap.getUsage()));

    const courseDataMap = [];
    for (const course of courseData) {
        courseDataMap.push([course.code, course]);
    }

    courseDataMap.sort((left, right) => left[0].localeCompare(right[0]));
    return Object.fromEntries(courseDataMap);
}

const args = process.argv.slice(2);
const top = Number.parseInt(args[0], 10);

if (Number.isNaN(top)) {
    throw new Error('Invalid arguments. Expected top as first argument.');
}

console.log(JSON.stringify(await main(top)));

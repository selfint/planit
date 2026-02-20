/// <reference path="./types.d.ts"/>

let totalRequests = 0;
let totalBatches = 0;
let totalBytesSent = 0;
let totalBytesReceived = 0;

export function getUsage() {
    return {
        requests: totalRequests,
        batches: totalBatches,
        sent: formatBytes(totalBytesSent),
        received: formatBytes(totalBytesReceived),
    };
}

async function requestSAP(endpoint, queries, lang = 'he') {
    if (queries.length === 0) {
        return [];
    }

    const url =
        'https://portalex.technion.ac.il/sap/opu/odata/sap/Z_CM_EV_CDIR_DATA_SRV/$batch';

    const boundary = 'batch_1d12-afbf-e3c7';
    const headers = {
        'Accept-Language': lang,
        'User-Agent': '',
        'Content-Type': `multipart/mixed;boundary=${boundary}`,
    };

    function buildRequest(query) {
        const params = new URLSearchParams(query);

        return [
            'Content-Type: application/http\r\n',
            `GET ${endpoint}?${params} HTTP/1.1`,
            'Accept: application/json',
            '\r\n\r\n\r\n',
        ].join('\r\n');
    }

    const requests = queries.map(buildRequest);
    const body = requests.reduceRight(
        (acc, request) => `--${boundary}\r\n${request}` + acc,
        `--${boundary}--\r\n`
    );

    totalBatches += 1;
    totalRequests += queries.length;
    totalBytesSent += body.length;

    console.error(
        `Sending request to '${endpoint}', batch size: ${queries.length}`
    );

    const start = Date.now();

    let response;
    try {
        response = await fetch(url, { method: 'POST', headers, body });
    } catch (error) {
        console.error(error);
        return undefined;
    }

    const duration = Date.now() - start;

    const contentLength = response.headers.get('Content-Length');
    const contentSize = Number.parseInt(contentLength ?? '-1', 10);
    totalBytesReceived += contentSize;
    const size = formatBytes(contentSize);

    console.error(
        `Got response: status=${response.status} size=${size} duration=${duration}ms`
    );

    if (!response.ok) {
        console.error(await response.text());
        return undefined;
    }

    const text = await response.text();
    const contentType = response.headers.get('Content-Type');
    if (contentType === null) {
        console.error(`Request failed, no content type: ${url}`);
        return undefined;
    }

    const responseBoundary = contentType.split('boundary=')[1];
    const blobs = text.split(`--${responseBoundary}`).slice(1, -1);

    if (blobs.length !== queries.length) {
        console.error(
            `Expected ${queries.length} blobs, got ${blobs.length}, treating as error`
        );
        return undefined;
    }

    try {
        return blobs.map((blob, index) => {
            const lines = blob.trim().split('\r\n');

            let results;
            try {
                results = JSON.parse(lines[lines.length - 1]);
            } catch (e) {
                const msg = `Request ${index + 1}/${requests.length} in batch failed '${JSON.stringify(
                    e
                )}':\n${requests[index]}`;
                console.error(msg);
                throw new Error(msg);
            }

            try {
                return results.d.results;
            } catch (e) {
                const msg = `Request ${index + 1}/${requests.length} in batch failed '${JSON.stringify(
                    e
                )}':\n\n---\n${requests[index].trim()}\n\n---\n${JSON.stringify(
                    results,
                    null,
                    4
                )}`;
                console.error(msg);
                throw new Error(msg);
            }
        });
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

async function requestBatch(
    endpoint,
    queries,
    lang = 'he',
    options = {
        maxRetry: 7,
        maxBatchSize: 500,
    }
) {
    let { maxRetry, maxBatchSize } = options;
    maxRetry ??= 7;
    maxBatchSize ??= 500;

    const responses = [];

    if (queries.length > maxBatchSize) {
        console.error(
            `Requesting '${endpoint}' with ${queries.length} queries in ${Math.ceil(
                queries.length / maxBatchSize
            )} batches`
        );
    }

    for (let i = 0; i < queries.length; i += maxBatchSize) {
        const batch = queries.slice(i, i + maxBatchSize);
        console.error(
            `Requesting batch ${i / maxBatchSize + 1}/${Math.ceil(
                queries.length / maxBatchSize
            )}`
        );
        let response = await requestSAP(endpoint, batch, lang);
        let retry = 0;
        let timeoutMs = 1000;
        while (response === undefined) {
            retry += 1;
            if (retry > maxRetry) {
                const msg = `Failed to fetch batch ${i / maxBatchSize + 1}/${Math.ceil(
                    queries.length / maxBatchSize
                )}`;
                console.error(msg);
                throw new Error(msg);
            }

            console.error(
                `Retrying request ${i / maxBatchSize + 1}/${Math.ceil(
                    queries.length / maxBatchSize
                )} (${retry}/${maxRetry})`
            );
            await new Promise((resolve) => setTimeout(resolve, timeoutMs));
            timeoutMs *= 2;

            response = await requestSAP(endpoint, batch, lang);
        }

        responses.push(...response);
    }

    return responses;
}

export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) {
        return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

async function loadChildren(batch) {
    if (batch.length === 0) {
        return [];
    }

    const batchResponses = await requestBatch(
        'TreeOnDemandSet',
        batch.map(({ Otjid, Peryr, Perid }) => ({
            'sap-client': '700',
            $filter: `ParentOtjid eq '${Otjid}' and Peryr eq '${Peryr}' and Perid eq '${Perid}'`,
            $orderby: 'Otjid asc',
            $select: 'Stext,Otjid,Peryr,Perid',
        }))
    );

    if (batchResponses === undefined) {
        throw new Error('Failed fetch tree');
    }

    const batchCourses = batchResponses.map((children) =>
        children
            .filter((child) => child.Otjid.startsWith('SM'))
            .map((child) => child.Otjid)
    );

    const batchGroups = batchResponses.map((children) =>
        children.filter((child) => !child.Otjid.startsWith('SM'))
    );

    const batchLengths = batchGroups.map((group) => group.length);
    const batchChildrenFlat = await loadChildren(batchGroups.flat());

    const batchResults = [];
    let batchOffset = 0;
    for (let i = 0; i < batchLengths.length; i += 1) {
        const length = batchLengths[i];
        const group = batchGroups[i];
        const batchSlice = batchChildrenFlat.slice(
            batchOffset,
            batchOffset + length
        );
        batchOffset += length;

        let courses = batchCourses[i];
        courses = courses.length > 0 ? courses : undefined;

        let children = batchSlice.map(
            ({ courses: nestedCourses, children }, index) => {
                const response = group[index];

                return {
                    Otjid: response.Otjid,
                    Name: {
                        he: response.Stext,
                    },
                    courses: nestedCourses,
                    children,
                };
            }
        );

        children = children.length > 0 ? children : undefined;

        batchResults.push({ courses, children });
    }

    return batchResults;
}

export async function getSemesterYears() {
    const semesters = await requestBatch('SemesterSet', [
        {
            $skip: '0',
            $top: '10000',
            $select: 'PiqYear,PiqSession,IsCurrent',
        },
    ]);

    return semesters
        .flat()
        .map((semester) => {
            delete semester.__metadata;
            return semester;
        })
        .filter((semester) =>
            ['200', '201', '202'].includes(semester.PiqSession)
        );
}

export async function getFaculties(semesterYears) {
    const facultiesSet = 'StudyFieldTilesSet';

    const faculties = await requestBatch(
        facultiesSet,
        semesterYears.map(({ PiqYear, PiqSession }) => ({
            $skip: '0',
            $top: '10000',
            $orderby: 'Prio asc',
            $filter: `PiqYear eq '${PiqYear}' and PiqSession eq '${PiqSession}'`,
            $inlinecount: 'allpages',
            $select: 'ZzOrgId,ZzOrgName,PiqYear,PiqSession',
        })),
        'he'
    ).then((results) =>
        results.flat().map((faculty) => {
            delete faculty.__metadata;
            return faculty;
        })
    );

    for (const faculty of faculties) {
        faculty.Name = {
            he: faculty.ZzOrgName,
        };
    }

    return faculties;
}

export async function getDegrees(faculties) {
    const degrees = await requestBatch(
        'ScObjectSet',
        faculties.map(({ PiqYear, PiqSession, ZzOrgId }) => ({
            'sap-client': '700',
            $skip: '0',
            $top: '10000',
            $orderby: 'ZzAcademicLevel asc,Name asc',
            $filter: `Peryr eq '${PiqYear}' and Perid eq '${PiqSession}' and OrgId eq '${ZzOrgId}' and ZzAcademicLevel eq '1'`,
            $select: 'Name,OrgText,ZzQualifications,Otjid,OrgId,Peryr,Perid',
            $inlinecount: 'allpages',
        })),
        'he'
    );

    for (let degreeIndex = 0; degreeIndex < degrees.length; degreeIndex += 1) {
        const degree = degrees[degreeIndex];
        for (let trackIndex = 0; trackIndex < degree.length; trackIndex += 1) {
            const track = degree[trackIndex];

            track.Name = {
                he: track.Name,
            };

            track.OrgText = {
                he: track.OrgText,
            };

            track.ZzQualifications = {
                he: track.ZzQualifications,
            };

            delete track.__metadata;
        }
    }

    return degrees;
}

export async function getTrackTrees(tracks) {
    return loadChildren(tracks);
}

export function getSemesterName(semester) {
    const semesterNames = new Map([
        ['200', { en: 'Winter', he: 'חורף' }],
        ['201', { en: 'Spring', he: 'אביב' }],
        ['202', { en: 'Summer', he: 'קיץ' }],
    ]);

    return semesterNames.get(semester);
}

export async function getCourses(semesterYears, top = 10000) {
    return requestBatch(
        'SmObjectSet',
        semesterYears.map(({ PiqYear, PiqSession }) => ({
            $skip: 0,
            $top: top,
            $select: 'Otjid,Peryr,Perid',
            $filter: `Peryr eq '${PiqYear}' and Perid eq '${PiqSession}' `,
        }))
    ).then((results) =>
        results.map((response) =>
            response.map((course) => {
                delete course.__metadata;
                return course;
            })
        )
    );
}

export async function getCourseData(courses) {
    return requestBatch(
        'SmObjectSet',
        courses.map(({ Otjid, Peryr, Perid }) => ({
            $expand: 'Exams,SmRelations,SmPrereq,SmOfferedPeriodSet',
            $filter: `Otjid eq '${Otjid}' and Peryr eq '${Peryr}' and Perid eq '${Perid}'`,
            $select: [
                'Otjid',
                'Name',
                'Points',
                'StudyContentDescription',
                'ZzOfferpattern',
                'Exams',
                'SmPrereq',
                'SmRelations',
                'OrgText',
                'SmOfferedPeriodSet',
            ].join(','),
        })),
        'he',
        {
            maxBatchSize: 100,
        }
    ).then((results) =>
        results.map((response) =>
            response.map((course) => {
                delete course.__metadata;
                return course;
            })
        )
    );
}

import { writeFileSync as fsWriteFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as sap from './SAPClient.mjs';

function writeFileSync(path, data) {
    const size = sap.formatBytes(new Blob([data]).size);
    console.error('Writing', path, `(${size})`);
    fsWriteFileSync(path, data, 'utf-8');
}

const cacheDir = join(process.cwd(), 'scripts', '.cache');
const rawCatalogs = join(cacheDir, 'catalogs.raw.json');

function isStructureElement(name) {
    const normalized = name.trim().toLowerCase();
    return normalized === 'מבנה' || normalized === 'structure element';
}

function writeTreeSync(path, tree) {
    let treePath = join(path, tree.Otjid);

    if (isStructureElement(tree.Name.he)) {
        treePath = path;
    } else {
        mkdirSync(treePath, { recursive: true });

        writeFileSync(join(treePath, 'he'), tree.Name.he);
        if (tree.courses !== undefined) {
            writeFileSync(
                join(treePath, 'courses'),
                tree.courses.map((course) => course.slice(2)).join('\n')
            );
        }
    }

    const children = tree.children;
    if (children !== undefined) {
        for (const child of children) {
            writeTreeSync(treePath, child);
        }
    }
}

function writeCatalog(dbPath, catalog) {
    const track = catalog.track;
    const year = track.Peryr;
    const semester = track.Perid;

    const yearSemesterPath = join(dbPath, `${year}_${semester}`);
    const orgId = track.OrgId;
    const orgPath = join(yearSemesterPath, orgId);
    const orgTracks = catalog.tree.children?.at(0);
    if (orgTracks === undefined) {
        console.error('No tracks found for', track.Otjid);
        return;
    }
    const orgTracksPath = join(orgPath, `${track.Otjid}_${orgTracks.Otjid}`);

    mkdirSync(yearSemesterPath, { recursive: true });
    writeFileSync(
        join(yearSemesterPath, 'he'),
        `${year} ${sap.getSemesterName(semester).he}`
    );

    mkdirSync(orgPath, { recursive: true });
    writeFileSync(join(orgPath, 'he'), track.OrgText.he);

    mkdirSync(join(orgTracksPath, 'requirement'), { recursive: true });
    writeFileSync(join(orgTracksPath, 'he'), track.ZzQualifications.he);
    writeFileSync(
        join(orgTracksPath, 'requirement', 'he'),
        track.ZzQualifications.he
    );

    for (const nestedTrack of orgTracks.children ?? []) {
        writeTreeSync(join(orgTracksPath, 'requirement'), nestedTrack);
    }
}

async function main() {
    mkdirSync(cacheDir, { recursive: true });

    const start = Date.now();
    const semesterYears = await sap.getSemesterYears();
    console.log(
        semesterYears.length,
        `Semester years: ${semesterYears
            .map(
                ({ PiqSession, PiqYear }) =>
                    `${sap.getSemesterName(PiqSession).he} ${PiqYear}`
            )
            .join(', ')}`
    );

    const faculties = await sap.getFaculties(semesterYears);
    console.log(
        faculties.length,
        'Faculties:',
        faculties.map((faculty) => faculty.Name.he).join(', ')
    );

    const tracks = await sap
        .getDegrees(faculties)
        .then((degreeList) => degreeList.flat().flat());
    console.log(
        tracks.length,
        'Tracks:',
        tracks.map((track) => track.Otjid).join(', ')
    );

    const trees = await sap.getTrackTrees(tracks);

    const catalogs = [];
    const gotResults = [];
    for (let index = 0; index < tracks.length; index += 1) {
        const track = tracks[index];
        const tree = trees[index];

        if (tree.children !== undefined || tree.courses !== undefined) {
            gotResults.push(track.Otjid);
        }

        const catalog = {
            track,
            tree,
        };

        catalogs.push(catalog);
    }
    console.log(gotResults.length, 'Catalogs:', gotResults.join(', '));
    console.log('SAP Usage:', JSON.stringify(sap.getUsage()));

    const duration = Date.now() - start;
    const durationHour = Math.floor(duration / 3600000);
    const durationMin = Math.floor((duration % 3600000) / 60000);
    const durationSec = Math.floor((duration % 60000) / 1000);
    const durationStr = `${durationHour}:${durationMin}:${durationSec}`;
    console.log('Duration:', durationStr);

    writeFileSync(rawCatalogs, JSON.stringify(catalogs, null, '\t'));
}

void main();

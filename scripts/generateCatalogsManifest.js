import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getSemesterName } from './SAPClient.mjs';

const rawCatalogsPath = join(
    process.cwd(),
    'scripts',
    '.cache',
    'catalogs.raw.json'
);
const manifestPath = join(process.cwd(), 'public', '_data', 'catalogs.json');

function buildManifest(catalogs) {
    const manifest = {};

    for (const catalog of catalogs) {
        const track = catalog.track;
        const rootTree = catalog.tree.children?.at(0);
        if (rootTree === undefined) {
            continue;
        }

        const catalogId = `${track.Peryr}_${track.Perid}`;
        const facultyId = track.OrgId;
        const programId = `${track.Otjid}_${rootTree.Otjid}`;

        if (manifest[catalogId] === undefined) {
            const semester = getSemesterName(track.Perid);
            if (semester === undefined) {
                throw new Error(
                    `Unknown semester '${track.Perid}' for track ${track.Otjid}`
                );
            }
            manifest[catalogId] = {
                he: `${track.Peryr} ${semester.he}`,
            };
        }

        if (manifest[catalogId][facultyId] === undefined) {
            if (typeof track.OrgText?.he !== 'string') {
                throw new Error(
                    `Missing faculty he label for track ${track.Otjid}`
                );
            }
            manifest[catalogId][facultyId] = {
                he: track.OrgText.he,
            };
        }

        if (typeof track.ZzQualifications?.he !== 'string') {
            throw new Error(
                `Missing program he label for track ${track.Otjid}`
            );
        }

        manifest[catalogId][facultyId][programId] = {
            he: track.ZzQualifications.he,
        };
    }

    return manifest;
}

const catalogs = JSON.parse(readFileSync(rawCatalogsPath, 'utf-8'));
const manifest = buildManifest(catalogs);
writeFileSync(manifestPath, JSON.stringify(manifest));

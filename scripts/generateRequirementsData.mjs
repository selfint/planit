import * as fs from 'node:fs';
import { join, dirname, basename } from 'node:path';
import * as sap from './SAPClient.mjs';

const dbPath = join(process.cwd(), 'public', '_catalogs');

function writeFileSync(path, data) {
    const size = sap.formatBytes(new Blob([data]).size);
    console.error('Writing', path, `(${size})`);
    fs.writeFileSync(path, data, 'utf-8');
}

function dirToJson(dir) {
    const subDirs = [];
    const files = [];
    for (const child of fs.readdirSync(dir)) {
        if (child === 'requirementsData.json') {
            continue;
        }
        const childPath = join(dir, child);
        if (fs.statSync(childPath).isDirectory()) {
            subDirs.push(dirToJson(childPath));
        } else {
            let childContent = fs.readFileSync(childPath).toString();
            if (child === 'courses') {
                childContent = childContent.split('\n');
            }
            files.push([child, childContent]);
        }
    }

    return {
        name: basename(dir),
        nested: subDirs,
        ...Object.fromEntries(files),
    };
}

function getDegrees(rootPath) {
    const getSubdirs = (path) =>
        fs
            .readdirSync(path)
            .map((sub) => join(path, sub))
            .filter((sub) => fs.statSync(sub).isDirectory());

    return getSubdirs(rootPath)
        .flatMap(getSubdirs)
        .flatMap(getSubdirs)
        .flatMap(getSubdirs)
        .filter((path) => basename(path) === 'requirement');
}

function main() {
    for (const degree of getDegrees(dbPath)) {
        writeFileSync(
            join(dirname(degree), 'requirementsData.json'),
            JSON.stringify(dirToJson(degree))
        );
    }
}

main();

// @ts-check
/// <reference path="./types.d.ts"/>

import * as fs from 'node:fs';
import { join } from 'node:path';
import * as sap from './SAPClient.mjs';

const outputRoot = join(process.cwd(), 'public', '_data', '_catalogs');
const rawCatalogsPath = join(
    process.cwd(),
    'scripts',
    '.cache',
    'catalogs.raw.json'
);

/**
 * Writes UTF-8 JSON files and logs their size for generation observability.
 *
 * @param {string} path Absolute or cwd-relative output file path.
 * @param {string} data Serialized JSON payload.
 */
function writeFileSync(path, data) {
    const size = sap.formatBytes(new Blob([data]).size);
    console.error('Writing', path, `(${size})`);
    fs.writeFileSync(path, data, 'utf-8');
}

/**
 * Detects catalog nodes that are pure structure wrappers and should not appear
 * as user-facing requirement entries.
 *
 * @param {string} name Label text from SAP `he` request (usually HE, sometimes EN fallback).
 * @returns {boolean} True when the label represents a structure node.
 */
function isStructureElement(name) {
    const normalized = name.trim().toLowerCase();
    return normalized === 'structure element' || normalized === 'מבנה';
}

/**
 * Maps SAP tree nodes into RequirementNode JSON shape.
 *
 * Returns an array because structure-element nodes are flattened out and only
 * contribute their children to the caller.
 *
 * @param {Tree} node
 * @returns {Array<{
 *   name: string;
 *   he: string;
 *   courses?: string[];
 *   nested?: Array<unknown>;
 * }>}
 */
function mapTreeNode(node) {
    if (node?.Name === undefined || typeof node.Name.he !== 'string') {
        throw new Error(
            `Invalid tree node label payload: ${JSON.stringify(node)}`
        );
    }

    const mappedChildren = [];
    for (const child of node.children ?? []) {
        const mapped = mapTreeNode(child);
        if (mapped !== undefined) {
            mappedChildren.push(...mapped);
        }
    }

    if (isStructureElement(node.Name.he)) {
        return mappedChildren;
    }

    /** @type {{
     *   name: string;
     *   he: string;
     *   courses?: string[];
     *   nested?: Array<unknown>;
     * }} */
    const mapped = {
        name: node.Otjid,
        he: node.Name.he,
    };

    if (Array.isArray(node.courses) && node.courses.length > 0) {
        mapped.courses = node.courses.map((courseCode) => courseCode.slice(2));
    }
    if (mappedChildren.length > 0) {
        mapped.nested = mappedChildren;
    }

    return [mapped];
}

/**
 * Builds a program requirement root payload from one raw catalog entry.
 *
 * @param {Catalog} catalog
 * @returns {{
 *   name: string;
 *   he: string;
 *   nested: Array<unknown>;
 * }}
 */
function buildRequirementRoot(catalog) {
    const rootTree = catalog.tree.children?.at(0);
    if (rootTree === undefined) {
        throw new Error(
            `No requirement root in catalog ${catalog.track.Otjid}`
        );
    }

    const nested = [];
    for (const child of rootTree.children ?? []) {
        nested.push(...mapTreeNode(child));
    }

    if (catalog.track.ZzQualifications?.he === undefined) {
        throw new Error(
            `Missing qualification labels for ${catalog.track.Otjid}: ${JSON.stringify(
                catalog.track.ZzQualifications
            )}`
        );
    }

    return {
        name: 'requirement',
        he: catalog.track.ZzQualifications.he,
        nested,
    };
}

/**
 * Computes the output directory for one program requirements file.
 *
 * @param {Catalog} catalog
 * @returns {string}
 */
function getProgramDirectory(catalog) {
    const rootTree = catalog.tree.children?.at(0);
    if (rootTree === undefined) {
        throw new Error(
            `No requirement root in catalog ${catalog.track.Otjid}`
        );
    }

    return join(
        outputRoot,
        `${catalog.track.Peryr}_${catalog.track.Perid}`,
        catalog.track.OrgId,
        `${catalog.track.Otjid}_${rootTree.Otjid}`
    );
}

/**
 * Entrypoint:
 * 1) Clears previous requirements output.
 * 2) Reads raw catalogs cache.
 * 3) Writes exactly one requirementsData.json per program.
 */
function main() {
    fs.rmSync(outputRoot, { recursive: true, force: true });

    /** @type {Catalog[]} */
    const catalogs = JSON.parse(fs.readFileSync(rawCatalogsPath, 'utf-8'));
    for (const catalog of catalogs) {
        if (catalog.tree.children === undefined) {
            continue;
        }

        const programDirectory = getProgramDirectory(catalog);
        fs.mkdirSync(programDirectory, { recursive: true });

        const requirementsJson = JSON.stringify(buildRequirementRoot(catalog));
        writeFileSync(
            join(programDirectory, 'requirementsData.json'),
            requirementsJson
        );
    }
}

main();

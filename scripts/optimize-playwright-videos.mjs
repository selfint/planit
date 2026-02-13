import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const inputRoot = path.join(projectRoot, 'test-results');
const outputRoot = path.join(projectRoot, 'public', 'tutorials');
const targetWidth = Number.parseInt(process.env.PW_VIDEO_WIDTH ?? '1280', 10);
const targetCrf = Number.parseInt(process.env.PW_VIDEO_CRF ?? '34', 10);
const audioBitrate = process.env.PW_VIDEO_AUDIO_BITRATE ?? '96k';

function collectWebmFiles(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    const results = [];

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory() === true) {
            results.push(...collectWebmFiles(fullPath));
            continue;
        }

        if (entry.isFile() === true && fullPath.endsWith('.webm')) {
            results.push(fullPath);
        }
    }

    return results;
}

function sanitizeFileName(name) {
    return name
        .replace(/[^a-zA-Z0-9-_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function buildOutputPath(inputPath, usedNames) {
    const relativePath = path.relative(inputRoot, inputPath);
    const parsed = path.parse(relativePath);
    const parentName = parsed.dir === '' ? '' : path.basename(parsed.dir);
    const baseName =
        parsed.name === 'video' && parentName !== '' ? parentName : parsed.name;
    const safeBaseName = sanitizeFileName(baseName) || 'playwright-video';
    let candidate = `${safeBaseName}.webm`;
    let counter = 1;

    while (usedNames.has(candidate) === true) {
        candidate = `${safeBaseName}-${counter}.webm`;
        counter += 1;
    }

    usedNames.add(candidate);
    return path.join(outputRoot, candidate);
}

function ensureDirectory(directory) {
    if (fs.existsSync(directory) === false) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

if (fs.existsSync(inputRoot) === false) {
    console.error(`Missing input directory: ${inputRoot}`);
    process.exit(1);
}

ensureDirectory(outputRoot);

const inputVideos = collectWebmFiles(inputRoot);

if (inputVideos.length === 0) {
    console.error('No .webm files found under test-results.');
    process.exit(1);
}

const usedNames = new Set();

for (const inputPath of inputVideos) {
    const outputPath = buildOutputPath(inputPath, usedNames);
    const args = [
        '-y',
        '-i',
        inputPath,
        '-vf',
        `scale=${targetWidth}:-2`,
        '-c:v',
        'libvpx-vp9',
        '-b:v',
        '0',
        '-crf',
        targetCrf.toString(),
        '-c:a',
        'libopus',
        '-b:a',
        audioBitrate,
        outputPath,
    ];

    console.log(`Optimizing ${inputPath} -> ${outputPath}`);
    const result = spawnSync('ffmpeg', args, { stdio: 'inherit' });

    if (result.status !== 0) {
        console.error(`ffmpeg failed for ${inputPath}`);
        process.exit(result.status ?? 1);
    }
}

console.log('Video optimization complete.');

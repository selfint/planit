import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const inputRoot = path.join(projectRoot, 'test-results');
const outputDir = path.join(projectRoot, 'public', 'tutorials');
const outputFile = path.join(outputDir, 'first-time-planning-flow-demo.webm');

const targetWidth = Number.parseInt(
    process.env.PW_DEMO_PUBLISH_WIDTH ?? '1920',
    10
);
const targetCrf = Number.parseInt(process.env.PW_DEMO_PUBLISH_CRF ?? '30', 10);
const audioBitrate = process.env.PW_DEMO_PUBLISH_AUDIO_BITRATE ?? '96k';

function collectVideoFiles(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    const results = [];

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory() === true) {
            results.push(...collectVideoFiles(fullPath));
            continue;
        }

        if (entry.isFile() === true && entry.name === 'video.webm') {
            results.push(fullPath);
        }
    }

    return results;
}

function scoreVideoPath(filePath) {
    const lowerPath = filePath.toLowerCase();
    let score = 0;

    if (lowerPath.includes('user-flows')) {
        score += 3;
    }
    if (lowerPath.includes('first') || lowerPath.includes('planning')) {
        score += 4;
    }
    if (lowerPath.includes('hardcoded-course')) {
        score += 2;
    }

    const stat = fs.statSync(filePath);
    score += Math.floor(stat.mtimeMs / 1000);

    return score;
}

function resolveSourceVideo() {
    const explicitInput = process.env.PW_DEMO_VIDEO_INPUT;
    if (typeof explicitInput === 'string' && explicitInput.trim().length > 0) {
        const absoluteInput = path.isAbsolute(explicitInput)
            ? explicitInput
            : path.join(projectRoot, explicitInput);
        if (fs.existsSync(absoluteInput) === false) {
            throw new Error(`PW_DEMO_VIDEO_INPUT not found: ${absoluteInput}`);
        }
        return absoluteInput;
    }

    if (fs.existsSync(inputRoot) === false) {
        throw new Error(
            'Missing test-results directory. Run `pnpm integtest:demo` first.'
        );
    }

    const videos = collectVideoFiles(inputRoot);
    if (videos.length === 0) {
        throw new Error(
            'No Playwright video.webm files found under test-results.'
        );
    }

    return [...videos].sort(
        (left, right) => scoreVideoPath(right) - scoreVideoPath(left)
    )[0];
}

function ensureOutputDirectory() {
    if (fs.existsSync(outputDir) === false) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
}

function hasFfmpeg() {
    const result = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return result.status === 0;
}

function transcodeWithFfmpeg(inputPath, outputPath) {
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

    const result = spawnSync('ffmpeg', args, { stdio: 'inherit' });
    if (result.status !== 0) {
        throw new Error(
            `ffmpeg failed with exit code ${String(result.status)}`
        );
    }
}

function copyWithoutTranscode(inputPath, outputPath) {
    fs.copyFileSync(inputPath, outputPath);
}

function main() {
    const sourceVideo = resolveSourceVideo();
    ensureOutputDirectory();

    console.log(`Publishing demo video from ${sourceVideo}`);
    if (hasFfmpeg()) {
        transcodeWithFfmpeg(sourceVideo, outputFile);
    } else {
        console.warn(
            'ffmpeg not found. Copying source video without re-encoding.'
        );
        copyWithoutTranscode(sourceVideo, outputFile);
    }

    console.log(`Landing demo video published to ${outputFile}`);
}

try {
    main();
} catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
}

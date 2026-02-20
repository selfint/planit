import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function main() {
    const dataDirPath = join(process.cwd(), 'public', '_data');
    const generatedAtPath = join(dataDirPath, 'generatedAt.json');

    mkdirSync(dataDirPath, { recursive: true });
    writeFileSync(
        generatedAtPath,
        JSON.stringify({ timestamp: Date.now() })
    );
}

main();

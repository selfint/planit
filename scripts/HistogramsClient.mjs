const histograms = 'https://michael-maltsev.github.io/technion-histograms';

async function _getMedian(code) {
    code = code.slice(2);

    const url = `${histograms}/${code}/index.min.json`;
    const response = await fetch(url);

    if (!response.ok) {
        const responseCode = response.status;
        if (responseCode === 404) {
            console.error(`Course ${code} median: Status 404 from ${url}`);
            return { status: 'ok', value: undefined };
        }

        const rateLimitRemaining = response.headers.get(
            'x-ratelimit-remaining'
        );
        try {
            if (
                rateLimitRemaining !== null &&
                Number.parseInt(rateLimitRemaining, 10) === 0
            ) {
                const rateLimitReset =
                    response.headers.get('x-ratelimit-reset');
                const rateLimitLimit =
                    response.headers.get('x-ratelimit-limit');
                const rateLimitUsed = response.headers.get('x-ratelimit-used');
                console.error(
                    `Course ${code} median: Rate limit exceeded for ${url}. Rate limit details: Limit=${rateLimitLimit}, Used=${rateLimitUsed}, Remaining=${rateLimitRemaining}, Reset=${rateLimitReset}`
                );
            }
        } catch {
            // Ignore malformed header values.
        }

        console.error(
            `Course ${code} median: Failed to fetch data from ${url}. Status ${responseCode}`
        );

        return { status: 'err', value: responseCode };
    }

    const info = await response.json();
    const allMedians = [];
    let medians = 0;
    let count = 0;

    for (const semester of Object.values(info).slice(-5)) {
        const median = semester.Finals?.median;
        if (
            median !== undefined &&
            median !== null &&
            !Number.isNaN(median) &&
            !Number.isNaN(Number.parseFloat(median))
        ) {
            allMedians.push(median);
            medians += Number.parseFloat(median);
            count += 1;
        }
    }

    if (count === 0) {
        console.error(`Course ${code} median: No median scores found`);
        return { status: 'ok', value: undefined };
    }

    const value = Number.parseFloat((medians / count).toFixed(1));
    console.error(
        `Course ${code} median: Median score is ${value}. All medians: ${allMedians.join(', ')}.`
    );
    return { status: 'ok', value };
}

export async function getMedian(code) {
    let median = await _getMedian(code);

    if (median.status !== 'err') {
        return median.value;
    }

    const retries = 7;
    const sleepMs = 5 * 1000;
    let currentSleepMs = sleepMs;

    for (let i = 0; i < retries; i += 1) {
        console.error(
            `Failed to fetch median for course ${code}. Retrying (${i + 1}/${retries}) in ${(currentSleepMs / 1000).toFixed(0)} seconds...`
        );

        await new Promise((resolve) => setTimeout(resolve, currentSleepMs));
        currentSleepMs *= 2;

        median = await _getMedian(code);

        if (median.status !== 'err') {
            return median.value;
        }
    }

    return undefined;
}

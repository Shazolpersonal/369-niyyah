const iterations = 1000000;

// Setup mock data
const dailyProgress = {};
for (let i = 0; i < 30; i++) {
    dailyProgress[`day-${i}`] = {
        morning: Math.random() > 0.5,
        noon: Math.random() > 0.5,
        night: Math.random() > 0.5,
    };
}

const calendarDays = [];
for (let i = 0; i < 30; i++) {
    calendarDays.push({ dateKey: `day-${i}` });
}

function runOld() {
    let complete = 0;
    let partial = 0;

    for (const cell of calendarDays) {
        const progress = dailyProgress[cell.dateKey];
        if (progress) {
            const count = [progress.morning, progress.noon, progress.night].filter(Boolean).length;
            if (count === 3) complete++;
            else if (count > 0) partial++;
        }
    }
}

function runNew() {
    let complete = 0;
    let partial = 0;

    for (const cell of calendarDays) {
        const progress = dailyProgress[cell.dateKey];
        if (progress) {
            const count = (progress.morning ? 1 : 0) + (progress.noon ? 1 : 0) + (progress.night ? 1 : 0);
            if (count === 3) complete++;
            else if (count > 0) partial++;
        }
    }
}

console.log("Warming up...");
for (let i = 0; i < 10000; i++) {
    runOld();
    runNew();
}

console.log("Running baseline (Old)...");
const startOld = process.hrtime.bigint();
for (let i = 0; i < iterations; i++) {
    runOld();
}
const endOld = process.hrtime.bigint();
const timeOld = Number(endOld - startOld) / 1000000; // ms

console.log("Running optimized (New)...");
const startNew = process.hrtime.bigint();
for (let i = 0; i < iterations; i++) {
    runNew();
}
const endNew = process.hrtime.bigint();
const timeNew = Number(endNew - startNew) / 1000000; // ms

console.log(`\nResults for ${iterations} iterations (30 days/iteration):`);
console.log(`Baseline: ${timeOld.toFixed(2)} ms`);
console.log(`Optimized: ${timeNew.toFixed(2)} ms`);
console.log(`Improvement: ${((timeOld - timeNew) / timeOld * 100).toFixed(2)}% faster`);
console.log(`Speedup: ${(timeOld / timeNew).toFixed(2)}x`);

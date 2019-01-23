import { performance } from 'perf_hooks'

// ─── Communication avec le parent ───
process.on('message', (msg) => {
	if (msg === 'start') process.send!(compute())
})

// ─── Simulation de calcul et d'allocation mémoire ───
export function compute() {
	let memUsageMb = process.memoryUsage().heapUsed / 1024 / 1024
	performance.mark('computeA') // https://nodejs.org/api/perf_hooks.html

	const bigArray = new Array(1e6)
	let i = 0
	while (i < 1e9) i++

	performance.mark('computeB')
	performance.measure('compute', 'computeA', 'computeB')
	const measureSec = performance.getEntriesByName('compute')[0].duration / 1000
	memUsageMb = process.memoryUsage().heapUsed / 1024 / 1024 - memUsageMb

	return { PID: process.pid, measureSec, memUsageMb }
}

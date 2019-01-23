//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: Cluster ::::::::
// ────────────────────────────────────────────────────────────────────────────
//
// https://www.bennadel.com/blog/3234-hello-world-concurrency-in-node-js-using-the-cluster-module
// http://stackabuse.com/setting-up-a-node-js-cluster/
//
// Sous le capot, cluster.fork utilise child_process.fork

import { fork, isMaster, isWorker, worker } from 'cluster'
import { createServer, get } from 'http'
import { cpus } from 'os'
import { compute } from './example-child'

if (isMaster) {
	console.log('Master PID:', process.pid)
	console.log('Nombre de processeurs:', cpus().length)

	cpus().forEach(fork)
} else if (isWorker) {
	const workerServer = createServer((req, res) => {
		// Load balancing entre workers
		// Les workers pivoteront de manière non séquentielle (optimisation round robin)
		const { measureSec, memUsageMb } = compute()
		console.log(`[Worker ${worker.id}] Temps de réponse: ${measureSec}s, Mémoire utilisée: ${memUsageMb}MB`)
	})

	workerServer.listen(8888, '127.0.0.1', () => {
		console.log(`[Worker ${worker.id}] PID: ${worker.process.pid}, serveur écoute localhost:8888`)
		// Simulation de requêtes
		setInterval(get.bind(null, { port: 8888 }), 100)
	})
}

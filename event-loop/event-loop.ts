import { EventEmitter } from 'events'
import { PathLike, readdir, readdirSync } from 'fs'

// ─── Guide ───
// https://nodejs.org/en/docs/guides/blocking-vs-non-blocking/
// https://nodejs.org/en/docs/guides/dont-block-the-event-loop/

//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: Méthode Synchrone ::::::::
// ────────────────────────────────────────────────────────────────────────────
//
// Bloque l'event loop jusqu'à résolution de la tâche I/O.

const files = readdirSync(__dirname)
console.log('lecture synchrone', files)

//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: Méthode Asynchrone ::::::::
// ────────────────────────────────────────────────────────────────────────────
//
// Récupère le callback dans la call stack une fois la tâche I/O résolue.

//
// ═════════ Callback ═════════
//
readdir(__dirname, (err, files) => {
	console.log('lecture asynchrone via callback', files)
})

//
// ═════════ Promise ═════════
//
const readdirPromise = (dir: PathLike) => {
	return new Promise<string[]>((resolve, reject) => {
		readdir(dir, (err, files) => {
			if (err) reject(err)
			resolve(files)
		})
	})
} // = util.promisify(readdir)

readdirPromise(__dirname).then((files) => {
	console.log('lecture asynchrone via promesse', files)
})

//
// ═════════ Async/Await ═════════
//
;(async () => {
	const files = await readdirPromise(__dirname)
	console.log('lecture asynchrone via async/await', files)
})()

//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: Timers ::::::::
// ────────────────────────────────────────────────────────────────────────────
//
// ─── Guide ───
// https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/
// https://nodejs.org/en/docs/guides/timers-in-node/

//
// ═════════ setImmediate ═════════
//
// Permet de reporter une exécution à la prochaine itération de l'event loop.
readdir(__dirname, () => {
	setTimeout(() => console.log('setTimeout'), 0)
	setImmediate(() => console.log('setImmediate arrive avant setTimeout dans un cycle I/O'))
	// En dehors d'un cycle I/O (base du module par ex), l'ordre d'exécution n'est pas déterministe.
})

//
// ═════════ nextTick ═════════
//
// Les callbacks de nextTick s'exécutent tout de suite après l'opération en cours,
// dans la même phase de l'event loop, et avant que celle-ci ne continue.
// Ne peut être annulé contrairement à setImmediate.

// ─── 1 ───
// Permet de créer un vrai callback asynchrone
const fnSync = (data: string, callbackSync: Function) => {
	callbackSync(data.toUpperCase())
}

const fnAsync = (data: string, callbackAsync: Function) => {
	process.nextTick(callbackAsync, data.toUpperCase())
}

fnAsync('callback asynchrone', console.log)
fnSync('callback synchrone', console.log)

// ─── 2 ───
// Permet de reporter l'émission d'un event pour enregistrer correctement le listnener
// (les listeners d'un event emitter sont appelés de manière synchrone)
class Bus extends EventEmitter {
	constructor() {
		super()
		process.nextTick(() => this.emit('init', 'bus initialisé'))
	}
}

new Bus().on('init', console.log)

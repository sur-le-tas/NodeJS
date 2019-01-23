//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: OS module ::::::::
// ────────────────────────────────────────────────────────────────────────────
// Accès simplifié aux infos système et réseau

import * as os from 'os'

const { username } = os.userInfo()
const ifaces = os.networkInterfaces()
console.log(`Hello ${username} ! Super ta machine ${os.type()} ${os.release()} !`)

//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: Process ::::::::
// ────────────────────────────────────────────────────────────────────────────
//

// ─── Variables d'environnement ───
const ENV_VARIABLES = process.env
const NODE_VERSION = process.version

// ─── Arguments CLI ───
const cliArgs = process.argv
const nodeArgs = process.argv.slice(2)
// process.argv[0] === process.execPath
// process.argv[1] === '/chemin/fichier-lancé-par-node.js'

//
// ════════ Process hérite de Event Emitter ════════
//
process.on('exit', (code) => {
	// Réalise une dernière opération synchrone
	// avant que le processus node se termine
	console.log(`Le processus node va quitter avec le code ${code}`)
})

process.once('uncaughtException', (error) => {
	// Event global pour gérer les erreurs déconseillé à utiliser.
	// Utile si besoin de clean et log.
	// Sans handler, Node affiche la Stack trace et quitte.
	// On doit donc manuellement quitter le processus.
	console.error(error)
	process.exit(1)
})

process.stdin.resume() // Permet de tenir l'Event Loop occupée pour éviter que Node se termine.

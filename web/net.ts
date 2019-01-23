//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: Chat Server ::::::::
// ────────────────────────────────────────────────────────────────────────────
//

import { createServer, Socket } from 'net'

// ─── Conservation des sockets connectés ───
const sockets: { [name: string]: Socket } = {}

// ─── Gestion de la connexion ───
const handleConnection = (socket: Socket) => {
	console.log(`Connexion ouverte sur ${socket.remoteAddress}:${socket.remotePort}`)

	let name: string
	socket.write('Votre nom ? ')

	socket.on('data', (data: Buffer) => {
		// Enregistre un nom comme identifiant
		if (!sockets[name]) {
			name = data.toString().trim()
			sockets[name] = socket
			socket.write(`Bonjour ${name} !\n`)
			console.log(`${name} a rejoint le chat`)
			return
		}

		// Ecrit aux autres sockets
		for (const [n, s] of Object.entries(sockets)) {
			if (n === name) return
			s.write(`${name}: ${data.toString()}`)
		}
	})

	socket.on('close', (aErreur: boolean) => {
		delete sockets[name]
		console.log(`Connexion fermée sur ${socket.remoteAddress}:${socket.remotePort}`)
	})

	socket.on('error', (erreur) => {
		console.error(erreur.message)
	})
}

// ─── Lancement du serveur ───
createServer(handleConnection).listen(8888, '127.0.0.1', () => {
	console.log('Serveur écoute sur localhost:8888')
	// Connexion avec netstat: `nc localhost 8888`
	// Connexion avec telnet: `telnet localhost 8888`
})

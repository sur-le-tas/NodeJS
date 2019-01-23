import { Writable, Readable, Duplex, Transform } from 'stream'
import { createWriteStream, readFile, createReadStream } from 'fs'
import { createServer, get } from 'http'

//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: Streams ::::::::
// ────────────────────────────────────────────────────────────────────────────
//
// Très efficace pour gérer la consommation mémoire + Donne la possibilité de pouvoir composer données et code.
// De nombreux modules standards de node implémentent l'interface de stream.
// https://devhints.io/nodejs-stream

//
// ═════════ Implémentation Readable/Writable Streams ═════════
//

// https://nodejs.org/api/stream.html#stream_implementing_a_writable_stream
const outStream = new Writable({
	// J'implémente le comportement de la méthode write.
	// Ici, mon stream writable est l'équivalent de process.stdout.
	write(chunk, encoding, callback) {
		console.log(chunk.toString())
		callback()
	},
})

// https://nodejs.org/api/stream.html#stream_implementing_a_readable_stream
let charCode = 65
const inStream = new Readable({
	// Implémenter read à la création du stream permet de pusher la donnée à la demande.
	read(size) {
		setTimeout(() => {
			if (charCode > 90) {
				this.push(null) // null envoie un signal de type EOF
			} else {
				this.push(String.fromCharCode(charCode++))
			}
		}, 100)
	},
})

//
// ═════════ Duplex/Transform Streams ═════════
//

// Un stream duplex permet d'implémenter les deux types de streams dans le même objet.
// Attention, ces deux streams agiront toujours de manière indépendante.
const inoutDuplex = new Duplex({
	write(chunk, encoding, callback) {
		console.log(chunk.toString())
		callback()
	},
	read(size) {
		this.push('ABC')
		this.push(null)
	},
})

// Un stream transform combine dans une même méthode les comportements de write et read.
// ex: zlib.createGzip()
const lowercaseTransform = new Transform({
	transform(chunk, encoding, callback) {
		this.push(chunk.toString().toLowerCase())
		callback()
	},
})
lowercaseTransform.writable === true
lowercaseTransform.readable === true

// ─── Pipe ───
// pipe permet de transférer la donnée depuis un stream readable vers un stream writable.
// https://nodejs.org/api/stream.html#stream_readable_pipe_destination_options
inStream.pipe(lowercaseTransform).pipe(outStream)

//
// ═════════ Streams dans les modules fs et http ═════════
//

// ─── Création d'un gros fichier grâce aux streams ───
const file = createWriteStream(`${__dirname}/big-file.txt`)
for (let i = 0; i < 1e3; i++) {
	file.write('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore\n')
}
file.end()

// ─── Serveur lisant le fichier via readFile ───
createServer((req, res) => {
	// readFile va lire tout le fichier avant de le passer à l'objet Réponse,
	// ce qui peut demander beaucoup de mémoire.
	readFile(`${__dirname}/big-file.txt`, (err, data) => res.end(data))
}).listen(3000)

// ─── Serveur lisant et transférant le fichier via stream ───
createServer((req, res) => {
	req.readable === true
	res.writable === true

	// En passant bout à bout le fichier à l'objet Réponse, on alloue moins de mémoire.
	const stream = createReadStream(`${__dirname}/big-file.txt`)

	// On transfère bout à bout la donnée du fichier vers l'objet réponse du serveur, grâce à pipe.
	stream.pipe(res)

	// Dans le cas d'un ReadStream, l'event 'close' est émit à la fin.
	// https://nodejs.org/api/fs.html#fs_event_close_1
	stream.on('close', () => res.end())
}).listen(4000)

// ─── Requête GET et récupération de la réponse sous forme de stream ───
get({ port: 4000 }, (res) => {
	res.readable === true
	res.isPaused() === false
	// res est déjà en flowing mode, on consomme la donnée grâce à un listener.
	// https://nodejs.org/api/stream.html#stream_event_data
	res.on('data', (chunk) => console.log(chunk.toString().slice(0, 5)))

	// 'end' est émit quand toute la data a été utilisée.
	// https://nodejs.org/api/stream.html#stream_event_end
	res.on('end', () => console.log('Fin du stream fichier'))
})

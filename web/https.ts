import * as fs from 'fs'
import * as https from 'https'
import { ServerRequest, ServerResponse, ClientRequest, IncomingMessage } from 'http'

//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: Https Server ::::::::
// ────────────────────────────────────────────────────────────────────────────
// http(s).Server hérite de net.Server et de Event Emitter

const server = https.createServer({
	// Création certificat auto-signé :
	// `openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -nodes`
	key: fs.readFileSync(`${__dirname}/ssl-certificate/key.pem`),
	cert: fs.readFileSync(`${__dirname}/ssl-certificate/cert.pem`),
	// (readFileSync acceptable car démarrage du serveur)
})

server.on('request', (req: ServerRequest, res: ServerResponse) => {
	req.readable === true // ServerRequest lit les données d'une requête
	res.writable === true // ServerResponse écrit les données pour répondre
	// Les deux héritent d'Event Emitter

	switch (req.url) {
		case '/api':
			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ data: 'yolo' }))
			break
		case '/home':
			res.writeHead(200, { 'Content-Type': 'text/html' })
			res.end(`<h1>Maison</h1>`)
		case '/':
			res.writeHead(301, { Location: '/home' })
			res.end()
		default:
			res.writeHead(404)
			res.end()
			break
	}
})

server.listen(443, () => {
	console.log('Serveur écoute sur https://localhost')
	// Test avec `curl -i -k https://localhost`
})

//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: Https Client ::::::::
// ────────────────────────────────────────────────────────────────────────────
//

const req: ClientRequest = https.request({ hostname: 'example.com' })
req.writable === true // ClientRequest écrit les données pour requêter

// globalAgent gère les connexions de ClientRequest avec des options prédéfinies
console.log(
	'globalAgent utilisé pour ClientRequest:',
	(req as ClientRequest & { agent: https.Agent }).agent === https.globalAgent
)

// ClientRequest et IncomingMessage héritent d'Event Emitter
req.on('response', (res: IncomingMessage) => {
	res.readable === true // IncomingMessage lit les données d'une réponse
	console.log('Statut IncomingMessage:', res.statusCode)

	res.on('data', (chunk) => console.log('Contenu IncomingMessage:', chunk.toString().slice(0, 63)))
})
req.end()

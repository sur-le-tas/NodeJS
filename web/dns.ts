import { lookup, resolve, reverse } from 'dns'

//
// ═════════ Lookup ═════════
//
// Utilise libuv et résoud l'adresse de la même manière que la commande ping
// en appelant getaddrinfo de manière synchrone.
// https://nodejs.org/docs/latest/api/dns.html#dns_implementation_considerations

lookup('github.com', (err, address) => {
	console.log('Adresse github:', address)
})

//
// ═════════ Resolve ═════════
//
// N'utilise pas libuv et effectue une requête DNS sur le réseau de manière asynchrone.
// https://nodejs.org/docs/latest/api/dns.html#dns_dns_resolve_hostname_rrtype_callback

resolve('github.com', 'MX', (err, addresses) => {
	console.log('Enregistrements MX github:', addresses)
})

//
// ═════════ Reverse ═════════
//
// Fait une requête DNS sur le réseau pour résoudre un nom de domaine.

reverse('192.30.253.112', (err, hostnames) => {
	console.log('Hostnames 192.30.253.122:', hostnames)
})

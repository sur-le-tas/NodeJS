//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: Buffer ::::::::
// ────────────────────────────────────────────────────────────────────────────
// Permet de manipuler des données binaires

// ─── Buffer et string ───
const string = 'Touché'
const buffer = Buffer.from('Touché')
console.log(string, string.length) // 6 = nombre de caractères
console.log(buffer, buffer.length) // 7 = nombre d'octets utilisés

// ─── Espace mémoire assigné ───
const chunk = buffer.slice(0, 1)
// Bien que `slice()` soit une méthode non mutative pour les strings,
// Le buffer original sera affecté car les 2 partagent le même espace mémoire.
chunk[0] = 66 // code ASCII pour lettre B
console.log(buffer.toString()) // Bouché

//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: String Encoder ::::::::
// ────────────────────────────────────────────────────────────────────────────
//
// Permet d'afficher correctement les caractères encodés sur plusieurs octets,
// utilise un buffer interne qui conserve les octets jusqu'à obtention du caractère complet
import { StringDecoder } from 'string_decoder'
const decoder = new StringDecoder('utf8')

for (const byte of [0xe2, 0x82, 0xac]) {
	const chunk = Buffer.from([byte])
	console.log(chunk.toString()) // Affiche '�'
	console.log(decoder.write(chunk)) // N'affiche rien jusqu'au denier octet puis '€'
}

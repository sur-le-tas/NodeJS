import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import { promisify } from 'util'

//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: Manipulation de fichiers ::::::::
// ────────────────────────────────────────────────────────────────────────────
//

// ─── Méthodes de fs promisifiées ───
const mkdir = promisify(fs.mkdir)
const writeFile = promisify(fs.writeFile)
const readdir = promisify(fs.readdir) // Liste fichiers d'un dossier
const exists = promisify(fs.exists) // Vérifie existence d'un fichier/dossier (déprécié pour son callback sans gestion d'erreur)
const stat = promisify(fs.stat) // Agit sur le raccourci si lien symbolique
const lstat = promisify(fs.lstat) // Agit sur le fichier source si lien symbolique
const utimes = promisify(fs.utimes) // manipule dates d'accès du fichier
const unlink = promisify(fs.unlink) // Supprime fichiers
const rmdir = promisify(fs.rmdir) // Supprime dossiers vides

const ONE_DAY_MS = 24 * 60 * 60 * 1000

	// ─── Lancement des scripts ───
;(async () => {
	await seedFakeFiles(`${__dirname}/tmp`)
	await removeOldFiles(`${__dirname}/tmp`)
	console.log("C'est fait ! Nettoyage du reste...")
	await rmr(`${__dirname}/tmp`)
})()

//
// ═════════ Création de faux fichiers ═════════
//
async function seedFakeFiles(dir: string) {
	await mkdir(dir).catch((err) => void 0) // catch si dossier existe déjà

	for (let i = 0; i < 10; i++) {
		const timestampMs = Date.now() - ONE_DAY_MS * i
		const filepath = path.join(dir, `file-${new Date(timestampMs).toLocaleDateString('fr-FR')}`)

		// Ecriture du fichier et manipulation de la date de dernier accès et modification
		await writeFile(filepath, i, 'utf8')
		await utimes(filepath, timestampMs / 1000, timestampMs / 1000)
	}
}

//
// ═════════ Suppression fichiers vieux de plus de X jours ═════════
//
async function removeOldFiles(dir: string) {
	const numberOfDays = await new Promise<number>((resolve) => {
		// Readline: Interface pour lire les streams une ligne à la fois (parfait pour input console)
		const rl = readline.createInterface(process.stdin, process.stdout)
		rl.question('Supprimer les fichiers vieux de plus de combien de jours ? ', (answer) => {
			rl.close()
			resolve(parseInt(answer))
		})
	})

	if (Number.isNaN(numberOfDays)) return

	const filenames = await readdir(dir)
	const filepaths = filenames.map((filename) => path.join(dir, filename))

	await Promise.all(
		filepaths.map(async (filepath) => {
			const { mtimeMs } = await stat(filepath)

			if (Date.now() - mtimeMs > ONE_DAY_MS * numberOfDays) {
				await unlink(filepath)
				console.log(`fichier ${filepath} supprimé`)
			}
		})
	)
}

//
// ═════════ rm -r ═════════
//
async function rmr(dir: string, force?: boolean) {
	if (!(await exists(dir))) return

	if (!force) {
		const confirm = await new Promise<boolean>((resolve) => {
			const rl = readline.createInterface(process.stdin, process.stdout)
			rl.question(`Êtes-vous sûr de vouloir supprimer ${dir} et son contenu ? (O/N) `, (answer) => {
				rl.close()
				if (answer.toLowerCase() !== 'o') resolve(false)
				resolve(true)
			})
		})

		if (!confirm) return
	}

	const filenames = await readdir(dir)
	const filepaths = filenames.map((filename) => path.join(dir, filename))

	await Promise.all(
		filepaths.map(async (filepath) => {
			const filestat = await lstat(filepath)

			if (filestat.isDirectory()) {
				await rmr(filepath, force)
			} else {
				await unlink(filepath)
			}
		})
	)

	await rmdir(dir)
	console.log(`dossier ${dir} supprimé`)
}

import { ChildProcess, exec, execFile, fork, spawn } from 'child_process'
import { promisify } from 'util'

// Module child_process permet de lancer des commandes systèmes
// ou d'autres programmes node, et gérer leur output
// https://nodejs.org/api/child_process.html

//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: spawn ::::::::
// ────────────────────────────────────────────────────────────────────────────
//
// Lance une commande sans avoir à créer de shell.
// Stream l'output à travers stdio. Efficace si gros output.

const childSpawned: ChildProcess = spawn('ls', ['-shSFm'], { cwd: __dirname })

// ─── Lecture des streams stdio ───
childSpawned.stdout.on('data', (out: Buffer) => console.log('stdout (via spawn)', out.toString()))
childSpawned.stderr.on('data', (err: Buffer) => console.error('stderr (via spawn)', err.toString()))

// ─── Events process enfant ───
childSpawned.on('exit', (code, signal) => {
	// Process enfant terminé
	console.log(`child (via spawn) terminé avec code ${code} et signal ${signal}`)
	// code 0 si process n'emet pas d'erreur
	// code 1 si process emet une erreur
	// signal null si process terminé normalement
})

childSpawned.on('close', (code, signal) => {
	// Streams stdio (stdin, stdout, stderr) fermés.
	// Ces streams pouvaient être partagés avec d'autres process enfants.
	// (raison pour laquelle close != exit)
})

childSpawned.on('error', console.error) // Si erreur au spawn ou au kill.

// ─── Pipes ───
const childPipedTo: ChildProcess = spawn('wc', ['-w'])
childSpawned.stdout.pipe(childPipedTo.stdin)
childPipedTo.stdout.on('data', (out: Buffer) => console.log('stdout piped (via spawn)', out.toString()))

//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: exec ::::::::
// ────────────────────────────────────────────────────────────────────────────
//
// Crée un shell (à la différence de spawn).
// Met en mémoire tampon tout l'output avant de le retourner.
// Utile si on veut la syntaxe du shell (pipes, redirections), et que l'output est assez petit.

exec('env | grep -i home', (err, stdout, stderr) => {
	console.log('stdout (via exec)', stdout)
})

// ─── exec promisifié ───
;(async () => {
	const { stdout } = await promisify(exec)('pwd')
	console.log('stdout (via exec promisifié)', stdout)
})()

//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: execFile ::::::::
// ────────────────────────────────────────────────────────────────────────────
//
// Agit comme exec mais ne crée pas de shell

execFile('node', ['--version'], (err, stdout, stderr) => {
	console.log('stdout (via execFile)', stdout)
})

//
// ═════════ Compatibilité Windows ═════════
//
// https://nodejs.org/api/child_process.html#child_process_spawning_bat_and_cmd_files_on_windows
// spawn/execFile ne peuvent pas lancer de fichiers .bat/.cmd (uniquement .exe): utiliser exec,
// ou si ou veut streamer l'output: spawn avec {shell: true} ou la solution ci-dessous

let childCrossPlatform: ChildProcess
const command = 'npm' // .cmd sous windows
const args = ['config', 'get', 'user-agent']

if (process.platform === 'win32') {
	args.unshift(command)
	args.unshift('/c')
	childCrossPlatform = spawn('cmd', args, { stdio: 'inherit' })
} else {
	childCrossPlatform = spawn(command, args, { stdio: 'inherit' })
	// { stdio: 'inherit' } : fusionne l'output avec celui du process parent (plus d'event sur stdio enfant)
	// { stdio: 'ignore' } : ne cherche pas à récupérer l'output
}

//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: Fork ::::::::
// ────────────────────────────────────────────────────────────────────────────
//
// Variation de spawn, établit un canal de communication entre parent et enfant.
// Utile pour déléguer une tâche intensive à un autre process (évite de bloquer le système).

const childForked: ChildProcess = fork('./example-child.ts', [], { cwd: __dirname })
childForked.send('start')
childForked.on('message', (msg) => {
	if (msg.PID) console.log('Retour fork', msg)
})

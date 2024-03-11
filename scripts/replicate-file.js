import fs from 'fs/promises'
import path from 'path'
import readline from 'readline'

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

const filePath = process.argv[2]

if (!filePath) {
	console.error('Usage: node scripts/replicate-file.js "<relative-file-path>"')
	process.exit(1)
}

function ask(question) {
	return new Promise(function (resolve) {
		rl.question(question, ans => {
			resolve(ans)
		})
	})
}

async function findTargetDirectories(startPath, targetDirName, result) {
	const entries = await fs.readdir(startPath, { withFileTypes: true })
	for (const entry of entries) {
		if (entry.isDirectory()) {
			const dirPath = path.join(startPath, entry.name)
			if (entry.name === targetDirName) {
				result.push(dirPath)
			}
			await findTargetDirectories(dirPath, targetDirName, result)
		}
	}
}

async function copyFileToDirectories(filePath, directories) {
	const fileName = path.basename(filePath)
	for (const dir of directories) {
		const destinationPath = path.join(dir, fileName)
		await fs.copyFile(filePath, destinationPath)
		console.log(`Copied to: ${destinationPath.replace(process.cwd(), '')}`)
	}
}

;(async function main() {
	// Extract the target directory name from the file's path
	const targetDirName = path.basename(path.dirname(filePath))
	let targetDirectories = []
	await findTargetDirectories(process.cwd(), targetDirName, targetDirectories)

	// Remove the original file's directory from the list of target directories
	const originalDirPath = path.resolve(path.dirname(filePath))
	const filteredDirectories = targetDirectories.filter(
		dir => path.resolve(dir) !== originalDirPath,
	)

	if (filteredDirectories.length > 0) {
		console.log('Target directories found:')
		filteredDirectories.forEach(dir =>
			console.log(dir.replace(process.cwd(), '')),
		)
		const answer = await ask(
			'Do you want to replicate the file to all of these directories? (Y/N): ',
		)
		if (answer.toLowerCase() === 'y') {
			await copyFileToDirectories(filePath, filteredDirectories)
		} else {
			console.log('Operation canceled.')
		}
	} else {
		console.log('No target directories found.')
	}

	rl.close()
})()

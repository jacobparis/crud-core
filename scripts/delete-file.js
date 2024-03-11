/**
 * Deletes all files with a given relative path from all exercises
 */
import fs from 'fs/promises'
import path from 'path'
import readline from 'readline'

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

const relativePathSegments = process.argv[2].split(path.sep)
const targetFile = relativePathSegments.pop()

if (!relativePathSegments.length || !targetFile) {
	console.error('Usage: node scripts/delete-file.js "<relative-path>"')
	process.exit(1)
}

let filesToDelete = []
await searchAndRemoveFile(process.cwd(), filesToDelete)

if (filesToDelete.length > 0) {
	console.log('Files matching the criteria:')
	filesToDelete.forEach(file => console.log(file.replace(process.cwd(), '')))
	const answer = await ask('Do you want to delete all of these files? (Y/N): ')
	if (answer.toLowerCase() === 'y') {
		for (let file of filesToDelete) {
			await fs.unlink(file)
			console.log(`Removed: ${file.replace(process.cwd(), '')}`)
		}
	} else {
		console.log('No files were removed.')
	}
} else {
	console.log('No files matching the criteria were found.')
}

rl.close()

function ask(question) {
	return new Promise(resolve => {
		rl.question(question, resolve)
	})
}

function checkPathSegments(fullPath) {
	const relativeFullPath = path.relative(process.cwd(), fullPath)
	const pathSegments = relativeFullPath.split(path.sep)
	let match = true
	let lastIndex = -1
	for (let segment of relativePathSegments) {
		const index = pathSegments.indexOf(segment, lastIndex + 1)
		if (index === -1) {
			match = false
			break
		}
		lastIndex = index
	}
	return match
}

async function searchAndRemoveFile(dirPath, filesToDelete) {
	const entries = await fs.readdir(dirPath, { withFileTypes: true })
	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name)
		if (entry.isDirectory()) {
			await searchAndRemoveFile(fullPath, filesToDelete)
		} else if (
			entry.isFile() &&
			entry.name === targetFile &&
			checkPathSegments(fullPath)
		) {
			filesToDelete.push(fullPath)
		}
	}
}

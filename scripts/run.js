/**
 * Run a command in all lessons or chapters in the exercises directory.
 * --chapter and --lesson flags can be used to filter lessons or chapters by either their number or name.
 *
 * Usage: node scripts/run.js  [--chapter <chapter>] [--lesson <lesson>] "<command>"
 */
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import chalk from 'chalk'

const args = process.argv.slice(2)
const command = args[0]

// Extract flags for chapter and lesson
const chapterFlagIndex = args.indexOf('--chapter')
const lessonFlagIndex = args.indexOf('--lesson')
const chapterFilter =
	chapterFlagIndex !== -1 ? args[chapterFlagIndex + 1] : null
const lessonFilter = lessonFlagIndex !== -1 ? args[lessonFlagIndex + 1] : null

if (!command || command.startsWith('--')) {
	console.error(
		'Usage: node scripts/run.js "<command>" [--chapter <chapter>] [--lesson <lesson>]',
	)
	process.exit(1)
}

const exercisesRoot = path.join(process.cwd(), 'exercises')

async function findAndRunCommand(directory) {
	const directories = await findMatchingDirectories(
		directory,
		chapterFilter,
		lessonFilter,
	)
	if (directories.length === 0) {
		console.log('No matching directories found.')
		return
	}

	for (const dir of directories) {
		console.log(chalk.yellow(`${dir.replace(process.cwd(), '')}`))
		await runCommand(command, dir)
	}
}

async function findMatchingDirectories(startPath, chapter, lesson) {
	let directories = []
	const entries = await fs.readdir(startPath, { withFileTypes: true })
	for (const entry of entries) {
		if (entry.isDirectory()) {
			const topLevelDir = path.join(startPath, entry.name)
			if (!matchesChapter(entry.name, chapter)) continue

			const subEntries = await fs.readdir(topLevelDir, { withFileTypes: true })
			for (const subEntry of subEntries) {
				if (subEntry.isDirectory()) {
					const subDirPath = path.join(topLevelDir, subEntry.name)
					if (matchesLesson(subEntry.name, lesson)) {
						directories.push(subDirPath)
					}
				}
			}
		}
	}
	return directories
}

/**
 * Checks if a directory name matches the provided chapter and lesson filters.
 *
 * @param {string} directoryName - The name of the directory to check.
 * @param {string} lesson - The lesson filter. If provided, the directory name must include the lesson number.
 */
function matchesLesson(directoryName, lesson) {
	if (lesson) {
		if (Number(lesson)) {
			const paddedNumber = String(lesson).padStart(2, '0')
			if (!directoryName.startsWith(paddedNumber)) return false
		} else {
			if (!directoryName.includes(lesson)) return false
		}
	}

	return true
}

function matchesChapter(directoryName, chapter) {
	if (chapter) {
		if (Number(chapter)) {
			const paddedNumber = String(chapter).padStart(2, '0')
			if (!directoryName.startsWith(paddedNumber)) return false
		} else {
			if (!directoryName.includes(chapter)) return false
		}
	}

	return true
}

function runCommand(cmd, cwd) {
	return new Promise((resolve, reject) => {
		exec(cmd, { cwd }, (error, stdout, stderr) => {
			const cleanCwd = cwd.replace(process.cwd(), '')
			if (error) {
				console.error(`Error executing command in ${cleanCwd}: ${error}`)
				reject(error)
				return
			}
			if (stdout) console.log(`\n  ${stdout}`.trim())
			if (stderr) console.error(`Errors from ${cleanCwd}:\n${stderr.trim()}`)
			resolve()
		})
	})
}

findAndRunCommand(exercisesRoot).catch(err => {
	console.error(`Failed to execute command: ${err}`)
	process.exit(1)
})

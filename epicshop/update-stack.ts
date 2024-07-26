import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import chalk from "chalk"

const args = process.argv.slice(2)
const projectRoot = args.includes("--project")
  ? args[args.indexOf("--project") + 1]
  : process.cwd()
const targetDir = args.includes("--target")
  ? args[args.indexOf("--target") + 1]
  : process.cwd()
const dryRun = args.includes("--dry-run")

let initialHash = args.includes("--hash")
  ? args[args.indexOf("--hash") + 1]
  : null

const defaultIgnoredPaths = [
  "remix.init",
  "LICENSE.md",
  "CONTRIBUTING.md",
  "docs",
  "tests/e2e/notes.test.ts",
  "tests/e2e/search.test.ts",
  ".github/workflows/version.yml",
]
const ignoredPaths: Array<string> = []
// Consolidated package.json checks
const packageJsonPath = path.join(targetDir, "package.json")
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"))
  const epicStackConfig = packageJson["epic-stack"] || {}

  // Read ignoredPaths from package.json#epic-stack
  const additionalIgnoredPaths = epicStackConfig.ignoredPaths || []
  ignoredPaths.push(...additionalIgnoredPaths)

  // Read initialHash if not provided
  if (!initialHash) {
    initialHash = epicStackConfig.head
  }
}

// Add custom ignore paths from command line arguments
args.forEach((arg, i) => {
  if (arg === "--ignore") {
    ignoredPaths.push(args[i + 1])
  }
})

if (!initialHash) {
  console.error(
    "Error: Could not read package.json#epic-stack.head. Is this an Epic Stack app? You can also provide a --hash argument."
  )
  process.exit(1)
}

const repoUrl = "https://github.com/epicweb-dev/epic-stack.git"
const repoPath = path.join(
  projectRoot,
  "node_modules",
  "@epic-web",
  "epic-stack"
)

function cleanPath(path: string) {
  return path.replace(process.cwd(), "")
}
async function gitCommand(command: string, repoPath: string) {
  return execSync(command, { encoding: "utf8", cwd: repoPath }).trim()
}

async function cloneOrUpdateRepo() {
  if (fs.existsSync(repoPath)) {
    const currentHash = await gitCommand("git rev-parse HEAD", repoPath)
    if (currentHash === initialHash) {
      console.log(cleanPath(repoPath), "is up to date")
      return
    }
    console.log("Updating", cleanPath(repoPath))
    await gitCommand("git fetch --quiet", repoPath)
  } else {
    console.log("Cloning latest epic-stack to", cleanPath(repoPath))
    fs.mkdirSync(repoPath, { recursive: true })
    await gitCommand(
      `git clone --quiet ${repoUrl} ${repoPath}`,
      path.dirname(repoPath)
    )
  }
}

async function getCommitsBetween(
  repoPath: string,
  startHash: string,
  endHash: string = "HEAD"
) {
  const output = await gitCommand(
    `git log --reverse --pretty=format:"%H|%s" ${startHash}..${endHash}`,
    repoPath
  )
  return output.split("\n").map((line) => {
    const [sha, message] = line.split("|")
    return { sha, message }
  })
}

async function getChangedFiles(repoPath: string, sha: string) {
  const output = await gitCommand(
    `git diff-tree --no-commit-id --name-status -r ${sha}`,
    repoPath
  )
  return output.split("\n").map((line) => {
    const [status, file] = line.split("\t")
    return { status, file }
  })
}

async function shouldApply(
  repoPath: string,
  commit: { sha: string },
  newFiles: Array<{ commit: string; file: string }>
) {
  const changedFiles = await getChangedFiles(repoPath, commit.sha)
  for (const { status, file } of changedFiles) {
    if (status === "A") {
      return true // New file created
    }
    if (fs.existsSync(path.join(targetDir, file))) {
      return true // File exists in target directory
    }
    if (newFiles.some((newFile) => newFile.file === file)) {
      return true // File is in the newFiles array
    }
  }
  return false // Only modifies files we don't have
}

async function getFileContent(repoPath: string, sha: string, file: string) {
  try {
    // Escape special characters in the file path
    const escapedFile = file.replace(/\$/g, "\\$")
    const content = await gitCommand(
      `git show ${sha}:"${escapedFile}"`,
      repoPath
    )
    return content
  } catch (error) {
    console.error(
      `Error getting content for ${file} at ${sha}: ${error.message}`
    )
    return null
  }
}

function ensureTrailingNewline(content: string) {
  return content.endsWith("\n") ? content : content + "\n"
}

function shouldIgnorePath(file: string) {
  return [...defaultIgnoredPaths, ...ignoredPaths].some(
    (ignoredPath) => file === ignoredPath || file.startsWith(`${ignoredPath}/`)
  )
}

async function applyCommit(
  repoPath: string,
  commit: { sha: string; message: string },
  targetDir: string
) {
  console.log(
    chalk.green(`#${commit.sha.substring(0, 7)}: `) + `${commit.message}`
  )

  const changedFiles = await getChangedFiles(repoPath, commit.sha)
  for (const { status, file } of changedFiles) {
    if (shouldIgnorePath(file)) {
      console.log(
        dryRun ? "(dry run)" : "",
        chalk.yellow(`SKIP ${status}`),
        `${file}`,
        "(ignored)"
      )
      continue
    }

    const targetPath = path.join(targetDir, file)

    const content = await getFileContent(repoPath, commit.sha, file)
    switch (status) {
      case "A":
        if (content !== null) {
          if (!dryRun) {
            const dirPath = path.dirname(targetPath)
            fs.mkdirSync(dirPath, { recursive: true })
            fs.writeFileSync(targetPath, ensureTrailingNewline(content))
            console.log(dryRun ? "(dry run)" : "", chalk.green("A"), `${file}`)
          }
        }
        break
      case "M":
        if (fs.existsSync(targetPath)) {
          if (content !== null) {
            if (!dryRun) {
              fs.writeFileSync(targetPath, ensureTrailingNewline(content))
            }
            console.log(dryRun ? "(dry run)" : "", chalk.cyan("M"), `${file}`)
          }
        } else {
          console.log(
            dryRun ? "(dry run)" : "",
            chalk.yellow("SKIP M"),
            `${file} (not found)`
          )
        }
        break
      case "D":
        if (fs.existsSync(targetPath)) {
          if (!dryRun) {
            fs.unlinkSync(targetPath)
          }
          console.log(dryRun ? "(dry run)" : "", chalk.red("D"), `${file}`)
        }
        break
      case "R":
        const [oldFile, newFile] = file.split("\t")
        const oldPath = path.join(targetDir, oldFile)
        const newPath = path.join(targetDir, newFile)
        if (fs.existsSync(oldPath)) {
          if (!dryRun) {
            fs.renameSync(oldPath, newPath)
          }
          console.log(
            dryRun ? "(dry run)" : "",
            chalk.magenta("R"),
            `${oldFile} -> ${newFile}`
          )
        } else {
          if (content !== null) {
            if (!dryRun) {
              const dirPath = path.dirname(newPath)
              fs.mkdirSync(dirPath, { recursive: true })
              fs.writeFileSync(newPath, ensureTrailingNewline(content))
            }
            console.log(
              dryRun ? "(dry run)" : "",
              chalk.magenta("A"),
              `${newFile}`
            )
          }
        }
        break
      default:
        console.log(chalk.gray(`Unhandled status ${status} for file: ${file}`))
    }
  }
}

async function main() {
  console.time("Total time to update")

  console.time("Pulled latest changes")
  await cloneOrUpdateRepo()
  console.timeEnd("Pulled latest changes")

  const newFiles: Array<{ commit: string; file: string }> = []
  const instructions: Array<{
    commit: { sha: string; message: string }
    skip: boolean
  }> = []
  console.time("Fetched commits")
  const commits = await getCommitsBetween(repoPath, initialHash!)
  console.log(`Found ${commits.length} commits`)
  console.timeEnd("Fetched commits")

  if (commits.length === 0) {
    console.log("No new commits to process")
    return
  }

  console.log("Applying commits later than", initialHash)
  for (const commit of commits) {
    if (await shouldApply(repoPath, commit, newFiles)) {
      instructions.push({ commit, skip: false })

      const changedFiles = await getChangedFiles(repoPath, commit.sha)
      for (const { status, file } of changedFiles) {
        if (status === "A") {
          newFiles.push({ commit: commit.sha, file })
        }
      }
    } else {
      instructions.push({ commit, skip: true })
    }
  }
  console.time("Applied commits")
  if (dryRun) {
    console.log(chalk.yellow("Dry run mode: No files will be modified"))
  }
  for (const { commit, skip } of instructions) {
    if (!skip) {
      await applyCommit(repoPath, commit, targetDir)
    } else {
      console.log(
        chalk.yellow(`#${commit.sha.substring(0, 7)}: SKIP `) +
          `${commit.message}`
      )
    }
  }

  // Update package.json with the last applied commit hash and ignoredPaths
  const lastAppliedCommit = instructions.filter((i) => !i.skip).pop()?.commit
  if (lastAppliedCommit) {
    const packageJsonPath = path.join(targetDir, "package.json")
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"))
      if (
        !packageJson["epic-stack"] ||
        typeof packageJson["epic-stack"] !== "object"
      ) {
        packageJson["epic-stack"] = {}
      }
      packageJson["epic-stack"].head = lastAppliedCommit.sha
      packageJson["epic-stack"].ignoredPaths = ignoredPaths

      if (!dryRun) {
        fs.writeFileSync(
          packageJsonPath,
          JSON.stringify(packageJson, null, 2) + "\n"
        )
      }
      console.log(
        dryRun ? "(dry run)" : "",
        chalk.cyan("M"),
        `package.json updated epic-stack.head to ${lastAppliedCommit.sha.substring(0, 7)} and added ignoredPaths`
      )
    }
  }

  console.timeEnd("Applied commits")
  console.timeEnd("Total time to update")
}

main()

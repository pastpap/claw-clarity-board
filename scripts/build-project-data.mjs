import fs from 'node:fs/promises'
import path from 'node:path'
import YAML from 'yaml'

const cwd = process.cwd()
const sourceDir = process.env.CLARITY_DATA_DIR
  ? path.resolve(cwd, process.env.CLARITY_DATA_DIR)
  : path.resolve(cwd, 'projects')
const outputFile = path.resolve(cwd, 'src/generated/projects.json')

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true })
}

const parseProjectFile = async (filePath) => {
  const raw = await fs.readFile(filePath, 'utf8')
  return YAML.parse(raw)
}

const validateProject = (project, fileName) => {
  const requiredTopLevel = ['version', 'project', 'identity', 'current_state', 'done', 'next', 'sources', 'sync']
  for (const key of requiredTopLevel) {
    if (!(key in project)) {
      throw new Error(`${fileName} is missing required top-level key: ${key}`)
    }
  }

  if (!project.project?.id || !project.project?.name) {
    throw new Error(`${fileName} must include project.id and project.name`)
  }
}

const build = async () => {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true })
  const yamlFiles = entries
    .filter((entry) => entry.isFile() && (entry.name.endsWith('.yml') || entry.name.endsWith('.yaml')))
    .map((entry) => entry.name)
    .sort()

  const projects = []

  for (const fileName of yamlFiles) {
    const fullPath = path.join(sourceDir, fileName)
    const project = await parseProjectFile(fullPath)
    validateProject(project, fileName)
    projects.push(project)
  }

  await ensureDir(path.dirname(outputFile))
  await fs.writeFile(outputFile, `${JSON.stringify(projects, null, 2)}\n`, 'utf8')

  console.log(`Generated ${projects.length} project summaries from ${sourceDir}`)
}

build().catch((error) => {
  console.error(error)
  process.exit(1)
})

import generatedProjects from '../generated/projects.json'
import type { ProjectSummary } from '../types'

export const projects: ProjectSummary[] = generatedProjects as ProjectSummary[]

export const getProjectById = (id: string) => projects.find((project) => project.project.id === id)

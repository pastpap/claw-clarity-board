import YAML from 'yaml'
import type { ProjectSummary } from '../types'

import ethicflowRaw from '../../projects/ethicflow.yml?raw'
import pathlizrRaw from '../../projects/pathlizr.yml?raw'

const parseProject = (raw: string): ProjectSummary => YAML.parse(raw) as ProjectSummary

export const projects: ProjectSummary[] = [parseProject(ethicflowRaw), parseProject(pathlizrRaw)]

export const getProjectById = (id: string) => projects.find((project) => project.project.id === id)

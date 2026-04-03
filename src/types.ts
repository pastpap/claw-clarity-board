export type ProjectStatus = 'active' | 'paused' | 'blocked' | 'incubating' | 'shipped'
export type RoadmapStatus = 'planned' | 'exploring' | 'active' | 'blocked' | 'later' | 'done'

export interface ProjectSummary {
  version: number
  project: {
    id: string
    name: string
    kind: string
    repo_path: string
    status: ProjectStatus
    visibility: string
    owner: string
  }
  identity: {
    one_liner: string
    current_phase: string
    primary_goal: string
    primary_users: string[]
  }
  current_state: {
    summary: string
    focus: string[]
    blockers: string[]
    risks: string[]
  }
  done: {
    recent_milestones: string[]
  }
  next: {
    roadmap_groups: Array<{
      name: string
      status: RoadmapStatus
      items: string[]
    }>
  }
  sources: {
    canonical_docs: string[]
    memory_refs: string[]
  }
  sync: {
    docs_backed: boolean
    last_updated: string
    last_updated_by: string
    confidence: string
    needs_review: boolean
  }
}

import { useMemo, useState } from 'react'
import './App.css'
import { getProjectById, projects } from './data/projects'
import type { ProjectSummary, ProjectStatus, RoadmapStatus } from './types'

const statusTone: Record<ProjectStatus, string> = {
  active: 'green',
  paused: 'slate',
  blocked: 'red',
  incubating: 'amber',
  shipped: 'blue',
}

const roadmapTone: Record<RoadmapStatus, string> = {
  planned: 'slate',
  exploring: 'amber',
  active: 'green',
  blocked: 'red',
  later: 'violet',
  done: 'blue',
}

function App() {
  const [activeSection] = useState<'projects'>('projects')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const selectedProject = useMemo(
    () => (selectedProjectId ? getProjectById(selectedProjectId) ?? null : null),
    [selectedProjectId],
  )

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Claw Clarity Board</p>
          <h1>Project knowledge, not just task status.</h1>
        </div>
        <div className="header-meta-pill">
          <span className="meta-label">Projects tracked</span>
          <strong>{projects.length}</strong>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <div className="sidebar-section-title">Navigation</div>
          <button className={`sidebar-nav-item ${activeSection === 'projects' ? 'active' : ''}`}>
            <span className="sidebar-nav-dot" />
            <span>Projects</span>
          </button>
        </aside>

        <main className="dashboard-main">
          <div className="dashboard-scroll">
            {!selectedProject ? (
              <ProjectListView onSelectProject={setSelectedProjectId} />
            ) : (
              <ProjectDetailView project={selectedProject} onBack={() => setSelectedProjectId(null)} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function ProjectListView({ onSelectProject }: { onSelectProject: (projectId: string) => void }) {
  return (
    <section className="view-section">
      <div className="view-header">
        <div>
          <p className="section-eyebrow">Projects</p>
          <h2>Tracked projects</h2>
          <p className="section-copy">
            Select a project to view its current phase, roadmap groups, recent milestones, and sync state.
          </p>
        </div>
      </div>

      <div className="project-list-grid">
        {projects.map((project) => (
          <button key={project.project.id} className="project-card" onClick={() => onSelectProject(project.project.id)}>
            <div className="project-card-top">
              <div>
                <h3>{project.project.name}</h3>
                <p>{project.identity.one_liner}</p>
              </div>
              <StatusBadge label={project.project.status} tone={statusTone[project.project.status]} />
            </div>

            <div className="project-card-section">
              <span className="label">Current phase</span>
              <strong>{project.identity.current_phase}</strong>
            </div>

            <div className="project-card-section">
              <span className="label">Current focus</span>
              <ul>
                {project.current_state.focus.slice(0, 3).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="project-card-footer">
              <span>Updated {project.sync.last_updated}</span>
              <span>{project.sync.confidence} confidence</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

function ProjectDetailView({ project, onBack }: { project: ProjectSummary; onBack: () => void }) {
  return (
    <section className="view-section">
      <div className="view-header detail-view-header">
        <div>
          <button className="back-button" onClick={onBack}>
            ← Back to projects
          </button>
          <p className="section-eyebrow">{project.project.kind}</p>
          <h2>{project.project.name}</h2>
          <p className="section-copy">{project.current_state.summary}</p>
        </div>
        <div className="detail-header-meta">
          <StatusBadge label={project.project.status} tone={statusTone[project.project.status]} />
          <div className="meta-stack">
            <span className="label">Phase</span>
            <strong>{project.identity.current_phase}</strong>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <div className="section-heading-row">
            <h3>Current focus</h3>
            <span className="section-hint">What matters now</span>
          </div>
          <ul className="bullet-list">
            {project.current_state.focus.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="section-heading-row">
            <h3>Primary goal</h3>
            <span className="section-hint">Strategic anchor</span>
          </div>
          <p className="body-copy">{project.identity.primary_goal}</p>
          <div className="subsection">
            <span className="label">Primary users</span>
            <ul className="bullet-list compact">
              {project.identity.primary_users.map((user) => (
                <li key={user}>{user}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card wide">
          <div className="section-heading-row">
            <h3>Roadmap groups</h3>
            <span className="section-hint">Structured next phase</span>
          </div>
          <div className="roadmap-groups">
            {project.next.roadmap_groups.map((group) => (
              <div key={group.name} className="roadmap-group">
                <div className="roadmap-group-top">
                  <h4>{group.name}</h4>
                  <StatusBadge label={group.status} tone={roadmapTone[group.status]} />
                </div>
                {group.items.length > 0 ? (
                  <ul className="bullet-list compact">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-copy">No sub-items listed yet.</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card wide">
          <div className="section-heading-row">
            <h3>Recent milestones</h3>
            <span className="section-hint">What’s already done</span>
          </div>
          <ol className="timeline-list">
            {project.done.recent_milestones.map((milestone) => (
              <li key={milestone}>{milestone}</li>
            ))}
          </ol>
        </div>

        <div className="card">
          <div className="section-heading-row">
            <h3>Sources</h3>
            <span className="section-hint">Canonical links</span>
          </div>
          <div className="subsection">
            <span className="label">Canonical docs</span>
            <ul className="bullet-list compact mono-list">
              {project.sources.canonical_docs.map((doc) => (
                <li key={doc}>{doc}</li>
              ))}
            </ul>
          </div>
          <div className="subsection">
            <span className="label">Memory refs</span>
            <ul className="bullet-list compact mono-list">
              {project.sources.memory_refs.map((ref) => (
                <li key={ref}>{ref}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="section-heading-row">
            <h3>Sync state</h3>
            <span className="section-hint">Knowledge freshness</span>
          </div>
          <div className="meta-table">
            <div><span className="label">Docs-backed</span><strong>{project.sync.docs_backed ? 'Yes' : 'No'}</strong></div>
            <div><span className="label">Last updated</span><strong>{project.sync.last_updated}</strong></div>
            <div><span className="label">Updated by</span><strong>{project.sync.last_updated_by}</strong></div>
            <div><span className="label">Confidence</span><strong>{project.sync.confidence}</strong></div>
            <div><span className="label">Needs review</span><strong>{project.sync.needs_review ? 'Yes' : 'No'}</strong></div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatusBadge({ label, tone }: { label: string; tone: string }) {
  return <span className={`status-badge ${tone}`}>{label}</span>
}

export default App

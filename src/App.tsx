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

const roadmapWeights: Record<RoadmapStatus, number> = {
  done: 1,
  active: 0.8,
  exploring: 0.55,
  planned: 0.3,
  later: 0.15,
  blocked: 0.08,
}

const roadmapStatuses: RoadmapStatus[] = ['done', 'active', 'exploring', 'planned', 'later', 'blocked']

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function confidenceScore(confidence: string) {
  switch (confidence.toLowerCase()) {
    case 'high':
      return 95
    case 'medium':
      return 72
    case 'low':
      return 45
    default:
      return 60
  }
}

function computeProjectHealth(project: ProjectSummary) {
  let score = 45
  if (project.sync.docs_backed) score += 20
  score += project.sync.needs_review ? -12 : 8
  score += Math.round((confidenceScore(project.sync.confidence) - 60) * 0.35)
  score += project.current_state.blockers.length === 0 ? 12 : -project.current_state.blockers.length * 10
  score -= Math.min(project.current_state.risks.length * 3, 12)
  return clamp(score, 0, 100)
}

function computeRoadmapMaturity(project: ProjectSummary) {
  const groups = project.next.roadmap_groups
  if (groups.length === 0) return 0

  const total = groups.reduce((sum, group) => sum + roadmapWeights[group.status], 0)
  return Math.round((total / groups.length) * 100)
}

function getRoadmapBreakdown(project: ProjectSummary) {
  return roadmapStatuses.map((status) => ({
    status,
    count: project.next.roadmap_groups.filter((group) => group.status === status).length,
  }))
}

function computePortfolioStats(projectSummaries: ProjectSummary[]) {
  const total = projectSummaries.length
  const active = projectSummaries.filter((project) => project.project.status === 'active').length
  const docsBacked = projectSummaries.filter((project) => project.sync.docs_backed).length
  const avgHealth = total > 0 ? Math.round(projectSummaries.reduce((sum, project) => sum + computeProjectHealth(project), 0) / total) : 0
  return {
    total,
    active,
    docsBacked,
    avgHealth,
  }
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
  const stats = computePortfolioStats(projects)

  return (
    <section className="view-section">
      <div className="view-header">
        <div>
          <p className="section-eyebrow">Projects</p>
          <h2>Tracked projects</h2>
          <p className="section-copy">
            Select a project to view its current phase, roadmap groups, recent milestones, sync state, and overall progress.
          </p>
        </div>
      </div>

      <div className="overview-stats-grid">
        <StatCard label="Total projects" value={String(stats.total)} helper="Tracked in the current dataset" />
        <StatCard label="Active now" value={String(stats.active)} helper="Projects currently in motion" />
        <StatCard label="Docs-backed" value={`${stats.docsBacked}/${stats.total}`} helper="Structured summaries tied to docs" />
        <StatCard label="Average health" value={`${stats.avgHealth}%`} helper="Overall state across tracked projects" />
      </div>

      <div className="project-list-grid">
        {projects.map((project) => {
          const health = computeProjectHealth(project)
          const maturity = computeRoadmapMaturity(project)
          const breakdown = getRoadmapBreakdown(project)

          return (
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

              <div className="project-card-section metric-stack">
                <ProgressMetric label="Project health" value={health} />
                <ProgressMetric label="Roadmap maturity" value={maturity} tone="secondary" />
              </div>

              <div className="project-card-section">
                <div className="mini-chart-header">
                  <span className="label">Roadmap status mix</span>
                  <span className="chart-note">{project.next.roadmap_groups.length} groups</span>
                </div>
                <StatusBreakdownBar breakdown={breakdown} />
              </div>

              <div className="project-card-footer">
                <span>Updated {project.sync.last_updated}</span>
                <span>{project.sync.confidence} confidence</span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function ProjectDetailView({ project, onBack }: { project: ProjectSummary; onBack: () => void }) {
  const health = computeProjectHealth(project)
  const maturity = computeRoadmapMaturity(project)
  const confidence = confidenceScore(project.sync.confidence)
  const breakdown = getRoadmapBreakdown(project)
  const activeCount = project.next.roadmap_groups.filter((group) => group.status === 'active').length

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

      <div className="overview-stats-grid detail-stats-grid">
        <StatCard label="Project health" value={`${health}%`} helper="Docs, blockers, review state, and confidence" />
        <StatCard label="Roadmap maturity" value={`${maturity}%`} helper="Weighted by roadmap-group status" />
        <StatCard label="Recent milestones" value={String(project.done.recent_milestones.length)} helper="Recorded completed progress points" />
        <StatCard label="Active roadmap groups" value={String(activeCount)} helper="Groups currently in active implementation" />
      </div>

      <div className="detail-grid">
        <div className="card wide">
          <div className="section-heading-row">
            <h3>Project state</h3>
            <span className="section-hint">Overall progress signals</span>
          </div>
          <div className="metric-panel-grid">
            <ProgressMetric label="Project health" value={health} large />
            <ProgressMetric label="Roadmap maturity" value={maturity} tone="secondary" large />
            <ProgressMetric label="Knowledge confidence" value={confidence} tone="tertiary" large />
          </div>
          <div className="subsection chart-section">
            <div className="mini-chart-header">
              <span className="label">Roadmap status breakdown</span>
              <span className="chart-note">By roadmap-group state</span>
            </div>
            <StatusBreakdownBar breakdown={breakdown} tall />
            <div className="legend-row">
              {breakdown.filter((item) => item.count > 0).map((item) => (
                <span key={item.status} className="legend-chip">
                  <span className={`legend-swatch ${roadmapTone[item.status]}`} />
                  {item.status}: {item.count}
                </span>
              ))}
            </div>
          </div>
        </div>

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

function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="stat-card">
      <span className="label">{label}</span>
      <strong>{value}</strong>
      <p>{helper}</p>
    </div>
  )
}

function ProgressMetric({
  label,
  value,
  tone = 'primary',
  large = false,
}: {
  label: string
  value: number
  tone?: 'primary' | 'secondary' | 'tertiary'
  large?: boolean
}) {
  return (
    <div className={`progress-metric ${large ? 'large' : ''}`}>
      <div className="progress-metric-head">
        <span className="label">{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="progress-track">
        <div className={`progress-fill ${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function StatusBreakdownBar({
  breakdown,
  tall = false,
}: {
  breakdown: Array<{ status: RoadmapStatus; count: number }>
  tall?: boolean
}) {
  const total = breakdown.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className={`status-breakdown-bar ${tall ? 'tall' : ''}`}>
      {breakdown.map((item) => {
        const width = total === 0 ? 0 : (item.count / total) * 100
        return <span key={item.status} className={`breakdown-segment ${roadmapTone[item.status]}`} style={{ width: `${width}%` }} />
      })}
    </div>
  )
}

function StatusBadge({ label, tone }: { label: string; tone: string }) {
  return <span className={`status-badge ${tone}`}>{label}</span>
}

export default App

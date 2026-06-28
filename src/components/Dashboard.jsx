import { openDetachedWindow } from '../core/detachedWindow'
import { modules } from '../moduleRegistry'
import ModuleCard from './ModuleCard'

function Dashboard() {
  return (
    <main className="dashboard-shell">
      <section className="hero-panel">
        <p className="system-label">K0rp_ware / internal tools</p>
        <h1>Dashboard</h1>
        <p className="hero-copy">
          Small web-based desk parasites for controlled procrastination, ritualized delay, and
          professionally framed non-output.
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="/?app=status-lamp">
            Launch StatusLamp
          </a>
          <button className="ghost-button" type="button" onClick={() => openDetachedWindow('status-lamp')}>
            Enable Desk Parasite Mode
          </button>
        </div>
      </section>

      <section className="module-grid" aria-label="Available modules">
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </section>
    </main>
  )
}

export default Dashboard

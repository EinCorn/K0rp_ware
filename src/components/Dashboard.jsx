import './Dashboard.css'

const releaseUrl = ['https://github.com', 'EinCorn', 'K0rp_ware', 'releases', 'latest'].join('/')

function Dashboard() {
  return (
    <main className="dashboard-shell hub-shell">
      <section className="hero-panel hub-hero">
        <p className="system-label">K0rp_ware / hub</p>
        <h1>Dashboard</h1>
        <p className="hero-copy">
          Local-first desk tools. Each module runs as its own small organism; the hub only exposes
          what is currently stable enough to look at directly.
        </p>
      </section>

      <section className="hub-module-grid" aria-label="Available K0rp_ware apps">
        <article className="module-card hub-module-card">
          <div>
            <p className="system-label">Desktop companion / live</p>
            <h2>ClickAudit</h2>
            <p>
              Aggregate click counter with a local desktop companion, localhost status mirror, and
              pin-on-top control.
            </p>
          </div>
          <div className="module-card-footer">
            <span className="module-status">v0.2</span>
            <div className="module-card-actions">
              <a href="/?app=click-audit">Open web</a>
              <a href={releaseUrl}>Download app</a>
            </div>
          </div>
        </article>

        <article className="module-card hub-module-card">
          <div>
            <p className="system-label">Desktop companion / stable toy</p>
            <h2>Fidget</h2>
            <p>
              Local fidget spinner with click/manual modes, pin-on-top control, rainbow spin feedback,
              and absolutely no measurable business value.
            </p>
          </div>
          <div className="module-card-footer">
            <span className="module-status">v0.2</span>
            <div className="module-card-actions">
              <a href="/?app=fidget">Open web</a>
              <a href={releaseUrl}>Download app</a>
            </div>
          </div>
        </article>

        <article className="module-card hub-module-card">
          <div>
            <p className="system-label">Desktop companion / status toy</p>
            <h2>Bloom</h2>
            <p>
              Status-stone puzzle with green, yellow, and red indicators, slower wave progression,
              satisfying bloom feedback, and a tiny clear-board explosion.
            </p>
          </div>
          <div className="module-card-footer">
            <span className="module-status">v0.2</span>
            <div className="module-card-actions">
              <a href="/?app=bloom">Open web</a>
              <a href={releaseUrl}>Download app</a>
            </div>
          </div>
        </article>
      </section>
    </main>
  )
}

export default Dashboard

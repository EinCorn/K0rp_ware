import ClickAuditBridge from './ClickAuditBridge'
import './Dashboard.css'

function ClickAuditPage() {
  return (
    <main className="dashboard-shell single-module">
      <nav className="hub-nav" aria-label="Hub navigation">
        <a href="/">← K0rp_ware Hub</a>
      </nav>

      <section className="hero-panel compact-hero">
        <p className="system-label">K0rp_ware / desktop companion</p>
        <h1>ClickAudit</h1>
        <p className="hero-copy">
          Local aggregate click counter. The desktop companion exposes a localhost status response;
          this web panel mirrors it when available.
        </p>
      </section>

      <ClickAuditBridge />
    </main>
  )
}

export default ClickAuditPage

import ClickAuditBridge from './ClickAuditBridge'
import './Dashboard.css'

function ClickAuditPage() {
  return (
    <main className="dashboard-shell single-module">
      <nav className="hub-nav" aria-label="Navigace rozcestníku">
        <a href="/">← K0rp_ware pult</a>
      </nav>

      <section className="hero-panel compact-hero">
        <p className="system-label">K0rp_ware / desktop doprovod</p>
        <h1>ClickAudit</h1>
        <p className="hero-copy">
          Lokální souhrnné počítadlo kliků. Desktop doprovod vystavuje stav přes localhost;
          tento webový panel ho zrcadlí, když je k dispozici.
        </p>
      </section>

      <ClickAuditBridge />
    </main>
  )
}

export default ClickAuditPage

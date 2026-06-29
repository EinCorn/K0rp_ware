import './Dashboard.css'

const releaseUrl = ['https://github.com', 'EinCorn', 'K0rp_ware', 'releases', 'latest'].join('/')

function Dashboard() {
  return (
    <main className="dashboard-shell hub-shell">
      <section className="hero-panel hub-hero">
        <p className="system-label">K0rp_ware / rozcestník</p>
        <h1>Řídicí pult</h1>
        <p className="hero-copy">
          Malé lokální nástroje pro řízenou krokrastinaci. Každý modul běží samostatně a pult ukazuje aktuálně schválené appky.
        </p>
      </section>

      <section className="hub-module-grid" aria-label="Dostupné appky K0rp_ware">
        <article className="module-card hub-module-card">
          <div>
            <p className="system-label">Desktop doprovod / živý stav</p>
            <h2>ClickAudit</h2>
            <p>Souhrnné počítadlo kliků s lokálním desktop doprovodem a localhost zrcadlem stavu.</p>
          </div>
          <div className="module-card-footer">
            <span className="module-status">v0.3 dílna</span>
            <div className="module-card-actions">
              <a href="/?app=click-audit">Otevřít web</a>
              <a href={releaseUrl}>Stáhnout appku</a>
            </div>
          </div>
        </article>

        <article className="module-card hub-module-card">
          <div>
            <p className="system-label">Desktop doprovod / stabilní hračka</p>
            <h2>Fidget</h2>
            <p>Lokální fidget spinner s ručním a klikacím režimem, pinem a duhovou zpětnou vazbou.</p>
          </div>
          <div className="module-card-footer">
            <span className="module-status">v0.3 dílna</span>
            <div className="module-card-actions">
              <a href="/?app=fidget">Otevřít web</a>
              <a href={releaseUrl}>Stáhnout appku</a>
            </div>
          </div>
        </article>

        <article className="module-card hub-module-card">
          <div>
            <p className="system-label">Desktop doprovod / stavová hračka</p>
            <h2>Bloom</h2>
            <p>Puzzle se zelenými, žlutými a červenými stavovými kameny a malým efektem při vyčištění celého boardu.</p>
          </div>
          <div className="module-card-footer">
            <span className="module-status">v0.3 dílna</span>
            <div className="module-card-actions">
              <a href="/?app=bloom">Otevřít web</a>
              <a href={releaseUrl}>Stáhnout appku</a>
            </div>
          </div>
        </article>
      </section>
    </main>
  )
}

export default Dashboard

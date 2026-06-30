import './Dashboard.css'
import './KorpVisualTest.css'

const releaseUrl = ['https://github.com', 'EinCorn', 'K0rp_ware', 'releases', 'latest'].join('/')

const modules = [
  {
    id: 'click',
    title: 'ClickAudit',
    label: 'Audit klikání a interakcí.',
    detail: 'Měř. vyhodnocuj. optimalizuj. Bez zbytečného svědectví navíc.',
    appUrl: '/?app=click-audit',
    artClass: 'korp-art-click',
  },
  {
    id: 'fidget',
    title: 'Fidget',
    label: 'Nástroj pro rozptýlení.',
    detail: 'Pomáhá přežít schůzky, status cally a drobné výpadky smyslu.',
    appUrl: '/?app=fidget',
    artClass: 'korp-art-fidget',
  },
  {
    id: 'bloom',
    title: 'Bloom',
    label: 'Sběr drobných myšlenek.',
    detail: 'Nechte je růst. Potom je interně vyhodnoťte jako stavový board.',
    appUrl: '/?app=bloom',
    artClass: 'korp-art-bloom',
  },
]

function Dashboard() {
  return (
    <main className="dashboard-shell hub-shell korp-test-shell">
      <section className="korp-console" aria-label="K0rp_ware testovací řídicí pult">
        <header className="korp-topbar">
          <div className="korp-wordmark" aria-label="K0rp_ware">
            <span className="korp-wordmark-main">KØ<span className="rose">r</span>p</span>
            <span className="korp-wordmark-sub">_ware</span>
          </div>
          <div className="korp-status-strip" aria-label="Stav systému">
            <span><span className="korp-led" aria-hidden="true" />Systém online</span>
            <small>test skin / v0.3 dílna</small>
          </div>
        </header>

        <section className="korp-hero">
          <div className="korp-panel-glyph" aria-hidden="true">☷</div>
          <div>
            <h1>Řídicí pult</h1>
            <p>Schválený přehled malých lokálních nástrojů pro řízenou krokrastinaci.</p>
          </div>
        </section>

        <section className="korp-module-grid" aria-label="Dostupné appky K0rp_ware">
          {modules.map((module) => (
            <article className={`korp-module-card ${module.id}`} key={module.id}>
              <div className={`korp-module-art ${module.artClass}`} aria-hidden="true">
                <span className="korp-art-icon" />
              </div>
              <div className="korp-module-body">
                <div className="korp-module-title-row">
                  <h2>{module.title}</h2>
                  <span className="korp-badge">v0.3 dílna</span>
                </div>
                <p><strong>{module.label}</strong><br />{module.detail}</p>
              </div>
              <div className="korp-module-actions">
                <a href={module.appUrl}>Otevřít web</a>
                <a href={releaseUrl}>Stáhnout appku</a>
              </div>
            </article>
          ))}
        </section>

        <footer className="korp-footer">
          <div className="korp-footer-note">
            <strong>K0rp_ware test verze</strong>
            <span>Vše může být jinak.</span>
          </div>
          <div className="korp-footer-mark" aria-hidden="true"><span>Ø</span></div>
          <div className="korp-footer-help">
            <strong>Potřebujete pomoc?</strong>
            <span>Otevřete znalostní bázi.</span>
          </div>
        </footer>
      </section>
    </main>
  )
}

export default Dashboard

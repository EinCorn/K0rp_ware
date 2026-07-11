import ClickAuditRuntimeModule from './ClickAuditRuntimeModule'
import {
  ClickAuditEmbeddedWindow,
  ClickAuditStandaloneShell,
} from './ClickAuditWindow'

function returnToKorpOs() {
  window.location.assign(window.location.pathname)
}

function ClickAuditPage() {
  const params = new URLSearchParams(window.location.search)
  const windowOnly = params.get('surface') === 'window'

  return (
    <main className={'clickaudit-preview-page' + (windowOnly ? ' is-window-only' : '')}>
      {windowOnly ? (
        <ClickAuditEmbeddedWindow
          onDragStart={(event) => event.preventDefault()}
          onMinimize={returnToKorpOs}
        >
          <ClickAuditRuntimeModule />
        </ClickAuditEmbeddedWindow>
      ) : (
        <ClickAuditStandaloneShell onClose={returnToKorpOs}>
          <ClickAuditRuntimeModule />
        </ClickAuditStandaloneShell>
      )}
    </main>
  )
}

export default ClickAuditPage

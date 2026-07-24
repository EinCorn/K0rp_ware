import { useState } from 'react'
import ClickAuditRuntimeModule from './ClickAuditRuntimeModule'
import { KorpModuleWindowPreview } from './KorpModuleWindow'
import {
  ClickAuditEmbeddedWindow,
  ClickAuditStandaloneShell,
} from './ClickAuditWindow'

function returnToKorpOs() {
  window.location.assign(window.location.pathname)
}

function ClickAuditPage() {
  const [pinned, setPinned] = useState(false)
  const params = new URLSearchParams(window.location.search)
  const windowOnly = params.get('surface') === 'window'

  return (
    <main className={'clickaudit-preview-page' + (windowOnly ? ' is-window-only' : '')}>
      {windowOnly ? (
        <KorpModuleWindowPreview>
          <ClickAuditEmbeddedWindow
            isPinned={pinned}
            onDragStart={(event) => event.preventDefault()}
            onTogglePin={() => setPinned((value) => !value)}
            onMinimize={returnToKorpOs}
            onClose={returnToKorpOs}
          >
            <ClickAuditRuntimeModule />
          </ClickAuditEmbeddedWindow>
        </KorpModuleWindowPreview>
      ) : (
        <ClickAuditStandaloneShell onClose={returnToKorpOs}>
          <ClickAuditRuntimeModule />
        </ClickAuditStandaloneShell>
      )}
    </main>
  )
}

export default ClickAuditPage

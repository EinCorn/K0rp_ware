import { useState } from 'react'
import {
  FidgetEmbeddedWindow,
  FidgetStandaloneShell,
} from './FidgetWindow'
import { KorpModuleWindowPreview } from './KorpModuleWindow'
import './FidgetPage.css'

function returnToKorpOs() {
  window.location.assign(window.location.pathname)
}

function FidgetPage() {
  const [pinned, setPinned] = useState(false)
  const params = new URLSearchParams(window.location.search)
  const windowOnly = params.get('surface') === 'window'

  return (
    <main className={'fidget-preview-page' + (windowOnly ? ' is-window-only' : '')}>
      {windowOnly ? (
        <KorpModuleWindowPreview>
          <FidgetEmbeddedWindow
            isPinned={pinned}
            onDragStart={(event) => event.preventDefault()}
            onTogglePin={() => setPinned((value) => !value)}
            onMinimize={returnToKorpOs}
            onClose={returnToKorpOs}
          />
        </KorpModuleWindowPreview>
      ) : (
        <FidgetStandaloneShell onClose={returnToKorpOs} />
      )}
    </main>
  )
}

export default FidgetPage

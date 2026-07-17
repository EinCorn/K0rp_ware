import {
  FidgetEmbeddedWindow,
  FidgetStandaloneShell,
} from './FidgetWindow'
import './FidgetPage.css'

function returnToKorpOs() {
  window.location.assign(window.location.pathname)
}

function FidgetPage() {
  const params = new URLSearchParams(window.location.search)
  const windowOnly = params.get('surface') === 'window'

  return (
    <main className={'fidget-preview-page' + (windowOnly ? ' is-window-only' : '')}>
      {windowOnly ? (
        <FidgetEmbeddedWindow
          onDragStart={(event) => event.preventDefault()}
          onMinimize={returnToKorpOs}
          closeLabel="Zavřít náhled Fidget"
        />
      ) : (
        <FidgetStandaloneShell onClose={returnToKorpOs} />
      )}
    </main>
  )
}

export default FidgetPage

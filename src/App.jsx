import Dashboard from './components/Dashboard'
import { useClickTelemetry } from './core/useClickTelemetry'
import ArchiveBloom from './modules/archiveBloom/ArchiveBloom'
import ClickAudit from './modules/clickAudit/ClickAudit'
import DopamineFidget from './modules/dopamineFidget/DopamineFidget'
import StatusLamp from './modules/statusLamp/StatusLamp'
import './App.css'
import './modules.css'

const moduleRoutes = {
  'archive-bloom': ArchiveBloom,
  'click-audit': ClickAudit,
  'dopamine-fidget': DopamineFidget,
  'status-lamp': StatusLamp,
}

function App() {
  const params = new URLSearchParams(window.location.search)
  const appId = params.get('app')
  const displayMode = params.get('mode')
  const SelectedModule = moduleRoutes[appId]

  useClickTelemetry(appId ?? 'dashboard')

  if (SelectedModule) {
    return <SelectedModule isDetached={displayMode === 'detached'} />
  }

  return <Dashboard />
}

export default App

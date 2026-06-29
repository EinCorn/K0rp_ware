import BloomPage from './components/BloomPage'
import ClickAuditPage from './components/ClickAuditPage'
import Dashboard from './components/Dashboard'
import FidgetPage from './components/FidgetPage'
import './App.css'

function App() {
  const params = new URLSearchParams(window.location.search)
  const appId = params.get('app')

  if (appId === 'click-audit') {
    return <ClickAuditPage />
  }

  if (appId === 'fidget') {
    return <FidgetPage />
  }

  if (appId === 'bloom') {
    return <BloomPage />
  }

  return <Dashboard />
}

export default App

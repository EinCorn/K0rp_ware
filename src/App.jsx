import ClickAuditPage from './components/ClickAuditPage'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const params = new URLSearchParams(window.location.search)
  const appId = params.get('app')

  if (appId === 'click-audit') {
    return <ClickAuditPage />
  }

  return <Dashboard />
}

export default App

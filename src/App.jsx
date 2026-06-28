import Dashboard from './components/Dashboard'
import StatusLamp from './modules/statusLamp/StatusLamp'
import './App.css'

function App() {
  const params = new URLSearchParams(window.location.search)
  const appId = params.get('app')
  const displayMode = params.get('mode')

  if (appId === 'status-lamp') {
    return <StatusLamp isDetached={displayMode === 'detached'} />
  }

  return <Dashboard />
}

export default App

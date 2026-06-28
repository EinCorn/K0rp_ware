import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import BloomPage from './components/BloomPage.jsx'

const params = new URLSearchParams(window.location.search)
const Root = params.get('app') === 'bloom' ? BloomPage : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)

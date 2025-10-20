import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/tailwind.css'

// diagnostics: surface hidden runtime errors
console.log('Astra booting…')
window.addEventListener('error', (e) => {
  // eslint-disable-next-line no-console
  console.error('window error', e.error || e.message)
})
window.addEventListener('unhandledrejection', (e) => {
  // eslint-disable-next-line no-console
  console.error('unhandledrejection', e.reason)
})

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)



import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import RootErrorBoundary from '@/lib/RootErrorBoundary'
import '@/index.css'

console.log('[entry] script loaded')
const rootElement = document.getElementById('root')
console.log('[entry] root element found', Boolean(rootElement))
if (!rootElement) {
  throw new Error('Root element #root was not found')
}
console.log('[entry] React render start')

ReactDOM.createRoot(rootElement).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
)
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { InstallPrompt } from './components/ui/InstallPrompt'
import './index.css'

registerSW({ onNeedRefresh() {}, onOfflineReady() {} })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <InstallPrompt />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#161d2b',
            color: '#eef2ff',
            border: '1px solid #1e2840',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'DM Sans, sans-serif',
          },
          success: {
            iconTheme: { primary: '#2dd4a0', secondary: '#161d2b' },
          },
          error: {
            iconTheme: { primary: '#f05c5c', secondary: '#161d2b' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)

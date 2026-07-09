import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
// Design-system CSS first, so the app's Tailwind utilities (in index.css)
// load afterward and win when passed via className.
import '@crfrsr/ui/reset.css'
import '@crfrsr/ui/tokens.css'
import '@crfrsr/ui/styles.css'
import './index.css'
import versionData from '../version.json'

// Expose version as window variable
declare global {
  interface Window {
    version: number
  }
}

window.version = versionData.version

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)

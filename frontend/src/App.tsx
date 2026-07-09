import { Routes, Route, Outlet } from 'react-router-dom'
import { ThemeProvider } from '@crfrsr/design-system-react'
import { pokedexTheme } from './theme'
import { PokemonProvider } from './contexts/PokemonContext'
import { StyleProvider } from './contexts/StyleContext'
import { TooltipProvider } from './components/ui/tooltip'
import Header from './components/Header'
import Home from './pages/Home'
import Pokemon from './pages/Pokemon'
import PokemonDetail from './pages/PokemonDetail'
import About from './pages/About'
import Team from './pages/Team'

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-50 w-full">
        <Header />
      </div>
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/pokemon"
            element={
              <>
                <Pokemon />
                <Outlet />
              </>
            }
          >
            <Route path=":id" element={<PokemonDetail />} />
          </Route>
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider theme={pokedexTheme}>
      <TooltipProvider delayDuration={0}>
        <StyleProvider>
          <PokemonProvider>
            <AppContent />
          </PokemonProvider>
        </StyleProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App

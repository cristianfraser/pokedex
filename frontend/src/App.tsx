import { useState, useEffect } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import { PokemonProvider, usePokemonContext } from './contexts/PokemonContext'
import { TooltipProvider } from './components/ui/tooltip'
import Header from './components/Header'
import Home from './pages/Home'
import Pokemon from './pages/Pokemon'
import PokemonDetail from './pages/PokemonDetail'
import About from './pages/About'

function AppContent() {
  const { isPanelExpanded, battleInfoPokemon } = usePokemonContext()
  const [paddingRight, setPaddingRight] = useState('0px')

  // Calculate padding based on panel states
  // PokemonTeam panel: expanded=300px, collapsed=136px
  // BattleInfoPokemon panel: 300px (always expanded when visible)
  // Gap between panels: 8px
  // Right margins: mobile=16px, sm=24px, lg=32px
  
  useEffect(() => {
    const updatePadding = () => {
      const battleInfoWidth = battleInfoPokemon ? 300 : 0
      const gap = battleInfoPokemon ? 8 : 0
      const pokemonTeamWidth = isPanelExpanded ? 300 : 136
      
      // Determine base margin based on window width
      let baseMargin = 16 // mobile
      if (window.innerWidth >= 1024) {
        baseMargin = 32 // lg
      } else if (window.innerWidth >= 640) {
        baseMargin = 24 // sm
      }
      
      const totalWidth = pokemonTeamWidth + gap + battleInfoWidth + baseMargin
      setPaddingRight(totalWidth > 0 ? `${totalWidth}px` : '0px')
    }

    updatePadding()
    window.addEventListener('resize', updatePadding)
    return () => window.removeEventListener('resize', updatePadding)
  }, [isPanelExpanded, battleInfoPokemon])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-50 w-full">
        <Header />
      </div>
      <main
        className="pt-16 transition-all duration-200 ease-in-out"
        style={{
          paddingRight,
          willChange: 'padding-right',
        }}
      >
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
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <TooltipProvider delayDuration={0}>
      <PokemonProvider>
        <AppContent />
      </PokemonProvider>
    </TooltipProvider>
  )
}

export default App

import { Routes, Route, Outlet } from 'react-router-dom'
import { PokemonProvider, usePokemonContext } from './contexts/PokemonContext'
import { TooltipProvider } from './components/ui/tooltip'
import Header from './components/Header'
import Home from './pages/Home'
import Pokemon from './pages/Pokemon'
import PokemonDetail from './pages/PokemonDetail'
import About from './pages/About'

function AppContent() {
  const { isPanelExpanded } = usePokemonContext()
  
  // Calculate padding based on panel state
  // Expanded: 300px + right margin (16px on mobile, 24px on sm, 32px on lg) = 316px/324px/332px
  // Collapsed: 136px + right margin = 152px/160px/168px
  const paddingRight = isPanelExpanded 
    ? 'pr-[316px] sm:pr-[324px] lg:pr-[332px]'
    : 'pr-[152px] sm:pr-[160px] lg:pr-[168px]'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-50 w-full">
        <Header />
      </div>
      <main 
        className={`pt-16 ${paddingRight} transition-all duration-200 ease-in-out`}
        style={{ willChange: 'padding-right' }}
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

import { Routes, Route, Outlet } from 'react-router-dom'
import { PokemonProvider } from './contexts/PokemonContext'
import Header from './components/Header'
import Home from './pages/Home'
import Pokemon from './pages/Pokemon'
import PokemonDetail from './pages/PokemonDetail'
import About from './pages/About'

function App() {
  return (
    <PokemonProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="fixed top-0 left-0 right-0 z-50 w-full">
          <Header />
        </div>
        <main className="pt-[250px]">
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
    </PokemonProvider>
  )
}

export default App

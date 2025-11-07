import { Routes, Route, Outlet } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Pokemon from './pages/Pokemon'
import PokemonDetail from './pages/PokemonDetail'
import About from './pages/About'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
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

export default App

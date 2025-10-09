import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to <span className="text-primary-600">Pokédex</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Discover and explore the amazing world of Pokémon. Find your
            favorite creatures, learn about their abilities, and build your
            ultimate team.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link to="/pokemon">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore Pokémon
                </Button>
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link to="/about">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card hover>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-600 text-xl">🔍</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Search Pokémon
                </h3>
                <p className="text-gray-500">
                  Find any Pokémon by name, type, or ability. Our comprehensive
                  database has information on all known Pokémon species.
                </p>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-600 text-xl">⚡</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Battle Stats
                </h3>
                <p className="text-gray-500">
                  View detailed statistics including HP, Attack, Defense, Speed,
                  and more for each Pokémon.
                </p>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-600 text-xl">🎯</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Type Matchups
                </h3>
                <p className="text-gray-500">
                  Learn about type effectiveness and weaknesses to build the
                  perfect team for any battle.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

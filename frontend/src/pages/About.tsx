import Card from '../components/Card'

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Pokédex
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A modern React application built with TypeScript, Vite, and Tailwind
            CSS to explore the wonderful world of Pokémon.
          </p>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            <b className="bg-gray-200 rounded-md p-1">
              This is a work in progress.
            </b>{' '}
            More features will be added soon.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Technology Stack
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                React 18 with TypeScript
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                Vite for fast development and building
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                Tailwind CSS for styling
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                React Router v6 for navigation
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                Framer Motion for animations
              </li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Features
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                Soon: Responsive design for all devices
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                Soon: Better UX for all pages
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                Modern component architecture
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                TypeScript for type safety
              </li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Backend
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                Simple Express.js server
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                <span>
                  Seeded data thanks to{' '}
                  <a
                    href="https://pokeapi.co/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    PokeAPI
                  </a>
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default About

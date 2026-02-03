import { Link, NavLink } from 'react-router-dom'

const Header = () => {
  return (
    <header
      className={`top-2 right-2 left-2 absolute transition-all md:header-floating sm:header-expanded`}
    >
      <div
        className={`w-full shadow-lg border px-4 sm:px-6 lg:px-8 transition-all header-floating`}
        style={{
          borderRadius: '12px',
          backgroundColor: `rgba(255, 255, 255, 0.7)`,
          backdropFilter: `blur(${10}px)`,
          WebkitBackdropFilter: `blur(${10}px)`,
          borderColor: `rgba(229, 231, 235)`,
          boxShadow: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.1)`,
        }}
      >
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">Pokéteam</span>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/pokemon"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              Pokémon
            </NavLink>
            <NavLink
              to="/team"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              Team
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              About
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header

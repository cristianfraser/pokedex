# Pokédex

A modern React application built with TypeScript, Vite, and Tailwind CSS to explore the wonderful world of Pokémon.

## 🚀 Features

- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling
- **React Router v6** for client-side routing
- **ESLint + Prettier** for code quality and formatting
- **Modern folder structure** with components, pages, hooks, and utils
- **Responsive design** that works on all devices
- **Custom hooks** for common functionality
- **Reusable components** with proper TypeScript interfaces

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with PostCSS and autoprefixer
- **Routing**: React Router v6
- **Code Quality**: ESLint, Prettier
- **Package Manager**: npm
- **Node Version**: 20.10.0 (LTS)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx
│   ├── Button.tsx
│   └── Card.tsx
├── pages/              # Page components
│   ├── Home.tsx
│   ├── Pokemon.tsx
│   └── About.tsx
├── hooks/              # Custom React hooks
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
├── utils/              # Utility functions
│   ├── constants.ts
│   └── helpers.ts
├── App.tsx             # Main app component
├── main.tsx            # Application entry point
└── index.css           # Global styles and Tailwind imports
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20.10.0 or later (use the version specified in `.nvmrc`)
- npm (comes with Node.js)

### Installation

1. **Clone the repository** (if not already done):

   ```bash
   git clone <repository-url>
   cd pokedex
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint to check for code issues
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

## 🎨 Styling

This project uses **Tailwind CSS** for styling with a custom configuration:

- **Primary colors**: Blue-based color palette
- **Typography**: Clean, readable fonts
- **Components**: Reusable button and card components
- **Responsive**: Mobile-first design approach

### Custom CSS Classes

- `.btn` - Base button styles
- `.btn-primary` - Primary button variant
- `.btn-secondary` - Secondary button variant

## 🧩 Components

### Button Component

A flexible button component with multiple variants and sizes:

```tsx
<Button variant="primary" size="lg" onClick={handleClick}>
  Click me
</Button>
```

### Card Component

A versatile card component for content display:

```tsx
<Card hover className="custom-class">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

## 🪝 Custom Hooks

### useLocalStorage

Persist state in localStorage with TypeScript support:

```tsx
const [value, setValue] = useLocalStorage('key', initialValue)
```

### useDebounce

Debounce values for performance optimization:

```tsx
const debouncedValue = useDebounce(searchTerm, 300)
```

## 🛣️ Routing

The app uses React Router v6 with the following routes:

- `/` - Home page
- `/pokemon` - Pokémon database
- `/about` - About page

## 🔧 Configuration

### TypeScript

- Strict mode enabled
- Path mapping configured (`@/*` maps to `src/*`)
- Modern ES2020 target

### ESLint

- React and TypeScript rules
- Prettier integration
- Custom rules for unused variables

### Prettier

- Consistent code formatting
- Semi-colons disabled
- Single quotes preferred
- 2-space indentation

## 📦 Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and formatting: `npm run lint:fix && npm run format`
5. Commit your changes
6. Push to your fork
7. Create a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The UI library
- [Vite](https://vitejs.dev/) - The build tool
- [Tailwind CSS](https://tailwindcss.com/) - The CSS framework
- [TypeScript](https://www.typescriptlang.org/) - The type system
- [React Router](https://reactrouter.com/) - The routing library

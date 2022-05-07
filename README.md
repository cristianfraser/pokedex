# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

# About the assignment

- The chonse API was: https://pokeapi.co/docs
  - There wasn't a specifid endpoint to get Pokémon listed and paginated, so a GET `/pokemon` endpoint was mocked.
  - GET `/pokemon` return a paginated query of Pokémon, allowing filtering by name, Pokédex entry number, or type.
- Houm palette should be used:
  - Inputs use primary color for focus styling. `#ff452b`
  - The primary color is used in the website header. `#ff452b`
  - Houm default black is used `#212121` for text.
- After the first results are loaded, more results are available when scrolling to the bottom of the page.
- Page is responsive by using grid.

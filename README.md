# Corgi Flop

A CorgiCoin-based Faucet game based on [Heavy Bird](https://github.com/marksteve/dtmb) (which is a clone of Flappy Bird) - Flappyception.

## Modernization (v2.0)

This project has been fully modernized with:

- **Phaser 3.80+** - Upgraded from Phaser v1.1.3 to the latest Phaser 3
- **Vite** - Modern build system with hot module replacement
- **ES6 Modules** - Modern JavaScript with import/export
- **Modern CSS** - Converted from LESS to CSS with CSS variables
- **No jQuery** - Removed jQuery dependency, using vanilla JavaScript and Fetch API
- **No Bootstrap** - Removed Bootstrap dependency, using custom responsive CSS
- **Modern HTML5** - Removed IE8 polyfills and outdated markup

## Development

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

This will start a development server at `http://localhost:3000` with hot module replacement.

### Build for Production

```bash
npm run build
```

This will create a production build in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
CorgiFlop/
├── src/
│   ├── scenes/
│   │   └── MainScene.js    # Main game scene (Phaser 3)
│   ├── config.js           # Game configuration constants
│   ├── main.js             # Entry point
│   └── style.css           # Modern CSS with variables
├── assets/                 # Game assets (sprites, audio, images)
├── index.html              # Main game page
├── about.html              # About page
├── donate.html             # Donation page
├── sent.html               # Thank you page
├── package.json
└── vite.config.js
```

## License

This work is licensed under a [Creative Commons Attribution-NonCommercial 4.0 International License](http://creativecommons.org/licenses/by-nc/4.0/).

# FantoCheMemo - Build Instructions

## Project Setup

This project uses **Vite** as a build tool to bundle and minify JavaScript, keeping your code protected and optimized.

### Installation

Install dependencies:
```bash
npm install
```

### Development

To run the development server with hot reload:
```bash
npm run dev
```

This starts a local server at `http://localhost:3000` with automatic refresh when files change.

### Production Build

To create a minified, optimized production build:
```bash
npm run build
```

This generates the optimized files in the `dist/` folder:
- `dist/index.html` - Main HTML file
- `dist/assets/index-[hash].js` - Minified and bundled JavaScript (2.47 kB)
- `dist/assets/*.png` - Optimized images with content hashing

### Preview Production Build

To preview the production build locally:
```bash
npm run preview
```

## Deployment

### Option 1: Deploy the `dist/` Folder
The `dist/` folder contains everything needed to run the game:
- Upload only the contents of the `dist/` folder to your web server
- No need to deploy source files, `node_modules`, or `src/` folder
- The JavaScript is minified and obfuscated for protection

### Option 2: GitHub Pages
```bash
npm run build
```
Then push the `dist/` folder to your GitHub Pages branch.

### Option 3: Static Hosting
Upload the contents of `dist/` to any static hosting service:
- Netlify
- Vercel
- AWS S3
- Azure Static Web Apps
- Any traditional web host (FTP/SFTP)

## Project Structure

```
fantochememo/
├── src/
│   └── game.js          # Main game logic (minified in build)
├── img/                 # Game images
├── dist/                # Production build output (generated)
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── package.json         # npm dependencies
└── README.md           # Project documentation
```

## Key Benefits

✅ **Code Protection** - JavaScript is minified and variable names are obfuscated
✅ **Smaller File Size** - ~2.47 kB gzipped for the entire game logic
✅ **Fast Development** - Hot module reload during development
✅ **Optimized Images** - Assets are processed and hashed for caching
✅ **Easy Deployment** - Just upload the `dist/` folder

## Notes

- The `src/` folder and `node_modules/` are NOT needed for deployment
- Only the `dist/` folder needs to be deployed to production
- Images are automatically copied to the `dist/assets/` folder during build

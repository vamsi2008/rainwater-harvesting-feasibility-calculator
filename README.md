# Rainwater Harvesting Feasibility Calculator

An interactive engineering calculator for estimating rainwater yield, storage requirements, peak runoff flow, demand coverage, and non-potable water allocation.

## Public website

After GitHub Pages finishes deploying, the calculator is available at:

https://vamsi2008.github.io/rainwater-harvesting-feasibility-calculator/

## Run locally

1. Install [Node.js](https://nodejs.org/).
2. Run `npm install`.
3. Run `npm run dev`.

The calculator runs fully in the browser and does not require a Gemini API key.

## Deployment

Every push to the `main` branch triggers the GitHub Actions workflow in `.github/workflows/deploy.yml`. It builds the Vite application and publishes the generated `dist` directory to GitHub Pages.

# NYL Mindshare Map

A public, synthetic demo that shows how advisor meeting briefs become governed intelligence. Built with Next.js 14, Tailwind CSS, D3, and in-memory data generation. No external data or keys required.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000 to explore the demo. The dataset is generated deterministically; use the “Refresh dataset” button to reseed with a new synthetic universe.

## Scripts

```bash
npm run dev     # start dev server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # lint with next lint
npm run test    # run unit tests (Vitest)
```

## Stack
- Next.js 14 App Router
- Tailwind CSS
- D3 force simulation rendered via react-force-graph
- pdf-lib for PDF export
- seedrandom for deterministic synthetic data

All data lives purely in memory so the site is safe to host publicly without configuration.

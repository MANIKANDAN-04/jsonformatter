# JSON Formatter & Compare Tool

A fast, privacy-first JSON formatter, validator & compare tool. Format, minify, diff JSON with inline highlights. No data leaves your browser.

**Live:** [https://jsonformatter-918.pages.dev](https://jsonformatter-918.pages.dev)

Try it now — no login, no ads, no data collection. Just open and use.

## Features

- **JSON Formatter** — Format, minify, and validate JSON with customizable indentation (2 or 4 spaces)
- **JSON Compare** — Side-by-side diff with inline highlights showing added, removed, and changed values
- **Click-to-scroll** — Click any diff in the sidebar to jump to that line in the editor
- **Tree View** — Collapsible tree visualization of JSON structure
- **Dark / Light Theme** — Toggle between themes, persisted across sessions
- **Drag & Drop** — Drop `.json` files directly into the editor
- **Privacy First** — Everything runs locally in your browser. No data is sent to any server.
- **Copy & Download** — Export formatted JSON or diff reports

## Tech Stack

- React 18 + TypeScript
- Vite 5
- Custom CSS (dark/light theming via CSS variables)

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Build

```bash
npm run build
```

Output goes to `dist/` — ready for static hosting.

## Deployment

This project is deployed on **Cloudflare Pages**. Every push to `main` triggers an automatic build and deploy.

## License

MIT

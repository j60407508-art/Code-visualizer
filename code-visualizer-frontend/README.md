# Code Visualizer — Frontend

A React + Vite app that turns pasted Java code into a live architecture diagram.
Paste a class/interface hierarchy into the Monaco editor on the left; the app
debounces your input, sends it to the backend parser, and renders the
resulting classes, interfaces, and their relationships (inheritance,
implementation, dependency) as a graph on the right using React Flow.

It also flags basic design pattern signatures (Singleton, Factory) it detects
in your code.

## Requirements

- Node 18+
- The [code-visualizer-backend](../code-visualizer-backend) running locally (default: `http://localhost:8080`)

## Setup

```bash
npm install
cp .env.example .env   # adjust VITE_API_URL if your backend runs elsewhere
npm run dev
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally

## How it works

1. You type/paste Java code into the Monaco editor.
2. 1.5s after you stop typing, the code is sent to `POST /api/parser/analyze` on the backend.
3. The backend parses it with JavaParser, classifies each class/interface, and returns nodes + edges.
4. The frontend renders that as a React Flow graph.
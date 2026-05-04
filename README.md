# Helpdesk

AI-powered ticket management system. Bun workspaces monorepo with an Express+TypeScript API server and a React+TypeScript+Vite client.

## Prerequisites

- [Bun](https://bun.sh) >= 1.3
- PostgreSQL (added in a later phase)

## Layout

```
.
├── server/   # Express + TypeScript API
└── client/   # React + TypeScript + Vite + Tailwind + React Router
```

## Getting started

```bash
bun install        # install all workspace deps
bun run dev        # start server and client in parallel
```

Individual apps:

```bash
bun run dev:server # http://localhost:4000
bun run dev:client # http://localhost:5174 (proxies /api -> server)
```

## Scripts

- `bun run dev` — run both apps in parallel
- `bun run build` — typecheck server, build client
- `bun run typecheck` — typecheck both apps

# Helpdesk — Project Notes for Claude

AI-powered ticket management system. See `project-scope.md`, `tech-stack.md`, and `implementation-plan.md` for the full spec.

## Stack

- **Runtime / package manager:** Bun 1.3+ (workspaces). Not Node/npm.
- **Server:** Express 5 + TypeScript, `server/` workspace, port **4000**.
- **Client:** React 19 + Vite 6 + TypeScript + Tailwind v4 + React Router v7, `client/` workspace, port **5174** (Vite will auto-bump if taken).
- **DB:** PostgreSQL via Prisma (added in Phase 4).
- **AI:** Anthropic Claude API (added in Phase 5).
- **Email:** SendGrid or Mailgun (Phase 6).

## Layout

```
helpdesk/
├── package.json     # workspaces: ["client", "server"]
├── server/          # Express API
│   └── src/index.ts
└── client/          # Vite + React app
    └── src/
```

## Commands

Always run from the repo root unless noted.

```bash
bun install           # install all workspace deps
bun run dev           # both apps in parallel
bun run dev:server    # server only — http://localhost:4000
bun run dev:client    # client only — http://localhost:5174
```

## Conventions

- The Vite client proxies `/api/*` → `http://localhost:4000`. Always call the API as `/api/...` from the client; no CORS middleware on the server (will be added in Phase 2 with a strict origin allowlist when sessions land).
- Server is ESM (`"type": "module"`). Use `import`, not `require`.
- Bun runs TS directly — no separate transpile step for the server. Dev uses `bun run --hot src/index.ts`.
- Strict TS everywhere (`strict: true`, `noUncheckedIndexedAccess: true` on the server).

## Phase status

Currently on **Phase 1 (Project Setup)** — scaffold complete. Phase 2 (Auth) is next: login page, session middleware, route protection. CORS gets added then.

## Documentation lookup — use context7

When working on this project and you need API syntax, config, or migration info for any library or framework here (Bun, Express, React, Vite, Tailwind, React Router, Prisma, Anthropic SDK, SendGrid/Mailgun), use the **context7** MCP server to fetch current docs rather than relying on training data. Workflow:

1. `mcp__context7__resolve-library-id` with the library name to get the Context7 ID.
2. `mcp__context7__query-docs` with that ID and a specific question.
3. Retry with `researchMode: true` if the first answer is thin.

Do this even for libraries you think you know — versions move fast (Tailwind v4, React Router v7, Express 5 all have breaking changes from prior majors).

Skip context7 for: refactoring, business-logic debugging, code review, general programming concepts.

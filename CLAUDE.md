# Helpdesk — Claude Project Notes

AI-powered ticket management system. Keep work focused and avoid broad project scans.

## Stack

- Package manager/runtime: Bun 1.3+ workspaces
- Server: Express 5 + TypeScript, `server/`, port 4000
- Client: React 19 + Vite 6 + TypeScript + Tailwind v4 + React Router v7, `client/`, port 5174
- DB: PostgreSQL via Prisma
- AI: Anthropic Claude API
- Email: SendGrid or Mailgun

## Repo layout

```text
helpdesk/
├── package.json
├── server/
│   └── src/index.ts
└── client/
    └── src/
```

## Commands

Run from repo root:

```bash
bun install
bun run dev
bun run dev:server
bun run dev:client
```

## Project conventions

- Use Bun commands, not npm/node commands.
- Client API calls should use `/api/...`.
- Vite proxies `/api/*` to `http://localhost:4000`.
- Server is ESM. Use `import`, not `require`.
- Bun runs TypeScript directly.
- TypeScript is strict.


## Token-saving workflow

- Do not scan the whole project by default.
- First inspect only files directly related to the task.
- Before editing more than 2–3 files, list the planned files and reason briefly.
- Do not refactor unrelated files.
- Keep existing UI and structure unless asked.
- Prefer small focused changes.

## Documentation lookup

Use Context7 only when:
- version-specific syntax is needed,
- an error suggests outdated API usage,
- the user explicitly asks to check docs.

Do not use Context7 for simple edits, refactoring, UI changes, or normal business logic.

# Helpdesk — Claude Project Notes

AI-powered ticket management system. Keep work focused and avoid broad project scans.

## Stack

- Package manager/runtime: Bun 1.3+ workspaces (`client/`, `core/`, `server/`)
- Server: Express 5 + TypeScript, `server/`, port 4000
- Client: React 19 + Vite 6 + TypeScript + Tailwind v4 + React Router v7, `client/`, port 5174
- Shared: `@helpdesk/core` package at `core/` — zod schemas and types shared by client + server
- DB: PostgreSQL via Prisma 7
- Auth: better-auth (email/password)
- Forms: react-hook-form + zod
- UI: shadcn/ui (Radix, Nova preset, neutral) + Lucide icons
- AI: Anthropic Claude API
- Email: SendGrid or Mailgun

## Key paths

- `server/src/index.ts` — Express entry, mounts `/api/auth/*splat`
- `server/src/lib/auth.ts` — better-auth server instance
- `server/src/lib/db.ts` — Prisma client (import from here, not from `generated/`)
- `server/src/middleware/require-auth.ts` — `requireAuth`, sets `req.user`/`req.session`
- `server/prisma/schema.prisma`, `server/prisma.config.ts`, `server/prisma/seed.ts`
- `server/src/generated/prisma/` — generated, do not edit
- `core/src/schemas/` — shared zod schemas and enums (e.g. `user.ts` exports `createUserSchema`, `CreateUserInput`; `role.ts` exports `Role`, `ROLES`, `roleSchema`); re-exported from `core/src/index.ts`
- `client/src/lib/auth.ts` — `useSession`, `signIn`, `signOut`
- `client/src/components/RequireAuth.tsx` — client route guard
- `client/src/components/ui/` — shadcn primitives
- `client/src/pages/LoginPage.tsx` — reference form pattern
- `client/components.json` — shadcn config

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
- Server relative imports need `.js` suffix even for `.ts` files (e.g. `./lib/auth.js`).
- Client imports inside `client/src` use the `@/` alias.
- Define any zod schema that's used by both client and server in `@helpdesk/core` (under `core/src/schemas/`), re-export it from `core/src/index.ts`, and import it as `import { fooSchema } from "@helpdesk/core"` on both sides. Do not duplicate a schema in client and server. Schemas exclusive to one side may stay local.
- Shared enums/constants used by both client and server (e.g. `Role`, `ROLES`) also live in `@helpdesk/core`. Do not import enums from `server/src/generated/prisma/` (server-only, generated) or hardcode the string literals — use `import { Role } from "@helpdesk/core"` everywhere, including in the seed script and better-auth `additionalFields`.
- Bun runs TypeScript directly.
- TypeScript is strict.
- Do not run `bun run typecheck` reflexively — only when asked or risky.

## Auth, DB, UI

- **Auth:** protect server routes with `requireAuth`; wrap protected client routes in `<RequireAuth>`. Seed admin with `bun run --filter server db:seed`.
- **DB:** Postgres connection in `prisma.config.ts`. Models (`User`, `Session`, `Account`, `Verification`) follow better-auth schema; `User.role` is the `Role` enum (`ADMIN | AGENT`) — import from `@helpdesk/core`.
- **UI:** reuse shadcn primitives from `client/src/components/ui/` before hand-rolling. Add more with `bunx --bun shadcn@latest add <name>` from `client/`. Forms follow the `LoginPage.tsx` pattern (zodResolver, `aria-invalid`, destructive `Alert` for submit errors).
- **Data fetching:** use `axios` + `@tanstack/react-query` (`useQuery`/`useMutation`) for server state — not raw `fetch` or `useEffect`.

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

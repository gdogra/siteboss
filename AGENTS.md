# Repository Guidelines

## Project Structure & Module Organization
- Root app: Vite + React 18 in `src/`, static assets in `public/`.
- Backend API: Node/Express (TypeScript) in `backend/src` with `controllers/`, `routes/`, `services/`, `middleware/`, `models/`, `database/`.
- Legacy CRA front end: `frontend/` (React Scripts) used by `start.sh` alongside backend.
- Config/docs: Tailwind config, ESLint, TS configs at root; additional docs under `docs/` and feature guides in repo MD files.

## Build, Test, and Development Commands
- All-in-one dev: `./start.sh` (Postgres locally) or `./start-supabase.sh` (Supabase). Starts `frontend` on `:3000` and API on `:3001`.
- Root Vite app: `npm run dev` (serves on `:8088`), `npm run build`, `npm run preview`, `npm run lint`.
- Backend: `cd backend && npm run dev` (nodemon), `npm run build` (tsc), `npm start`, `npm test`.
- CRA frontend: `cd frontend && npm start`, `npm run build`, `npm test`.
  - API URL: set `REACT_APP_API_URL` (defaults to `http://localhost:3001/api`).

## Coding Style & Naming Conventions
- Language: TypeScript across apps; React components in `.tsx`.
- Linting: ESLint configured at root (`eslint.config.js`); run `npm run lint` at the appropriate workspace.
- Indentation: 2 spaces; semicolons optional per linter rules.
- Naming: React components `PascalCase` (see `src/components/*`); variables/functions `camelCase`; hooks prefixed `use*`; backend files mirror layer names (e.g., `routes/*.ts`, `controllers/*.ts`).
- Imports: Use alias `@/*` for root Vite app (see `vite.config.ts`, `tsconfig.json`).

## Testing Guidelines
- Frameworks: Backend uses Jest + ts-jest; CRA frontend uses Jest + React Testing Library.
- Naming: `*.test.ts`/`*.test.tsx` next to source or under `__tests__/` (backend `tsconfig` excludes `**/*.test.ts` from builds).
- Run: `cd backend && npm test` or `cd frontend && npm test`. No enforced coverage threshold; add tests for controllers/services and critical UI.

## Commit & Pull Request Guidelines
- Commits: Current history is informal; prefer imperative present (e.g., "feat(api): add project routes"). Conventional Commits encouraged.
- PRs: Include clear description, linked issues, screenshots/GIFs for UI, and API change notes. Update docs (`README.md`, feature docs) and mention affected directories.

## Security & Configuration Tips
- Secrets: Never commit `.env`; start from `.env.example` in `backend/` and `frontend/`.
- Databases: `start.sh` expects local Postgres `siteboss` DB; `start-supabase.sh` uses project credentials—update `backend/.env` before running.

## Docker & Netlify
- Backend (example):
  - Build: `docker build -t siteboss-backend ./backend`
  - Run: `docker run -p 3001:3001 --env DB_HOST=host.docker.internal --env DB_USER=postgres --env DB_PASSWORD=password --env DB_NAME=siteboss --env PORT=3001 siteboss-backend`
  - Minimal Dockerfile (place in `backend/`):
    - `FROM node:18-alpine`
    - `WORKDIR /app`
    - `COPY package*.json .` `&& npm ci`
    - `COPY . .` `&& npm run build`
    - `EXPOSE 3001` `&& CMD ["npm","start"]`
- CRA frontend on Netlify:
  - Local: `cd frontend && npx netlify dev` (reads `frontend/netlify.toml`).
  - Deploy: `npx netlify deploy --build --prod --dir=build` after `cd frontend`.
  - SPA routing handled via redirect to `/index.html` (already in `netlify.toml`).

## Docker Compose (Full Stack Dev)
- Copy env: `cp .env.example .env` (override defaults as needed).
- Dev profile: `docker compose --profile dev up --build` (db:5432, api:3001, web:3000).
- Prod profile: `docker compose --profile prod up --build -d` (db:5432, api:8089, web:8088 via Nginx).
- Down: `docker compose down -v` (removes containers and DB volume).
- Logs: `docker compose logs -f backend-dev` or `frontend-dev` (dev) and `backend` or `frontend` (prod).
- Hot reload (dev): code is bind-mounted; CRA and nodemon reload automatically.
- Frontend API base URL:
  - Dev: override with `REACT_APP_API_URL` in `.env` or `docker compose --profile dev -e REACT_APP_API_URL=... up`.
  - Prod: baked into build using compose `build.args.REACT_APP_API_URL` (defaults to `http://localhost:3001/api`).

# Create Project Troubleshooting

This guide helps diagnose and fix issues when creating a new project from the frontend.

## Quick Checklist
- Backend running on `http://localhost:3001` (`cd backend && npm run dev`).
- Frontend running on `http://localhost:3000` (`cd frontend && npm start`).
- CRA proxy in place (frontend/package.json contains `"proxy": "http://localhost:3001"`).
- Logged in as demo user (`demo@siteboss.com`) or a valid Supabase user.
- Database schema applied (local Postgres via `./start.sh` or Supabase via `backend/src/database/schema.sql`).

## Common Errors
- 404 `api/projects` in DevTools:
  - Cause: Requests not reaching the backend; CRA dev server needs a proxy.
  - Fix: Ensure `proxy` field exists in `frontend/package.json` and restart `npm start`.

- 401 Unauthorized:
  - Cause: No token or missing demo headers.
  - Fix: Login as `demo@siteboss.com` (any password) to set `demo-token`, or ensure you’re authenticated via Supabase.

- 403 Forbidden:
  - Cause: Role not authorized.
  - Fix: Demo user role defaults to `company_admin` (authorized). If using Supabase, ensure the user’s `role` metadata is `company_admin` or `project_manager`.

- 400 Validation error:
  - Cause: Missing required fields or wrong types.
  - Fix: Provide `name` and `address`. Dates must be `YYYY-MM-DD`. Numbers must be positive.

- Backend fails to start (`JWT_SECRET is required`):
  - Fix: Add `JWT_SECRET` in `backend/.env` (see `backend/.env.example`).

## Verify Endpoints
- Health: `curl http://localhost:3001/health`
- API info: `curl http://localhost:3001/api`

## Smoke Test (Create Project)
1) Demo headers/token:
```
TOKEN=demo-token
ROLE=company_admin
CID=123e4567-e89b-12d3-a456-426614174000
UID=123e4567-e89b-12d3-a456-426614174001
```
2) Request:
```
curl -i -X POST http://localhost:3001/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-User-Role: $ROLE" \
  -H "X-Company-Id: $CID" \
  -H "X-User-Id: $UID" \
  -H "Content-Type: application/json" \
  -d '{
        "name":"Test Project",
        "address":"123 Main St",
        "total_budget": 100000,
        "contract_value": 125000
      }'
```
- Expect: `HTTP/1.1 201 Created` with `{ success: true, data: {...}, message: "Project created successfully" }`.

## Supabase Setup Notes
- Use `./start-supabase.sh` to run locally with Supabase env.
- Apply schema in Supabase SQL editor: paste `backend/src/database/schema.sql`.
- Ensure `backend/.env` points to your Supabase `DATABASE_URL`.

## Frontend API Base URL
- CRA dev: either `REACT_APP_API_URL=http://localhost:3001/api` or site-relative `/api` (works with CRA proxy).
- Netlify dev/preview: uses site-relative `/api` and `frontend/netlify.toml` redirects.

If issues persist, capture:
- DevTools Network entry for POST `/api/projects` (status + response body).
- Backend console output at the time of the request.


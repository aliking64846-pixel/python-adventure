# Python Adventure — Python API (separate service)

This folder adds a **new FastAPI service** without replacing the existing Node.js backend or changing the existing PostgreSQL schema.

## Deploy on Render

Create a new **Web Service** from the same GitHub repository and select:

- **Root Directory:** `server-python`
- **Runtime:** Python 3
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

Configure environment variables in the new service:

- `DATABASE_URL`: use the existing Render PostgreSQL database's **Internal Database URL** if this service is deployed on Render. Do not commit database credentials to GitHub.
- `FRONTEND_ORIGINS`: comma-separated allowed origins for the published game, for example `https://YOUR-GITHUB-USERNAME.github.io`. For initial health-only testing it can be left unset; the default is `*`. Once browser-based API requests are introduced, set this to the exact frontend origin(s).

## Endpoints

- `/` — service information
- `/health` — app status and a read-only PostgreSQL connection check
- `/api/v1/health` — API health
- `/docs` — interactive OpenAPI documentation

## Safety and scope

- This service does not create, alter, or delete tables.
- The existing Node.js server and its `render.yaml` are unchanged.
- The health endpoint only executes `SELECT 1`; it does not read player data.
- No registration, login, or progress-saving endpoints are implemented yet. Add those in a later change after confirming the existing data model and session/authentication approach.

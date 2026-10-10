# Meerkat Vision Quest

```
backend/    Python (FastAPI + SQLite) API: accounts, login, saved progress
frontend/   The game (index.html, Vite dev server)
```

## Run it (development)

First time only:

```
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt
npm --prefix frontend install
```

Then in two terminals:

```
npm run dev:api   # API on http://127.0.0.1:8000
npm run dev:web   # game on http://localhost:5173 (proxies /api to the API)
```

## Run it as one server

```
npm start         # builds the frontend, serves game + API on http://localhost:8000
```

Data is stored in `backend/data/meerkat.db` (SQLite, git-ignored). Set `MVQ_DATA_DIR` to store it somewhere else.

## Put it online (free)

The `Dockerfile` builds the game and runs the API + game as one web service on `$PORT`.

- **Database:** locally the API uses a SQLite file (`backend/data/meerkat.db`, or `MVQ_DATA_DIR`). Setting `DATABASE_URL` to a Postgres connection string switches it to Postgres, which is what you want online because free hosts wipe local files on restart.
- **Privacy while it's a work in progress:** set `MVQ_SITE_PASSWORD`. Everyone must then enter that password (any username) before they can even see the site, and search engines are told not to index it. Leave it unset for a public launch.

Free setup: a free Postgres database on [Neon](https://neon.tech) and a free web service on [Render](https://render.com) (Render > New > Blueprint > pick the GitHub repo; `render.yaml` does the rest). Set `DATABASE_URL` (the Neon connection string) and `MVQ_SITE_PASSWORD` when Render asks. The free web service sleeps after ~15 minutes idle, so the first visit after a quiet spell takes 30-60 seconds to wake up.

## API

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/auth/register` | username, password, start_grade |
| POST | `/api/auth/login` | returns a bearer token + saved progress |
| POST | `/api/auth/logout` | |
| GET / PATCH | `/api/me` | profile + saved progress / change starting grade |
| PUT | `/api/progress` | saves the whole game state (streak, grades, gems, rewards, settings) |

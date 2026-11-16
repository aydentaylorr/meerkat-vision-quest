# Meerkat Vision Quest

A story-driven vision and reading practice game for children. Nomi the meerkat travels through
12 grades; each grade has four modules (Reading, Visual Memory, Scanning, Eye Therapy). Players
sign in, and their progress, streak and rewards are saved to their account.

## Project layout

```
backend/                 Python API (FastAPI) that also serves the game
  app/
    main.py              builds the app and registers routes
    config.py            settings from environment variables
    db.py                database access (SQLite locally, Postgres when DATABASE_URL is set)
    security.py          password hashing, session tokens, login throttling
    schemas.py           request/response shapes
    deps.py              shared request dependencies
    middleware.py        optional preview password, no-index header
    frontend.py          serves the static game files
    routes/              auth.py (accounts), progress.py (saving), health.py
  requirements.txt
frontend/                the game: plain HTML, CSS and JavaScript (ES modules), no build step
  index.html             page skeleton
  css/                   styles, split by area (base, world, hud, cards, buttons, ...)
  js/
    main.js              entry point
    handlers.js          functions the HTML calls from onclick attributes
    core/                shared plumbing: state, API calls, timers, progress rules, utilities
    data/                content: stories, word lists, grades, difficulty, rewards
    art/                 the hand-drawn SVG world, Nomi and icons
    ui/                  screens: map, HUD, cards, sheets, sign-in, profile, grown-ups area
    modules/             the four game modules and the runner that drives them
  assets/                favicon
Dockerfile               container for deployment
render.yaml              Render deployment blueprint
Makefile                 common commands
```

## Run it locally

```
make setup     # once: creates backend/.venv and installs dependencies
make run       # game and API on http://localhost:8000
```

There is nothing to build: edit a file in `frontend/` and refresh the page. Locally, accounts and
progress are stored in a SQLite file at `backend/data/meerkat.db` (git-ignored).

`make lint` checks and formats the Python code.

## Configuration

All optional, set as environment variables.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Use Postgres instead of the local SQLite file. Needed in production, where the disk is wiped on restart. |
| `MVQ_DATA_DIR` | Where the SQLite file lives locally. |
| `MVQ_SITE_PASSWORD` | Ask everyone for this shared password before showing the site. For previews. |

## API

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/health` | `{ ok, version }`; the version is the deployed git commit |
| POST | `/api/auth/register` | username, password, start_grade, and optionally `parent` (email, password, consent) |
| POST | `/api/auth/login` | returns a session token and the saved progress |
| POST | `/api/auth/logout` | |
| GET / PATCH | `/api/me` | profile and saved progress / change starting grade |
| PUT | `/api/progress` | saves the whole game state |
| POST | `/api/parent` | adds the grown-up to an account that has none |
| POST | `/api/parent/unlock` | checks the grown-up password, to open the grown-ups area |
| PUT | `/api/parent/consent` | grown-up password and consent on or off |

The session token is sent in an `X-Session-Token` header.

## Grown-ups and consent

Each account has one grown-up on record in the `parents` table: an email address, a password of
their own and whether they have agreed to sharing. Sign-up on the web asks for them. The grown-ups
area opens only with the grown-up password and locks again when it closes. The email address is
recorded but not yet verified, and there is no way to reset a forgotten grown-up password.

## Deploying

The `Dockerfile` runs the API and the game as one web service on `$PORT`. On Render, create a
Blueprint from this repository (`render.yaml`), then set `DATABASE_URL` (for example a free Neon
Postgres database) and, for a private preview, `MVQ_SITE_PASSWORD`. Pushing to `main` redeploys.
The deployed version appears at the bottom of the main screen and in `/api/health`.

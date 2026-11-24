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
app/                     the mobile app (Expo / React Native); shares content and art with frontend/
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

## Mobile app (Expo)

`app/` is a native iOS and Android version of the game, built with Expo and React Native. It is
its own app with native screens, but it is not a second copy of the game: it takes the stories,
word lists, difficulty curve and artwork straight from `frontend/js` (see `app/src/shared.js`) and
talks to the same API, so an account works in both and content is edited in one place.

```
make run-lan             # the game server, reachable from a phone or simulator
make app                 # in another terminal: the app's dev server
```

Then press `i` for the iOS simulator or `a` for an Android emulator, or scan the QR code with
Expo Go on a phone on the same Wi-Fi. Expo needs Node 22.13 or newer.

In development the app finds the server on the machine running `make app`. For a release build,
set `EXPO_PUBLIC_API_URL` to the deployed site (see `app/.env.example`) and build with
`npx eas-cli@latest build` from `app/`.

```
app/
  App.js                 loads the font and starts the game
  src/
    shared.js            everything taken from frontend/js (content, difficulty, artwork)
    rules.js             progress, unlocking, streak and rewards (checked by `npm test`)
    api.js, storage.js   the game server, and the session token in the device keychain
    GameContext.js       the signed-in player and their saved game
    Game.js              which card is on screen and how the player moves between them
    World.js, Hud.js     the scrolling map, the backdrops and the top bar
    ui.js                text, buttons, inputs and cards
    modules/             Reading, Visual Memory, Scanning, Eye Therapy and the runner
    sheets/              rewards, profile and the grown-ups area
```

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
| POST | `/api/auth/register` | username, password, start_grade |
| POST | `/api/auth/login` | returns a session token and the saved progress |
| POST | `/api/auth/logout` | |
| GET / PATCH | `/api/me` | profile and saved progress / change starting grade |
| PUT | `/api/progress` | saves the whole game state |

The session token is sent in an `X-Session-Token` header.

## Deploying

The `Dockerfile` runs the API and the game as one web service on `$PORT`. On Render, create a
Blueprint from this repository (`render.yaml`), then set `DATABASE_URL` (for example a free Neon
Postgres database) and, for a private preview, `MVQ_SITE_PASSWORD`. Pushing to `main` redeploys.
The deployed version appears at the bottom of the main screen and in `/api/health`.

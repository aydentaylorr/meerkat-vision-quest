This is the Expo / React Native app for Meerkat Vision Quest. The web game in `../frontend` is the
original; the app is a native version of it and shares its content.

## How the app is put together

- `App.js` loads the font and starts the game. Everything else is in `src/`.
- `src/shared.js` is the only file that imports from `../frontend/js`. Stories, word lists, the
  difficulty curve and the SVG artwork are written once there and used by both versions. Change
  content there, not here. `metro.config.js` is what lets the app read that folder.
- `src/rules.js` holds the game's rules as plain functions (progress, unlocking, streak, rewards).
  It mirrors the web game so both save the same state to the server. `npm test` checks it.
- `src/GameContext.js` owns the signed-in player and the saved game: loading, saving, signing in.
- `src/Game.js` decides which card is on screen. The game is one screen with cards over an
  illustrated world, so there is no router; moving around is a change of `view` in that file.
- `src/ui.js` has the shared pieces (text, buttons, inputs, cards). `src/World.js` draws the map
  and backdrops, `src/Hud.js` the top bar, `src/modules/` the four game modules, `src/sheets/` the
  pop-ups.
- Colours and sizes come from `useTheme()` so the grown-ups' text-size and contrast settings apply
  everywhere. Do not hard-code text colours or font sizes in screens.

## Expo has changed: do not trust your training data

Expo ships breaking changes every SDK release. Before writing code that touches an Expo, EAS, or
React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt and follow its links. Never answer from memory.

## Commands

```bash
npx expo install <package>  # ALWAYS use instead of npm install: resolves SDK-compatible versions
npx expo start              # start the dev server (needs Node 22.13 or newer)
npm test                    # check the game rules
npm run lint                # lint
npx expo-doctor             # diagnose dependency and config issues
```

Run `npm test` and `npm run lint` before calling a change done, and look at the change on a
simulator: the browser preview (`npm run web`) is quick but does not show keyboard behaviour.

## Rules

- `ios/` and `android/` are generated. Never create or edit them by hand; configure native
  behaviour in `app.json` and config plugins.
- Build and submit with EAS (`npx eas-cli@latest build`). Docs: https://docs.expo.dev/eas/index.md

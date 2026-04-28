# AGENTS.md

## Project Overview

`nth-kids-learning` is a Vietnamese-language educational Single Page Application (SPA) for young children. It teaches numbers, letters, colours, and shapes through interactive mini-games with audio feedback.

**Core stack:**

- **React 19** + **TypeScript** (strict mode)
- **Vite 8** — dev server and build tool
- **TanStack Router** — file-based routing with auto code-splitting
- **Tailwind CSS v4** (via `@tailwindcss/vite`) — styling
- **Radix UI** primitives + custom `ui/` components
- **i18next** + `react-i18next` — internationalisation
- **Zod** — runtime validation
- **Web Audio API** (custom `useSound` hook) — sound effects and audio sprites
- **Yarn** — package manager (do NOT use `npm` or `npx`)

The app is deployed as a **prerendered static SPA** — each route in `src/routes/` is prerendered to its own `dist/<route>/index.html` by a custom Vite plugin, so it can be hosted on any static host (GitHub Pages, Netlify, Cloudflare Pages, S3).

**Navigation model:** the app has **four primary tabs** wired up in [`src/components/layout/bottom-nav.tsx`](src/components/layout/bottom-nav.tsx):

- `/` — Home
- `/learn` — Learn hub (topic grid)
- `/game` — Game hub (topic grid)
- `/settings` — Settings

Topic pages are nested under the hub routes (`/learn/<topic>`, `/game/<topic>`). Game topics with multiple modes (letters, colors) use a selector hub at `/game/letters` and `/game/colors` with deeper routes per mode (e.g. `/game/colors/matching`). The bottom nav uses prefix matching, so it stays active while the user is deep inside a section.

## Setup Commands

- Install dependencies: `yarn install`
- Start dev server (HMR): `yarn dev` (default `http://localhost:5173`)
- Alias for dev: `yarn start`

Requirements: **Node.js ≥ 20** and **Yarn**. A `yarn.lock` is committed — keep it in sync.

## Development Workflow

- `yarn dev` runs Vite with HMR.
- Routes are auto-discovered from files in `src/routes/`. The `@tanstack/router-plugin` regenerates `src/routeTree.gen.ts` on change — **never edit `routeTree.gen.ts` by hand**; it is overwritten on every build and dev run.
- A custom Vite plugin in `scripts/vite-plugin-static-routes.mjs` prerenders static routes into `dist/<route>/index.html` during `yarn build`. If you add a new static route, no extra wiring is needed — it is picked up automatically from the generated route tree.
- Path alias `@/*` maps to `./src/*` (set in both `tsconfig.json` and `vite.config.js`). Always prefer `@/...` over long relative paths.

### Environment variables

- `VITE_BASE_URL` — used only at build time to set Vite's `base` when deploying to a subpath (e.g. GitHub Pages). In `development` mode it is forced to `/`.
  ```bash
  VITE_BASE_URL=/nth-kids/ yarn build
  ```

## Testing Instructions

**There is currently no test framework wired up.** Do not assume `yarn test` exists. If you add tests, integrate **Vitest** (matches the Vite stack) and add a `test` script to `package.json`. Until then, the de-facto verification commands are:

- Lint: `yarn lint`
- Type check: `yarn type-check`
- Production build (includes type check): `yarn build`
- Manual smoke test: `yarn preview`

All three must pass before committing:

```bash
yarn lint && yarn type-check && yarn build
```

## Code Style

- **Language**: TypeScript strict mode. `noImplicitAny` is **off** — but still prefer explicit types at public boundaries.
- **Quotes**: double quotes (`"..."`), enforced by ESLint.
- **Semicolons**: always required.
- **Line endings**: Unix (`LF`).
- **Indent / width**: Prettier defaults; `printWidth: 100`, `trailingComma: "es5"`, `arrowParens: "avoid"`.
- **Imports**:
  - Sorted automatically by `@trivago/prettier-plugin-sort-imports`. Order is: `react` → third-party → `@/` or `~/` → `src/...` → relative. Groups are separated by a blank line.
  - Always use `@/...` instead of deep relative paths.
  - Use `import type { ... }` for type-only imports — enforced by `@typescript-eslint/consistent-type-imports`.
  - Unused imports error out (`unused-imports/no-unused-imports`). Prefix intentionally-unused vars with `_`.
- **Tailwind**: class order sorted automatically by `prettier-plugin-tailwindcss`. Compose variants with `class-variance-authority` and merge with `tailwind-merge` (see `src/lib/utils.ts` for the `cn` helper).
- **React**:
  - Function components only; follow the Rules of Hooks (enforced by `eslint-plugin-react-hooks`).
  - Avoid exporting non-component values from route/component files that would break HMR (`eslint-plugin-react-refresh`).
- **Routing**: add new pages only by creating files in `src/routes/`. Do not touch `routeTree.gen.ts`.
- **Formatting**: run `yarn format` to apply Prettier to everything under `./src`.

## Project Structure

```
nth-kids/
├── index.html                         # HTML entry
├── vite.config.js                     # Vite + Tailwind + TanStack Router + prerender plugin
├── tsconfig.json                      # Strict TS, path alias @/*
├── eslint.config.mjs                  # Flat ESLint config
├── .prettierrc                        # Prettier + import/tailwind plugin config
├── package.json                       # Scripts & dependencies (Yarn)
│
├── public/                            # Static assets copied as-is into dist/
│   ├── assets/                        # Audio sprites: alphabet/colors/numbers/shapes.m4a
│   ├── favicon*.{ico,svg,png}
│   └── site.webmanifest
│
├── scripts/                           # Custom build tooling
│   ├── build-sprite-manifest.mjs      # Rebuilds src/data/audioSpriteManifest.json
│   ├── edge_tts_synth.py              # TTS synth helper (Python)
│   ├── extract-static-routes.mjs      # Parses routeTree.gen.ts for static routes
│   ├── generate-tts-sprites.mjs       # Generates sprite audio via Edge TTS
│   ├── tts-content.mjs                # Localised TTS script definitions
│   └── vite-plugin-static-routes.mjs  # Prerenders dist/<route>/index.html per route
│
└── src/
    ├── main.tsx                       # Creates router & mounts RouterProvider
    ├── routeTree.gen.ts               # AUTO-GENERATED — do not edit
    ├── styles.css                     # Tailwind directives + globals
    ├── vite-env.d.ts
    │
    ├── routes/                        # File-based routes (thin wrappers around features/*)
    │   ├── __root.tsx                 # Root layout + devtools
    │   ├── index.tsx                  # /
    │   ├── settings.tsx               # /settings
    │   ├── learn/
    │   │   ├── index.tsx              # /learn (hub)
    │   │   ├── numbers.tsx            # /learn/numbers
    │   │   ├── letters.tsx            # /learn/letters
    │   │   ├── colors.tsx             # /learn/colors
    │   │   └── shapes.tsx             # /learn/shapes
    │   └── game/
    │       ├── index.tsx              # /game (hub)
    │       ├── numbers.tsx            # /game/numbers
    │       ├── shapes.tsx             # /game/shapes
    │       ├── flashcards.tsx         # /game/flashcards
    │       ├── letters/
    │       │   ├── index.tsx          # /game/letters (mode selector)
    │       │   ├── alphabet.tsx       # /game/letters/alphabet
    │       │   └── sequence.tsx       # /game/letters/sequence
    │       └── colors/
    │           ├── index.tsx          # /game/colors (mode selector)
    │           ├── identify.tsx       # /game/colors/identify
    │           ├── matching.tsx       # /game/colors/matching
    │           └── coloring.tsx       # /game/colors/coloring
    │
    ├── features/                      # Page/domain components organised by topic
    │   ├── home/
    │   │   ├── home-page.tsx
    │   │   └── recommendation-card.tsx
    │   ├── learn/
    │   │   └── learn-hub-page.tsx
    │   ├── game/
    │   │   ├── game-hub-page.tsx
    │   │   ├── letters-game-hub-page.tsx
    │   │   └── colors-game-hub-page.tsx
    │   ├── settings/
    │   │   ├── settings-page.tsx
    │   │   └── settings-panel.tsx
    │   ├── numbers/
    │   │   ├── numbers-learning.tsx
    │   │   ├── counting-game.tsx
    │   │   └── number-generator.ts    # Data generator for counting game
    │   ├── letters/
    │   │   ├── alphabet-learning.tsx
    │   │   ├── alphabet-game.tsx
    │   │   └── sequence-game.tsx
    │   ├── colors/
    │   │   ├── color-learning.tsx
    │   │   ├── color-game.tsx
    │   │   ├── color-matching-game.tsx
    │   │   └── coloring-game.tsx
    │   ├── shapes/
    │   │   ├── shapes-learning.tsx
    │   │   └── shapes-game.tsx
    │   └── flashcards/
    │       └── flashcards-game.tsx
    │
    ├── components/                    # Reusable, cross-feature UI
    │   ├── ui/                        # Primitives (button, card, ...)
    │   ├── layout/                    # app-shell, bottom-nav, page-container, immersive-view
    │   ├── games/                     # Shared game scaffolding (hud, result, tutorial, feedback)
    │   └── hub/                       # topic-hub used by both /learn and /game hubs
    │
    ├── hooks/
    │   ├── useSound.ts                # Web Audio API wrapper (tone + sprite playback)
    │   ├── useSpritePreload.ts        # Preloads audio sprite topics on-demand
    │   ├── useSpeakPrompt.ts          # Speaks localised prompts on question change
    │   ├── useGameEngine.ts           # Shared game state/flow
    │   └── usePreferences.ts          # localStorage-backed user preferences
    │
    ├── data/                          # Static content + audio sprite manifests
    │   ├── alphabet.ts
    │   ├── colors.ts
    │   ├── shapes.ts
    │   ├── topics.ts                  # LEARN_TOPICS, GAME_TOPICS, IMMERSIVE_PATHS
    │   ├── coloringTemplates.ts
    │   ├── audioSprites.ts
    │   └── audioSpriteManifest.json
    │
    ├── i18n/                          # i18next setup + translation resources
    │   ├── index.ts
    │   └── locales/{vi,en}.json
    ├── config/
    │   └── games.ts                   # Game difficulty tiers and thresholds
    └── lib/
        ├── utils.ts                   # cn() and other helpers
        └── audio-sprite-player.ts     # Low-level sprite playback helper
```

### Key conventions

- **Routes are thin wrappers**: every file under `src/routes/` should only declare the `createFileRoute(...)` and delegate rendering to a feature page/component under `src/features/<area>/`. Do not put page logic, state, or effects directly inside route files beyond a tiny wrapper (e.g. sprite preload + `<ImmersiveView>` + feature component).
- **Feature boundaries**: topic-specific UI lives in `src/features/<topic>/`. Cross-feature reusable primitives (layout, ui, games scaffolding, topic hub) stay in `src/components/`. Don't import from one feature into another — lift shared code into `components/`, `hooks/`, `data/`, or `lib/` instead.
- **Immersive routes**: full-screen play/learning pages wrap their content in [`ImmersiveView`](src/components/layout/immersive-view.tsx) and must also be listed in `IMMERSIVE_PATHS` in [`src/data/topics.ts`](src/data/topics.ts) so [`AppShell`](src/components/layout/app-shell.tsx) hides the bottom nav. Selector hubs like `/game/letters` and `/game/colors` are intentionally **not** immersive.
- **Topic metadata**: nav labels, icons, theming, and paths for each topic live centrally in [`src/data/topics.ts`](src/data/topics.ts) as `LEARN_TOPICS` and `GAME_TOPICS`. When adding a new topic, update this file plus the matching routes and feature folder — don't hard-code paths/colours inside components.
- **Data layer**: Static learning content (alphabet entries, colour palettes, shapes, topics) lives in `src/data/`. Audio is delivered via sprite files in `public/assets/` with a manifest in `src/data/audioSpriteManifest.json` — when adding new audio, regenerate/update the manifest (via `scripts/build-sprite-manifest.mjs`) rather than hardcoding offsets in components.
- **Preferences**: User-tunable settings (e.g. max number in counting game, mute, reduce motion, language) are persisted via the `usePreferences` hook to `localStorage`. Reuse this hook instead of calling `localStorage` directly.
- **Sound**: Always play sounds through the `useSound` hook so a single shared `AudioContext` is reused and the global mute toggle is respected. Preload sprite topics on route entry via `usePreloadSprite` / `usePreloadAllSprites`.

## Build and Deployment

- Build: `yarn build` → outputs to `dist/`.
  - `dist/index.html` — the SPA shell.
  - `dist/<route>/index.html` — prerendered per-route shell (one per static route).
  - `dist/assets/...` — chunked JS/CSS bundle.
- Preview the built output locally: `yarn preview`.
- Deploy: upload `dist/` to any static host. Set `VITE_BASE_URL` at build time if the site is served from a subpath.

## Pull Request Guidelines

- **Title format**: `<type>(<scope>): <summary>` following [Conventional Commits](https://www.conventionalcommits.org/) — e.g. `feat(numbers): add sequence hints`, `fix(color-game): correct RGB match`, `chore: bump tanstack-router`.
- **Required checks before opening a PR**:
  ```bash
  yarn lint && yarn type-check && yarn build
  ```
- **UI changes**: include before/after screenshots or a short screen recording in the PR description.
- **Generated files**: never hand-edit `src/routeTree.gen.ts`; commit it as regenerated by the dev server or build.
- **New audio/assets**: place binary assets in `public/assets/` and reference them via the sprite manifest where applicable.
- **New routes**: add a file under `src/routes/` (nested folders mirror nested paths — e.g. `src/routes/game/colors/matching.tsx` → `/game/colors/matching`). Keep routes as thin wrappers around a feature page. Do not modify `routeTree.gen.ts` manually.
- **New feature area**: create a folder in `src/features/<name>/` with the page-level components, then wire it up via a route file. Put domain helpers alongside the feature (e.g. `number-generator.ts`). Only promote something to `src/components/` or `src/hooks/` when a second feature needs it.

## Additional Notes

- **Package manager**: Yarn only. `npm install` / `npx ...` commands are not supported by this repo's lockfile — use `yarn` or `yarn dlx`.
- **No backend**: the app is fully client-side. Any data fetching uses `redaxios` against external or mocked endpoints — validate responses with **Zod** before use.
- **i18n**: copy strings belong in `src/i18n/` resources, not hardcoded in components. Default locale is Vietnamese.
- **Accessibility / kid-friendly UX**: target audience is children — prefer large hit targets, strong colour contrast, short copy, and audio feedback for every interactive element.
- **No Service Worker / PWA runtime**: `site.webmanifest` is present for install metadata only; there is currently no offline caching layer.
- **Testing gap**: there is no unit/e2e test harness yet. If you introduce one, prefer **Vitest** + **@testing-library/react** to match the Vite ecosystem, wire it up in `package.json` as `yarn test`, and update this file.

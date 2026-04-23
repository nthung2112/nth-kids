# Phase 2 Sprite Backlog

This is the follow-up backlog to the sprite-only audio migration. Phase 1 removed
all runtime TTS (Piper, Kokoro, `speechSynthesis`) and reduced the app to playing
existing audio sprites only. Phase 2 expands sprite coverage to restore and
improve the audio experience for content that Phase 1 left silent.

Nothing in this document is required for the app to ship. Everything here is
optional content work that can be prioritised independently.

## Current sprite coverage (as of Phase 1)

All existing sprites live under `public/assets/` and are described in
`src/data/audioSprites.ts` / `src/data/audioSpriteManifest.json`.

| Topic | File | Segments | Language | Consumers |
|-------|------|----------|----------|-----------|
| alphabet | `alphabet.m4a` | intro + A..Z (27 total) | English | `alphabet-learning`, `useSound.playLetterSound`, `flashcards-game` (letter kind) |
| numbers | `numbers.m4a` | 1..100 + extras | English | `numbers` route, `useSound.playNumberSound`, `flashcards-game` (number kind) |
| colors | `colors.m4a` | 11 colour names | English | `color-learning`, `coloring-game`, `useSound.playColorSound`, `flashcards-game` (color kind) |
| shapes | `shapes.m4a` | 12 shape names | English | `shapes-learning`, `useSound.playShapeSound`, `flashcards-game` (shape kind) |

## Phase 1 silent content

The following call sites were previously spoken at runtime and are now silent.
They are safe to ship as-is but can be addressed in priority order below.

### Generic question prompts (7 strings)

| Game | i18n key | VI | EN |
|------|----------|----|----|
| counting | `games.counting.question` | Đếm xem có bao nhiêu? | How many do you see? |
| alphabet | `games.alphabet.question` | Chữ cái nào bắt đầu từ này? | Which letter does this word start with? |
| sequence | `games.sequence.question` | Chữ cái tiếp theo là gì? | What letter comes next? |
| colorGuess | `games.colorGuess.question` | Đây là màu gì? | What color is this? |
| colorMatching | `games.colorMatching.title` | Ghép Cặp Màu Giống Nhau! | Match the Same Colors! |
| shapes | `shapes.game.question` | Đây là hình gì? | What shape is this? |
| flashcards | `flashcards.questionLabels.*` (4 strings) | "Đây là số nào?" etc. | "Which number is this?" etc. |

### Alphabet example words (26 per locale)

`alphabet-game.tsx` used to speak `"{question} {word}"` (e.g. "Which letter does
this word start with? Apple"). `alphabet-learning.tsx` used to speak just the
word. Both are now silent for the word-layer — only the letter sprite plays.

Source-of-truth strings are in `src/i18n/locales/{vi,en}.json` under
`data.alphabet.[A-Z].word`.

## Priority order

### P1 — Vietnamese localisation of existing sprites

The app is Vietnamese-first but every sprite today is English. Vietnamese users
on the numbers / colors / shapes / alphabet screens currently hear English
audio. This is the single biggest UX gap.

Deliverables:

1. Record four new sprite files — `alphabet-vi.m4a`, `numbers-vi.m4a`,
   `colors-vi.m4a`, `shapes-vi.m4a` — matching the segment catalogue of the
   existing English sprites.
2. Extend `AUDIO_SPRITES` in `src/data/audioSprites.ts` with locale-aware
   sources. Easiest shape: `src: { en: "assets/...m4a", vi: "assets/...-vi.m4a" }`
   and teach `audio-sprite-player.ts` to pick the right URL using the current
   `i18next` language.
3. Re-run the sprite segment detection script and commit the updated
   `audioSpriteManifest.json` and `audioSprites.ts`.

No component-level code changes are required once the player is locale-aware —
every call site already flows through `useSound`.

### P2 — Alphabet example words

Needed to restore the "Apple → A" association in `alphabet-learning.tsx` and
`alphabet-game.tsx`.

Deliverables:

1. Record 26 word segments per locale (EN + VI). Vietnamese locale currently
   reuses the English word text in `data.alphabet.*.vietnamese` — replace those
   with locale-appropriate cue words before recording (or record the English
   word pronounced slowly for both locales, with a design decision).
2. Add a new sprite topic, e.g. `alphabetWords`, with index `A..Z → 1..26`.
3. In `alphabet-learning.tsx`, choose whether the listen button plays the
   letter sprite, the word sprite, or both in sequence. Recommend: letter on
   first tap, word on second tap, or a tiny "picture / letter" toggle.
4. In `alphabet-game.tsx`, reintroduce an auto-speak of the word as a hint when
   a new question appears (guarded by a `soundMuted` check that `useSound`
   already does).

### P3 — Game question prompts

The seven strings listed in "Generic question prompts". These are static per
locale, so they trivially fit a sprite.

Deliverables:

1. Record one sprite file per locale, e.g. `prompts-en.m4a` / `prompts-vi.m4a`,
   with one segment per prompt.
2. Add a `prompts` sprite topic with a typed index, e.g.
   `PROMPT_SPRITE_INDEX: Record<PromptKey, number>`.
3. Introduce a small `playPromptSound(key)` in `useSound` that looks up the
   correct segment for the current locale.
4. Reintroduce an auto-speak on question change in
   `alphabet-game`, `shapes-game`, `sequence-game`, `counting-game`,
   `color-matching-game`, `color-game`, and `flashcards-game`. Phase 1 removed
   the `useSpeakOnChange` hook; Phase 2 can replace it with a one-liner
   `useEffect` that calls `playPromptSound(...)` on the trigger key.

### P4 — Settings voice preview

Minor polish. A 1–2 second voice sample per locale so parents can check the
voice in Settings before turning the app loose on their kid.

Deliverables:

1. Add a `preview-en.m4a` / `preview-vi.m4a` (or a single `preview.m4a` with
   per-locale segments).
2. Reintroduce a "Nghe thử" / "Preview" button in `settings-panel.tsx` that
   plays the sprite for the current locale.

## Files most likely to change in Phase 2

| File | Change |
|------|--------|
| `public/assets/*.m4a` | add new recordings |
| `src/data/audioSprites.ts` | add topics, locale-aware `src`, extend index maps |
| `src/data/audioSpriteManifest.json` | regenerate from script |
| `src/lib/audio-sprite-player.ts` | locale-aware URL resolution |
| `src/hooks/useSound.ts` | new `playPromptSound`, `playAlphabetWord`, etc. |
| `src/components/alphabet-learning.tsx` | optional word playback toggle |
| `src/components/alphabet-game.tsx` | optional prompt+word auto-speak |
| `src/components/*-game.tsx` (6 files) | optional prompt auto-speak on question change |
| `src/components/settings/settings-panel.tsx` | optional voice preview button |

## Out of scope

- Bringing back any runtime TTS engine. The app is now sprite-only by
  intent; if Phase 2 cannot record a prompt, that screen stays silent.
- Server-side TTS or cached remote audio. The app ships as a static PWA and
  has no backend.
- Dynamic user-entered text. There is none in the current product.

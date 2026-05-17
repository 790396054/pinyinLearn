# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pure-frontend pinyin learning app for 6-year-old children. No build step — open `index.html` in a browser.

## Script Loading Order

```
index.html → js/data.js → js/audio.js → js/app.js
```

## Key Architecture

- **`js/data.js`** — 52 Chinese characters across 6 categories (animals, fruits, nature, numbers, colors, body). Each word: `{char, pinyin, emoji}`. Exports `parsePinyin()` → `{initial, final}` and `getImagePath(char)`.
- **`js/app.js`** — `App` object with two modes: `learn` (browse cards with image + pinyin) and `practice` (fill-in-the-blank quiz). Practice: randomly blanks initial or final, generates 4 options, wrong answers stay on same question for retry.
- **`js/audio.js`** — `AudioPlayer` plays local MP3 files: `speakChar(char)` → `audio/{char}.mp3`, `speak(text)` → `audio/encourage/{msg}.mp3`. Strips punctuation to match filenames.
- **`css/style.css`** — Child-friendly: large fonts (80px chars, 44px pinyin), warm colors, CSS animations (shake/bounce/starBurst), responsive for mobile/tablet.

## Asset Pipelines

- **Images**: `generate-images-tongyi.js` — generates PNGs via 阿里通义万相 (DashScope API, model `wanx-v1`, async mode). Run: `DASHSCOPE_API_KEY="sk-xxx" node generate-images-tongyi.js`. Output: `images/{char}.png`.
- **Audio**: `generate-audio.py` — generates MP3s via edge-tts (Microsoft Xiaoxiao voice). Run: `python3 generate-audio.py`. Requires `pipx install edge-tts`. Character output: `audio/{char}.mp3` (contextual phrase: "词组。单字"), encouragement output: `audio/encourage/{msg}.mp3`.

## Key Behaviors

- Images fall back to emoji via `onerror` handler when PNG doesn't exist
- Practice round = 10 questions per round, shuffled from current category
- Stars + combo tracking, completion modal after each round
- Keyboard: ArrowLeft/Right for learn mode navigation, Space/Enter for audio

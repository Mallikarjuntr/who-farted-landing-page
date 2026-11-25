# Who Farted? landing page

The one-page website for **Who Farted?**, a daily comedic deduction game that runs inside Reddit.

Someone farted in the lift. Six suspects, one guess, a new case every day.

- Live site: https://who-farted.netlify.app/
- Play: https://www.reddit.com/r/WhoFartedDaily/
- Trailer (55 s): https://youtu.be/RtDaoH_iMvU
- Devpost: https://devpost.com/software/who-farted
- Game code: https://github.com/Mallikarjuntr/who-farted

## What's here

A static site with no build step: `index.html`, `styles.css`, `main.js` and `assets/`.

- `assets/suspects/` — the six characters in six moods, exported as SVG from the game's own art code.
- `assets/img/` — real screens from the game, recorded in the Reddit app.
- `assets/suspects/` also holds each suspect's guilty face, shown when you point at them.
- `assets/fonts/` — Luckiest Guy (Apache License 2.0), Rubik and Patrick Hand (both SIL Open Font
  License 1.1), self-hosted.
- Brand icons (Reddit, YouTube, GitHub, Devpost) are from Simple Icons (CC0), inlined in `index.html`.

Point at a suspect and they look guilty and make a short sound. The sounds are made in code with
the Web Audio API (no audio files), only start after the visitor's first click or tap, as browsers
require, and can be muted with the speaker button.

The trailer loads from youtube-nocookie.com only when the visitor presses play.

## Run it locally

Open `index.html` in a browser, or serve the folder with any static server.

## Deploy on Netlify

Import this repo in Netlify, pick the `master` branch, leave the build command empty and set the
publish directory to `.` (also set in `netlify.toml`).

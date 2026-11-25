// Who Farted? landing page: a few small touches, nothing else.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. Sounds. Tiny cartoon "voices" made in code, like the game's own sound
//    effects: no audio files, and no fart sounds (cheeky, not gross).
//    Browsers only allow sound after the visitor clicks or taps something,
//    so nothing plays before that. The speaker button in the nav mutes it.
const SOUND_KEY = 'wf_landing_sound';
const soundBtn = document.getElementById('sound');
let ctx = null;
let wanted = true;
try {
  wanted = window.localStorage.getItem(SOUND_KEY) !== '0';
} catch {
  // Storage blocked: sound stays on for this visit.
}

function saveWanted() {
  try {
    window.localStorage.setItem(SOUND_KEY, wanted ? '1' : '0');
  } catch {
    // Not saved; it still works for this visit.
  }
}

function soundIsOn() {
  return wanted && ctx !== null && ctx.state === 'running';
}

function showSoundState() {
  if (soundBtn) {
    soundBtn.setAttribute('aria-pressed', soundIsOn() ? 'true' : 'false');
  }
}

// Called on every click, tap and key press: the browser lets sound start here.
// It runs before the speaker button's own click, so remember how things were.
let onBeforePress = false;
function unlockSound(e) {
  if (e?.type !== 'pointerup') onBeforePress = soundIsOn();
  if (!wanted) return;
  try {
    ctx ??= new AudioContext();
    ctx.onstatechange = showSoundState;
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
  showSoundState();
}
for (const type of ['pointerdown', 'pointerup', 'keydown']) {
  document.addEventListener(type, unlockSound, { capture: true });
}

function play(notes) {
  if (!soundIsOn()) return;
  const start = ctx.currentTime + 0.01;
  for (const n of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = n.type ?? 'triangle';
    osc.frequency.setValueAtTime(n.freq, start + n.at);
    if (n.slideTo) {
      osc.frequency.exponentialRampToValueAtTime(n.slideTo, start + n.at + n.length);
    }
    const peak = n.volume ?? 0.06;
    gain.gain.setValueAtTime(0.0001, start + n.at);
    gain.gain.exponentialRampToValueAtTime(peak, start + n.at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + n.at + n.length);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start + n.at);
    osc.stop(start + n.at + n.length + 0.02);
  }
}

// One short sound per suspect, matching who they are.
const VOICES = {
  // "Oh dear!": two wobbly falling notes.
  agnes: [
    { freq: 880, at: 0, length: 0.13, slideTo: 720 },
    { freq: 740, at: 0.13, length: 0.2, slideTo: 560 },
  ],
  // "Bro!": one low, punchy grunt.
  brock: [{ freq: 150, at: 0, length: 0.17, type: 'square', slideTo: 100, volume: 0.05 }],
  // A toddler giggle: three quick rising notes.
  pip: [
    { freq: 1047, at: 0, length: 0.06 },
    { freq: 1319, at: 0.07, length: 0.06 },
    { freq: 1568, at: 0.14, length: 0.09 },
  ],
  // "Woof woof!"
  biscuit: [
    { freq: 560, at: 0, length: 0.09, type: 'sawtooth', slideTo: 230, volume: 0.045 },
    { freq: 560, at: 0.15, length: 0.09, type: 'sawtooth', slideTo: 230, volume: 0.045 },
  ],
  // "Ahem."
  linda: [
    { freq: 392, at: 0, length: 0.08, type: 'square', volume: 0.04 },
    { freq: 294, at: 0.1, length: 0.15, type: 'square', volume: 0.04 },
  ],
  // The mime makes no sound... except a slide whistle.
  marcel: [{ freq: 500, at: 0, length: 0.3, type: 'sine', slideTo: 1200, volume: 0.08 }],
};

let lastVoice = 0;
function voice(id) {
  const now = performance.now();
  if (now - lastVoice < 90) return; // sweeping across the lift shouldn't machine-gun
  lastVoice = now;
  play(VOICES[id] ?? []);
}

if (soundBtn) {
  soundBtn.addEventListener('click', () => {
    if (onBeforePress) {
      wanted = false;
    } else {
      wanted = true;
      unlockSound();
      window.setTimeout(() => {
        play([
          { freq: 660, at: 0, length: 0.06 },
          { freq: 990, at: 0.07, length: 0.08 },
        ]);
      }, 30);
    }
    saveWanted();
    showSoundState();
  });
  showSoundState();
}

// 2. A different suspect protests their innocence every few seconds,
//    just like the case card in the Reddit feed.
const DENIALS = ['NOT ME!', 'WASN’T ME!', 'DON’T LOOK AT ME!', 'I SMELL NOTHING!'];
const lineup = document.getElementById('lineup');
const bubble = document.getElementById('denial');
let turn = 4; // Linda goes first
let pointing = false; // the visitor is pointing at someone in the lift

function placeBubble(index, text) {
  const faces = lineup.querySelectorAll('.face');
  const face = faces[index % faces.length];
  if (!face) return;
  const rowBox = lineup.getBoundingClientRect();
  const faceBox = face.getBoundingClientRect();
  // On wide screens the page is drawn at 80% (see styles.css). Screen
  // measurements come back zoomed, so turn them back into page pixels.
  const scale = lineup.offsetWidth ? rowBox.width / lineup.offsetWidth : 1;
  const left = (faceBox.left - rowBox.left + faceBox.width / 2) / scale;
  const top = (faceBox.top - rowBox.top) / scale - 30;
  bubble.style.left = `${left}px`;
  bubble.style.top = `${Math.max(0, top)}px`;
  bubble.textContent = text ?? DENIALS[index % DENIALS.length];
  bubble.classList.remove('pop');
  void bubble.offsetWidth; // restart the pop animation
  bubble.classList.add('pop');
}

if (lineup && bubble) {
  placeBubble(turn);
  window.addEventListener('resize', () => placeBubble(turn));
  if (!reduceMotion) {
    setInterval(() => {
      if (pointing) return;
      turn = (turn + 5) % 6; // skip around the lift, not left to right
      placeBubble(turn);
    }, 2600);
  }
}

// 3. Point at a suspect (hover with a mouse, or tap on a phone) and they
//    look guilty, give a little shake and make their sound.
const guilty = (id) => `assets/suspects/${id}-guilty.svg`;

function catchSuspect(el) {
  if (el.classList.contains('caught')) return;
  const img = el.tagName === 'IMG' ? el : el.querySelector('img');
  const id = el.dataset.id;
  if (!img || !id) return;
  img.dataset.calm ??= img.getAttribute('src');
  img.src = guilty(id);
  el.classList.add('caught');
  voice(id);
  if (lineup && bubble && el.parentElement === lineup) {
    pointing = true;
    turn = [...lineup.querySelectorAll('.face')].indexOf(el);
    placeBubble(turn, DENIALS[Math.floor(Math.random() * DENIALS.length)]);
  }
}

function releaseSuspect(el) {
  if (!el.classList.contains('caught')) return;
  const img = el.tagName === 'IMG' ? el : el.querySelector('img');
  if (img?.dataset.calm) img.src = img.dataset.calm;
  el.classList.remove('caught');
  if (lineup && el.parentElement === lineup) pointing = false;
}

const suspects = document.querySelectorAll('[data-id]');
for (const el of suspects) {
  let timer = 0;
  el.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') catchSuspect(el);
  });
  el.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') releaseSuspect(el);
  });
  // Phones have no hover: a tap shows the guilty face for a moment.
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    catchSuspect(el);
    window.clearTimeout(timer);
    timer = window.setTimeout(() => releaseSuspect(el), 1200);
  });
}

// Load the guilty faces early so the swap is instant.
window.addEventListener('load', () => {
  for (const id of new Set([...suspects].map((el) => el.dataset.id))) {
    new Image().src = guilty(id);
  }
});

// 4. Load YouTube only when someone presses play (keeps the page fast
//    and sets no YouTube cookies before then).
const playTrailer = document.getElementById('play-trailer');
if (playTrailer) {
  playTrailer.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = 'https://www.youtube-nocookie.com/embed/RtDaoH_iMvU?autoplay=1&rel=0';
    frame.title = 'Who Farted? trailer';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    playTrailer.replaceWith(frame);
  });
}

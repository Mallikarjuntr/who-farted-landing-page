// Who Farted? landing page: two small touches, nothing else.

// 1. A different suspect protests their innocence every few seconds,
//    just like the case card in the Reddit feed.
const DENIALS = ['NOT ME!', 'WASN’T ME!', 'DON’T LOOK AT ME!', 'I SMELL NOTHING!'];
const lineup = document.getElementById('lineup');
const bubble = document.getElementById('denial');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function placeBubble(index) {
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
  bubble.textContent = DENIALS[index % DENIALS.length];
  bubble.classList.remove('pop');
  void bubble.offsetWidth; // restart the pop animation
  bubble.classList.add('pop');
}

if (lineup && bubble) {
  let turn = 4; // Linda goes first
  placeBubble(turn);
  window.addEventListener('resize', () => placeBubble(turn));
  if (!reduceMotion) {
    setInterval(() => {
      turn = (turn + 5) % 6; // skip around the lift, not left to right
      placeBubble(turn);
    }, 2600);
  }
}

// 2. Load YouTube only when someone presses play (keeps the page fast
//    and sets no YouTube cookies before then).
const play = document.getElementById('play-trailer');
if (play) {
  play.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = 'https://www.youtube-nocookie.com/embed/RtDaoH_iMvU?autoplay=1&rel=0';
    frame.title = 'Who Farted? trailer';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    play.replaceWith(frame);
  });
}

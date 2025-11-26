// app.js - Simon Says (fixed)
const COLORS = ["red", "yellow", "green", "purple"];

let gameSeq = [];
let userSeq = [];
let level = 0;
let started = false;
let acceptingInput = false; // when false, user clicks are ignored while sequence plays

const statusH2 = document.getElementById("status");
const buttons = {}; // map color -> element
COLORS.forEach(c => buttons[c] = document.getElementById(c));

// Start game on first keypress
document.addEventListener("keydown", () => {
  if (!started) startGame();
});

// attach click handlers
COLORS.forEach(color => {
  buttons[color].addEventListener("click", function () {
    if (!started || !acceptingInput) return; // ignore clicks when not allowed
    handleUserClick(color);
  });
});

function startGame() {
  resetGame();
  started = true;
  nextLevel();
}

function nextLevel() {
  acceptingInput = false;
  userSeq = [];
  level++;
  statusH2.innerText = `Level ${level}`;
  // push new random color
  const randIdx = Math.floor(Math.random() * COLORS.length);
  gameSeq.push(COLORS[randIdx]);

  // play the whole sequence (with delay between flashes)
  playSequence(gameSeq).then(() => {
    // after sequence is played allow user to input
    acceptingInput = true;
  });
}

// plays sequence of colors with delay and returns a Promise that resolves when done
function playSequence(seq) {
  const delayBetween = 600; // ms between flashes
  const flashDuration = 300; // ms each flash
  return new Promise(resolve => {
    seq.forEach((color, i) => {
      const time = i * delayBetween;
      setTimeout(() => flashButton(buttons[color], flashDuration), time);
    });
    // resolve after last flash finished
    setTimeout(resolve, seq.length * delayBetween);
  });
}

function flashButton(btn, duration = 250) {
  if (!btn) return;
  btn.classList.add("flash");
  setTimeout(() => btn.classList.remove("flash"), duration);
}

// when user clicks a color
function handleUserClick(color) {
  // visually show user's click briefly
  const btn = buttons[color];
  btn.classList.add("userFlash");
  setTimeout(() => btn.classList.remove("userFlash"), 160);

  userSeq.push(color);
  checkAnswer(userSeq.length - 1);
}

function checkAnswer(currentIndex) {
  if (userSeq[currentIndex] !== gameSeq[currentIndex]) {
    // wrong answer -> game over
    gameOver();
    return;
  }

  // if user completed the whole sequence correctly
  if (userSeq.length === gameSeq.length) {
    // short delay, then next level
    acceptingInput = false;
    setTimeout(nextLevel, 700);
  }
}

function gameOver() {
  const score = Math.max(0, level - 1); // last completed level
  statusH2.innerHTML = `Game Over! Your score: <b>${score}</b><br>Press any key to start again`;
  flashPageOnFail();
  resetGameStateButAllowRestart();
}

function flashPageOnFail() {
  const original = document.body.style.backgroundColor;
  document.body.style.backgroundColor = "salmon";
  setTimeout(() => (document.body.style.backgroundColor = original), 200);
}

function resetGameStateButAllowRestart() {
  started = false;
  acceptingInput = false;
  // don't clear DOM handlers, just reset sequences and level so keydown will start again
  gameSeq = [];
  userSeq = [];
  level = 0;
}

function resetGame() {
  gameSeq = [];
  userSeq = [];
  level = 0;
  acceptingInput = false;
}

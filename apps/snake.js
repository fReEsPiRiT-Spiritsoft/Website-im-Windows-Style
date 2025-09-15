let mode = 'hard';

function renderSnakeView() {
  return `
    <div class="snake-wrap">
      <div class="snake-ui">
        <button id="snake-mode-hard" class="snake-mode-btn">Schwer</button>
        <button id="snake-mode-easy" class="snake-mode-btn">Leicht</button>
      </div>
      <canvas id="snake-canvas" width="320" height="320"></canvas>
      <div class="snake-ui">
        <button id="snake-restart">Neu</button>
        <span>Punkte: <b id="snake-score">0</b></span>
      </div>
    </div>
  `;
}

function initSnake(win) {
  const cvs = win.querySelector('#snake-canvas');
  const scoreEl = win.querySelector('#snake-score');
  const btn = win.querySelector('#snake-restart');
  const btnHard = win.querySelector('#snake-mode-hard');
  const btnEasy = win.querySelector('#snake-mode-easy');
  if (!cvs || !scoreEl || !btn) {
    console.log('Snake: Elemente nicht gefunden, warte...');
    requestAnimationFrame(() => initSnake(win));
    return;
  }
  const ctx = cvs.getContext('2d');
  if (!ctx) {
    console.error('Snake: Canvas-Context nicht verfügbar!');
    return;
  }

  // NEU: Canvas-Größe als Properties setzen (wichtig für Zeichnen!)
  cvs.width = 320;
  cvs.height = 320;
  cvs.style.width = '80%';
  cvs.style.height = '80%';

  console.log('Snake: Init erfolgreich');

  const size = 16;
  let snake, dir, food, score, loopId, alive, immortal = false;  // NEU: Immortal-Modus für Überraschung

  function randCell() {
    return {
      x: Math.floor(Math.random() * (cvs.width / size)),
      y: Math.floor(Math.random() * (cvs.height / size))
    };
  }

  function spawnFood() {
    let f;
    do {
      f = randCell();
    } while (snake.some(s => s.x === f.x && s.y === f.y));
    food = f;
  }

  function reset() {
    snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
    dir = { x: 1, y: 0 };
    score = 0;
    alive = true;
    immortal = false;  // Reset Immortal
    spawnFood();
    scoreEl.textContent = score;
  }

  function step() {
    if (!alive) return;
    let head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (mode === 'easy') {
      // Wrap-Around
      if (head.x < 0) head.x = cvs.width / size - 1;
      if (head.y < 0) head.y = cvs.height / size - 1;
      if (head.x >= cvs.width / size) head.x = 0;
      if (head.y >= cvs.height / size) head.y = 0;
    }

    // Game Over nur bei "schwer" oder bei Selbstkollision,
    // aber im Immortal-Modus ignorieren wir ALLE Kollisionen!
    if (!immortal && (
      (mode === 'hard' && (
        head.x < 0 || head.y < 0 ||
        head.x >= cvs.width / size || head.y >= cvs.height / size
      )) ||
      snake.some(s => s.x === head.x && s.y === head.y)
    )) {
      alive = false;
      draw(true);
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = score;
      spawnFood();
    } else {
      snake.pop();
    }
    draw(false);
  }

  function draw(gameOver) {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    // Food
    ctx.fillStyle = '#e91e63';
    ctx.fillRect(food.x * size, food.y * size, size, size);

    // Snake – NEU: Immortal-Modus zeigt grüne Schlange
    ctx.fillStyle = immortal ? '#00ff00' : '#4caf50';
    snake.forEach((p, i) => {
      ctx.fillRect(p.x * size, p.y * size, size - 1, size - 1);
    });

    if (gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, cvs.width, cvs.height);
      ctx.fillStyle = '#fff';
      ctx.font = '20px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', cvs.width / 2, cvs.height / 2);
    }
  }

  function loop() {
    step();
    loopId = setTimeout(loop, immortal ? 80 : 120);  // NEU: Schneller im Immortal-Modus
  }

  function start() {
    reset();
    draw(false);
    clearTimeout(loopId);
    loop();
  }

  btn.onclick = start;

  if (btnHard && btnEasy) {
    btnHard.onclick = () => { mode = 'hard'; btnHard.classList.add('active'); btnEasy.classList.remove('active'); start(); };
    btnEasy.onclick = () => { mode = 'easy'; btnEasy.classList.add('active'); btnHard.classList.remove('active'); start(); };
  }

  window.addEventListener('keydown', e => {
    if (!alive) return;
    if (e.key === 'ArrowUp' && dir.y !== 1) dir = { x: 0, y: -1 };
    if (e.key === 'ArrowDown' && dir.y !== -1) dir = { x: 0, y: 1 };
    if (e.key === 'ArrowLeft' && dir.x !== 1) dir = { x: -1, y: 0 };
    if (e.key === 'ArrowRight' && dir.x !== -1) dir = { x: 1, y: 0 };
    // NEU: Überraschung-Cheat – Drücke 'i' für Immortal-Modus
    if (e.key === 'i') {
      immortal = !immortal;
      console.log('Snake: Immortal-Modus', immortal ? 'aktiviert' : 'deaktiviert');
      scoreEl.textContent = immortal ? score + ' (IMMORTAL)' : score;
    }
  });

  start();
}
window.renderSnakeView = window.renderSnakeView || renderSnakeView;
window.initSnake = window.initSnake || initSnake;
function renderTerminalView() {
  return `
    <div class="terminal-root">
      <div class="terminal-screen">
        <div class="terminal-output"></div>
        <div class="terminal-input-line">
          <span class="terminal-prompt">C:\\></span>
          <input class="terminal-input" autocomplete="off" spellcheck="false" />
          <button class="terminal-run-btn" title="Ausführen">▶</button>
        </div>
      </div>
    </div>
  `;
}

function initTerminal(win) {
  const output = win.querySelector('.terminal-output');
  const promptEl = win.querySelector('.terminal-prompt');
  const input = win.querySelector('.terminal-input');
  const runBtn = win.querySelector('.terminal-run-btn');

  if (!output || !input || !promptEl) {
    requestAnimationFrame(() => initTerminal(win));
    return;
  }
  if (win._terminalReady) return;
  win._terminalReady = true;

  const state = {
    history: [],
    histIndex: 0,
    prompt: 'C:\\>',
    cwd: 'C:/'  // Current Working Directory
  };

  function esc(s = '') { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function write(line) { const div = document.createElement('div'); div.className = 'term-line'; div.innerHTML = line; output.appendChild(div); output.parentElement.scrollTop = output.parentElement.scrollHeight; }
  function writePlain(t) { write(esc(t)); }

  // Matrix-Animation beim Start
  function startMatrixAnimation() {
    const matrixContainer = document.createElement('div');
    matrixContainer.className = 'matrix-animation';
    matrixContainer.style.position = 'absolute';
    matrixContainer.style.top = '0';
    matrixContainer.style.left = '0';
    matrixContainer.style.width = '100%';
    matrixContainer.style.height = '100%';
    matrixContainer.style.background = '#000';
    matrixContainer.style.color = '#0f0';
    matrixContainer.style.fontFamily = 'monospace';
    matrixContainer.style.fontSize = '14px';
    matrixContainer.style.overflow = 'hidden';
    matrixContainer.style.zIndex = '10';
    output.parentElement.appendChild(matrixContainer);

    const columns = Math.floor(matrixContainer.offsetWidth / 10); // 10px pro Spalte
    const drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * matrixContainer.offsetHeight / 14);
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const interval = setInterval(() => {
      matrixContainer.innerHTML = '';
      for (let i = 0; i < columns; i++) {
        const text = document.createElement('div');
        text.style.position = 'absolute';
        text.style.left = `${i * 10}px`;
        text.style.top = `${drops[i] * 14}px`;
        text.innerHTML = chars[Math.floor(Math.random() * chars.length)];
        matrixContainer.appendChild(text);
        drops[i]++;
        if (drops[i] * 14 > matrixContainer.offsetHeight && Math.random() > 0.975) {
          drops[i] = 0;
        }
      }
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      matrixContainer.remove();
      writePlain('Terminal bereit – tippe help');
      input.focus();
    }, 2000);
  }

  function runCommand(raw) {
    write(`<span class="term-prompt-line">${esc(state.prompt)}</span> ${esc(raw)}`);
    if (!raw.trim()) return;
    const parts = raw.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    switch (cmd) {
      case 'help':
        writePlain('Befehle: help, clear, echo <txt>, pwd, ls [path], cd <path>, mkdir <dir>, rm <file>, matrix, shutdown [-r]');
        break;
      case 'clear':
        output.innerHTML = '';
        break;
      case 'echo':
        writePlain(args.join(' '));
        break;
      case 'pwd':
        writePlain(state.cwd);
        break;
      case 'ls':
      case 'dir':
        if (window.VFS) {
          try {
            const tree = VFS.load();
            const path = args[0] || state.cwd;
            const list = VFS.list(tree, path);
            if (list.length) {
              writePlain(list.map(e => e.type === 'file' ? e.name : `[${e.name}]`).join('  '));
            } else {
              writePlain('Verzeichnis leer oder nicht gefunden.');
            }
          } catch (e) {
            writePlain('Fehler beim Auflisten: ' + e.message);
          }
        } else {
          writePlain('VFS nicht verfügbar.');
        }
        break;
      case 'cd':
        if (args[0]) {
          const newPath = args[0].startsWith('/') ? args[0] : state.cwd + '/' + args[0];
          if (window.VFS) {
            try {
              const tree = VFS.load();
              if (VFS.list(tree, newPath).some(e => e.type === 'dir')) {
                state.cwd = newPath.replace(/\/+/g, '/');
                state.prompt = state.cwd + '>';
                promptEl.textContent = state.prompt;
              } else {
                writePlain('Verzeichnis nicht gefunden.');
              }
            } catch (e) {
              writePlain('Fehler beim Wechseln: ' + e.message);
            }
          } else {
            writePlain('VFS nicht verfügbar.');
          }
        } else {
          writePlain('Verwendung: cd <path>');
        }
        break;
      case 'mkdir':
        if (args[0]) {
          if (window.VFS) {
            try {
              const tree = VFS.load();
              VFS.mkdir(tree, state.cwd + '/' + args[0]);
              VFS.save(tree);
              writePlain('Verzeichnis erstellt.');
            } catch (e) {
              writePlain('Fehler beim Erstellen: ' + e.message);
            }
          } else {
            writePlain('VFS nicht verfügbar.');
          }
        } else {
          writePlain('Verwendung: mkdir <name>');
        }
        break;
      case 'rm':
        if (args[0]) {
          if (window.VFS) {
            try {
              const tree = VFS.load();
              VFS.remove(tree, state.cwd + '/' + args[0]);
              VFS.save(tree);
              writePlain('Gelöscht.');
            } catch (e) {
              writePlain('Fehler beim Löschen: ' + e.message);
            }
          } else {
            writePlain('VFS nicht verfügbar.');
          }
        } else {
          writePlain('Verwendung: rm <name>');
        }
        break;
      case 'shutdown':
        if (args[0] === '-r') {
          if (window.showRestartConfirm) {
            writePlain('System wird neu gestartet...');
            setTimeout(() => window.showRestartConfirm(), 500);
          } else {
            writePlain('Restart-Funktion nicht verfügbar.');
          }
        } else {
          writePlain('Verwendung: shutdown -r (für Restart)');
        }
        break;
      case 'matrix':
        startMatrixAnimation();
        break;
      default:
        writePlain('Unbekannter Befehl: ' + cmd + ' – tippe help');
    }
  }

  function submit() {
    const val = input.value;
    if (val.trim()) {
      state.history.push(val);
      state.histIndex = state.history.length;
    }
    runCommand(val);
    input.value = '';
  }
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (state.histIndex > 0) {
        state.histIndex--;
        input.value = state.history[state.histIndex] || '';
        input.setSelectionRange(input.value.length, input.value.length);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (state.histIndex < state.history.length - 1) {
        state.histIndex++;
        input.value = state.history[state.histIndex] || '';
      } else {
        state.histIndex = state.history.length;
        input.value = '';
      }
      input.setSelectionRange(input.value.length, input.value.length);
    }
  });

  if (runBtn) runBtn.onclick = submit;

  win.addEventListener('mousedown', () => {
    if (document.activeElement !== input) input.focus();
  });

  // Starte Matrix-Animation statt direkt "Terminal bereit"
  startMatrixAnimation();
}

window.renderTerminalView = window.renderTerminalView || renderTerminalView;
window.initTerminal = window.initTerminal || initTerminal;
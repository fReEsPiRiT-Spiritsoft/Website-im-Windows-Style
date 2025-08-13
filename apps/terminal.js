// Terminal – Minimal funktionierende Basis mit Debug

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
  // Falls Inhalt noch nicht eingefügt (Timing) -> erneut versuchen
  const output   = win.querySelector('.terminal-output');
  const promptEl = win.querySelector('.terminal-prompt');
  const input    = win.querySelector('.terminal-input');
  const runBtn   = win.querySelector('.terminal-run-btn');

  if (!output || !input || !promptEl) {
    // Einmal retry im nächsten Frame
    requestAnimationFrame(()=>initTerminal(win));
    return;
  }

  // Doppelte Initialisierung verhindern
  if (win._terminalReady) return;
  win._terminalReady = true;

  const state = {
    history: [],
    histIndex: 0,
    prompt: 'C:\\>'
  };

  function esc(s=''){return s.replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));}
  function write(line){ const div=document.createElement('div'); div.className='term-line'; div.innerHTML=line; output.appendChild(div); output.parentElement.scrollTop = output.parentElement.scrollHeight; }
  function writePlain(t){ write(esc(t)); }

  function runCommand(raw) {
    write(`<span class="term-prompt-line">${esc(state.prompt)}</span> ${esc(raw)}`);
    if (!raw.trim()) return;
    const parts = raw.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    switch(cmd) {
      case 'help':
        writePlain('Befehle: help, clear, echo <txt>');
        break;
      case 'clear':
        output.innerHTML = '';
        break;
      case 'echo':
        writePlain(args.join(' '));
        break;
      default:
        writePlain('Unbekannter Befehl: '+cmd);
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

  // Enter / Pfeile
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (state.histIndex > 0) {
        state.histIndex--;
        input.value = state.history[state.histIndex] || '';
        input.setSelectionRange(input.value.length,input.value.length);
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
      input.setSelectionRange(input.value.length,input.value.length);
    }
  });

  // Button
  if (runBtn) runBtn.onclick = submit;

  // Fenster-Klick -> Fokus
  win.addEventListener('mousedown', () => {
    if (document.activeElement !== input) input.focus();
  });

  // Initialausgabe
  writePlain('Terminal bereit – tippe help');
  input.focus();
}

// Optional: Export prüfen
window.renderTerminalView = window.renderTerminalView || renderTerminalView;
window.initTerminal = window.initTerminal || initTerminal;
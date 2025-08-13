// ...existing code...
renderTaskbar();
function renderTaskbar() {
  const bar = document.createElement('div');
  bar.className = "taskbar";
  bar.innerHTML = `
    <button class="start-button">Start</button>
    <span class="taskbar-time"></span>
  `;
  $('#root').appendChild(bar);
  updateClock();
  setInterval(updateClock, 1000);

  let startMenu = null;
  bar.querySelector('.start-button').onclick = () => {
    if (startMenu) { closeMenu(); return; }
    startMenu = document.createElement('div');
    startMenu.className = "start-menu";
    startMenu.innerHTML = `
      <div class="start-menu-programs">
        <b>Programme</b>
        <ul>
          ${icons.map(icon => `<li class="start-menu-item" data-id="${icon.id}">${icon.icon} ${icon.name}</li>`).join('')}
        </ul>
      </div>
      <button class="restart-btn" type="button">🔄 Neustarten</button>
    `;
    startMenu.querySelectorAll('.start-menu-item').forEach(item => {
      item.onclick = () => {
        const id = item.getAttribute('data-id');
        const icon = icons.find(i => i.id == id);
        if (icon) openWindow(icon.id, icon.name);
        closeMenu();
      };
    });
    startMenu.querySelector('.restart-btn').onclick = () => {
      closeMenu();
      showRestartConfirm();
    };
    bar.appendChild(startMenu);
    document.addEventListener('mousedown', outsideHandler);
  };

  function outsideHandler(ev) {
    if (!startMenu) return;
    if (!startMenu.contains(ev.target) && !ev.target.closest('.start-button')) {
      closeMenu();
    }
  }
  function closeMenu() {
    if (!startMenu) return;
    startMenu.remove();
    startMenu = null;
    document.removeEventListener('mousedown', outsideHandler);
  }
}

// === Restart / Boot Sequenz ===
function showRestartConfirm() {
  if (document.querySelector('.restart-overlay')) return;
  const ov = document.createElement('div');
  ov.className = 'restart-overlay';
  ov.innerHTML = `
    <div class="restart-modal">
      <h2>Wirklich Neustarten?</h2>
      <p>Der gesamte Speicher (Ordner & Dateien) wird gelöscht.</p>
      <div class="restart-info hidden">
        <div class="restart-info-text">
          Achtung: Alle angelegten Ordner, Textdateien und importierten Dateien im virtuellen Dateisystem gehen verloren.
          Dieser Vorgang kann nicht rückgängig gemacht werden.
        </div>
      </div>
      <div class="restart-actions">
        <button class="btn-cancel">Abbrechen</button>
        <button class="btn-info">Info</button>
        <button class="btn-confirm">Neustarten</button>
      </div>
    </div>
  `;
  document.body.appendChild(ov);

  ov.querySelector('.btn-cancel').onclick = () => ov.remove();
  ov.querySelector('.btn-info').onclick = () => {
    ov.querySelector('.restart-info').classList.toggle('hidden');
  };
  ov.querySelector('.btn-confirm').onclick = () => {
    startRestartSequence(ov);
  };
  ov.addEventListener('keydown', e => {
    if (e.key === 'Escape') { ov.remove(); }
  });
  ov.focus();
}

function startRestartSequence(overlay) {
  document.body.classList.add('restarting-blur');
  // Modal durch Boot-Screen ersetzen
  overlay.innerHTML = `
    <div class="boot-stage boot-bios">
      <div class="bios-line">VIRTUAL BIOS v1.0 _</div>
      <div class="bios-sub">Speicher wird gelöscht...</div>
    </div>
  `;

  // Speicher löschen
  try { localStorage.clear(); } catch {}
  // Minimal warten (BIOS Look)
  setTimeout(() => {
    // Spinner Phase
    overlay.innerHTML = `
      <div class="boot-stage boot-os">
        <div class="boot-logo">🪟</div>
        <div class="boot-text">Windows wird gestartet...</div>
        <div class="boot-spinner">
          <div></div><div></div><div></div><div></div><div></div><div></div>
        </div>
      </div>
    `;
    // Virtuelles FS neu initialisieren (erzeugt Default)
    if (window.VFS) {
      const tree = VFS.load();
      if (window.icons) VFS.syncPrograms(tree, window.icons);
    }
    // Desktop neu aufbauen nach kurzer Wartezeit
    setTimeout(() => {
      overlay.remove();
      document.body.classList.remove('restarting-blur');
      rebuildDesktopEnvironment();
      playStartupSound();
    }, 2200);
  }, 1600);
}

function rebuildDesktopEnvironment() {
  // Root leeren außer Taskbar/Overlay falls vorhanden
  const root = document.getElementById('root');
  if (!root) return;
  // Entferne alle Fenster
  root.querySelectorAll('.window').forEach(w => w.remove());
  // Entferne alte Desktop-Icons
  root.querySelectorAll('.desktop-icons').forEach(d => d.remove());
  // Neu rendern
  if (typeof renderIcons === 'function') renderIcons();
  // Explorer Fenster aktualisieren (falls auto)
  if (typeof refreshExplorerWindows === 'function') refreshExplorerWindows();
}

function playStartupSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(660, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(990, ctx.currentTime + 0.35);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 1.2);
  } catch {}
}
// ...existing code...
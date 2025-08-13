const icons = [
  {
    id: 1,
    name: "Explorer",
    icon: "🗂️"
  },
  {
    id: 2,
    name: "Editor",
    icon: "📝"
  },
  {
    id: 3,
    name: "Browser",
    icon: "🌐"
  },
  {
    id: 4,
    name: "Terminal",
    icon: "💻"
  },
  {
    id: 5,
    name: "Trash",
    icon: "🗑️"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  if (window.VFS) {
    const tree = VFS.load();
    VFS.syncPrograms(tree, icons);
  VFS.ensureInfoFile(tree);
    if (typeof refreshExplorerWindows === 'function') refreshExplorerWindows();
  }
});

function $(sel, parent = document) { return parent.querySelector(sel); }

function $all(sel, parent = document) { return parent.querySelectorAll(sel); }

function updateClock() {
  const el = $('.taskbar-time');
  if (el) el.textContent = new Date().toLocaleTimeString();
}

function makeDraggable(win, titleBar) {
  let isDragging = false;
  let offsetX = 0, offsetY = 0;
  let longPressTimer = null;
  let startPX = 0, startPY = 0;
  const LONG_PRESS_MS = 420; 
  const MOVE_TOL = 8; 
  titleBar.style.touchAction = "none";

  function startDrag(x, y) {
    const rect = win.getBoundingClientRect();
    offsetX = x - rect.left;
    offsetY = y - rect.top;
    isDragging = true;
    win.style.zIndex = ++window.zCounter;
    document.body.style.cursor = "grabbing";
  }
  function moveDrag(x, y) {
    const maxX = window.innerWidth - win.offsetWidth;
    const maxY = window.innerHeight - win.offsetHeight - 38;
    win.style.left = Math.max(0, Math.min(x - offsetX, maxX)) + 'px';
    win.style.top  = Math.max(0, Math.min(y - offsetY, maxY)) + 'px';
  }
  function endDrag() {
    isDragging = false;
    document.body.style.cursor = "";
  }
  function clearLongPress() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }
  titleBar.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') {
      startPX = e.clientX;
      startPY = e.clientY;
      clearLongPress();
      longPressTimer = setTimeout(() => {
        longPressTimer = null;
        startDrag(e.clientX, e.clientY);
      }, LONG_PRESS_MS);
    } else {
      startDrag(e.clientX, e.clientY); // Maus / Pen sofort
    }
  });

  document.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch' && !isDragging && longPressTimer) {
      // Wenn Finger zu weit bewegt -> Long-Press abbrechen (kein Drag starten)
      if (Math.abs(e.clientX - startPX) > MOVE_TOL || Math.abs(e.clientY - startPY) > MOVE_TOL) {
        clearLongPress();
      }
    }
    if (isDragging) moveDrag(e.clientX, e.clientY);
  });

  ['pointerup','pointercancel','pointerleave'].forEach(ev => {
    document.addEventListener(ev, () => {
      clearLongPress();
      if (isDragging) endDrag();
    });
  });
}

function makeScaleAble(win) {
  let isResizing = false;
  let startX, startY, startWidth, startHeight;
  const resizer = document.createElement('div');
  resizer.className = 'window-resizer';
  resizer.style.touchAction = "none";
  win.appendChild(resizer);

  function start(e) {
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = win.offsetWidth;
    startHeight = win.offsetHeight;
    document.body.style.cursor = "nwse-resize";
  }
  function move(e) {
    if (!isResizing) return;
    const newWidth = startWidth + (e.clientX - startX);
    const newHeight = startHeight + (e.clientY - startY);
    win.style.width = Math.max(340, newWidth) + 'px';
    win.style.height = Math.max(200, newHeight) + 'px';
  }
  function end() {
    isResizing = false;
    document.body.style.cursor = "";
  }

  resizer.addEventListener('pointerdown', start);
  document.addEventListener('pointermove', move);
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);
}

function getWindowContent(appName, explorerPath = "") {
  if (appName === "Explorer") return `<b>Explorer</b><br>${renderExplorerView(explorerPath || "C:/")}`;
  if (appName === "Editor")   return renderEditorView();
  if (appName === "Browser")  return renderBrowserView("https://patrick-schmidt.info");
  if (appName === "Trash")    return `<b>Papierkorb</b><br>${renderTrashView()}`;
  if (appName === "Terminal") return renderTerminalView();
  return "Noch keine App!";
}

function openWindow(appId, appName, explorerPath = "") {
  const win = document.createElement('div');
  win.className = 'window';
  win.dataset.winid = appId;
  win.dataset.app = appName; 
  win.innerHTML = `
    <div class="window-title">
      ${appName}
      <button class="window-close-btn" style="float:right;font-size:16px;cursor:pointer;background:none;border:none;">❌</button>
    </div>
    <div class="window-content">${getWindowContent(appName, explorerPath)}</div>
  `;
  makeDraggable(win, win.querySelector('.window-title'));
  makeScaleAble(win);
  $('#root').appendChild(win);
  window.openCount++;
  win.querySelector('.window-close-btn').onclick = () => win.remove();
  switch (appName) {
    case "Explorer": initExplorer(win, explorerPath); break;
    case "Editor":   initEditor(win); break;
    case "Browser":  initBrowser(win); break;
    case "Trash":    initTrash(win); break;
    case "Terminal": initTerminal(win); break;
  }
  return win;
}

function renderIcons() {
  // Vorhandenes Icon-Container entfernen
  const old = document.querySelector('.desktop-icons');
  if (old) old.remove();

  const container = document.createElement('div');
  container.className = 'desktop-icons';

  // 1) Feste App-Icons
  icons.forEach(app => {
    const el = document.createElement('div');
    el.className = 'desktop-icon';
    el.innerHTML = `<div class="icon-img">${app.icon}</div><div class="icon-title">${app.name}</div>`;
    el.ondblclick = () => openWindow(app.id, app.name);
    container.appendChild(el);
  });

  // 2) Dateien aus C:/Desktop
  try {
    if (window.VFS) {
      const tree = VFS.load();
      VFS.ensureInfoFile && VFS.ensureInfoFile(tree); // INFO.txt sicherstellen
      const list = VFS.list(tree, 'C:/Desktop')
        .filter(e => e.type === 'file');

      list.forEach(f => {
        const el = document.createElement('div');
        el.className = 'desktop-icon';
        const icon = f.name.toLowerCase().endsWith('.txt') ? '📄'
                   : f.name.toLowerCase().endsWith('.js')  ? '🧩'
                   : '📄';
        el.innerHTML = `<div class="icon-img">${icon}</div><div class="icon-title">${f.name}</div>`;
        el.ondblclick = () => {
          const full = 'C:/Desktop/' + f.name;
          const data = VFS.readFile(tree, full) || '';
          openEditorWithContent(full, data);
        };
        container.appendChild(el);
      });
    }
  } catch(e) {
    console.warn('Desktop-Dateien Fehler:', e);
  }

  document.getElementById('root').appendChild(container);
}

// Beim Start aufrufen
document.addEventListener('DOMContentLoaded', () => {
  if (window.VFS) {
    const tree = VFS.load();
    VFS.ensureInfoFile && VFS.ensureInfoFile(tree);
  }
  renderIcons();
});

window.zCounter = 10;
window.openCount = 0;
$('#root').innerHTML = "";
renderIcons();
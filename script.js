
// Konfiguration der Desktop-Icons
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
    // Explorer-Fenster aktualisieren falls schon offen
    if (typeof refreshExplorerWindows === 'function') refreshExplorerWindows();
  }
});

// Hilfsfunktionen
function $(sel, parent = document) { return parent.querySelector(sel); }
function $all(sel, parent = document) { return parent.querySelectorAll(sel); }

// Taskbar-Uhr aktualisieren
function updateClock() {
  const el = $('.taskbar-time');
  if (el) el.textContent = new Date().toLocaleTimeString();
}

// Fenster verschiebbar machen
function makeDraggable(win, titleBar) {
  let isDragging = false;
  let offsetX = 0, offsetY = 0;
  let longPressTimer = null;
  let startPX = 0, startPY = 0;
  const LONG_PRESS_MS = 420;   // Dauer fürs Gedrückthalten
  const MOVE_TOL = 8;          // Toleranz bevor Long-Press abbricht
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

// Fenster-Content je nach App
function getWindowContent(appName, explorerPath = "") {
  if (appName === "Explorer") return `<b>Explorer</b><br>${renderExplorerView(explorerPath || "C:/")}`;
  if (appName === "Editor")   return renderEditorView();
  if (appName === "Browser")  return renderBrowserView("https://patrick-schmidt.info");
  if (appName === "Trash")    return `<b>Papierkorb</b><br>${renderTrashView()}`;
  if (appName === "Terminal") return renderTerminalView();
  return "Noch keine App!";
}

// Fenster öffnen
function openWindow(appId, appName, explorerPath = "") {
  const win = document.createElement('div');
  win.className = 'window';
  win.dataset.winid = appId;
  win.dataset.app = appName; // wichtig für Refresh
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

// Desktop Icons rendern
function renderIcons() {
  const container = document.createElement('div');
  container.className = "desktop-icons";
  icons.forEach(icon => {
    const el = document.createElement('div');
    el.className = "desktop-icon";
    el.innerHTML = `<div class="icon-img">${icon.icon}</div><div class="icon-title">${icon.name}</div>`;
    el.ondblclick = () => openWindow(icon.id, icon.name);
    container.appendChild(el);
  });
  $('#root').appendChild(container);
}

// Initialisierung
window.zCounter = 10;
window.openCount = 0;
$('#root').innerHTML = ""; // Clean Up
renderIcons();


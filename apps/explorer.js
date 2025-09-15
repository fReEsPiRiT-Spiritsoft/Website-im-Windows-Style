

function initExplorer(win, path = "C:/") {
  win.dataset.explorerPath = VFS.normalize(path || 'C:/');
  renderExplorerInto(win);
  setupExplorerEventsFS(win);
}

function renderExplorerView(currentPath = "C:/") {
  const tree = VFS.load(); // Laden falls extern geändert
  currentPath = VFS.normalize(currentPath);
  const entries = VFS.list(tree, currentPath);
  let html = `<div class="explorer-toolbar">
    <span class="explorer-path">${currentPath}</span>
    <div class="explorer-actions">
      <button class="explorer-up-btn" title="Eine Ebene hoch">⬆</button>
      <button class="explorer-new-folder" title="Neuer Ordner">📁+</button>
    </div>
  </div>`;
  html += `<div class="explorer-grid">`;

  // Parent (außer Root)
  if (currentPath !== 'C:/') {
    html += `
      <div class="explorer-folder" data-folder="..">
        <div class="explorer-icon">⬅️</div>
        <div class="explorer-label">Zurück</div>
      </div>`;
  }

  entries.forEach(e => {
    if (e.type === 'dir') {
      html += `
        <div class="explorer-folder" data-folder="${e.name}">
          <div class="explorer-icon">📁</div>
          <div class="explorer-label">${e.name}</div>
        </div>`;
    } else {
      // Datei
      const icon = e.name.endsWith('.js') ? '🧩' : '📄';
      html += `
        <div class="explorer-file" data-fname="${e.name}">
          <div class="explorer-icon">${icon}</div>
          <div class="explorer-label">${e.name}</div>
        </div>`;
    }
  });

  html += `</div>`;
  return html;
}

function renderExplorerInto(win) {
  const path = win.dataset.explorerPath || 'C:/';
  win.querySelector('.window-content').innerHTML =
    `<b>Explorer</b><br>${renderExplorerView(path)}`;
}

function setupExplorerEventsFS(win) {
  const content = win.querySelector('.window-content');
  if (!content) return;
  const currentPath = win.dataset.explorerPath || 'C:/';

  // Up Button
  const upBtn = content.querySelector('.explorer-up-btn');
  if (upBtn) {
    upBtn.onclick = () => {
      goUp();
    };
  }

  // Neuer Ordner
  const newFolderBtn = content.querySelector('.explorer-new-folder');
  if (newFolderBtn) {
    newFolderBtn.onclick = () => {
      showFilenameDialog(win, {
        title: "Neuer Ordner",
        value: "",
        onOk: (name) => {
          const tree = VFS.load();
          const res = VFS.mkdir(tree, currentPath, name);
          if (!res.ok) {
            showInfo("Fehler: " + res.error, { type: 'error' });
          } else {
            showInfo("Ordner erstellt", { type: 'success' });
            renderExplorerInto(win);
            setupExplorerEventsFS(win);
          }
        }
      });
    };
  }

  // Ordner Doppelklick
  content.querySelectorAll('.explorer-folder').forEach(el => {
    el.ondblclick = () => {
      const folder = el.getAttribute('data-folder');
      if (folder === '..') {
        goUp();
      } else {
        navigateInto(folder);
      }
    };
  });

  // Datei Doppelklick -> Editor öffnen
  content.querySelectorAll('.explorer-file').forEach(el => {
    el.ondblclick = () => {
      const fname = el.getAttribute('data-fname');
      const fullPath = (currentPath.endsWith('/') ? currentPath : currentPath + '/') + fname;
      const tree = VFS.load();
      const data = VFS.readFile(tree, fullPath) ?? '';
      openEditorWithContent(fullPath, data);
    };
  });

  function goUp() {
    if (currentPath === 'C:/') return;
    const parts = currentPath.replace(/\\/g, '/').split('/');
    parts.pop(); // letzte (leer)
    parts.pop(); // Ordner
    let newPath = 'C:/';
    if (parts.length > 1) {
      newPath = parts.join('/') + '/';
    }
    win.dataset.explorerPath = VFS.normalize(newPath);
    renderExplorerInto(win);
    setupExplorerEventsFS(win);
  }

  function navigateInto(folder) {
    const newPath = VFS.normalize(currentPath + (currentPath.endsWith('/') ? '' : '/') + folder + '/');
    win.dataset.explorerPath = newPath;
    renderExplorerInto(win);
    setupExplorerEventsFS(win);
  }
  // --- Drag & Drop Upload ---
  content.addEventListener('dragover', e => {
    e.preventDefault();
    content.classList.add('dragover');
  });
  content.addEventListener('dragleave', e => {
    e.preventDefault();
    content.classList.remove('dragover');
  });
  content.addEventListener('drop', async e => {
    e.preventDefault();
    content.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (!files || !files.length) return;
    const tree = await VFS.load();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = function (evt) {
        // Schreibe Datei ins aktuelle Verzeichnis
        const path = currentPath + (currentPath.endsWith('/') ? '' : '/') + file.name;
        VFS.writeFile(tree, path, evt.target.result);
        VFS.save(tree);
        showInfo(`Datei "${file.name}" hochgeladen`, { type: 'success' });
        renderExplorerInto(win);
        setupExplorerEventsFS(win);
      };
      reader.readAsText(file); // Für Textdateien, für Binärdaten ggf. readAsArrayBuffer
    }
  });
}

function refreshExplorerWindows() {
  document.querySelectorAll('.window[data-app="Explorer"]').forEach(win => {
    renderExplorerInto(win);
    setupExplorerEventsFS(win);
  });
}

// moveFileToTrash bleibt falls noch genutzt – kann aber angepasst werden
function moveFileToTrash(fname) {
  // Optional: Integration in VFS (hier Legacy-Funktion belassen)
  const key = "textfiles/" + fname;
  const data = localStorage.getItem(key);
  if (data === null) return false;
  let trashKey = "trashfiles/" + fname;
  if (localStorage.getItem(trashKey)) {
    trashKey = "trashfiles/" + Date.now() + "_" + fname;
  }
  localStorage.setItem(trashKey, data);
  localStorage.removeItem(key);
  return true;
}

// el.ondblclick = () => {
//   const fname = el.getAttribute('data-fname');
//   const fullPath = (currentPath.endsWith('/') ? currentPath : currentPath + '/') + fname;
//   const tree = VFS.load();
//   const node = VFS.getNode(tree, fullPath);
//   if (fname === 'launcher.app' && node && node.type === 'file') {
//     try {
//       const meta = JSON.parse(node.content);
//       const iconObj = (window.icons || []).find(i => i.id == meta.appId);
//       if (iconObj) {
//         openWindow(iconObj.id, iconObj.name);
//         return;
//       }
//     } catch {}
//   }
//   const data = VFS.readFile(tree, fullPath) ?? '';
//   openEditorWithContent(fullPath, data);
// };

let ctxTargetFile = null;
const explorerCtxMenu = document.getElementById('explorer-contextmenu') || (() => {
  const el = document.createElement('div');
  el.id = 'explorer-contextmenu';
  document.body.appendChild(el);
  return el;
})();

// Kontextmenü ausblenden bei Klick außerhalb
document.addEventListener('click', () => {
  explorerCtxMenu.style.display = 'none';
  ctxTargetFile = null;
});

// Kontextmenü für Dateien im Explorer
document.addEventListener('contextmenu', async e => {
  const fileEl = e.target.closest('.explorer-file');
  if (!fileEl) return;
  e.preventDefault();
  ctxTargetFile = fileEl;
  const fname = fileEl.getAttribute('data-fname');
  explorerCtxMenu.innerHTML = `
    <div class="ctx-item" data-action="open">Öffnen</div>
    <div class="ctx-item" data-action="delete">Löschen</div>
  `;
  explorerCtxMenu.style.left = e.pageX + 'px';
  explorerCtxMenu.style.top = e.pageY + 'px';
  explorerCtxMenu.style.display = 'block';
});

// Aktionen
explorerCtxMenu.onclick = async function(e) {
  const item = e.target.closest('.ctx-item');
  if (!item || !ctxTargetFile) return;
  const action = item.dataset.action;
  const fname = ctxTargetFile.getAttribute('data-fname');
  // Ermittle das aktuelle Verzeichnis
  const win = ctxTargetFile.closest('.window[data-app="Explorer"]');
  const currentPath = win?.dataset.explorerPath || 'C:/';
  const fullPath = (currentPath.endsWith('/') ? currentPath : currentPath + '/') + fname;

  if (action === 'open') {
    ctxTargetFile.ondblclick && ctxTargetFile.ondblclick();
  }
  if (action === 'delete') {
    if (window.VFS) {
      const tree = await VFS.load();
      const parts = fullPath.replace(/\\/g,'/').split('/');
      const file = parts.pop();
      const parentPath = parts.join('/') + '/';
      const parent = VFS.getNode(tree, parentPath);
      if (parent && parent.children && parent.children[file]) {
        delete parent.children[file];
        await VFS.save(tree);
        showInfo && showInfo(`Datei "${fname}" gelöscht`, {type:'success'});
        renderExplorerInto(win);
        setupExplorerEventsFS(win);
      }
    }
  }
  explorerCtxMenu.style.display = 'none';
  ctxTargetFile = null;
};
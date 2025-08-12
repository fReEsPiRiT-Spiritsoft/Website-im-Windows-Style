function initExplorer(win, path="") {
  setupExplorerEvents(win, path);
}

// Explorer-Ansicht als eigene Funktion
function renderExplorerView(currentPath = "") {
  // Wenn wir im Root sind, nur die Ordner anzeigen
  if (!currentPath || currentPath === "") {
    const folders = [
      { name: "Dokumente", icon: "📁" },
      { name: "Bilder", icon: "🖼️" }
    ];
    let html = `<div class="explorer-grid">`;
    folders.forEach(folder => {
      html += `
        <div class="explorer-folder" data-folder="${folder.name}">
          <div class="explorer-icon">${folder.icon}</div>
          <div class="explorer-label">${folder.name}</div>
        </div>
      `;
    });
    html += `</div>`;
    return html;
  }

  // Wenn wir im Ordner "Dokumente" sind, Textdateien anzeigen
  if (currentPath === "Dokumente") {
    let files = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("textfiles/")) {
        files.push(key.replace("textfiles/", ""));
      }
    }
    let html = `<div class="explorer-grid">`;
    html += `
      <div class="explorer-folder" data-folder="..">
        <div class="explorer-icon">⬅️</div>
        <div class="explorer-label">Zurück</div>
      </div>
    `;
    files.forEach(file => {
      html += `
        <div class="explorer-file" data-fname="${file}">
          <div class="explorer-icon">📄</div>
          <div class="explorer-label">${file}</div>
        </div>
      `;
    });
    html += `</div>`;
    return html;
  }

  // Sonst: leer
  return `<div class="explorer-grid"></div>`;
}

// Hilfsfunktion für Explorer-Events (Ordnernavigation)
function setupExplorerEvents(win, explorerPath) {
  // Ordner öffnen
  win.querySelectorAll('.explorer-folder').forEach(el => {
    el.ondblclick = () => {
      const folder = el.getAttribute('data-folder');
      if (folder === "..") {
        win.querySelector('.window-content').innerHTML = renderExplorerView("");
        setupExplorerEvents(win, "");
      } else {
        win.querySelector('.window-content').innerHTML = renderExplorerView(folder);
        setupExplorerEvents(win, folder);
      }
    };
  });
  // Dateien öffnen
  win.querySelectorAll('.explorer-file').forEach(el => {
    el.ondblclick = () => {
      const fname = el.getAttribute('data-fname');
      const content = localStorage.getItem("textfiles/" + fname);
      openEditorWithContent(fname, content);
    };
  });
}

function refreshExplorerWindows() {
  document.querySelectorAll('.window[data-app="Explorer"]').forEach(win => {
    const path = win.dataset.explorerPath || "";
    win.querySelector('.window-content').innerHTML = `<b>Explorer</b><br>${renderExplorerView(path)}`;
    setupExplorerEvents(win, path);
  });
}

function moveFileToTrash(fname) {
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
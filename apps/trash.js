
function renderTrashView() {
  const files = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith("trashfiles/")) files.push(k.substring(11));
  }
  let html = `<div class="explorer-grid">`;
  if (!files.length) {
    html += `<div style="opacity:.7;font-size:14px;">(Papierkorb leer)</div>`;
  } else {
    files.forEach(f => {
      html += `
        <div class="trash-file" data-fname="${f}">
          <div class="explorer-icon">🗑️</div>
          <div class="explorer-label">${f}</div>
          <div class="trash-actions">
            <button class="trash-restore" title="Wiederherstellen">↩️</button>
            <button class="trash-delete" title="Endgültig löschen">✖</button>
          </div>
        </div>
      `;
    });
  }
  html += `</div>`;
  return html;
}

function refreshTrashWindows() {
  document.querySelectorAll('.window[data-app="Trash"]').forEach(win => {
    win.querySelector('.window-content').innerHTML = `<b>Papierkorb</b><br>${renderTrashView()}`;
    initTrash(win);
  });
}

function initTrash(win) {
  win.querySelectorAll('.trash-restore').forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      const box = btn.closest('.trash-file');
      const fname = box.getAttribute('data-fname');
      const data = localStorage.getItem("trashfiles/" + fname);
      if (data === null) return;
      if (localStorage.getItem("textfiles/" + fname)) {
        if (!confirm("Datei existiert bereits. Überschreiben?")) return;
      }
      localStorage.setItem("textfiles/" + fname, data);
      localStorage.removeItem("trashfiles/" + fname);
      refreshTrashWindows();
      if (typeof refreshExplorerWindows === "function") refreshExplorerWindows();
    };
  });

  win.querySelectorAll('.trash-delete').forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      const box = btn.closest('.trash-file');
      const fname = box.getAttribute('data-fname');
      if (!confirm(`Datei '${fname}' endgültig löschen?`)) return;
      localStorage.removeItem("trashfiles/" + fname);
      refreshTrashWindows();
    };
  });

  win.querySelectorAll('.trash-file').forEach(el => {
    el.ondblclick = () => {
      const fname = el.getAttribute('data-fname');
      const content = localStorage.getItem("trashfiles/" + fname);
      if (!content) return;
      if (!localStorage.getItem("textfiles/" + fname)) {
        localStorage.setItem("textfiles/" + fname, content);
        localStorage.removeItem("trashfiles/" + fname);
        if (typeof refreshTrashWindows === "function") refreshTrashWindows();
      }
      if (typeof refreshExplorerWindows === "function") refreshExplorerWindows();
      openEditorWithContent(fname, content);
    };
  });
}
// Editor-Template ausgelagert
function renderEditorView() {
  return `
    <textarea id="editor-text" class="editor-textarea"
      style="width:100%;height:calc(100% - 120px);max-height:500px;">Hier kannst du Text bearbeiten!</textarea>
      <div class="editor-toolbar">
      <button id="save-btn" class="btn btn-primary">💾 Speichern</button>
      <button id="delete-btn" class="btn btn-danger" title="Datei in den Papierkorb verschieben">🗑️ Löschen</button>
      <span class="editor-filename-label">(neue Datei)</span>
    </div>
  `;
}

// Bestätigungs-Modal
function showConfirm(win, message, onYes) {
  if (win.querySelector('.editor-confirm')) return;
  const overlay = document.createElement('div');
  overlay.className = 'editor-confirm';
  overlay.innerHTML = `
    <div class="editor-confirm-box">
      <div class="editor-confirm-msg">${message}</div>
      <div class="editor-confirm-actions">
        <button class="editor-confirm-yes">Ja</button>
        <button class="editor-confirm-no">Nein</button>
      </div>
    </div>
  `;
  win.appendChild(overlay);
  overlay.querySelector('.editor-confirm-no').onclick = () => overlay.remove();
  overlay.querySelector('.editor-confirm-yes').onclick = () => {
    overlay.remove();
    onYes && onYes();
  };
}

function showInfo(message, {timeout=1700, type='info'} = {}) {
  const old = document.querySelector('.app-info-modal');
  if (old) old.remove();
  const wrap = document.createElement('div');
  wrap.className = `app-info-modal app-info-${type}`;
  wrap.innerHTML = `
    <div class="app-info-box">
      <div class="app-info-text">${message}</div>
      <button class="app-info-close">OK</button>
    </div>`;
  document.body.appendChild(wrap);
  const close = () => {
    wrap.classList.add('closing');
    setTimeout(()=>wrap.remove(), 220);
  };
  wrap.querySelector('.app-info-close').onclick = close;
  if (timeout) setTimeout(close, timeout);
}

function showFilenameDialog(win, {title="Dateiname eingeben", value="", onOk, onCancel} = {}) {
  if (win.querySelector('.editor-prompt')) return;
  const wrap = document.createElement('div');
  wrap.className = 'editor-prompt';
  wrap.innerHTML = `
    <div class="editor-prompt-box">
      <div class="editor-prompt-title">${title}</div>
      <input type="text" class="editor-prompt-input" value="${value.replace(/"/g,'&quot;')}" placeholder="z.B. notizen.txt">
      <div class="editor-prompt-actions">
        <button class="editor-prompt-cancel">Abbrechen</button>
        <button class="editor-prompt-ok">OK</button>
      </div>
    </div>
  `;
  win.appendChild(wrap);
  const input = wrap.querySelector('.editor-prompt-input');
  setTimeout(()=>input.focus(),30);

  function close() { wrap.classList.add('closing'); setTimeout(()=>wrap.remove(),180); }
  wrap.querySelector('.editor-prompt-cancel').onclick = () => { close(); onCancel && onCancel(); };
  wrap.querySelector('.editor-prompt-ok').onclick = submit;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') submit();
    else if (e.key === 'Escape') { close(); onCancel && onCancel(); }
  });
  function submit() {
    const v = input.value.trim();
    if (!v) { input.classList.add('shake'); setTimeout(()=>input.classList.remove('shake'),400); return; }
    close();
    onOk && onOk(v);
  }
}

// Überschreib-Dialog (anstelle confirm)
function confirmOverwrite(win, fname, onYes, onNo) {
  showConfirm(win, `Datei '${fname}' überschreiben?`, onYes, onNo);
}

// Einzige gültige initEditor (bitte doppelte alte Version entfernen)
function initEditor(win) {
  const saveBtn = win.querySelector('#save-btn');
  const delBtn  = win.querySelector('#delete-btn');
  const ta      = win.querySelector('#editor-text');
  const nameLbl = win.querySelector('.editor-filename-label');

  function updateLabel() {
    nameLbl.textContent = win.dataset.filename ? win.dataset.filename : '(neue Datei)';
    const titleEl = win.querySelector('.window-title');
    if (titleEl && titleEl.firstChild && titleEl.firstChild.nodeType === Node.TEXT_NODE) {
      const base = 'Editor';
      titleEl.firstChild.textContent = win.dataset.filename ? (base + ' - ' + win.dataset.filename) : base;
    }
  }

  function performSave(fname) {
    localStorage.setItem("textfiles/" + fname, ta.value);
    win.dataset.filename = fname;
    updateLabel();
    refreshExplorerWindows && refreshExplorerWindows();
    showInfo("Gespeichert: " + fname, {type:'success'});
  }

  function requestFilenameAndSave() {
    showFilenameDialog(win, {
      title: "Dateiname speichern",
      value: "",
      onOk: (fname) => {
        if (localStorage.getItem("textfiles/" + fname)) {
          confirmOverwrite(win, fname, () => performSave(fname));
        } else {
          performSave(fname);
        }
      }
    });
  }

  function saveFile() {
    let fname = win.dataset.filename;
    if (!fname) {
      requestFilenameAndSave();
      return;
    }
    // Existiert schon -> direkt überschreiben ohne Dialog
    performSave(fname);
  }

  function trashFile() {
    const fname = win.dataset.filename;
    if (!fname) {
      showInfo("Keine gespeicherte Datei.", {type:'warn'});
      return;
    }
    showConfirm(win, `Datei '${fname}' in den Papierkorb verschieben?`, () => {
      const ok = moveFileToTrash(fname);
      if (ok) {
        refreshExplorerWindows && refreshExplorerWindows();
        refreshTrashWindows && refreshTrashWindows();
        showInfo("Verschoben in Papierkorb: " + fname, {type:'info'});
        win.remove();
      } else {
        showInfo("Fehler beim Verschieben.", {type:'error', timeout:5300});
      }
    });
  }

  saveBtn && (saveBtn.onclick = saveFile);
  delBtn  && (delBtn.onclick  = trashFile);
  updateLabel();
}

function openEditorWithContent(fname, content) {
  const win = openWindow("editor-" + fname, "Editor");
  win.dataset.filename = fname;
  setTimeout(() => {
    const ta = win.querySelector('#editor-text');
    if (ta) ta.value = content || "";
    const lbl = win.querySelector('.editor-filename-label');
    if (lbl) lbl.textContent = fname;
    const titleEl = win.querySelector('.window-title');
    if (titleEl && titleEl.firstChild) titleEl.firstChild.textContent = 'Editor - ' + fname;
  }, 30);
}
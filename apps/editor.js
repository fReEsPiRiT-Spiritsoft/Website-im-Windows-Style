// Editor-Template ausgelagert
function renderEditorView() {
  return `
    <textarea id="editor-text" class="editor-textarea"
      style="width:100%;height:calc(100% - 120px);max-height:500px;" placeholder="Hier kannst du Text bearbeiten!"></textarea>
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
    nameLbl.textContent = win.dataset.filePath || '(neu)';
    renderIcons();
  }

  function performSave(path) {
    const tree = VFS.load();
    const res = VFS.writeFile(tree, path, ta.value);
    if (!res.ok) {
      showInfo("Fehler: " + res.error, {type:'error'});
    } else {
      win.dataset.filePath = path;
      updateLabel();
      refreshExplorerWindows && refreshExplorerWindows();
      showInfo("Gespeichert", {type:'success'});
      // renderIcons();
    }
  }

  function saveFile() {
    const current = win.dataset.filePath;
    if (!current) {
      showSaveDialog(win, {
        initialPath: "C:/Dokumente/",
        defaultName: "",
        onSave: performSave
      });
      return;
    }
    performSave(current);
  }

  function deleteFile() {
    const path = win.dataset.filePath;
    if (!path) {
      showInfo("Keine Datei zu löschen", {type:'warn'});
      return;
    }
    showConfirm(win, `Datei '${path}' in den Papierkorb verschieben?`, () => {
      const res = vfsMoveFileToTrash(path);
      if (!res.ok) {
        showInfo("Fehler: " + res.error, {type:'error'});
        return;
      }
      win.dataset.filePath = "";
      ta.value = "";
      updateLabel();
      refreshExplorerWindows && refreshExplorerWindows();
      refreshTrashWindows && refreshTrashWindows();
      showInfo("In Papierkorb verschoben: " + res.name, {type:'success'});
      // renderIcons();
    });
  }

  saveBtn && (saveBtn.onclick = saveFile);
  delBtn && (delBtn.onclick  = deleteFile);
  updateLabel();
}

function openEditorWithContent(fullPath, content) {
  const win = openWindow('editor-'+Date.now(), 'Editor');
  win.dataset.filePath = fullPath;
  const ta = win.querySelector('#editor-text');
  if (ta) ta.value = content || '';
  const lbl = win.querySelector('.editor-filename-label');
  if (lbl) lbl.textContent = fullPath || '(neu)';
  return win;
}

function ensureTextExtension(name) {
  let n = name.trim();
  if (!n) return n;
  // Letzten Slash entfernen (sicherheitshalber keine Pfadangaben zulassen)
  n = n.replace(/[\\/]+/g,'_');
  // Falls Punkt am Ende -> entfernen
  if (n.endsWith('.')) n = n.slice(0,-1);
  // Wenn kein weiterer Punkt (keine Extension) -> .txt anhängen
  if (!/\.[A-Za-z0-9]{1,10}$/.test(n)) {
    n += '.txt';
  }
  return n;
}

function vfsMoveFileToTrash(fullPath) {
  const tree = VFS.load();
  const norm = VFS.normalize(fullPath);
  const node = VFS.getNode(tree, norm);
  if (!node || node.type !== 'file') return {ok:false, error:'Datei nicht gefunden'};

  const parts = norm.replace(/\\/g,'/').split('/');
  const fname = parts.pop();
  if (!fname) return {ok:false, error:'Ungültiger Pfad'};
  const parentPath = parts.join('/') + '/';
  const parent = VFS.getNode(tree, parentPath);
  if (!parent || parent.type !== 'dir') return {ok:false, error:'Elternordner fehlt'};
  const content = node.content || '';
  let trashKey = 'trashfiles/' + fname;
  if (localStorage.getItem(trashKey)) {
    trashKey = 'trashfiles/' + Date.now() + '_' + fname;
  }
  localStorage.setItem(trashKey, content);
  delete parent.children[fname];
  VFS.save(tree);
  return {ok:true, name:fname};
}

function showSaveDialog(win, {
  title = "Speichern unter",
  initialPath = "C:/Dokumente/",
  defaultName = "",
  onSave,
  onCancel
} = {}) {
  if (win.querySelector('.editor-save-dialog')) return;
  let currentPath = VFS.normalize(initialPath);
  if (!currentPath.endsWith('/')) currentPath += '/';

  const wrap = document.createElement('div');
  wrap.className = 'editor-save-dialog';
  wrap.innerHTML = `
    <div class="editor-save-box">
      <div class="editor-save-head">
        <div class="editor-save-title">${title}</div>
        <button class="editor-save-close" title="Schließen">✕</button>
      </div>
      <div class="editor-save-path"></div>
      <div class="editor-save-browser">
        <div class="editor-save-folders"></div>
        <div class="editor-save-side">
          <label class="editor-save-label">Dateiname:</label>
          <input type="text" class="editor-save-fname" value="${defaultName.replace(/"/g,'&quot;')}" placeholder="z.B. notizen.txt">
          <div class="editor-save-actions">
            <button class="editor-save-cancel">Abbrechen</button>
            <button class="editor-save-ok">Speichern</button>
          </div>
          <div class="editor-save-hint">Ordner doppelklicken zum Öffnen • „..“ = hoch</div>
        </div>
      </div>
    </div>
  `;
  win.appendChild(wrap);

  const elPath   = wrap.querySelector('.editor-save-path');
  const elFolders= wrap.querySelector('.editor-save-folders');
  const inpName  = wrap.querySelector('.editor-save-fname');

  function close(doCancel=false) {
    wrap.classList.add('closing');
    setTimeout(()=>wrap.remove(),180);
    if (doCancel) onCancel && onCancel();
  }

  wrap.querySelector('.editor-save-close').onclick =
  wrap.querySelector('.editor-save-cancel').onclick = () => close(true);

  wrap.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.stopPropagation(); close(true); }
  });

  function renderFolderList() {
    elPath.textContent = currentPath;
    const tree = VFS.load();
    const list = VFS.list(tree, currentPath).filter(e=>e.type==='dir');
    let html = `<div class="editor-save-folder-row" data-nav="..">[..]</div>`;
    list.forEach(f=>{
      html += `<div class="editor-save-folder-row" data-nav="${f.name}">📁 ${f.name}</div>`;
    });
    elFolders.innerHTML = html;
    elFolders.querySelectorAll('.editor-save-folder-row').forEach(row=>{
      row.ondblclick = () => {
        const nav = row.getAttribute('data-nav');
        if (nav === '..') goUp();
        else enter(nav);
      };
      row.onclick = () => {
        elFolders.querySelectorAll('.editor-save-folder-row.active').forEach(a=>a.classList.remove('active'));
        row.classList.add('active');
      };
    });
  }

  function goUp() {
    if (currentPath === 'C:/') return;
    const parts = currentPath.replace(/\\/g,'/').split('/').filter(Boolean);
    // parts: ["C:", "Ordner", ...]
    parts.pop(); // entfernt Leer wegen trailing slash
    parts.pop(); // entfernt aktuellen Ordner
    if (parts.length === 1) {
      currentPath = 'C:/';
    } else {
      currentPath = parts.join('/') + '/';
    }
    renderFolderList();
  }

  function enter(name) {
    currentPath += (name + '/');
    currentPath = VFS.normalize(currentPath);
    if (!currentPath.endsWith('/')) currentPath += '/';
    renderFolderList();
  }

  function submit() {
    let fname = inpName.value.trim();
    if (!fname) {
      inpName.classList.add('shake');
      setTimeout(()=>inpName.classList.remove('shake'),400);
      return;
    }
    fname = ensureTextExtension(fname);
    const fullPath = currentPath + fname;
    // Existiert?
    const node = VFS.getNode(VFS.load(), fullPath);
    const doSave = () => {
      onSave && onSave(fullPath);
      close(false);
    };
    if (node && node.type === 'file') {
      // Überschreiben bestätigen
      showConfirm(win, `Datei '${fullPath}' überschreiben?`, doSave);
    } else {
      doSave();
    }
  }

  wrap.querySelector('.editor-save-ok').onclick = submit;
  inpName.addEventListener('keydown', e=>{
    if (e.key === 'Enter') submit();
  });

  renderFolderList();
  setTimeout(()=>inpName.focus(),30);
}
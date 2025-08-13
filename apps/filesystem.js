// Virtuelles Dateisystem (VFS) für Explorer & Editor

const FS_STORAGE_KEY = 'fsTreeV1';

function fs_now() { return Date.now(); }

// Standard-Struktur (nur wenn kein FS existiert)
const FS_DEFAULT = {
  version: 1,
  drives: {
    'C:': {
      type: 'dir',
      children: {
  'Desktop': { type:'dir', children:{} },
        'Dokumente': { type:'dir', children:{} },
        'Bilder':     { type:'dir', children:{} },
        'Programme': {
          type:'dir',
          children: {
            'Editor': {
              type:'dir',
              children: {
                'editor.js': {
                  type:'file',
                  content: `// Beispiel Editor-Quellcode\nfunction hello(){ console.log("Editor läuft"); }\n`,
                  modified: fs_now()
                }
              }
            }
          }
        }
      }
    }
  }
};

function fs_load() {
  try {
    const raw = localStorage.getItem(FS_STORAGE_KEY);
    if (!raw) {
      const tree = structuredClone(FS_DEFAULT);
      fs_save(tree);
      fs_migrateLegacyTextFiles(tree);
      fs_postLoadMigrations(tree);
      return tree;
    }
    const tree = JSON.parse(raw);
    fs_postLoadMigrations(tree);
    return tree;
  } catch {
    const tree = structuredClone(FS_DEFAULT);
    fs_save(tree);
    fs_postLoadMigrations(tree);
    return tree;
  }
}

function fs_save(tree) {
  localStorage.setItem(FS_STORAGE_KEY, JSON.stringify(tree));
}

// Migration: alte localStorage Keys textfiles/* in C:/Dokumente
function fs_migrateLegacyTextFiles(tree) {
  const docs = fs_getNode(tree, 'C:/Dokumente');
  if (!docs || docs.type !== 'dir') return;
  let moved = 0;
  for (let i=0;i<localStorage.length;i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('textfiles/')) {
      const fname = k.slice('textfiles/'.length);
      if (!docs.children[fname]) {
        docs.children[fname] = {
          type:'file',
          content: localStorage.getItem(k) || '',
          modified: fs_now()
        };
        moved++;
      }
    }
  }
  if (moved) fs_save(tree);
}

// Hilfsfunktionen Pfad
function fs_normalizePath(path) {
  path = path.trim();
  if (!path) return 'C:/';
  // Vereinheitlichen
  path = path.replace(/\\/g,'/');
  // Entferne doppelte Slashes
  path = path.replace(/\/+/g,'/');
  // Sicherstellen Laufwerk endet mit :
  if (/^[Cc]:?$/.test(path)) return 'C:/';
  // Großes C:
  path = path.replace(/^c:/i,'C:');
  // Entferne führenden Slash vor C:
  path = path.replace(/^\/C:/,'C:');
  if (!/^C:\//.test(path)) {
    if (path.startsWith('/')) path = 'C:' + path;
    else if (!path.startsWith('C:')) path = 'C:/' + path;
  }
  // Wenn kein abschließender Slash für Root
  return path;
}

// Pfad in Segmente (ohne Laufwerk)
function fs_split(path) {
  path = fs_normalizePath(path);
  const m = path.match(/^([A-Z]:)\/?(.*)$/);
  if (!m) return { drive:null, parts:[] };
  const drive = m[1];
  const rest = m[2];
  const parts = rest ? rest.split('/').filter(Boolean) : [];
  return { drive, parts };
}

// Node holen
function fs_getNode(tree, path) {
  path = fs_normalizePath(path);
  const { drive, parts } = fs_split(path);
  if (!drive) return null;
  let cur = tree.drives[drive];
  if (!cur) return null;
  for (const p of parts) {
    if (!cur.children) return null;
    cur = cur.children[p];
    if (!cur) return null;
  }
  return cur;
}

// Inhalt eines Verzeichnisses auflisten
function fs_list(tree, path) {
  const node = fs_getNode(tree, path);
  if (!node || node.type !== 'dir') return [];
  return Object.entries(node.children).map(([name, n]) => ({
    name,
    type: n.type
  })).sort((a,b)=>{
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name, 'de', { sensitivity:'base' });
  });
}

// Verzeichnis anlegen
function fs_mkdir(tree, parentPath, name) {
  name = name.trim();
  if (!name) return { ok:false, error:'Name leer' };
  if (/[/\\]/.test(name)) return { ok:false, error:'Kein Slash erlaubt' };
  const parent = fs_getNode(tree, parentPath);
  if (!parent || parent.type !== 'dir') return { ok:false, error:'Pfad ungültig' };
  if (parent.children[name]) return { ok:false, error:'Existiert bereits' };
  parent.children[name] = { type:'dir', children:{} };
  fs_save(tree);
  return { ok:true };
}

// Datei schreiben (neu/overwrite)
function fs_writeFile(tree, filePath, content) {
  filePath = fs_normalizePath(filePath);
  if (filePath.endsWith('/')) return { ok:false, error:'Pfad ist Verzeichnis' };
  const { drive, parts } = fs_split(filePath);
  if (!drive || parts.length === 0) return { ok:false, error:'Ungültiger Dateipfad' };
  const fname = parts.pop();
  let cur = tree.drives[drive];
  for (const p of parts) {
    if (!cur.children[p]) {
      cur.children[p] = { type:'dir', children:{} };
    }
    cur = cur.children[p];
    if (cur.type !== 'dir') return { ok:false, error:'Pfad-Konflikt' };
  }
  cur.children[fname] = { type:'file', content, modified: fs_now() };
  fs_save(tree);
  return { ok:true };
}

function fs_readFile(tree, filePath) {
  const node = fs_getNode(tree, filePath);
  if (!node || node.type !== 'file') return null;
  return node.content;
}

function fs_ensureProgrammeRoot(tree) {
  const c = tree.drives['C:'];
  if (!c.children['Programme']) {
    c.children['Programme'] = { type:'dir', children:{} };
    return true;
  }
  return false;
}

function fs_syncPrograms(tree, programList) {
  if (!Array.isArray(programList)) return {created:0, updated:0};
  let changed = false;
  fs_ensureProgrammeRoot(tree);
  const progRoot = tree.drives['C:'].children['Programme'];
  let created = 0;
  programList.forEach(p => {
    if (!p || !p.name) return;
    const folderName = p.name; 
    if (!progRoot.children[folderName]) {
      progRoot.children[folderName] = { type:'dir', children:{} };
      changed = true;
    }
    const folder = progRoot.children[folderName];
    if (folder.type !== 'dir') return;
    if (!folder.children['launcher.app']) {
      folder.children['launcher.app'] = {
        type:'file',
        content: JSON.stringify({ appId: p.id, name: p.name }, null, 2),
        kind: 'launcher',
        modified: fs_now()
      };
      created++;
      changed = true;
    }
    if (!folder.children['info.txt']) {
      folder.children['info.txt'] = {
        type:'file',
        content: `Programm: ${p.name}\nID: ${p.id}\nErzeugt: ${new Date().toLocaleString()}\n`,
        modified: fs_now()
      };
      changed = true;
    }
  });
  if (changed) fs_save(tree);
  return {created, updated:0};
}

function fs_ensureInfoFile(tree) {
  fs_ensureFolder(tree, 'C:/Desktop');
  const desktop = fs_getNode(tree, 'C:/Desktop');
  if (!desktop || desktop.type !== 'dir') return false;
  if (!desktop.children['INFO.txt']) {
    desktop.children['INFO.txt'] = {
      type:'file',
      content: `INFO / KURZANLEITUNG\n\nWillkommen!\nDies ist deine Mini-Windows-Umgebung.\nDiese Datei liegt auf dem virtuellen Desktop (C:/Desktop).\n- Explorer: Dateien ansehen\n- Editor: Texte bearbeiten\n- Terminal: Basis-Kommandos\n- Neustart: LocalStorage Reset\n\nViel Spaß!\n`,
      modified: fs_now()
    };
    fs_save(tree);
    return true;
  }
  return false;
}
function fs_ensureFolder(tree, path) {
  path = fs_normalizePath(path);
  const { drive, parts } = fs_split(path);
  if (!drive) return false;
  let cur = tree.drives[drive];
  if (!cur) return false;
  let changed = false;
  for (const part of parts) {
    if (!cur.children[part]) {
      cur.children[part] = { type:'dir', children:{} };
      changed = true;
    }
    cur = cur.children[part];
    if (cur.type !== 'dir') return false;
  }
  if (changed) fs_save(tree);
  return true;
}

function fs_postLoadMigrations(tree) {
  let changed = false;

  if (!fs_getNode(tree, 'C:/Desktop')) {
    fs_ensureFolder(tree, 'C:/Desktop');
    changed = true;
  }
  if (!fs_getNode(tree, 'C:/Programme')) {
    fs_ensureFolder(tree, 'C:/Programme');
    changed = true;
  }

  const desktop = fs_getNode(tree, 'C:/Desktop');
  if (desktop && desktop.type === 'dir') {
    const needCreate = !desktop.children['INFO.txt'];
    const placeholderMarker = '__INFO_PLACEHOLDER__';
    const existing = desktop.children['INFO.txt'];
    if (needCreate) {
      desktop.children['INFO.txt'] = {
        type:'file',
        content: `INFO.txt wird geladen...\n(Platzhalter – wird automatisch ersetzt sobald info.txt verfügbar ist)\n${placeholderMarker}`,
        modified: fs_now()
      };
      changed = true;
      fetch('info.txt', { cache:'no-cache' })
        .then(r => r.ok ? r.text() : null)
        .then(txt => {
          if (!txt) return;
          const tree2 = fs_load();
            const desk2 = fs_getNode(tree2, 'C:/Desktop');
            if (!desk2 || desk2.type !== 'dir') return;
            const infoNode = desk2.children['INFO.txt'];
            if (!infoNode || infoNode.type !== 'file') return;
            if (infoNode.content.includes(placeholderMarker)) {
              infoNode.content = txt;
              infoNode.modified = fs_now();
              fs_save(tree2);
            }
        })
        .catch(()=>{ /* stiller Fallback */ });
    } else if (existing.type === 'file' &&
               existing.content.includes('__INFO_PLACEHOLDER__')) {
      fetch('info.txt', { cache:'no-cache' })
        .then(r => r.ok ? r.text() : null)
        .then(txt => {
          if (!txt) return;
          const tree2 = fs_load();
          const desk2 = fs_getNode(tree2, 'C:/Desktop');
          if (!desk2) return;
          const infoNode = desk2.children['INFO.txt'];
          if (!infoNode || infoNode.type !== 'file') return;
          if (infoNode.content.includes('__INFO_PLACEHOLDER__')) {
            infoNode.content = txt;
            infoNode.modified = fs_now();
            fs_save(tree2);
          }
        })
        .catch(()=>{});
    }
  }

  if (changed) fs_save(tree);
}

function fs_ensureInfoFile() {
  return Promise.resolve(false);
}

window.VFS = {
  load: fs_load,
  save: fs_save,
  list: fs_list,
  mkdir: fs_mkdir,
  writeFile: fs_writeFile,
  readFile: fs_readFile,
  getNode: fs_getNode,
  normalize: fs_normalizePath,
  syncPrograms: fs_syncPrograms,
  ensureInfoFile: fs_ensureInfoFile
};
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
      fs_migrateLegacyTextFiles(tree); // Migration alter textfiles/
      return tree;
    }
    return JSON.parse(raw);
  } catch {
    const tree = structuredClone(FS_DEFAULT);
    fs_save(tree);
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

window.VFS = {
  load: fs_load,
  save: fs_save,
  list: fs_list,
  mkdir: fs_mkdir,
  writeFile: fs_writeFile,
  readFile: fs_readFile,
  getNode: fs_getNode,
  normalize: fs_normalizePath
};
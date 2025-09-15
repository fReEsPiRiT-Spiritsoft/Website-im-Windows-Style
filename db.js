function openBgDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('DesktopSettings', 1);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('background')) {
        db.createObjectStore('background');
      }
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}
function saveBgToDb(dataUrl) {
  return openBgDb().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('background', 'readwrite');
      tx.objectStore('background').put(dataUrl, 'bg');
      tx.oncomplete = resolve;
      tx.onerror = e => reject(e.target.error);
    });
  });
}
function loadBgFromDb() {
  return openBgDb().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('background', 'readonly');
      const req = tx.objectStore('background').get('bg');
      req.onsuccess = () => resolve(req.result);
      req.onerror = e => reject(e.target.error);
    });
  });
}
function removeBgFromDb() {
  return openBgDb().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('background', 'readwrite');
      tx.objectStore('background').delete('bg');
      tx.oncomplete = resolve;
      tx.onerror = e => reject(e.target.error);
    });
  });
}
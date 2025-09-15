function renderSettingsView() {
  return `
    <div class="settings-tabs">
      <button class="settings-tab active" data-tab="background">🖼️ Hintergrund</button>
      <button class="settings-tab" data-tab="info">ℹ️ Info</button>
    </div>
    <div class="settings-content">
      <div class="settings-panel" data-panel="background" style="display:block">
        <h2>Hintergrund ändern</h2>
        <input type="file" id="bg-upload" accept="image/*" />
        <div style="margin:10px 0;">
          <button id="bg-reset">Standard wiederherstellen</button>
        </div>
        <div id="bg-preview"></div>
      </div>
      <div class="settings-panel" data-panel="info" style="display:none">
        <h2>Info</h2>
        <p>Hier kannst du in Zukunft weitere Einstellungen vornehmen.</p>
      </div>
    </div>
  `;
}

function initSettings(win) {
  // Tabs
  win.querySelectorAll('.settings-tab').forEach(tab => {
    tab.onclick = () => {
      win.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const sel = tab.dataset.tab;
      win.querySelectorAll('.settings-panel').forEach(panel => {
        panel.style.display = (panel.dataset.panel === sel) ? 'block' : 'none';
      });
    };
  });

  // Hintergrund-Upload
  const fileInput = win.querySelector('#bg-upload');
  const preview = win.querySelector('#bg-preview');
  const resetBtn = win.querySelector('#bg-reset');

  // Vorschau und speichern
  fileInput.onchange = e => {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new Image();
    img.onload = function() {
      const maxW = 1024, maxH = 768;
      let w = img.width, h = img.height;
      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const url = canvas.toDataURL('image/jpeg', 0.85);
      document.body.style.background = `url('${url}') center/cover no-repeat fixed`;
      saveBgToDb(url).then(() => {
        preview.innerHTML = `<img src="${url}" style="max-width:180px;max-height:120px;border-radius:8px;margin-top:10px;">`;
      });
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
};

  // Reset-Button
  resetBtn.onclick = () => {
    document.body.style.background = "";
    localStorage.removeItem('desktopBg');
    preview.innerHTML = "";
    // Optional: Standard-Gradient wiederherstellen
    document.body.style.background = "linear-gradient(135deg, #3a6ea5, #c2e9fb 80%)";
  };

  // Vorschau beim Öffnen, falls schon gesetzt
  const bg = localStorage.getItem('desktopBg');
  if (bg) {
    preview.innerHTML = `<img src="${bg}" style="max-width:180px;max-height:120px;border-radius:8px;margin-top:10px;">`;
  }
}

window.renderSettingsView = window.renderSettingsView || renderSettingsView;
window.initSettings = window.initSettings || initSettings;
function initBrowser(win) {
  const urlInput = win.querySelector('.browser-url');
  const goBtn = win.querySelector('.browser-go');
  const openTabBtn = win.querySelector('.browser-open-tab');
  const frame = win.querySelector('.browser-frame');
  const overlay = win.querySelector('.browser-blocked-overlay');
  if (!urlInput || !frame) return;

  function normalize(url) {
    url = url.trim();
    if (/^hrrps:\/\//i.test(url)) url = url.replace(/^hrrps/i,'https');
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    return url;
  }

  function showBlocked(url) {
    if (!overlay) return;
    overlay.style.display = 'flex';
    const btn = overlay.querySelector('.open-external');
    if (btn) btn.onclick = () => window.open(url, '_blank');
  }

  function hideBlocked() {
    if (overlay) overlay.style.display = 'none';
  }

  function navigate() {
    hideBlocked();
    const target = normalize(urlInput.value);
    frame.src = target;

    // Erkennungsversuch nach kurzem Delay
    setTimeout(() => {
      let blocked = false;
      try {
        // Zugriff löst bei Cross-Origin keinen Fehler, aber bei X-Frame-Options wird nichts sinnvoll gerendert
        // Wir testen minimal auf body-Inhalt; bei blockierter Seite oft leer.
        const doc = frame.contentDocument;
        if (!doc || !doc.body || !doc.body.innerHTML.trim()) blocked = true;
      } catch (e) {
        // Cross-Origin -> kann trotzdem erlaubt sein; wir warten auf load
      }
    }, 700);
  }

  frame.addEventListener('load', () => {
    try {
      const doc = frame.contentDocument;
      if (!doc || !doc.body) return;
      // Wenn nach load immer noch fast leer (häufig bei Block)
      const txt = doc.body.textContent.trim();
      if (!doc.body.children.length && txt.length < 5) {
        showBlocked(urlInput.value);
      }
    } catch (e) {
      // Cross-Origin Zugriff verboten (normal), kein sicherer Block-Indikator -> nichts tun
    }
  });

  goBtn.onclick = navigate;
  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(); });
  openTabBtn.onclick = () => {
    const target = normalize(urlInput.value);
    window.open(target, '_blank');
  };
}

// Browser-Ansicht als eigene Funktion
function renderBrowserView(initialUrl = "https://patrick-schmidt.info") {
  return `
    <div class="browser-root">
      <div class="browser-bar">
        <input class="browser-url" type="text" value="${initialUrl}" placeholder="https://..." />
        <button class="browser-go">➡️</button>
        <button class="browser-open-tab" title="In neuem Tab öffnen">🡕</button>
      </div>
      <div class="browser-frame-wrap">
        <div class="browser-blocked-overlay" style="display:none;">
          <div class="blocked-msg">
            Diese Seite erlaubt kein Einbetten in ein iframe.<br>
            <button class="open-external">In neuem Tab öffnen</button>
          </div>
        </div>
        <iframe class="browser-frame" src="${initialUrl}" sandbox="allow-scripts allow-same-origin"></iframe>
      </div>
    </div>
  `;
}
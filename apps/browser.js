// ...existing code (falls oberhalb etwas steht)...
const BROWSER_FAVORITES = [
  { title: "Google Maps", url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2500.0875266242915!2d8.702952439440807!3d51.199038857237305!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bb9ab6d313a325%3A0xd36ddfa5d80e3257!2sMega%20D%C3%B6ner!5e0!3m2!1sde!2sde!4v1755083176974!5m2!1sde!2sde" },
  { title: "Wikipedia (DE)", url: "https://de.wikipedia.org" },
  { title: "Patrick Schmidt", url: "https://patrick-schmidt.info" },
  { title: "JS Lern video", url: "https://www.youtube.com/embed/eWLDAAMsD-c?si=WksVA3unp_6myIM8"},
  { title: "Pokedex by Patrick, Schmidt", url: "https://www.patrick-schmidt.developerakademie.net/pokedex"}
];

function initBrowser(win) {
  const urlInput   = win.querySelector('.browser-url');
  const goBtn      = win.querySelector('.browser-go');
  const openTabBtn = win.querySelector('.browser-open-tab');
  const favBtn     = win.querySelector('.browser-fav-btn');
  const favPanel   = win.querySelector('.browser-fav-panel');
  const frame      = win.querySelector('.browser-frame');
  const overlay    = win.querySelector('.browser-blocked-overlay');

  if (!urlInput || !frame) return;

  // Favoriten befüllen
  if (favPanel) {
    favPanel.innerHTML = `
      <div class="fav-head">Favoriten</div>
      <div class="fav-list">
        ${BROWSER_FAVORITES.map(f => `
          <div class="fav-item" data-url="${f.url}">
            <div class="fav-title">${f.title}</div>
            <div class="fav-url">${f.url}</div>
          </div>
        `).join('')}
      </div>`;
  }

  function normalize(url) {
    url = url.trim();
    if (/^hrrps:\/\//i.test(url)) url = url.replace(/^hrrps/i, 'https');
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    return url;
  }
  function hideBlocked() { if (overlay) overlay.style.display = 'none'; }
  function showBlocked()  { if (overlay) overlay.style.display = 'flex'; }

  function navigate(targetUrl) {
    hideBlocked();
    const target = normalize(targetUrl || urlInput.value);
    urlInput.value = target;
    frame.src = target;
  }

  goBtn && (goBtn.onclick = () => navigate());
  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(); });
  openTabBtn && (openTabBtn.onclick = () => window.open(normalize(urlInput.value), '_blank'));

  // Erster load-Listener (Kurzprüfung auf leeren Body)
  frame.addEventListener('load', () => {
    try {
      const doc = frame.contentDocument;
      if (!doc || !doc.body) return;
      if (!doc.body.children.length && !doc.body.textContent.trim()) showBlocked();
    } catch(e) { /* Cross-Origin */ }
  });

  // Eingebauter zusätzlicher load-Listener (dein gewünschter Codeblock integriert)
  frame.addEventListener('load', () => {
    try {
      const doc = frame.contentDocument;
      if (!doc || !doc.body) return;
      // Wenn nach load immer noch fast leer (häufig bei Block)
      const txt = doc.body.textContent.trim();
      if (!doc.body.children.length && txt.length < 5) {
        // showBlocked akzeptiert hier keine URL, daher nur aufrufen
        showBlocked();
      }
      // Bonus: _blank Links in Frame behalten (wenn same-origin)
      doc.querySelectorAll && doc.querySelectorAll('a[target="_blank"]').forEach(a => a.target = '_self');
    } catch (e) {
      // Cross-Origin Zugriff verboten (normal)
    }
  });

  // Favoriten Panel
  if (favBtn && favPanel) {
    favBtn.onclick = (e) => {
      e.stopPropagation();
      favPanel.classList.toggle('open');
    };
    document.addEventListener('click', () => favPanel.classList.remove('open'));
    favPanel.addEventListener('click', e => e.stopPropagation());
    favPanel.querySelectorAll('.fav-item').forEach(it => {
      it.onclick = () => {
        navigate(it.dataset.url);
        favPanel.classList.remove('open');
      };
      it.ondblclick = () => window.open(normalize(it.dataset.url), '_blank');
    });
  }

  forceBrowserLayout(win);
}

function forceBrowserLayout(win) {
  const wrap  = win.querySelector('.browser-frame-wrap');
  const frame = win.querySelector('.browser-frame');
  if (!wrap || !frame) return;

  const root = win.querySelector('.browser-root');
  if (root) {
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.height = '100%';
  }
  wrap.style.flex = '1';
  wrap.style.minHeight = '260px';

  let tries = 0;
  function applySrcWhenReady() {
    const h = wrap.getBoundingClientRect().height;
    if (h > 20) {
      if (!frame.src) frame.src = frame.dataset.initsrc;
      return;
    }
    if (tries++ < 10) requestAnimationFrame(applySrcWhenReady);
    else {
      wrap.style.height = '300px';
      frame.src = frame.dataset.initsrc;
    }
  }
  applySrcWhenReady();
}

function renderBrowserView(initialUrl = "https://patrick-schmidt.info") {
  return `
    <div class="browser-root">
      <div class="browser-bar">
        <button class="browser-fav-btn" title="Favoriten">☰</button>
        <input class="browser-url" type="text" value="${initialUrl}" placeholder="https://..." />
        <button class="browser-go">➡️</button>
        <button class="browser-open-tab" title="In neuem Tab öffnen">🡕</button>
        <div class="browser-fav-panel"></div>
      </div>
      <div class="browser-frame-wrap">
        <div class="browser-blocked-overlay" style="display:none;">
          <div class="blocked-msg">
            Seite blockiert Einbettung.<br>
            <button class="open-external">Extern öffnen</button>
          </div>
        </div>
        <iframe class="browser-frame"
                data-initsrc="${initialUrl}"
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"></iframe>
      </div>
    </div>
  `;
}
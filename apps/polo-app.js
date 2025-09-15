function renderPoloView() {
  return `
    <div class="polo-wrapper">
      <div class="polo-bar">
        <button class="polo-btn polo-reload">Neu laden</button>
        <button class="polo-btn polo-openwin" title="Extern öffnen">Extern</button>
        <button class="polo-btn polo-full" title="Fullscreen (Iframe)">Fullscreen</button>
      </div>
      <iframe
        class="polo-frame"
        src="apps/polo/polo.html"
        loading="lazy"
        allow="fullscreen"
      ></iframe>
    </div>
  `;
}

function initPolo(win) {
  const iframe = win.querySelector('.polo-frame');
  const btnReload = win.querySelector('.polo-reload');
  const btnExt    = win.querySelector('.polo-openwin');
  const btnFull   = win.querySelector('.polo-full');

  btnReload && (btnReload.onclick = () => {
    if (!iframe) return;
    // Cache-Buster
    const base = iframe.src.split('?')[0];
    iframe.src = base + '?t=' + Date.now();
  });

  btnExt && (btnExt.onclick = () => {
    window.open('apps/polo/polo.html', '_blank');
  });

  btnFull && (btnFull.onclick = () => {
    if (iframe && iframe.requestFullscreen) {
      iframe.requestFullscreen().catch(()=>{});
    }
  });

//   // === Auto-Fullscreen Versuch beim Start ===
//   // Hinweis: Ohne User-Geste blocken viele Browser (dann fallback auf ersten Klick/Touch)
//   let fsDone = false;
//   function tryFullscreen() {
//     if (fsDone) return;
//     fsDone = true;
//     if (iframe && iframe.requestFullscreen) {
//       iframe.requestFullscreen().catch(() => {
//         // Falls blockiert, erneuten Versuch nach erster echten Interaktion zulassen
//         fsDone = false;
//       });
//     }
//   }
//   // Sofort (kleine Verzögerung, damit DOM steht)
//   setTimeout(tryFullscreen, 80);

//   // Fallback: Erster User-Input (falls initial blockiert)
//   ['pointerdown','keydown','touchstart','click'].forEach(ev => {
//     window.addEventListener(ev, tryFullscreen, { once:true, passive:true });
//   });
}
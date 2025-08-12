renderTaskbar();
function renderTaskbar() {
  const bar = document.createElement('div');
  bar.className = "taskbar";
  bar.innerHTML = `
    <button class="start-button">Start</button>
    <span class="taskbar-time"></span>
  `;
  $('#root').appendChild(bar);
  updateClock();
  setInterval(updateClock, 1000);

  // Startmenü erstellen
  let startMenu = null;
  bar.querySelector('.start-button').onclick = (e) => {
    if (startMenu && startMenu.parentNode) {
      startMenu.remove();
      startMenu = null;
      return;
    }
    startMenu = document.createElement('div');
    startMenu.className = "start-menu";
    startMenu.innerHTML = `
      <div class="start-menu-programs">
        <b>Programme</b>
        <ul>
          ${icons.map(icon => `<li class="start-menu-item" data-id="${icon.id}">${icon.icon} ${icon.name}</li>`).join('')}
        </ul>
      </div>
      <button class="restart-btn">🔄 Neustarten</button>
    `;
    // Programme öffnen
    startMenu.querySelectorAll('.start-menu-item').forEach(item => {
      item.onclick = () => {
        const id = item.getAttribute('data-id');
        const icon = icons.find(i => i.id == id);
        if (icon) openWindow(icon.id, icon.name);
        closeMenu();
      };
    });
    startMenu.querySelector('.restart-btn').onclick = () => {
      startMenu.innerHTML = "<div style='padding:30px;text-align:center;'>🔄 Neustart...<br><small>(Hier könnte eine Animation sein)</small></div>";
      setTimeout(() => location.reload(), 1200);
    };
    bar.appendChild(startMenu);

    const startBtn = bar.querySelector('.start-button');
    function outsideHandler(ev) {
      if (!startMenu) { document.removeEventListener('mousedown', outsideHandler); return; }
      if (startMenu.contains(ev.target) || ev.target === startBtn) return;
      closeMenu();
    }
    document.addEventListener('mousedown', outsideHandler);

    function closeMenu() {
      if (!startMenu) return;
      startMenu.remove();
      startMenu = null;
      document.removeEventListener('mousedown', outsideHandler);
    }
  };
}
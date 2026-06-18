(function () {

  var cachedData = null;

  function removeDash() {
    var el = document.getElementById('fear-dashboard-overlay');
    if (el) el.remove();
  }

  function injectDashboard(data) {
    if (!data) return;
    if (window.location.pathname !== '/admin') { removeDash(); return; }
    if (document.getElementById('fear-dashboard-overlay')) return;

    const cards = [
      { label: 'Miembros',            value: data.miembros,   icon: '🪖', color: '#f0b830', href: '/admin/resources/Miembros' },
      { label: 'Reclutas',            value: data.reclutas,   icon: '🔫', color: '#e02020', href: '/admin/resources/Reclutas' },
      { label: 'Votaciones abiertas', value: data.votaciones, icon: '🗳️', color: '#4a9aff', href: '/admin/resources/Votaciones' },
      { label: 'Cuotas sin pagar',    value: data.sinPagar,   icon: '💰', color: '#e07020', href: '/admin/resources/Mensualidades' },
    ];

    // Esperar a que exista el sidebar para calcular su ancho
    const sidebar = document.querySelector('[data-css="sidebar"]') || document.querySelector('nav');
    const sidebarWidth = sidebar ? sidebar.offsetWidth : 280;

    const overlay = document.createElement('div');
    overlay.id = 'fear-dashboard-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: ${sidebarWidth}px;
      right: 0;
      bottom: 0;
      background: #111;
      z-index: 100;
      overflow-y: auto;
      font-family: 'Barlow Condensed', sans-serif;
      color: #fff;
      padding: 40px 48px;
      box-sizing: border-box;
    `;

    overlay.innerHTML = `
      <div style="display:flex;align-items:center;gap:20px;margin-bottom:40px;padding-bottom:24px;border-bottom:1px solid #2a2a2a;">
        <img src="https://i.ibb.co/qM7GkTsq/fear5N12.png" style="width:64px;height:64px;object-fit:contain;" />
        <div>
          <div style="color:#444;font-size:11px;letter-spacing:.2em;text-transform:uppercase;margin-bottom:4px;">Fuerza Española de Acción Rápida</div>
          <h1 style="color:#fff;font-size:30px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin:0;">CLAN <span style="color:#e02020;">F.E.A.R</span></h1>
          <div style="color:#444;font-size:11px;letter-spacing:.2em;text-transform:uppercase;margin-top:4px;">Simulación Militar · Arma Reforger · España</div>
        </div>
      </div>
      <div style="color:#444;font-size:10px;letter-spacing:.25em;text-transform:uppercase;margin-bottom:20px;">── Estadísticas del clan</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">
        ${cards.map(c => `
          <a href="${c.href}" style="text-decoration:none;" onclick="document.getElementById('fear-dashboard-overlay').remove()">
            <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-top:3px solid ${c.color};padding:24px 28px;cursor:pointer;transition:background .15s;" onmouseenter="this.style.background='#222'" onmouseleave="this.style.background='#1a1a1a'">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
                <div style="font-size:28px;">${c.icon}</div>
                <div style="color:${c.color};font-size:44px;font-weight:800;line-height:1;">${c.value}</div>
              </div>
              <div style="color:#fff;font-size:14px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">${c.label}</div>
            </div>
          </a>
        `).join('')}
      </div>
      <div style="margin-top:48px;padding-top:20px;border-top:1px solid #1a1a1a;color:#2a2a2a;font-size:11px;letter-spacing:.1em;text-transform:uppercase;">// CLAN F.E.A.R — OPS PANEL · Solo misión</div>
    `;

    document.body.appendChild(overlay);
  }

  function tryInject() {
    if (window.location.pathname !== '/admin') {
      removeDash();
      return;
    }
    if (document.getElementById('fear-dashboard-overlay')) return;

    if (cachedData) {
      setTimeout(() => injectDashboard(cachedData), 300);
    } else {
      fetch('/admin-stats')
        .then(r => r.json())
        .then(data => {
          cachedData = data;
          setTimeout(() => injectDashboard(data), 300);
        })
        .catch(err => console.error('Dashboard error:', err));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInject);
  } else {
    tryInject();
  }

  const origPush = history.pushState.bind(history);
  history.pushState = function(...args) {
    origPush(...args);
    removeDash();
    setTimeout(tryInject, 400);
  };
  const origReplace = history.replaceState.bind(history);
  history.replaceState = function(...args) {
    origReplace(...args);
    removeDash();
    setTimeout(tryInject, 400);
  };
  window.addEventListener('popstate', () => { removeDash(); setTimeout(tryInject, 400); });

})();

(function () {
  if (window.location.pathname !== '/admin') return;

  function renderDashboard(data) {
    const cards = [
      { label: 'Miembros',            value: data.miembros,   icon: '🪖', color: '#f0b830', href: '/admin/resources/Miembros' },
      { label: 'Reclutas',            value: data.reclutas,   icon: '🔫', color: '#e02020', href: '/admin/resources/Reclutas' },
      { label: 'Votaciones abiertas', value: data.votaciones, icon: '🗳️', color: '#4a9aff', href: '/admin/resources/Votaciones' },
      { label: 'Cuotas sin pagar',    value: data.sinPagar,   icon: '💰', color: '#e07020', href: '/admin/resources/Mensualidades' },
    ];

    const html = `
      <div id="fear-dashboard" style="min-height:80vh;background:#111;padding:40px 48px;font-family:'Barlow Condensed',sans-serif;color:#fff;">
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
            <a href="${c.href}" style="text-decoration:none;">
              <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-top:3px solid ${c.color};padding:24px 28px;cursor:pointer;transition:background .15s;" onmouseenter="this.style.background='#222'" onmouseleave="this.style.background='#1a1a1a'">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
                  <div style="font-size:28px;">${c.icon}</div>
                  <div style="color:${c.color};font-size:44px;font-weight:800;line-height:1;">${c.value}</div>
                </div>
                <div style="color:#fff;font-size:14px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;">${c.label}</div>
              </div>
            </a>
          `).join('')}
        </div>
        <div style="margin-top:48px;padding-top:20px;border-top:1px solid #1a1a1a;color:#2a2a2a;font-size:11px;letter-spacing:.1em;text-transform:uppercase;">// CLAN F.E.A.R — OPS PANEL · Solo misión</div>
      </div>
    `;

    const interval = setInterval(() => {
      if (document.getElementById('fear-dashboard')) {
        clearInterval(interval);
        return;
      }

      // Buscar el section concreto del dashboard por defecto (contiene links a adminjs)
      const allBoxes = document.querySelectorAll('section.adminjs_Box');
      let defaultDash = null;

      for (const box of allBoxes) {
        if (box.innerHTML.includes('docs.adminjs.co') || box.innerHTML.includes('adminjs.page.link')) {
          defaultDash = box;
          break;
        }
      }

      if (!defaultDash) return;

      // Reemplazar solo el contenido interno del section, NO el padre
      defaultDash.innerHTML = html;
      // Quitar estilos que puedan interferir
      defaultDash.removeAttribute('style');

      clearInterval(interval);
    }, 200);
  }

  function init() {
    fetch('/admin-stats')
      .then(r => r.json())
      .then(data => renderDashboard(data))
      .catch(err => console.error('Dashboard stats error:', err));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

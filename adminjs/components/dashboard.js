import React, { useState, useEffect } from 'react'

const Dashboard = () => {
  const [stats, setStats] = useState({ miembros: null, reclutas: null, votaciones: null, sinPagar: null })

  useEffect(() => {
    Promise.all([
      fetch('/admin/api/resources/Miembros/actions/list?perPage=1').then(r => r.json()).catch(() => ({})),
      fetch('/admin/api/resources/Reclutas/actions/list?perPage=1').then(r => r.json()).catch(() => ({})),
      fetch('/admin/api/resources/Votaciones/actions/list?perPage=1').then(r => r.json()).catch(() => ({})),
      fetch('/admin/api/resources/Mensualidades/actions/list?perPage=1&filters.pagado=false').then(r => r.json()).catch(() => ({})),
    ]).then(([m, r, v, men]) => {
      setStats({
        miembros:  m?.meta?.total ?? 0,
        reclutas:  r?.meta?.total ?? 0,
        votaciones: v?.meta?.total ?? 0,
        sinPagar:  men?.meta?.total ?? 0,
      })
    })
  }, [])

  const cards = [
    { label: 'Miembros', value: stats.miembros, icon: '🪖', color: '#f0b830', href: '/admin/resources/Miembros', sub: 'Miembros activos del clan' },
    { label: 'Reclutas', value: stats.reclutas, icon: '🔫', color: '#e02020', href: '/admin/resources/Reclutas', sub: 'En periodo de reclutamiento' },
    { label: 'Votaciones abiertas', value: stats.votaciones, icon: '🗳️', color: '#4a9aff', href: '/admin/resources/Votaciones', sub: 'Pendientes de resolución' },
    { label: 'Cuotas sin pagar', value: stats.sinPagar, icon: '💰', color: '#e07020', href: '/admin/resources/Mensualidades', sub: 'Mensualidades pendientes' },
  ]

  const s = {
    wrap: { minHeight: '100vh', background: '#111', padding: '40px 48px', fontFamily: "'Barlow Condensed', sans-serif", color: '#fff' },
    header: { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40, paddingBottom: 24, borderBottom: '1px solid #2a2a2a' },
    logo: { width: 64, height: 64, objectFit: 'contain' },
    sub: { color: '#444', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 },
    title: { color: '#fff', fontSize: 30, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 },
    fear: { color: '#e02020' },
    sectionLabel: { color: '#444', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 20 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 },
    footer: { marginTop: 48, paddingTop: 20, borderTop: '1px solid #1a1a1a', color: '#2a2a2a', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' },
  }

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <img src="https://i.ibb.co/qM7GkTsq/fear5N12.png" alt="FEAR" style={s.logo} />
        <div>
          <div style={s.sub}>Fuerza Española de Acción Rápida</div>
          <h1 style={s.title}>CLAN <span style={s.fear}>F.E.A.R</span></h1>
          <div style={s.sub}>Simulación Militar · Arma Reforger · España</div>
        </div>
      </div>

      <div style={s.sectionLabel}>── Estadísticas del clan</div>

      <div style={s.grid}>
        {cards.map(card => (
          <a key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
            <div
              style={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderTop: `3px solid ${card.color}`,
                padding: '24px 28px',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#222'}
              onMouseLeave={e => e.currentTarget.style.background = '#1a1a1a'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ fontSize: 28 }}>{card.icon}</div>
                <div style={{ color: card.color, fontSize: 44, fontWeight: 800, lineHeight: 1 }}>
                  {stats.miembros === null ? '…' : card.value}
                </div>
              </div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                {card.label}
              </div>
              <div style={{ color: '#555', fontSize: 12 }}>{card.sub}</div>
            </div>
          </a>
        ))}
      </div>

      <div style={s.footer}>// CLAN F.E.A.R — OPS PANEL · Solo misión</div>
    </div>
  )
}

export default Dashboard

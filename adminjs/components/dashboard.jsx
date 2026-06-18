import React, { useState, useEffect } from 'react'

const Dashboard = () => {
  const [stats, setStats] = useState({
    miembros: '—',
    reclutas: '—',
    votaciones: '—',
    sinPagar: '—',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [miembros, reclutas, votaciones, mensualidades] = await Promise.all([
          fetch('/admin/api/resources/Miembros/actions/list?perPage=1').then(r => r.json()),
          fetch('/admin/api/resources/Reclutas/actions/list?perPage=1').then(r => r.json()),
          fetch('/admin/api/resources/Votaciones/actions/list?perPage=1').then(r => r.json()),
          fetch('/admin/api/resources/Mensualidades/actions/list?perPage=500&filters.pagado=false').then(r => r.json()),
        ])

        setStats({
          miembros:  miembros?.meta?.total ?? '—',
          reclutas:  reclutas?.meta?.total ?? '—',
          votaciones: votaciones?.meta?.total ?? '—',
          sinPagar:  mensualidades?.meta?.total ?? '—',
        })
      } catch (e) {
        console.error('Dashboard stats error:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const cards = [
    {
      label: 'Miembros',
      value: stats.miembros,
      icon: '🪖',
      color: '#f0b830',
      href: '/admin/resources/Miembros',
      sub: 'Miembros activos del clan',
    },
    {
      label: 'Reclutas',
      value: stats.reclutas,
      icon: '🔫',
      color: '#e02020',
      href: '/admin/resources/Reclutas',
      sub: 'En periodo de reclutamiento',
    },
    {
      label: 'Votaciones abiertas',
      value: stats.votaciones,
      icon: '🗳️',
      color: '#4a9aff',
      href: '/admin/resources/Votaciones',
      sub: 'Pendientes de resolución',
    },
    {
      label: 'Cuotas sin pagar',
      value: stats.sinPagar,
      icon: '💰',
      color: '#e07020',
      href: '/admin/resources/Mensualidades',
      sub: 'Mensualidades pendientes',
    },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#111111',
      padding: '40px 48px',
      fontFamily: "'Barlow Condensed', sans-serif",
    }}>

      {/* Header */}
      <div style={{ marginBottom: 40, borderBottom: '1px solid #333', paddingBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8 }}>
          <img
            src="https://i.ibb.co/qM7GkTsq/fear5N12.png"
            alt="FEAR"
            style={{ width: 64, height: 64, objectFit: 'contain' }}
          />
          <div>
            <div style={{ color: '#555', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>
              Fuerza Española de Acción Rápida
            </div>
            <h1 style={{
              color: '#ffffff',
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              margin: 0,
            }}>
              CLAN <span style={{ color: '#e02020' }}>F.E.A.R</span>
            </h1>
            <div style={{ color: '#555', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 4 }}>
              Simulación Militar · Arma Reforger · España
            </div>
          </div>
        </div>
      </div>

      {/* Sección estadísticas */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: '#555', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 20 }}>
          ── Estadísticas del clan
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}>
          {cards.map(card => (
            <a
              key={card.label}
              href={card.href}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderTop: `3px solid ${card.color}`,
                padding: '24px 28px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#222'}
                onMouseLeave={e => e.currentTarget.style.background = '#1a1a1a'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ fontSize: 28 }}>{card.icon}</div>
                  <div style={{
                    color: loading ? '#444' : card.color,
                    fontSize: 42,
                    fontWeight: 800,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}>
                    {loading ? '…' : card.value}
                  </div>
                </div>
                <div style={{
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}>
                  {card.label}
                </div>
                <div style={{ color: '#555', fontSize: 12, letterSpacing: '0.04em' }}>
                  {card.sub}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 48,
        paddingTop: 20,
        borderTop: '1px solid #222',
        color: '#333',
        fontSize: 11,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        // CLAN F.E.A.R — OPS PANEL · Solo misión
      </div>
    </div>
  )
}

export default Dashboard

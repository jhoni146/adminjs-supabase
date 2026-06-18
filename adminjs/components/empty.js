import React, { useEffect } from 'react'

// Este componente se inyecta como override del Layout de AdminJS
// para que los estilos globales se apliquen en TODAS las páginas
const GlobalStyle = ({ children }) => {
  useEffect(() => {
    // ── Google Fonts ──────────────────────────────────────────────
    if (!document.querySelector('#fear-fonts')) {
      const link = document.createElement('link')
      link.id = 'fear-fonts'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap'
      document.head.appendChild(link)
    }

    // ── Estilos globales militares ────────────────────────────────
    if (!document.querySelector('#fear-styles')) {
      const style = document.createElement('style')
      style.id = 'fear-styles'
      style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');

        *, body, input, button, select, textarea {
          font-family: 'Barlow Condensed', 'Roboto Condensed', sans-serif !important;
          letter-spacing: 0.03em;
        }

        h1, h2, h3, h4, h5 {
          text-transform: uppercase !important;
          letter-spacing: 0.08em !important;
          font-weight: 700 !important;
        }

        button, [class*="Button"], a[class*="Button"] {
          border-radius: 0 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.06em !important;
          font-weight: 600 !important;
        }

        input, select, textarea {
          border-radius: 0 !important;
        }

        td, th {
          border-bottom: 1px solid #2e4520 !important;
          font-size: 15px !important;
        }

        th {
          text-transform: uppercase !important;
          letter-spacing: 0.08em !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          color: #4a6e30 !important;
        }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0a0f08; }
        ::-webkit-scrollbar-thumb { background: #2e4520; border-radius: 0; }
        ::-webkit-scrollbar-thumb:hover { background: #4a6e30; }

        [class*="Badge"], [class*="Tag"] {
          border-radius: 0 !important;
          text-transform: uppercase !important;
          font-size: 11px !important;
          letter-spacing: 0.06em !important;
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  return React.createElement(React.Fragment, null, children)
}

export default GlobalStyle

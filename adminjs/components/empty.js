import React, { useEffect } from 'react'

const GlobalStyle = () => {
  useEffect(() => {
    // Cargar Barlow Condensed desde Google Fonts
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap'
    document.head.appendChild(link)

    // Inyectar estilos globales militares
    const style = document.createElement('style')
    style.innerHTML = `
      /* ── Tipografía global ── */
      *, body, input, button, select, textarea {
        font-family: 'Barlow Condensed', 'Roboto Condensed', sans-serif !important;
        letter-spacing: 0.03em;
      }

      /* ── Títulos en mayúsculas estilo militar ── */
      h1, h2, h3, h4, h5,
      [class*="Header"], [class*="title"], [class*="Title"] {
        text-transform: uppercase !important;
        letter-spacing: 0.08em !important;
        font-weight: 700 !important;
      }

      /* ── Sidebar: nombre del panel en estilo táctico ── */
      [class*="BrandingLogoStyle"],
      [class*="branding"] span {
        font-family: 'Barlow Condensed', sans-serif !important;
        font-weight: 700 !important;
        letter-spacing: 0.12em !important;
        text-transform: uppercase !important;
        font-size: 13px !important;
      }

      /* ── Botones: bordes rectos, sin redondeo ── */
      button, [class*="Button"], a[class*="Button"] {
        border-radius: 0 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.06em !important;
        font-weight: 600 !important;
      }

      /* ── Inputs y selects: sin redondeo ── */
      input, select, textarea, [class*="Input"] {
        border-radius: 0 !important;
      }

      /* ── Cards / panels: sin redondeo ── */
      [class*="Card"], [class*="Panel"], [class*="Box"] {
        border-radius: 0 !important;
      }

      /* ── Tabla: separadores más marcados ── */
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

      /* ── Valores de IDs y datos en monoespaciado ── */
      td:first-child {
        font-family: 'Share Tech Mono', monospace !important;
        font-size: 13px !important;
        color: #4a6e30 !important;
      }

      /* ── Scrollbar táctica ── */
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: #0a0f08; }
      ::-webkit-scrollbar-thumb { background: #2e4520; border-radius: 0; }
      ::-webkit-scrollbar-thumb:hover { background: #4a6e30; }

      /* ── Badge / tags ── */
      [class*="Badge"], [class*="Tag"] {
        border-radius: 0 !important;
        text-transform: uppercase !important;
        font-size: 11px !important;
        letter-spacing: 0.06em !important;
      }

      /* ── Nav items activos con borde izquierdo táctico ── */
      [class*="NavItem"][class*="active"],
      [class*="SidebarLink"][class*="active"] {
        border-left: 3px solid #b8952a !important;
        padding-left: 13px !important;
      }
    `
    document.head.appendChild(style)
  }, [])

  return null
}

export default GlobalStyle

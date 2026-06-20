import React, { useEffect, useState } from 'react'
import './Cartas.css'

type Props = {  
  numero: number;
  name: string;
  attributes: string;
  attack?: number;
  defense?: number;
  llifepoints?: number;
  description: string;
  pictureUrl: string;
};

type CartaProps = Props & {
  expanded?: boolean;
  onClick?: () => void;
  selectable?: boolean;
  selectionType?: 'delete' | 'select';
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;  
};

function Carta ({
  attack = 0,
  defense = 0,
  description = "sin descripción",
  pictureUrl,
  name = "Sin nombre",
  numero = 0, 
  attributes = "Normal",
  llifepoints = 0, 
  expanded = false,
  onClick,
  selectable = false,
  selectionType = 'delete',
  isSelected = false,
  onSelect,
  onEdit, 
}: CartaProps) {
  const [palette, setPalette] = useState<{primary: string; light: string; dark: string; accent: string} | null>(null)

  const rgbToHex = (r: number, g: number, b: number) => {
    const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  const rgbToHsl = (r:number,g:number,b:number) => {
    r/=255; g/=255; b/=255
    const max = Math.max(r,g,b), min = Math.min(r,g,b)
    let h=0, s=0, l=(max+min)/2
    if (max!==min) {
      const d = max-min
      s = l>0.5? d/(2-max-min) : d/(max+min)
      switch(max) {
        case r: h = (g-b)/d + (g<b?6:0); break
        case g: h = (b-r)/d + 2; break
        case b: h = (r-g)/d + 4; break
      }
      h /= 6
    }
    return [h, s, l]
  }

  const hslToRgb = (h:number,s:number,l:number) => {
    let r,g,b
    if (s===0) { r=g=b=l }
    else {
      const hue2rgb = (p:number,q:number,t:number) => {
        if (t<0) t+=1
        if (t>1) t-=1
        if (t<1/6) return p + (q-p)*6*t
        if (t<1/2) return q
        if (t<2/3) return p + (q-p)*(2/3 - t)*6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l*s
      const p = 2 * l - q
      r = hue2rgb(p,q,h + 1/3)
      g = hue2rgb(p,q,h)
      b = hue2rgb(p,q,h - 1/3)
    }
    return [Math.round(r*255), Math.round(g*255), Math.round(b*255)]
  }

  const enhanceColor = (r:number,g:number,b:number, satBoost = 0.2, lightBoost = 0) => {
    const [h,s,l] = rgbToHsl(r,g,b)
    const s2 = Math.max(0, Math.min(1, s + satBoost))
    const l2 = Math.max(0, Math.min(1, l + lightBoost))
    const [nr,ng,nb] = hslToRgb(h,s2,l2)
    return [nr, ng, nb]
  }

  const hexToRgba = (hex: string, alpha = 1) => {
    const h = hex.replace('#','')
    const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const lighten = (r:number,g:number,b:number, amt = 0.3) => {
    return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt)
  }

  const darken = (r:number,g:number,b:number, amt = 0.25) => {
    return rgbToHex(r * (1 - amt), g * (1 - amt), b * (1 - amt))
  }

  const typeFallback = (type: string) => {
    const map: Record<string, {primary:string, light:string, dark:string, accent:string}> = {
      Agua: { primary: '#4da6ff', light: '#9fd7ff', dark: '#2b7fbf', accent: '#60b0ff' },
      Fuego: { primary: '#ff6b6b', light: '#ffb3b3', dark: '#bf3b3b', accent: '#ff8a66' },
      Planta: { primary: '#66c266', light: '#b3e6b3', dark: '#3f8f3f', accent: '#7fe087' },
      Dragón: { primary: '#7aaaff', light: '#cfe8ff', dark: '#3b6fbf', accent: '#86b7ff' },
      Eléctrico: { primary: '#ffd86b', light: '#fff0b8', dark: '#caa43f', accent: '#ffdf8a' },
      Normal: { primary: '#bdbdbd', light: '#efefef', dark: '#8f8f8f', accent: '#d1d1d1' },
    }
    return map[type] || map['Normal']
  }

  useEffect(() => {
    if (!pictureUrl) return setPalette(typeFallback(attributes))

    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = pictureUrl
    const handleError = () => setPalette(typeFallback(attributes))

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) { handleError(); return }
        const w = Math.min(100, img.width || 100)
        const h = Math.min(100, img.height || 100)
        canvas.width = w
        canvas.height = h
        ctx.drawImage(img, 0, 0, w, h)
        const data = ctx.getImageData(0, 0, w, h).data
        let r = 0, g = 0, b = 0, count = 0
        const step = 4 * 5
        for (let i = 0; i < data.length; i += step) {
          const alpha = data[i+3]
          if (alpha === 0) continue
          r += data[i]
          g += data[i+1]
          b += data[i+2]
          count++
        }
        if (count === 0) { handleError(); return }
        r = r / count; g = g / count; b = b / count
        // mejorar saturación/contraste para paleta más visible
        const [er,eg,eb] = enhanceColor(r,g,b, 0.24, -0.03)
        const primary = rgbToHex(er, eg, eb)
        const light = lighten(er,eg,eb, 0.28)
        const dark = darken(er,eg,eb, 0.32)
        const [ar,ag,ab] = enhanceColor(r,g,b, 0.36, -0.08)
        const accent = rgbToHex(ar, ag, ab)
        setPalette({ primary, light, dark, accent })
      } catch (err) {
        handleError()
      }
    }
    img.onerror = handleError
  }, [pictureUrl, attributes])
  if (expanded) {
    return (
      <>
        <div className="overlay" onClick={onClick} />
        <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={palette ? {
            ['--card-bg' as any]: `linear-gradient(135deg, ${palette.light}, ${palette.primary})`,
            ['--name-gradient' as any]: `linear-gradient(135deg, ${palette.primary}, ${palette.accent})`,
          } : {}}>
            <div className="pokebola modal-pokebola" aria-hidden="true" />
            <div className="modal-card-header">
              <span className="modal-num">#{numero}</span>
            </div>

            <div className="modal-card-body">
              <div className="modal-media">
                <img src={pictureUrl} alt={name} />
              </div>
            </div>

            <div className="modal-card-footer">
              <h2 className="modal-name">{name}</h2>
            </div>
          </div>

          <aside className="modal-details" onClick={(e) => e.stopPropagation()}>
            <h3>Estadísticas</h3>
            <div className="stat-row"><span className="stat-icon">⚔️</span> <strong>Ataque:</strong> {attack}</div>
            <div className="stat-row"><span className="stat-icon">🛡️</span> <strong>Defensa:</strong> {defense}</div>
            <div className="stat-row"><span className="stat-icon">❤</span> <strong>Vida:</strong> {llifepoints}</div>
            <div className="stat-row"><span className="stat-icon">✨</span> <strong>Atributos:</strong> {attributes}</div>
            <div className="stat-row stat-row--description">
              <span className="stat-icon">📜</span> <strong>Descripción:</strong> 
              <span className="description-text">{description}</span>
            </div>
            <button className="close-button" onClick={onClick}>Cerrar</button>
          </aside>
        </div>
      </>
    )
  }

  // Función que maneja el clic en la carta
  // Función que maneja el clic en la carta
  const handleCardClick = (e: React.MouseEvent) => {
    // Detener propagación si se hizo clic en el botón de editar
    if ((e.target as HTMLElement).closest('.edit-button')) {
      e.stopPropagation();
      return;
    }
    
    if (selectable) {
      e.stopPropagation();
      if (onSelect) {
        onSelect()
      }
      return
    }

    if (onClick) {
      onClick()
    }
  }

  // Manejar clic en editar
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Botón editar clickeado para carta:', numero);
    if (onEdit) {
      onEdit();
    }
  }

  const showBadge = selectable || isSelected
  const badgeIcon = isSelected ? '✅' : selectionType === 'select' ? '🎯' : '🗑️'
  const normalizeTypeClass = (type: string) =>
    type
      .toLowerCase()
      .normalize('NFD')
      .replace(/[ -]/g, '')
      .replace(/[ -]/g, '')
      .replace(/[ -]/g, '')
      .replace(/[ -]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const typeList = attributes
    ? attributes.split(',').map((value) => value.trim()).filter(Boolean)
    : []

  const cssVars: React.CSSProperties = palette ? {
    ['--card-bg' as any]: `linear-gradient(135deg, ${palette.light}, ${palette.primary})`,
    ['--card-overlay' as any]: `linear-gradient(135deg, ${hexToRgba(palette.primary, 0.45)}, ${hexToRgba(palette.accent, 0.28)})`,
    ['--img-border' as any]: palette.primary,
    ['--border-color' as any]: hexToRgba(palette.primary, 0.6),
    ['--name-gradient' as any]: `linear-gradient(135deg, ${palette.primary}, ${palette.accent})`,
  } : {}
  return (
    <div 
      className={`carta ${isSelected ? 'selected' : ''} ${selectable ? 'select-mode' : ''} selection-type-${selectionType}`} 
      onClick={handleCardClick}
      role="button" 
      tabIndex={0}
      style={cssVars}
    >
      
      <div className="pokebola" aria-hidden="true" />
      {showBadge && (
        <div className={`select-badge ${isSelected ? 'checked' : ''} select-type-${selectionType}`} aria-hidden="true">
          {badgeIcon}
        </div>
      )}
      {/* Botón de editar */}
      {!selectable && (
        <button 
          className="edit-button"
          onClick={handleEditClick}
          onMouseDown={(e) => e.stopPropagation()} // Prevenir que el mousedown active el click de la carta
          aria-label="Editar carta"
          type="button"
        >
          ✏️
        </button>
      )}
      <div className="carta-number">#{numero}</div>

      <div className="carta-contenido">
        <div className="carta-media">
          <img src={pictureUrl} alt={name} />
        </div>

        <div className="carta-name-bar">
          <div className="carta-name">{name}</div>
          {typeList.length > 0 && (
            <div className="carta-attribute-list">
              {typeList.map((type) => (
                <div className={`carta-attribute-badge type-${normalizeTypeClass(type)}`} key={type}>
                  {type}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Efecto de brillo al seleccionar para borrar */}
      {selectable && isSelected && (
        <div className="delete-effect"></div>
      )}
    </div>
  )
}

export default Carta
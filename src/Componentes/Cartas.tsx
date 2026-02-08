import './Cartas.css'

type Props = {  
  numero: number;
  nombre: string;
  tipo: string;
  ataque?: number;
  defensa?: number;
  vida?: number;
  descripcion: string;
  imagen: string;
};

type CartaProps = Props & {
  expanded?: boolean;
  onClick?: () => void;
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
};

function Carta ({
  ataque = 0,
  defensa = 0,
  descripcion = "sin descripción",
  imagen,
  nombre = "Pikachu",
  numero = 0,
  tipo = "Normal",
  expanded = false,
  onClick,
  selectable = false,
  isSelected = false,
  onSelect,
}: CartaProps) {

  if (expanded) {
    return (
      <>
        <div className="overlay" onClick={onClick} />
        <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pokebola modal-pokebola" aria-hidden="true" />
            <div className="modal-card-header">
              <span className="modal-num">#{numero}</span>
            </div>

            <div className="modal-card-body">
              <div className="modal-media">
                <img src={imagen} alt={nombre} />
              </div>
            </div>

            <div className="modal-card-footer">
              <h2 className="modal-name">{nombre}</h2>
            </div>
          </div>

          <aside className="modal-details" onClick={(e) => e.stopPropagation()}>
            <h3>Estadísticas</h3>
            <div className="stat-row"><span className="stat-icon">⚔️</span> <strong>Ataque:</strong> {ataque}</div>
            <div className="stat-row"><span className="stat-icon">🛡️</span> <strong>Defensa:</strong> {defensa}</div>
            <div className="stat-row"><span className="stat-icon">❤</span> <strong>Vida:</strong> 100</div>
            <div className="stat-row"><span className="stat-icon">✨</span> <strong>Tipo:</strong> {tipo}</div>
            <div className="stat-row stat-row--descripcion"><span className="stat-icon">📜</span> <strong>Descripción:</strong> <span className="descripcion-text">{descripcion}</span></div>
            <button className="close-button" onClick={onClick}>Cerrar</button>
          </aside>
        </div>
      </>
    )
  }

  const handleClick = () => {
    if (selectable) {
      onSelect?.()
    } else {
      onClick?.()
    }
  }

  return (
    <div className={"carta" + (isSelected ? ' selected' : '')} onClick={handleClick} role="button" tabIndex={0}>
      <div className="pokebola" aria-hidden="true" />
      {selectable && (
        <div className={"select-badge" + (isSelected ? ' checked' : '')} aria-hidden="true">{isSelected ? '✓' : ''}</div>
      )}
      <div className="carta-number">#{numero}</div>

      <div className="carta-contenido">
        <div className="carta-media">
          <img src={imagen} alt={nombre} />
        </div>

        <div className="carta-name-bar">
          <div className="carta-name">{nombre}</div>
        </div>
      </div>
    </div>
  )
}

export default Carta
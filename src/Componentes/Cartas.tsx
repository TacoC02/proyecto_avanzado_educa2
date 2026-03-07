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
  isSelected?: boolean;
  onSelect?: () => void;
};

function Carta ({
  attack = 0,
  defense = 0,
  description = "sin descripción",
  pictureUrl,
  name = "Pikachu",
  numero = 0,
  attributes = "Normal",
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
                <img src={pictureUrl} alt={name} />
              </div>
            </div>

            <div className="modal-card-footer">
              <h2 className="modal-name">{name}</h2>
            </div>
          </div>

          <aside className="modal-details" onClick={(e) => e.stopPropagation()}>
            <h3>Estadísticas</h3>
            <div className="stat-row"><span className="stat-icon">⚔️</span> <strong>attack: </strong>{attack}</div>
            <div className="stat-row"><span className="stat-icon">🛡️</span> <strong>defense:</strong> {defense}</div>
            <div className="stat-row"><span className="stat-icon">❤</span> <strong>llifepoints:</strong> 100</div>
            <div className="stat-row"><span className="stat-icon">✨</span> <strong>attributes:</strong> {attributes}</div>
            <div className="stat-row stat-row--description"><span className="stat-icon">📜</span> <strong>Descripción:</strong> <span className="description-text">{description}</span></div>
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
          <img src={pictureUrl} alt={name} />
        </div>

        <div className="carta-name-bar">
          <div className="carta-name">{name}</div>
        </div>
      </div>
    </div>
  )
}

export default Carta
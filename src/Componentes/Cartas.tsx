// Cartas.tsx - Arreglar el botón de editar

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
  isSelected = false,
  onSelect,
  onEdit, 
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
  const handleCardClick = (e: React.MouseEvent) => {
    // Detener propagación si se hizo clic en el botón de editar
    if ((e.target as HTMLElement).closest('.edit-button')) {
      e.stopPropagation();
      return;
    }
    
    console.log('Carta clickeada - selectable:', selectable, 'name:', name)
    if (selectable) {
      if (onSelect) {
        console.log('Llamando a onSelect para:', numero)
        onSelect()
      }
    } else {
      if (onClick) {
        console.log('Llamando a onClick para ver detalles')
        onClick()
      }
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

  return (
    <div 
      className={`carta ${isSelected ? 'selected' : ''} ${selectable ? 'select-mode' : ''}`} 
      onClick={handleCardClick}
      role="button" 
      tabIndex={0}
    >
      <div className="pokebola" aria-hidden="true" />
      {selectable && (
        <div className={`select-badge ${isSelected ? 'checked' : ''}`} aria-hidden="true">
          {isSelected ? '✓' : '🗑️'}
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
          {attributes && attributes !== "Normal" && (
            <div className="carta-attribute-badge">{attributes}</div>
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
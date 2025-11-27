import './Cartas.css'

type Props = {  
  numero: number;
  nombre: string;
  tipo: string;
  ataque?: number;
  defensa?: number;
  descripcion: string;
  imagen: string;
};

type CartaProps = Props & {
  expanded?: boolean;
  onClick?: () => void;
};

function Carta ({
  ataque = 0,
  defensa = 0,
  descripcion = "sin descripción",
  imagen,
  nombre = "pikachu",
  numero = 0,
  tipo = "electrico",
  expanded = false,
  onClick,
}: CartaProps) {

  // Vista expandida como modal (sin cambios)
  if (expanded) {
    return (
      <>
        <div className="overlay" onClick={onClick} />
        <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
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
            <h3>Información</h3>
            <p><span className="icon">⚔️</span> Ataque: {ataque}</p>
            <p><span className="icon">🛡️</span> Defensa: {defensa}</p>
            <p><span className="icon">❤</span> Vida: 100</p>
            <p><span className="icon">📜</span> {descripcion}</p>
            <p><span className="icon">🌟</span> Tipo: {tipo}</p>
            <button className="close-button" onClick={onClick}>Cerrar</button>
          </aside>
        </div>
      </>
    )
  }

  // Vista normal (lista) — nombre debajo de la imagen
  return (
    <div className="carta" onClick={onClick} role="button" tabIndex={0}>
      <div className="carta-contenido">
        <div className="carta-media">
          <img src={imagen} alt={nombre} />
        </div>
        <div className="carta-name">{nombre}</div>
      </div>
    </div>
  )
}

export default Carta
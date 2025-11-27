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
  return (
    <div className={`carta ${expanded ? 'expanded' : ''}`} onClick={onClick} role="button" tabIndex={0}>
      <div className="carta-media">
        <img src={imagen} alt={nombre} />
      </div>

      <div className="carta-nombre">{nombre}</div>

      {expanded && (
        <div className="carta-detalles">
          <p>#{numero} — {tipo}</p>
          <p>Ataque: {ataque}</p>
          <p>Defensa: {defensa}</p>
          <p className="descripcion">{descripcion}</p>
        </div>
      )}
    </div>
  )
}

export default Carta
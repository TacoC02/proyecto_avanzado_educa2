import "./Cartas.css"
type Props ={  
    numero: number;
    nombre: string;
    tipo: string;
    ataque?: number;
    defensa?: number;
    descripcion: string;
    imagen: string;
};

function Carta ({
    ataque=0,
    defensa=0,
    descripcion="ola",
    imagen,
    nombre="pikachu",
    numero=0,
    tipo="electrico",
}:Props) {
  return (
    <div>
        <h3>
            {nombre} (#{numero})
        </h3>
        <img src={imagen} alt={nombre} />
        <p>Tipo: {tipo}</p>
        <p>Ataque: {ataque}</p>
        <p>Defensa: {defensa}</p>
        <p>{descripcion}</p>
    </div>
  );
}

export default Carta;
type Props ={  
    numero: number;
    name: string;
    attributes: string;
    attack: number;
    defense: number;
    description: string;
    pictureUrl: string;
};

function CardDetail ({
    attack,
    defense,
    description,
    pictureUrl,
    name,
    numero,
    attributes,
}:Props) {
  return (
    <div>
        <h3>
            {name} (#{numero})
        </h3>
        <img src={pictureUrl} alt={name} />
        <p>attributes: {attributes}</p>
        <p>attack: {attack}</p>
        <p>defense: {defense}</p>
        <p>{description}</p>
    </div>
    );
}

export default CardDetail;

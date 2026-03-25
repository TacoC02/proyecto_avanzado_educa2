import './spinner.css'

interface SpinnerProps {
  message?: string;
}

function Spinner({ message = "Cargando..." }: SpinnerProps) {
  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <div className="pokeball-spinner">
          <div className="pokeball-button"></div>
        </div>
        <p className="spinner-message">{message}</p>
      </div>
    </div>
  )
}

export default Spinner
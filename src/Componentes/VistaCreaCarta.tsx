import { useState } from 'react'
import './vistaCreaCarta.css'

type FormData = {
	nombre: string
	tipo: string
	ataque: number
	defensa: number
	vida: number
	descripcion: string
	imagen: string
}

type Props = {
	onClose: () => void
	onCreate: (data: FormData) => void
	nextNumero: number
}

function VistaCreaCarta({ onClose, onCreate, nextNumero }: Props) {
	const [form, setForm] = useState<FormData>({
		nombre: '',
		tipo: '',
		ataque: 0,
		defensa: 0,
		vida: 100,
		descripcion: '',
		imagen: '',
	})

	function handleChange<K extends keyof FormData>(key: K, value: FormData[K]) {
		setForm((s) => ({ ...s, [key]: value }))
	}

	function submit(e?: React.FormEvent) {
		e?.preventDefault()
		if (!form.nombre) return alert('Ingrese un nombre')
		onCreate({ ...form })
		onClose()
	}

	return (
		<div className="overlay" onClick={onClose}>
			<div className="create-modal" onClick={(e) => e.stopPropagation()} role="dialog">
				<div className="modal-card" onClick={(e) => e.stopPropagation()}>
					<div className="pokebola modal-pokebola" aria-hidden="true" />
					<div className="modal-card-header">
						<span className="modal-num">#{nextNumero}</span>
					</div>

					<div className="modal-card-body">
						<div className="modal-media">
							{form.imagen ? (
								<img src={form.imagen} alt={form.nombre || 'preview'} />
							) : (
								<div style={{width:120,height:120,borderRadius:999,background:'#fff',boxShadow:'inset 0 0 0 6px rgba(0,0,0,0.03)'}} />
							)}
						</div>
					</div>

					<div className="modal-card-footer">
						<h2 className="modal-name">{form.nombre || 'Nombre'}</h2>
					</div>
				</div>

				<aside className="modal-details" onClick={(e) => e.stopPropagation()}>
					<h3>Crear nueva carta</h3>
					<form onSubmit={submit} className="create-form">
						<label>
							Nombre
							<input value={form.nombre} onChange={(e) => handleChange('nombre', e.target.value)} />
						</label>

						<label>
							Tipo
							<input value={form.tipo} onChange={(e) => handleChange('tipo', e.target.value)} />
						</label>

						<div className="stat-row"><span className="stat-icon">⚔️</span>
							<label>Ataque
								<input type="number" value={form.ataque} onChange={(e) => handleChange('ataque', Number(e.target.value || 0))} />
							</label>
						</div>

						<div className="stat-row"><span className="stat-icon">🛡️</span>
							<label>Defensa
								<input type="number" value={form.defensa} onChange={(e) => handleChange('defensa', Number(e.target.value || 0))} />
							</label>
						</div>

						<div className="stat-row"><span className="stat-icon">❤</span>
							<label>Vida
								<input type="number" value={form.vida} onChange={(e) => handleChange('vida', Number(e.target.value || 0))} />
							</label>
						</div>

						<label>
							Imagen (URL)
							<input value={form.imagen} onChange={(e) => handleChange('imagen', e.target.value)} />
						</label>

						<label>
							Descripción
							<textarea value={form.descripcion} onChange={(e) => handleChange('descripcion', e.target.value)} />
						</label>

						<div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
							<button type="button" className="close-button" onClick={onClose}>Cancelar</button>
							<button type="submit" className="btn primary">Agregar</button>
						</div>
					</form>
				</aside>
			</div>
		</div>
	)
}

export default VistaCreaCarta

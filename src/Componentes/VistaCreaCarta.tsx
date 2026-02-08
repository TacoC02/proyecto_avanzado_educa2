import { useState } from 'react'
import './vistaCreaCarta.css'

type FormData = {
	nombre: string
	tipo: string
	ataque: number
	defensa: number
	vida: number
	descripcion: string
	pokemonName: string
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
		pokemonName: '',
		imagen: '',
	})

	function handleChange<K extends keyof FormData>(key: K, value: FormData[K]) {
		setForm((s) => ({ ...s, [key]: value }))
	}

	async function submit(e?: React.FormEvent) {
		e?.preventDefault()
		if (!form.nombre) return alert('Ingrese un nombre')
		if (!form.pokemonName) return alert('Ingrese el nombre del Pokémon para buscar la imagen')

		const name = form.pokemonName.trim().toLowerCase()
		try {
			const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`)
			if (!res.ok) return alert('Pokémon no encontrado')
			const data = await res.json()
			const image = data?.sprites?.other?.['official-artwork']?.front_default || data?.sprites?.front_default || ''
			if (!image) return alert('Imagen no disponible para ese Pokémon')

			onCreate({ ...form, imagen: image })
			onClose()
		} catch (err) {
			console.error(err)
			alert('Error al buscar el Pokémon')
		}
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
					<h1>Crear tu carta</h1>
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
							Nombre del Pokémon
							<input value={form.pokemonName} onChange={(e) => handleChange('pokemonName', e.target.value)} placeholder="Ej: Pikachu" />
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

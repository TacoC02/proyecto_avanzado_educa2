import { useState } from 'react'
import './vistaCreaCarta.css'

type FormData = {
	name: string
	attributes: string
	attack: number
	defense: number
	llifepoints: number
	description: string
	pokemonName: string
	pictureUrl: string
}

type Props = {
	onClose: () => void
	onCreate: (data: FormData) => void
	nextNumero: number
}

function VistaCreaCarta({ onClose, onCreate, nextNumero }: Props) {
	const [form, setForm] = useState<FormData>({
		name: '',
		attributes: '',
		attack: 0,
		defense: 0,
		llifepoints: 100,
		description: '',
		pokemonName: '',
		pictureUrl: '',
	})

	function handleChange<K extends keyof FormData>(key: K, value: FormData[K]) {
		setForm((s) => ({ ...s, [key]: value }))
	}

	async function submit(e?: React.FormEvent) {
		e?.preventDefault()
		if (!form.name) return alert('Ingrese un name')
		if (!form.pokemonName) return alert('Ingrese el name del Pokémon para buscar la pictureUrl')

		const name = form.pokemonName.trim().toLowerCase()
		try {
			const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`)
			if (!res.ok) return alert('Pokémon no encontrado')
			const data = await res.json()
			const image = data?.sprites?.other?.['official-artwork']?.front_default || data?.sprites?.front_default || ''
			if (!image) return alert('pictureUrl no disponible para ese Pokémon')

			onCreate({ ...form, pictureUrl: image })
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
							{form.pictureUrl ? (
								<img src={form.pictureUrl} alt={form.name || 'preview'} />
							) : (
								<div style={{width:120,height:120,borderRadius:999,background:'#fff',boxShadow:'inset 0 0 0 6px rgba(0,0,0,0.03)'}} />
							)}
						</div>
					</div>

					<div className="modal-card-footer">
						<h2 className="modal-name">{form.name || 'name'}</h2>
					</div>
				</div>

				<aside className="modal-details" onClick={(e) => e.stopPropagation()}>
					<h1>Crear tu carta</h1>
					<form onSubmit={submit} className="create-form">
						<label>
							name
							<input value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
						</label>

						<label>
							attributes
							<input value={form.attributes} onChange={(e) => handleChange('attributes', e.target.value)} />
						</label>

						<div className="stat-row"><span className="stat-icon">⚔️</span>
							<label>attack
								<input type="number" value={form.attack} onChange={(e) => handleChange('attack', Number(e.target.value || 0))} />
							</label>
						</div>

						<div className="stat-row"><span className="stat-icon">🛡️</span>
							<label>defense
								<input type="number" value={form.defense} onChange={(e) => handleChange('defense', Number(e.target.value || 0))} />
							</label>
						</div>

						<div className="stat-row"><span className="stat-icon">❤</span>
							<label>llifepoints
								<input type="number" value={form.llifepoints} onChange={(e) => handleChange('llifepoints', Number(e.target.value || 0))} />
							</label>
						</div>

						<label>
							name del Pokémon
							<input value={form.pokemonName} onChange={(e) => handleChange('pokemonName', e.target.value)} placeholder="Ej: Pikachu" />
						</label>

						<label>
							Descripción
							<textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
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

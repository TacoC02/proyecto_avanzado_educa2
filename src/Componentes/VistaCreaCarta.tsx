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
				<h2>Crear carta #{nextNumero}</h2>
				<form onSubmit={submit} className="create-form">
					<label>
						Nombre
						<input value={form.nombre} onChange={(e) => handleChange('nombre', e.target.value)} />
					</label>

					<label>
						Tipo
						<input value={form.tipo} onChange={(e) => handleChange('tipo', e.target.value)} />
					</label>

					<label>
						Ataque
						<input type="number" value={form.ataque} onChange={(e) => handleChange('ataque', Number(e.target.value || 0))} />
					</label>

					<label>
						Defensa
						<input type="number" value={form.defensa} onChange={(e) => handleChange('defensa', Number(e.target.value || 0))} />
					</label>

					<label>
						Vida
						<input type="number" value={form.vida} onChange={(e) => handleChange('vida', Number(e.target.value || 0))} />
					</label>

					<label>
						Imagen (URL)
						<input value={form.imagen} onChange={(e) => handleChange('imagen', e.target.value)} />
					</label>

					<label>
						Descripción
						<textarea value={form.descripcion} onChange={(e) => handleChange('descripcion', e.target.value)} />
					</label>

					<div className="create-actions">
						<button type="button" className="btn secondary" onClick={onClose}>Cancelar</button>
						<button type="submit" className="btn primary">Agregar</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default VistaCreaCarta

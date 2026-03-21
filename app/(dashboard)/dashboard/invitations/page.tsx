'use client'

import { useEffect, useState } from 'react'
import { Ticket, Plus, Trash2, Copy, Check, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import {
    createInviteCode,
    listInvitations,
    deleteInviteCode,
    type Invitation,
} from '@/app/lib/firebase/services/invitations'

function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const segment = (n: number) =>
        Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    return `${segment(4)}-${segment(4)}`
}

export default function InvitationsPage() {
    const [invitations, setInvitations] = useState<Invitation[]>([])
    const [loading, setLoading] = useState(true)
    const [code, setCode] = useState(generateCode())
    const [note, setNote] = useState('')
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState<string | null>(null)

    async function load() {
        setLoading(true)
        setInvitations(await listInvitations())
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        setCreating(true)
        setError(null)
        try {
            await createInviteCode(code, note)
            setCode(generateCode())
            setNote('')
            await load()
            toast.success('Código de invitación creado')
        } catch (err: any) {
            setError(err.message)
            toast.error('No se pudo crear el código')
        }
        setCreating(false)
    }

    async function handleDelete(inv: Invitation) {
        toast(`¿Eliminar el código ${inv.code}?`, {
            action: {
                label: 'Eliminar',
                onClick: async () => {
                    await deleteInviteCode(inv.code)
                    await load()
                    toast.success(`Código ${inv.code} eliminado`)
                },
            },
            cancel: { label: 'Cancelar', onClick: () => {} },
        })
    }

    function handleCopy(code: string) {
        navigator.clipboard.writeText(code)
        setCopied(code)
        toast.success('Código copiado al portapapeles')
        setTimeout(() => setCopied(null), 2000)
    }

    return (
        <div className="space-y-6 md:space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Invitaciones</h1>
                <p className="text-gray-500 mt-1 text-sm md:text-base">Generá códigos para tus nuevos clientes.</p>
            </div>

            {/* Formulario nuevo código */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Nuevo código</h2>
                <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex flex-col sm:flex-row gap-2 flex-1">
                        <div className="flex gap-2">
                            <input
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                                required
                                placeholder="XXXX-XXXX"
                                className="w-36 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono tracking-widest text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <button
                                type="button"
                                onClick={() => setCode(generateCode())}
                                title="Generar código aleatorio"
                                className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-md"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </button>
                        </div>
                        <input
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Nota (ej: Bar El Patio)"
                            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={creating}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Crear
                    </button>
                </form>
                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>

            {/* Lista */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-800">Códigos generados</h2>
                    <span className="text-sm text-gray-400">{invitations.length} total</span>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
                ) : invitations.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        <Ticket className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        Todavía no hay códigos.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {invitations.map(inv => (
                            <li key={inv.code} className="flex flex-wrap items-center gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${inv.used ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                                    {inv.used ? 'Usado' : 'Disponible'}
                                </span>
                                <span className="font-mono text-sm font-semibold text-gray-800 tracking-wider">{inv.code}</span>
                                <span className="flex-1 text-sm text-gray-500 truncate min-w-0">{inv.note || '—'}</span>
                                {inv.used && inv.usedBy && (
                                    <span className="text-xs text-gray-400 hidden sm:block truncate max-w-40">{inv.usedBy}</span>
                                )}
                                <div className="flex items-center gap-1 ml-auto sm:ml-0">
                                    {!inv.used && (
                                        <button
                                            onClick={() => handleCopy(inv.code)}
                                            title="Copiar código"
                                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded transition-colors"
                                        >
                                            {copied === inv.code ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(inv)}
                                        title="Eliminar"
                                        className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

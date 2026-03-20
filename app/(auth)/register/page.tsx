'use client'

import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/app/lib/firebase/config'
import { validateInviteCode, consumeInviteCode } from '@/app/lib/firebase/services/invitations'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const inviteCode = formData.get('inviteCode') as string

        try {
            const isValid = await validateInviteCode(inviteCode)
            if (!isValid) {
                setError('El código de invitación no es válido o ya fue usado.')
                setLoading(false)
                return
            }

            const { user } = await createUserWithEmailAndPassword(auth, email, password)
            await consumeInviteCode(inviteCode, user.uid, email)
            // La redirección al dashboard la hace automáticamente el AuthContext
        } catch (err: any) {
            setError(
                err.code === 'auth/email-already-in-use'
                    ? 'Este correo ya está registrado.'
                    : err.message
            )
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Crear Cuenta</h2>
                    <p className="text-gray-500 mt-2">Registra tu local y comienza a usar tu menú QR</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="inviteCode">
                            Código de Invitación
                        </label>
                        <input
                            id="inviteCode"
                            name="inviteCode"
                            type="text"
                            required
                            placeholder="XXXX-XXXX"
                            autoComplete="off"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700 uppercase tracking-widest"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="tu@negocio.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            placeholder="••••••••"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            'Crear mi cuenta'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600">
                    ¿Ya tienes una cuenta?{' '}
                    <Link href="/login" className="font-medium text-red-600 hover:text-red-500 hover:underline">
                        Inicia sesión aquí
                    </Link>
                </p>
            </div>
        </div>
    )
}

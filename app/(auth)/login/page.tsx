'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/app/lib/firebase/config'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        try {
            await signInWithEmailAndPassword(auth, email, password)
            // La redirección al dashboard la hace automáticamente el AuthContext
        } catch (err: any) {
            setError('Correo o contraseña incorrectos.')
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-red-50 to-gray-100">
            <div className="w-full max-w-md space-y-8 bg-white/80 p-10 rounded-3xl shadow-xl border border-white/40 backdrop-blur-md">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 transform -rotate-3 mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Iniciar Sesión</h2>
                    <p className="text-gray-500 mt-2 font-medium">Gestiona tu menú digital en segundos</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                            {error}
                        </div>
                    )}

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
                            placeholder="••••••••"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md shadow-red-500/20 text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            'Ingresar al panel'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm font-medium text-gray-600">
                    ¿No tienes una cuenta?{' '}
                    <Link href="/register" className="text-red-600 hover:text-red-700 hover:underline transition-colors">
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </div>
    )
}

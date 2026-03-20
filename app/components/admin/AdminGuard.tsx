'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2, ShieldOff } from 'lucide-react'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) router.push('/login')
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-red-400" />
            </div>
        )
    }

    if (!user || user.email !== ADMIN_EMAIL) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-900 flex-col gap-4">
                <ShieldOff className="h-12 w-12 text-red-400" />
                <p className="text-white text-lg font-semibold">Acceso denegado</p>
                <p className="text-gray-400 text-sm">No tenés permisos para ver esta sección.</p>
            </div>
        )
    }

    return <>{children}</>
}

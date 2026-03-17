'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '@/app/lib/firebase/config'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

type AuthContextType = {
    user: User | null
    loading: boolean
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Suscribirse a los cambios de estado de autenticación
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            setLoading(false)

            const isDashboardRoute = pathname?.startsWith('/dashboard')
            const isAuthRoute = pathname?.startsWith('/login') || pathname?.startsWith('/register')

            // Protección de rutas del lado del cliente
            if (!currentUser && isDashboardRoute) {
                router.push('/login')
            } else if (currentUser && isAuthRoute) {
                router.push('/dashboard/settings')
            }
        })

        return () => unsubscribe()
    }, [pathname, router])

    const logout = async () => {
        try {
            await firebaseSignOut(auth)
            router.push('/login')
        } catch (error) {
            console.error('Error cerrando sesión', error)
        }
    }

    // Mostrar un loader global mientras Firebase chequea si hay sesión activa
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
        )
    }

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Store, Layers, Pizza, QrCode, LogOut } from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'

const navigation = [
    { name: 'Resumen', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Mi Local', href: '/dashboard/settings', icon: Store },
    { name: 'Categorías', href: '/dashboard/categories', icon: Layers },
    { name: 'Productos', href: '/dashboard/products', icon: Pizza },
    { name: 'Código QR', href: '/dashboard/qr', icon: QrCode },
]

export function DashboardSidebar() {
    const pathname = usePathname()
    const { logout } = useAuth()

    return (
        <div className="flex h-full flex-col bg-white border-r border-gray-200">
            <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
                <QrCode className="h-8 w-8 text-red-600" />
                <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-indigo-600">
                    QR SaaS
                </span>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                <nav className="flex-1 space-y-1 px-4">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-red-50 text-red-700'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-red-700' : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={logout}
                    className="group flex w-full items-center px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600" aria-hidden="true" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    )
}

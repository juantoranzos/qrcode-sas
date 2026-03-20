'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Store, Ticket, QrCode, LogOut, ShieldCheck, Menu, X } from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useState, useEffect } from 'react'

const navigation = [
    { name: 'Métricas', href: '/admin', icon: LayoutDashboard },
    { name: 'Negocios', href: '/admin/businesses', icon: Store },
    { name: 'Invitaciones', href: '/admin/invitations', icon: Ticket },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const { logout } = useAuth()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        setOpen(false)
    }, [pathname])

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [open])

    const sidebarContent = (
        <div className="flex h-full flex-col bg-gray-900 border-r border-gray-800">
            <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-7 w-7 text-red-400" />
                    <span className="text-lg font-bold text-white">Admin</span>
                </div>
                <button
                    onClick={() => setOpen(false)}
                    className="md:hidden p-1.5 text-gray-400 hover:text-white rounded-md"
                >
                    <X className="h-5 w-5" />
                </button>
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
                                    ? 'bg-red-600 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-800 space-y-2">
                <Link
                    href="/dashboard"
                    className="group flex w-full items-center px-3 py-2 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                >
                    <QrCode className="mr-3 h-4 w-4" />
                    Ir al dashboard
                </Link>
                <button
                    onClick={logout}
                    className="group flex w-full items-center px-3 py-2.5 text-sm font-medium text-red-400 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile header bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center gap-3 bg-gray-900 border-b border-gray-800 px-4">
                <button
                    onClick={() => setOpen(true)}
                    className="p-1.5 text-gray-400 hover:text-white rounded-md"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <ShieldCheck className="h-6 w-6 text-red-400" />
                <span className="text-lg font-bold text-white">Admin</span>
            </div>

            {/* Mobile overlay */}
            {open && (
                <div
                    className="md:hidden fixed inset-0 z-50 bg-black/50"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <div className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                {sidebarContent}
            </div>

            {/* Desktop sidebar */}
            <div className="hidden md:flex md:fixed md:inset-y-0 md:w-64 md:flex-col">
                {sidebarContent}
            </div>
        </>
    )
}

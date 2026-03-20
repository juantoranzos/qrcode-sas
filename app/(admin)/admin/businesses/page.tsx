'use client'

import { useEffect, useState } from 'react'
import { Store, ExternalLink } from 'lucide-react'
import { getAllBusinesses } from '@/app/lib/firebase/services/admin'
import { AdminGuard } from '@/app/components/admin/AdminGuard'
import type { BusinessProfile } from '@/app/lib/firebase/services/business'

function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminBusinessesPage() {
    const [businesses, setBusinesses] = useState<BusinessProfile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAllBusinesses().then(b => { setBusinesses(b); setLoading(false) })
    }, [])

    return (
        <AdminGuard>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Negocios</h1>
                    <p className="text-gray-500 mt-1">Todos los locales registrados en el sistema.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-800">Lista de negocios</h2>
                        <span className="text-sm text-gray-400">{businesses.length} total</span>
                    </div>

                    {loading ? (
                        <div className="divide-y divide-gray-100">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="px-6 py-4 h-16 animate-pulse bg-gray-50" />
                            ))}
                        </div>
                    ) : businesses.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 text-sm">
                            <Store className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            No hay negocios registrados todavía.
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {businesses.map(b => (
                                <li key={b.id} className="flex items-center gap-4 px-6 py-4">
                                    {b.logoUrl ? (
                                        <img src={b.logoUrl} alt={b.businessName} className="h-10 w-10 rounded-full object-cover border border-gray-200" />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                            <Store className="h-5 w-5 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{b.businessName}</p>
                                        <p className="text-xs text-gray-400">/{b.slug}</p>
                                    </div>
                                    <span className="text-xs text-gray-400 hidden sm:block">{formatDate(b.createdAt)}</span>
                                    <a
                                        href={`/menu/${b.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Ver menú"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AdminGuard>
    )
}

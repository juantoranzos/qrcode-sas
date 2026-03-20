'use client'

import { useEffect, useState } from 'react'
import { Store, Ticket, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { getAdminMetrics } from '@/app/lib/firebase/services/admin'
import { AdminGuard } from '@/app/components/admin/AdminGuard'

type Metrics = Awaited<ReturnType<typeof getAdminMetrics>>

function StatCard({ icon: Icon, label, value, sub }: { icon: any, label: string, value: number, sub?: string }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-start gap-4">
            <div className="p-2 bg-red-50 rounded-lg">
                <Icon className="h-6 w-6 text-red-600" />
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
            </div>
        </div>
    )
}

export default function AdminPage() {
    const [metrics, setMetrics] = useState<Metrics | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAdminMetrics().then(m => { setMetrics(m); setLoading(false) })
    }, [])

    return (
        <AdminGuard>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Métricas</h1>
                    <p className="text-gray-500 mt-1">Resumen general del sistema.</p>
                </div>

                {loading || !metrics ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 h-28 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <StatCard icon={Store} label="Negocios registrados" value={metrics.totalBusinesses} />
                        <StatCard icon={TrendingUp} label="Nuevos este mes" value={metrics.newThisMonth} />
                        <StatCard icon={Ticket} label="Invitaciones totales" value={metrics.totalInvitations} />
                        <StatCard icon={CheckCircle} label="Invitaciones usadas" value={metrics.usedInvitations} />
                        <StatCard icon={Clock} label="Invitaciones disponibles" value={metrics.availableInvitations} />
                    </div>
                )}
            </div>
        </AdminGuard>
    )
}

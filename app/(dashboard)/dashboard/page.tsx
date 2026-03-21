'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { getProducts, type Product } from '@/app/lib/firebase/services/products'
import { getCategories } from '@/app/lib/firebase/services/categories'
import { getBusinessProfile, type BusinessProfile } from '@/app/lib/firebase/services/business'
import { getScanStats, type ScanStats, type DailyScanCount } from '@/app/lib/firebase/services/analytics'
import Link from 'next/link'
import {
    Package, Tag, CheckCircle2, QrCode, ExternalLink,
    Clock, ChevronRight, Loader2, AlertCircle, ImageOff, FileText,
    Store, Palette, TrendingUp, ScanLine, BarChart2, Calendar
} from 'lucide-react'

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function isBusinessOpenNow(profile: BusinessProfile): { open: boolean; todaySchedule: { isOpen: boolean; openTime: string; closeTime: string } | null } {
    if (!profile.schedule) return { open: false, todaySchedule: null }
    const now = new Date()
    const dayKey = DAY_KEYS[now.getDay()]
    const todaySchedule = profile.schedule[dayKey]
    if (!todaySchedule || !todaySchedule.isOpen) return { open: false, todaySchedule: todaySchedule || null }

    const [openH, openM] = todaySchedule.openTime.split(':').map(Number)
    const [closeH, closeM] = todaySchedule.closeTime.split(':').map(Number)
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const openMinutes = openH * 60 + openM
    const closeMinutes = closeH * 60 + closeM

    return { open: currentMinutes >= openMinutes && currentMinutes < closeMinutes, todaySchedule }
}

interface StatCardProps {
    label: string
    value: number | string
    icon: React.ReactNode
    color: string
    sub?: string
}

function StatCard({ label, value, icon, color, sub }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}

interface HealthBarProps {
    label: string
    count: number
    total: number
    icon: React.ReactNode
}

function HealthBar({ label, count, total, icon }: HealthBarProps) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0
    const color = pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    {icon}
                    {label}
                </div>
                <span className="text-sm font-semibold text-gray-800">{count}/{total}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    )
}

const DAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function MiniBarChart({ data }: { data: DailyScanCount[] }) {
    const max = Math.max(...data.map(d => d.count), 1)
    return (
        <div className="flex items-end gap-1.5 h-20">
            {data.map(({ date, count }) => {
                const d = new Date(date + 'T12:00:00')
                const dayName = DAY_SHORT[d.getDay()]
                const heightPct = Math.max((count / max) * 100, count > 0 ? 8 : 3)
                const isToday = date === data[data.length - 1].date
                return (
                    <div key={date} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-gray-500 font-medium tabular-nums leading-none">
                            {count > 0 ? count : ''}
                        </span>
                        <div className="w-full flex items-end" style={{ height: '48px' }}>
                            <div
                                className={`w-full rounded-t-md transition-all ${isToday ? 'bg-red-500' : 'bg-gray-200'}`}
                                style={{ height: `${heightPct}%` }}
                            />
                        </div>
                        <span className={`text-[10px] font-medium leading-none ${isToday ? 'text-red-600' : 'text-gray-400'}`}>
                            {dayName}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

const EMPTY_SCAN_STATS: ScanStats = { total: 0, today: 0, thisWeek: 0, last7Days: [] }

export default function DashboardPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState<Product[]>([])
    const [categoryCount, setCategoryCount] = useState(0)
    const [profile, setProfile] = useState<BusinessProfile | null>(null)
    const [scanStats, setScanStats] = useState<ScanStats | null>(null)

    useEffect(() => {
        if (!user) return
        async function load() {
            try {
                const [prods, cats, prof] = await Promise.all([
                    getProducts(user!.uid),
                    getCategories(user!.uid),
                    getBusinessProfile(user!.uid),
                ])
                setProducts(prods)
                setCategoryCount(cats.length)
                setProfile(prof)
                if (prof?.id) {
                    getScanStats(prof.id)
                        .then(setScanStats)
                        .catch(() => setScanStats(EMPTY_SCAN_STATS))
                }
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user])

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div>
    }

    const available = products.filter(p => p.isAvailable).length
    const paused = products.filter(p => !p.isAvailable).length
    const withImage = products.filter(p => p.imageUrl).length
    const withDesc = products.filter(p => p.description?.trim()).length

    const profileChecks = [
        !!profile?.businessName,
        !!profile?.slug,
        !!profile?.logoUrl,
        !!profile?.themeColor,
        !!profile?.schedule,
    ]
    const profileScore = profileChecks.filter(Boolean).length

    const { open: isOpen, todaySchedule } = profile ? isBusinessOpenNow(profile) : { open: false, todaySchedule: null }
    const todayName = DAY_NAMES[new Date().getDay()]

    const menuUrl = profile?.slug
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/menu/${profile.slug}`
        : null

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                    {profile?.businessName ? `Hola, ${profile.businessName}` : 'Panel de Control'}
                </h1>
                <p className="text-gray-500 mt-1 text-sm md:text-base">
                    Resumen de tu menú digital.
                </p>
            </div>

            {/* Alerta si no hay perfil */}
            {!profile?.slug && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-800">Tu local no está configurado</p>
                        <p className="text-sm text-amber-700 mt-0.5">
                            <Link href="/dashboard/settings" className="underline font-medium">Completá tu perfil</Link> para activar tu menú QR y que tus clientes puedan verlo.
                        </p>
                    </div>
                </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                    label="Total productos"
                    value={products.length}
                    icon={<Package className="h-5 w-5 text-indigo-600" />}
                    color="bg-indigo-50"
                />
                <StatCard
                    label="Disponibles"
                    value={available}
                    icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
                    color="bg-green-50"
                    sub={products.length > 0 ? `${Math.round((available / products.length) * 100)}% del menú` : undefined}
                />
                <StatCard
                    label="Escaneos totales"
                    value={scanStats === null ? '—' : scanStats.total.toLocaleString('es-AR')}
                    icon={<ScanLine className="h-5 w-5 text-red-600" />}
                    color="bg-red-50"
                    sub={scanStats ? `${scanStats.today} hoy · ${scanStats.thisWeek} esta semana` : undefined}
                />
                <StatCard
                    label="Categorías"
                    value={categoryCount}
                    icon={<Tag className="h-5 w-5 text-purple-600" />}
                    color="bg-purple-50"
                />
            </div>

            {/* Panel de Analytics */}
            {profile?.slug && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <BarChart2 className="h-4 w-4 text-gray-400" />
                        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Escaneos del QR</h2>
                    </div>

                    {!scanStats ? (
                        <div className="flex items-center justify-center h-24">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <div className="flex justify-center mb-1.5">
                                        <ScanLine className="h-4 w-4 text-red-500" />
                                    </div>
                                    <p className="text-2xl font-black text-gray-900 tabular-nums">{scanStats.total.toLocaleString('es-AR')}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 font-medium">Total</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <div className="flex justify-center mb-1.5">
                                        <Calendar className="h-4 w-4 text-indigo-500" />
                                    </div>
                                    <p className="text-2xl font-black text-gray-900 tabular-nums">{scanStats.today.toLocaleString('es-AR')}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 font-medium">Hoy</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <div className="flex justify-center mb-1.5">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                    </div>
                                    <p className="text-2xl font-black text-gray-900 tabular-nums">{scanStats.thisWeek.toLocaleString('es-AR')}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 font-medium">Últimos 7 días</p>
                                </div>
                            </div>

                            {scanStats.last7Days.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wider">Actividad — últimos 7 días</p>
                                    <MiniBarChart data={scanStats.last7Days} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

                {/* Salud del catálogo */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Calidad del catálogo</h2>
                    </div>

                    {products.length === 0 ? (
                        <p className="text-sm text-gray-400 py-2">Aún no tenés productos cargados.</p>
                    ) : (
                        <div className="space-y-4">
                            <HealthBar
                                label="Con foto"
                                count={withImage}
                                total={products.length}
                                icon={<ImageOff className="h-3.5 w-3.5 text-gray-400" />}
                            />
                            <HealthBar
                                label="Con descripción"
                                count={withDesc}
                                total={products.length}
                                icon={<FileText className="h-3.5 w-3.5 text-gray-400" />}
                            />
                            <HealthBar
                                label="Disponibles"
                                count={available}
                                total={products.length}
                                icon={<CheckCircle2 className="h-3.5 w-3.5 text-gray-400" />}
                            />
                        </div>
                    )}

                    <Link
                        href="/dashboard/products"
                        className="flex items-center justify-between text-sm text-red-600 font-medium hover:text-red-700 pt-1"
                    >
                        Gestionar productos <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* Perfil del local */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Store className="h-4 w-4 text-gray-400" />
                        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Perfil del local</h2>
                    </div>

                    <div className="space-y-2">
                        {[
                            { label: 'Nombre del local', done: !!profile?.businessName },
                            { label: 'URL del menú (slug)', done: !!profile?.slug },
                            { label: 'Logo cargado', done: !!profile?.logoUrl },
                            { label: 'Color de marca', done: !!profile?.themeColor },
                            { label: 'Horarios configurados', done: !!profile?.schedule },
                        ].map(({ label, done }) => (
                            <div key={label} className="flex items-center gap-2">
                                <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-green-100' : 'bg-gray-100'}`}>
                                    {done
                                        ? <CheckCircle2 className="h-3 w-3 text-green-600" />
                                        : <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                    }
                                </div>
                                <span className={`text-sm ${done ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Perfil completo</span>
                            <span className="text-xs font-semibold text-gray-700">{profileScore}/5</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${profileScore === 5 ? 'bg-green-500' : profileScore >= 3 ? 'bg-amber-400' : 'bg-red-400'}`}
                                style={{ width: `${(profileScore / 5) * 100}%` }}
                            />
                        </div>
                    </div>

                    <Link
                        href="/dashboard/settings"
                        className="flex items-center justify-between text-sm text-red-600 font-medium hover:text-red-700 pt-1"
                    >
                        Editar perfil <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* Estado hoy + acciones rápidas */}
                <div className="space-y-4 md:col-span-2 lg:col-span-1">

                    {/* Horario hoy */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Hoy — {todayName}</h2>
                        </div>

                        {!todaySchedule ? (
                            <p className="text-sm text-gray-400">No hay horario configurado.</p>
                        ) : !todaySchedule.isOpen ? (
                            <div className="flex items-center gap-2">
                                <span className="inline-flex h-2 w-2 rounded-full bg-gray-300" />
                                <span className="text-sm text-gray-500 font-medium">Cerrado hoy</span>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex h-2 w-2 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`} />
                                    <span className={`text-sm font-semibold ${isOpen ? 'text-green-700' : 'text-amber-700'}`}>
                                        {isOpen ? 'Abierto ahora' : 'Fuera de horario'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 pl-4">
                                    {todaySchedule.openTime} – {todaySchedule.closeTime}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Acciones rápidas */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Palette className="h-4 w-4 text-gray-400" />
                            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Acciones rápidas</h2>
                        </div>
                        <div className="space-y-2">
                            <Link
                                href="/dashboard/products"
                                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center gap-2.5 text-sm text-gray-700">
                                    <Package className="h-4 w-4 text-indigo-500" />
                                    Agregar producto
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                            </Link>
                            <Link
                                href="/dashboard/qr"
                                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center gap-2.5 text-sm text-gray-700">
                                    <QrCode className="h-4 w-4 text-red-500" />
                                    Descargar código QR
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                            </Link>
                            {menuUrl && (
                                <a
                                    href={menuUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                                        <ExternalLink className="h-4 w-4 text-green-500" />
                                        Ver menú público
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

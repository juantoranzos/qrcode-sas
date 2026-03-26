'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/app/lib/firebase/config'
import { BusinessProfile } from '@/app/lib/firebase/services/business'
import { Category, getCategories } from '@/app/lib/firebase/services/categories'
import { Product, getProducts } from '@/app/lib/firebase/services/products'
import { Loader2, Search, Utensils, Info, Clock } from 'lucide-react'
import { recordScan } from '@/app/lib/firebase/services/analytics'

export default function PublicMenuPage() {
    const params = useParams()
    const slug = params?.slug as string

    const [business, setBusiness] = useState<BusinessProfile | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [products, setProducts] = useState<Product[]>([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<string>('all')

    const [isOpenStatus, setIsOpenStatus] = useState<{ isOpen: boolean; text: string }>({ isOpen: true, text: '' })

    // Helper para saber si está abierto
    const checkOpenStatus = (scheduleConfig: BusinessProfile['schedule']) => {
        if (!scheduleConfig) return { isOpen: true, text: '' }; // Si no configuró horarios, por defecto abierto

        const now = new Date();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
        const currentDayStr = days[now.getDay()];
        const todaySchedule = scheduleConfig[currentDayStr];

        if (!todaySchedule || !todaySchedule.isOpen) {
            return { isOpen: false, text: 'Cerrado hoy' };
        }

        const currentTimeNum = now.getHours() * 60 + now.getMinutes();

        const [openHour, openMin] = todaySchedule.openTime.split(':').map(Number);
        const openTimeNum = openHour * 60 + openMin;

        const [closeHour, closeMin] = todaySchedule.closeTime.split(':').map(Number);
        // Manejar el caso donde cierra después de la medianoche (ej: 02:00)
        let closeTimeNum = closeHour * 60 + closeMin;
        if (closeTimeNum < openTimeNum) {
            closeTimeNum += 24 * 60; // Sumamos un día en minutos
        }

        let adjustedCurrentTime = currentTimeNum;
        if (currentTimeNum < openTimeNum && closeTimeNum > 24 * 60) {
            adjustedCurrentTime += 24 * 60;
        }

        if (adjustedCurrentTime >= openTimeNum && adjustedCurrentTime <= closeTimeNum) {
            return { isOpen: true, text: 'Abierto ahora' };
        } else {
            return { isOpen: false, text: `Abre a las ${todaySchedule.openTime}` };
        }
    }

    // Cargar todos los datos públicoss
    useEffect(() => {
        async function loadMenu() {
            if (!slug) return

            try {
                // 1. Buscar el negocio por su slug
                const q = query(collection(db, 'businesses'), where('slug', '==', slug))
                const snapshot = await getDocs(q)

                if (snapshot.empty) {
                    setError(true)
                    setLoading(false)
                    return
                }

                const businessData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BusinessProfile
                setBusiness(businessData)
                setIsOpenStatus(checkOpenStatus(businessData.schedule))

                // Registrar el escaneo una sola vez por sesión
                const sessionKey = `scanned_${businessData.id}`
                if (!sessionStorage.getItem(sessionKey)) {
                    sessionStorage.setItem(sessionKey, '1')
                    recordScan(businessData.id!).catch(() => {/* silencioso */})
                }

                // 2. Traer categorías y productos en paralelo
                const [cats, prods] = await Promise.all([
                    getCategories(businessData.id!),
                    getProducts(businessData.id!)
                ])

                setCategories(cats)
                setProducts(prods)
            } catch (err: unknown) {
                console.error("Error cargando el menú", err)
                // Solo mostramos error fatal si no pudimos encontrar el negocio
                if (!business) setError(true)
            } finally {
                setLoading(false)
            }
        }

        loadMenu()
    }, [slug])

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-red-600 mb-4" />
                <p className="text-gray-500 font-medium tracking-wide">Preparando algo delicioso...</p>
            </div>
        )
    }

    if (error || !business) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <Utensils className="h-10 w-10 text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Local no encontrado</h1>
                <p className="text-gray-500 max-w-xs mx-auto">Parece que este local no existe o el enlace es incorrecto.</p>
            </div>
        )
    }

    // Filtrado de productos (Buscador + Categoría activa)
    const filteredProducts = products.filter(product => {
        // 1. Si no está disponible, no lo mostramos en el menú público
        if (!product.isAvailable) return false;

        // 2. Filtro por buscador de texto
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);

        // 3. Filtro por categoría seleccionada
        const matchesCategory = activeCategory === 'all' || product.categoryId === activeCategory;

        return matchesSearch && matchesCategory;
    })

    return (
        <div className="min-h-screen bg-[#F5F5F8] pb-24 font-sans">

            {/* Header del Local (Estilo App) */}
            <div
                className="px-4 pt-10 pb-6 shadow-md  top-0 z-30 rounded-b-[2.5rem]"
                style={{ backgroundColor: business.themeColor || '#dc2626' }}
            >
                <div className="max-w-md mx-auto relative flex flex-col items-center">

                    {business.logoUrl && (
                        <div className="w-20 h-20 mb-3 rounded-full border-4 border-white overflow-hidden shadow-sm bg-white">
                            <img src={business.logoUrl} alt={`Logo de ${business.businessName}`} className="w-full h-full object-cover" />
                        </div>
                    )}

                    <h1 className="text-3xl font-extrabold text-white tracking-tight text-center mb-1 drop-shadow-sm">
                        {business.businessName}
                    </h1>

                    {/* Status Badge */}
                    {business.schedule && (
                        <div className="flex justify-center mb-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${isOpenStatus.isOpen ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                <Clock className="w-3.5 h-3.5" />
                                {isOpenStatus.text}
                            </span>
                        </div>
                    )}

                    <p className={`text-center text-sm font-medium text-white/90 mb-6 drop-shadow-sm ${business.schedule ? 'hidden' : ''}`}>Menú Digital</p>


                    {/* Buscador Integrado */}
                    <div className="relative shadow-lg shadow-red-900/20 rounded-2xl">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="¿Qué vas a pedir hoy?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-12 pr-4 py-3.5 border-none bg-white rounded-2xl focus:ring-4 focus:ring-red-400/50 text-gray-900 placeholder-gray-400 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Selector de Categorías (Flotante) */}
            <div className=" top-[150px] z-20 -mt-2 mb-4 pt-4 pb-2 bg-gradient-to-b from-[#F5F5F8] to-transparent">
                <div className="max-w-md mx-auto px-4">
                    <div className="flex overflow-x-auto hide-scrollbar gap-2.5 pb-2 snap-x">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`snap-start whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeCategory === 'all'
                                ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                                : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:bg-gray-50'
                                }`}
                        >
                            ⭐ Todos
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id!)}
                                className={`snap-start whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeCategory === cat.id
                                    ? 'text-white shadow-lg'
                                    : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:bg-gray-50'
                                    }`}
                                style={activeCategory === cat.id ? { backgroundColor: business.themeColor || '#dc2626' } : {}}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Listado de Productos */}
            <div className="max-w-md mx-auto px-4 py-2 space-y-4">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <Info className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No encontramos platos con esos filtros.</p>
                    </div>
                ) : (
                    filteredProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-[1.5rem] p-3 shadow-sm border border-gray-100 flex gap-4 items-center active:scale-[0.98] transition-all hover:shadow-md cursor-pointer group">

                            {/* Full Image */}
                            {product.imageUrl ? (
                                <div className="w-28 h-28 flex-shrink-0 relative overflow-hidden rounded-[1.2rem] shadow-sm">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            ) : (
                                <div className="w-28 h-28 flex-shrink-0 relative overflow-hidden rounded-[1.2rem] bg-gray-50 flex items-center justify-center border border-gray-100">
                                    <Utensils className="w-8 h-8 text-gray-300" />
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex-1 min-w-0 py-1 pr-2 flex flex-col justify-between h-full">
                                <div>
                                    <h3 className="text-base font-extrabold text-gray-900 leading-tight mb-1">{product.name}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed font-medium">
                                        {product.description}
                                    </p>
                                </div>
                                <div className="mt-auto pt-1">
                                    <span
                                        className="inline-block font-black text-lg"
                                        style={{ color: business.themeColor || '#dc2626' }}
                                    >
                                        ${product.price.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="text-center pt-8 pb-4">
                <p className="text-xs text-gray-400 font-medium tracking-wide">Creado con QRCode-SaaS</p>
            </div>

        </div >
    )
}

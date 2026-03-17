'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { getBusinessProfile } from '@/app/lib/firebase/services/business'
import { Category, getCategories } from '@/app/lib/firebase/services/categories'
import { Product, getProducts, addProduct, deleteProduct, updateProduct } from '@/app/lib/firebase/services/products'
import { uploadImageToCloudinary } from '@/app/lib/cloudinary/upload'
import { Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react'

export default function ProductsPage() {
    const { user } = useAuth()
    const [businessId, setBusinessId] = useState<string | null>(null)

    const [categories, setCategories] = useState<Category[]>([])
    const [products, setProducts] = useState<Product[]>([])

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form states
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        async function loadData() {
            if (!user) return
            try {
                const profile = await getBusinessProfile(user.uid)
                if (profile?.id) {
                    setBusinessId(profile.id)
                    const [loadedCategories, loadedProducts] = await Promise.all([
                        getCategories(profile.id),
                        getProducts(profile.id)
                    ])
                    setCategories(loadedCategories)
                    setProducts(loadedProducts)
                    if (loadedCategories.length > 0) {
                        setCategoryId(loadedCategories[0].id)
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [user])

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || !price || !categoryId || !businessId) return

        setSaving(true)
        try {
            let imageUrl = ''
            if (imageFile) {
                imageUrl = await uploadImageToCloudinary(imageFile)
            }

            const newProduct = await addProduct({
                businessId,
                categoryId,
                name: name.trim(),
                description: description.trim(),
                price: parseFloat(price.toString()),
                imageUrl,
                isAvailable: true
            })

            setProducts([...products, newProduct])

            // Reset form
            setName('')
            setDescription('')
            setPrice('')
            setImageFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        } catch (error) {
            console.error("Error agregando producto:", error)
            alert("Hubo un error al guardar el producto o subir la imagen.")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este plato?')) return

        // UI update optimista
        const prevProducts = [...products]
        setProducts(products.filter(p => p.id !== id))

        try {
            await deleteProduct(id)
        } catch (error) {
            console.error("Error borrando:", error)
            setProducts(prevProducts)
        }
    }

    const toggleAvailability = async (id: string, currentStatus: boolean) => {
        const updatedProducts = products.map(p => p.id === id ? { ...p, isAvailable: !currentStatus } : p)
        setProducts(updatedProducts)
        try {
            await updateProduct(id, { isAvailable: !currentStatus })
        } catch (error) {
            console.error("Error actualizando", error)
            // revertir
        }
    }

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div>
    }

    if (!businessId) {
        return (
            <div className="text-center p-12 bg-yellow-50 rounded-xl border border-yellow-200">
                <h3 className="text-lg font-medium text-yellow-800">Aún no has configurado tu local</h3>
                <p className="mt-2 text-sm text-yellow-700">Por favor, ve a la sección "Mi Local" primero.</p>
            </div>
        )
    }

    if (categories.length === 0) {
        return (
            <div className="text-center p-12 bg-red-50 rounded-xl border border-red-200">
                <h3 className="text-lg font-medium text-red-800">Crea tu primera categoría</h3>
                <p className="mt-2 text-sm text-red-700">Necesitas al menos una categoría (ej: Bebidas) antes de agregar productos.</p>
            </div>
        )
    }

    return (
        <div className="max-w-5xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Platos y Productos</h1>
                <p className="text-gray-500 mt-2">Agrega los platos de tu menú, sube fotos apetitosas y define los precios.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Agregar Nuevo Plato</h2>

                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: Hamburguesa Completa"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <select
                                    required
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-700"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción corta (opcional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Lleva queso cheddar, bacon, huevo frito..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-gray-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Foto del producto (opcional, muy recomendado)</label>
                        <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-gray-100 transition-colors relative">
                            {imageFile ? (
                                <div className="text-center">
                                    <p className="text-sm text-gray-900 font-medium truncate max-w-xs">{imageFile.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button
                                        type="button"
                                        onClick={() => { setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                                        className="mt-3 text-xs text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Quitar foto
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer rounded-md bg-transparent font-semibold text-red-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-red-600 focus-within:ring-offset-2 hover:text-red-500"
                                        >
                                            <span>Buscar imagen en mi PC</span>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                accept="image/*"
                                                className="sr-only"
                                                ref={fileInputRef}
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setImageFile(e.target.files[0])
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs leading-5 text-gray-500">Recomendado formato cuadrado. PNG o JPG.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2 pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium shadow-sm"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                            {saving ? 'Guardando...' : 'Agregar al Menú'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Tus Platos ({products.length})</h2>

                {products.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                        No tienes productos aún. Completa el formulario de arriba.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => {
                            const groupName = categories.find(c => c.id === product.categoryId)?.name || 'Sin categoría';

                            return (
                                <div key={product.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col relative group">

                                    {/* Card Image */}
                                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden flex items-center justify-center">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
                                        ) : (
                                            <ImageIcon className="w-10 h-10 text-gray-300" />
                                        )}

                                        {!product.isAvailable && (
                                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-[1px]">
                                                <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">Agotado</span>
                                            </div>
                                        )}

                                        {/* Badge flotante de Categoría */}
                                        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md font-medium">
                                            {groupName}
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className={`font-bold text-gray-900 line-clamp-1 pr-2 ${!product.isAvailable && 'text-gray-400'}`}>
                                                {product.name}
                                            </h3>
                                            <span className={`font-bold ${product.isAvailable ? 'text-red-600' : 'text-gray-400'}`}>
                                                ${product.price}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                                            {product.description || <span className="italic text-gray-400">Sin descripción</span>}
                                        </p>

                                        {/* Controls */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={product.isAvailable}
                                                    onChange={() => toggleAvailability(product.id, product.isAvailable)}
                                                />
                                                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                                                <span className={`ms-2 text-xs font-medium ${product.isAvailable ? 'text-gray-700' : 'text-gray-400'}`}>
                                                    {product.isAvailable ? 'Disponible' : 'Agotado'}
                                                </span>
                                            </label>

                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Eliminar producto"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

        </div>
    )
}

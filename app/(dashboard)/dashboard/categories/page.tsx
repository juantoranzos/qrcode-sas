'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { getBusinessProfile } from '@/app/lib/firebase/services/business'
import { Category, getCategories, addCategory, deleteCategory, reorderCategories } from '@/app/lib/firebase/services/categories'
import { Plus, Trash2, GripVertical, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import {
    DndContext,
    closestCenter,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// ── Sortable category row ─────────────────────────────────────────────────
function SortableCategory({
    cat,
    index,
    onDelete,
}: {
    cat: Category
    index: number
    onDelete: (id: string) => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: cat.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between p-4 bg-gray-50 border rounded-lg transition-colors ${
                isDragging
                    ? 'border-red-400 bg-red-50 shadow-lg opacity-90'
                    : 'border-gray-200 hover:border-gray-300'
            }`}
        >
            <div className="flex items-center">
                <button
                    {...attributes}
                    {...listeners}
                    className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing mr-3 touch-none"
                    title="Arrastrar para reordenar"
                >
                    <GripVertical className="w-5 h-5" />
                </button>
                <span className="font-medium text-gray-900">{cat.name}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 bg-white px-2 py-1 border border-gray-200 rounded-md">
                    Orden: {index + 1}
                </span>
                <button
                    onClick={() => onDelete(cat.id!)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors ml-2"
                    title="Eliminar categoría"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function CategoriesPage() {
    const { user } = useAuth()
    const [businessId, setBusinessId] = useState<string | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [newCategoryName, setNewCategoryName] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 200, tolerance: 5 },
        })
    )

    useEffect(() => {
        async function loadBusinessId() {
            if (!user) return
            try {
                const profile = await getBusinessProfile(user.uid)
                if (profile?.id) setBusinessId(profile.id)
            } catch (error) {
                console.error("Error obteniendo negocio:", error)
            }
        }
        loadBusinessId()
    }, [user])

    useEffect(() => {
        async function fetchCategories() {
            if (!businessId) { setLoading(false); return }
            try {
                const data = await getCategories(businessId)
                setCategories(data)
            } catch (error) {
                console.error("Error cargando categorías:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCategories()
    }, [businessId])

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCategoryName.trim() || !businessId) return

        setSaving(true)
        try {
            const newCat = await addCategory(businessId, newCategoryName.trim(), categories.length)
            setCategories(prev => [...prev, newCat])
            setNewCategoryName('')
            toast.success(`Categoría "${newCat.name}" creada`)
        } catch (error) {
            console.error("Error agregando:", error)
            toast.error("No se pudo crear la categoría")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        const cat = categories.find(c => c.id === id)
        const prev = [...categories]
        setCategories(categories.filter(c => c.id !== id))

        try {
            await deleteCategory(id)
            toast.success(`Categoría "${cat?.name}" eliminada`)
        } catch (error) {
            console.error("Error borrando:", error)
            setCategories(prev)
            toast.error("No se pudo eliminar la categoría")
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = categories.findIndex(c => c.id === active.id)
        const newIndex = categories.findIndex(c => c.id === over.id)
        const reordered = arrayMove(categories, oldIndex, newIndex)

        setCategories(reordered)

        try {
            await reorderCategories(reordered.map((c, i) => ({ id: c.id, order: i })))
        } catch (error) {
            console.error("Error reordenando:", error)
            toast.error("No se pudo guardar el nuevo orden")
            setCategories(categories)
        }
    }

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div>
    }

    if (!businessId) {
        return (
            <div className="text-center p-12 bg-yellow-50 rounded-xl border border-yellow-200">
                <h3 className="text-lg font-medium text-yellow-800">Aún no has configurado tu local</h3>
                <p className="mt-2 text-sm text-yellow-700">Por favor, ve a la sección "Mi Local" primero para poder crear categorías.</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl space-y-6 md:space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Categorías</h1>
                <p className="text-gray-500 mt-1 md:mt-2 text-sm md:text-base">
                    Agrupa tus productos (ej: Entradas, Bebidas, Postres). Arrastrá para cambiar el orden.
                </p>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">

                <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 md:mb-8">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nombre de la nueva categoría..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        maxLength={40}
                    />
                    <button
                        type="submit"
                        disabled={saving || !newCategoryName.trim()}
                        className="flex items-center justify-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                        Agregar
                    </button>
                </form>

                <div className="space-y-3">
                    {categories.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                            No tienes categorías aún. Escribe una arriba para empezar.
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={categories.map(c => c.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {categories.map((cat, index) => (
                                    <SortableCategory
                                        key={cat.id}
                                        cat={cat}
                                        index={index}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </div>
        </div>
    )
}

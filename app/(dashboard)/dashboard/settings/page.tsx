'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/app/contexts/AuthContext'
import { getBusinessProfile, saveBusinessProfile, isSlugAvailable, BusinessProfile } from '@/app/lib/firebase/services/business'
import { Store, Loader2, CheckCircle2 } from 'lucide-react'

// Esquema de validación usando Zod
const formSchema = z.object({
    businessName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    slug: z.string()
        .min(3, 'La URL debe tener al menos 3 caracteres')
        .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones. Sin espacios.'),
    themeColor: z.string().optional(),
    schedule: z.object({
        monday: z.object({ isOpen: z.boolean(), openTime: z.string(), closeTime: z.string() }),
        tuesday: z.object({ isOpen: z.boolean(), openTime: z.string(), closeTime: z.string() }),
        wednesday: z.object({ isOpen: z.boolean(), openTime: z.string(), closeTime: z.string() }),
        thursday: z.object({ isOpen: z.boolean(), openTime: z.string(), closeTime: z.string() }),
        friday: z.object({ isOpen: z.boolean(), openTime: z.string(), closeTime: z.string() }),
        saturday: z.object({ isOpen: z.boolean(), openTime: z.string(), closeTime: z.string() }),
        sunday: z.object({ isOpen: z.boolean(), openTime: z.string(), closeTime: z.string() }),
    }).optional(),
})

type FormData = z.infer<typeof formSchema>

export default function SettingsPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [existingProfile, setExistingProfile] = useState<BusinessProfile | null>(null)
    const [successMessage, setSuccessMessage] = useState('')
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [uploadingLogo, setUploadingLogo] = useState(false)

    const defaultSchedule = {
        monday: { isOpen: true, openTime: '09:00', closeTime: '20:00' },
        tuesday: { isOpen: true, openTime: '09:00', closeTime: '20:00' },
        wednesday: { isOpen: true, openTime: '09:00', closeTime: '20:00' },
        thursday: { isOpen: true, openTime: '09:00', closeTime: '20:00' },
        friday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
        saturday: { isOpen: true, openTime: '10:00', closeTime: '23:30' },
        sunday: { isOpen: false, openTime: '10:00', closeTime: '15:00' },
    }

    const { register, handleSubmit, formState: { errors, isDirty }, setValue, setError, watch } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            schedule: defaultSchedule
        }
    })

    // Cargar perfil existente al entrar
    useEffect(() => {
        async function loadProfile() {
            if (!user) return
            try {
                const profile = await getBusinessProfile(user.uid)
                if (profile) {
                    setExistingProfile(profile)
                    setValue('businessName', profile.businessName)
                    setValue('slug', profile.slug)
                    if (profile.themeColor) setValue('themeColor', profile.themeColor)
                    if (profile.logoUrl) setLogoPreview(profile.logoUrl)
                    if (profile.schedule) setValue('schedule', profile.schedule)
                }
            } catch (error) {
                console.error("Error cargando perfil", error)
            } finally {
                setLoading(false)
            }
        }
        loadProfile()
    }, [user, setValue])

    const onSubmit = async (data: FormData) => {
        if (!user) return
        setSaving(true)
        setSuccessMessage('')

        try {
            // 1. Verificar que la URL no esté ocupada por otro negocio
            const available = await isSlugAvailable(data.slug, existingProfile?.id)
            if (!available) {
                setError('slug', { type: 'manual', message: 'Esta URL ya está siendo usada por otro local' })
                setSaving(false)
                return
            }

            let finalLogoUrl = existingProfile?.logoUrl

            // Si hay una nueva imagen seleccionada, la subimos a Cloudinary
            if (logoFile) {
                setUploadingLogo(true)
                try {
                    // Import dinámico para evitar error si no está arriba
                    const { uploadImageToCloudinary } = await import('@/app/lib/cloudinary/upload')
                    finalLogoUrl = await uploadImageToCloudinary(logoFile)
                } catch (error) {
                    console.error("Error subiendo logo:", error)
                    setError('root', { type: 'manual', message: 'Error al subir la imagen del logo' })
                    setSaving(false)
                    setUploadingLogo(false)
                    return
                }
                setUploadingLogo(false)
            }

            // 2. Guardar en Firestore
            const profileDataToSave = {
                ...data,
                logoUrl: finalLogoUrl,
                schedule: data.schedule || defaultSchedule
            }
            await saveBusinessProfile(user.uid, profileDataToSave as any, existingProfile?.id)

            setSuccessMessage('¡Configuración guardada correctamente!')

            // Actualizamos el estado local por si sigue editando
            if (!existingProfile) {
                setExistingProfile({ ...profileDataToSave, userId: user.uid, id: user.uid, createdAt: Date.now() })
            } else {
                setExistingProfile({ ...existingProfile, ...profileDataToSave })
            }
            setLogoFile(null) // Reseteamos el archivo local modificado
        } catch (error) {
            console.error("Error guardando", error)
        } finally {
            setSaving(false)
            setTimeout(() => setSuccessMessage(''), 3000)
        }
    }

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div>
    }

    return (
        <div className="max-w-2xl space-y-6 md:space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Mi Local</h1>
                <p className="text-gray-500 mt-1 md:mt-2 text-sm md:text-base">Configura los datos básicos de tu negocio y tu URL única.</p>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {successMessage && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center border border-green-100">
                            <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                            {successMessage}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="businessName">
                            Nombre del Local
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Store className="h-5 w-5 text-red-600" />
                            </div>
                            <input
                                id="businessName"
                                {...register("businessName")}
                                placeholder="Ej: Pizzería Don Pepe"
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                            />
                        </div>
                        {errors.businessName && <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="slug">
                            URL de tu Menú Digital
                        </label>
                        <div className="flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-red-600 sm:text-sm">
                                /menu/
                            </span>
                            <input
                                id="slug"
                                {...register("slug")}
                                placeholder="pizzeria-don-pepe"
                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Esta será la dirección web que se abrirá cuando escaneen tu QR. Usa solo minúsculas y guiones.
                        </p>
                        {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Personalización (Visual)</h3>

                        <div className="space-y-6">
                            {/* Logo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Logo del Local
                                </label>
                                <div className="flex items-center gap-6">
                                    <div className="h-24 w-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <Store className="h-8 w-8 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                            Cambiar Logo
                                        </label>
                                        <input
                                            id="logo-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    setLogoFile(file)
                                                    setLogoPreview(URL.createObjectURL(file))
                                                }
                                            }}
                                        />
                                        <p className="mt-2 text-xs text-gray-500">PNG, JPG, WEBP hasta 5MB. Recomendado: 400x400px.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Color Picker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="themeColor">
                                    Color Principal de la Marca
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        id="themeColor"
                                        {...register("themeColor")}
                                        className="h-10 w-14 p-1 rounded border border-gray-300 cursor-pointer"
                                        defaultValue="#ef4444"
                                    />
                                    <span className="text-sm text-gray-500">Este color se usará en botones y detalles de tu menú digital.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Horarios de Atención</h3>
                        <p className="text-sm text-gray-500 mb-4">Si está marcado como cerrado, tu menú virtual no permitirá hacer pedidos y mostrará un cartel de cerrado.</p>

                        <div className="space-y-3 bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-200">
                            {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day, idx) => {
                                const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
                                const dayNamesFull = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
                                const isOpen = watch(`schedule.${day}.isOpen`);
                                return (
                                    <div key={day} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3 sm:w-1/3">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                                {...register(`schedule.${day}.isOpen`)}
                                                id={`day-${day}`}
                                            />
                                            <label htmlFor={`day-${day}`} className={`text-sm font-medium cursor-pointer ${isOpen ? 'text-gray-900' : 'text-gray-400'}`}>
                                                <span className="sm:hidden">{dayNames[idx]}</span>
                                                <span className="hidden sm:inline">{dayNamesFull[idx]}</span>
                                            </label>
                                        </div>

                                        <div className={`flex items-center gap-2 pl-7 sm:pl-0 sm:flex-1 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                            <input
                                                type="time"
                                                className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500 w-[110px]"
                                                {...register(`schedule.${day}.openTime`)}
                                            />
                                            <span className="text-gray-500 text-sm">a</span>
                                            <input
                                                type="time"
                                                className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500 w-[110px]"
                                                {...register(`schedule.${day}.closeTime`)}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={saving || uploadingLogo || (!isDirty && logoFile === null && existingProfile !== null)}
                            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {(saving || uploadingLogo) ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                            {uploadingLogo ? 'Subiendo imagen...' : saving ? 'Guardando...' : existingProfile ? 'Actualizar Información' : 'Guardar Información'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

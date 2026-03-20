'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { getBusinessProfile } from '@/app/lib/firebase/services/business'
import { QRCodeSVG } from 'qrcode.react'
import { Loader2, Download, ExternalLink, Copy, Check } from 'lucide-react'
import Link from 'next/link'

export default function QRCodePage() {
    const { user } = useAuth()
    const [businessSlug, setBusinessSlug] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    const qrRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        async function loadData() {
            if (!user) return
            try {
                const profile = await getBusinessProfile(user.uid)
                if (profile?.slug) {
                    setBusinessSlug(profile.slug)
                }
            } catch (error) {
                console.error("Error loading profile:", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [user])

    const menuUrl = businessSlug
        ? `${window.location.origin}/menu/${businessSlug}`
        : ''

    const copyToClipboard = () => {
        if (!menuUrl) return
        navigator.clipboard.writeText(menuUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadQR = () => {
        if (!qrRef.current) return

        // Obtener el SVG como string
        const svgData = new XMLSerializer().serializeToString(qrRef.current)
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(blob)

        // Crear un elemento <a> temporal para forzar la descarga
        const link = document.createElement('a')
        link.href = url
        link.download = `qr-${businessSlug || 'menu'}.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div>
    }

    if (!businessSlug) {
        return (
            <div className="text-center p-12 bg-yellow-50 rounded-xl border border-yellow-200">
                <h3 className="text-lg font-medium text-yellow-800">Aún no has configurado tu local</h3>
                <p className="mt-2 text-sm text-yellow-700">Para generar tu Código QR, primero ve a la sección "Mi Local" y define la URL de tu menú.</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl space-y-6 md:space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Tu Código QR</h1>
                <p className="text-gray-500 mt-1 md:mt-2 text-sm md:text-base">Imprime este código y colócalo en tus mesas para que los clientes vean el menú.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

                {/* Panel del QR */}
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className="bg-white border-8 border-white shadow-sm rounded-xl p-4 mb-8">
                        <QRCodeSVG
                            value={menuUrl}
                            size={250}
                            level="H"
                            includeMargin={true}
                            className="w-full h-auto max-w-[250px]"
                            ref={qrRef}
                        />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">Escanea para ordenar</h3>
                    <p className="text-sm text-gray-500 mb-6">Apunta la cámara de tu celular a este código.</p>

                    <button
                        onClick={downloadQR}
                        className="flex items-center justify-center w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Descargar Código QR (SVG)
                    </button>
                    <p className="text-xs text-gray-400 mt-3">Formato vectorial ideal para enviar a imprentas sin perder calidad.</p>
                </div>

                {/* Panel del Enlace */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Enlace directo a tu menú</h3>
                        <p className="text-sm text-gray-600 mb-4">Además del QR, puedes compartir este link por WhatsApp o ponerlo en la biografía de tu Instagram.</p>

                        <div className="flex rounded-md shadow-sm">
                            <input
                                type="text"
                                readOnly
                                value={menuUrl}
                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 bg-gray-50 text-gray-600 text-sm focus:outline-none"
                            />
                            <button
                                onClick={copyToClipboard}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                title="Copiar enlace"
                            >
                                {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                        <h3 className="text-sm font-semibold text-red-900 flex items-center mb-2">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Vista Previa
                        </h3>
                        <p className="text-sm text-red-800 mb-4">¿Quieres ver cómo ven tus clientes el menú ahora mismo?</p>
                        <Link
                            href={`/menu/${businessSlug}`}
                            target="_blank"
                            className="inline-flex items-center text-sm font-medium text-red-700 hover:text-red-800 hover:underline"
                        >
                            Abrir menú público en nueva pestaña &rarr;
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    )
}

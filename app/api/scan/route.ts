import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/app/lib/firebase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SCAN_COOKIE_TTL_SECONDS = 60 * 60

function toDateString(date: Date = new Date()): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function getScanCookieName(businessId: string) {
    return `scan_${businessId.replace(/[^a-zA-Z0-9_-]/g, '')}`
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => null) as { businessId?: unknown } | null
        const businessId = typeof body?.businessId === 'string' ? body.businessId.trim() : ''

        if (!businessId) {
            return NextResponse.json({ error: 'businessId is required' }, { status: 400 })
        }

        const cookieName = getScanCookieName(businessId)
        if (request.cookies.get(cookieName)?.value === '1') {
            return NextResponse.json({ ok: true, counted: false })
        }

        const db = getAdminDb()
        const today = toDateString()
        const businessRef = db.collection('businesses').doc(businessId)
        const dayRef = db.collection('scansByDay').doc(`${businessId}_${today}`)

        const counted = await db.runTransaction(async (transaction) => {
            const businessSnap = await transaction.get(businessRef)

            if (!businessSnap.exists) return false

            transaction.set(businessRef, { totalScans: FieldValue.increment(1) }, { merge: true })
            transaction.set(dayRef, {
                businessId,
                date: today,
                count: FieldValue.increment(1),
            }, { merge: true })

            return true
        })

        const response = NextResponse.json({ ok: true, counted })

        if (counted) {
            response.cookies.set(cookieName, '1', {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                maxAge: SCAN_COOKIE_TTL_SECONDS,
                path: '/',
            })
        }

        return response
    } catch (error) {
        console.error('Error recording scan:', error)
        return NextResponse.json({ error: 'Unable to record scan' }, { status: 500 })
    }
}

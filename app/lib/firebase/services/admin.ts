import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/app/lib/firebase/config'
import type { BusinessProfile } from './business'
import type { Invitation } from './invitations'

export async function getAllBusinesses(): Promise<BusinessProfile[]> {
    const q = query(collection(db, 'businesses'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessProfile))
}

export async function getAdminMetrics() {
    const [businesses, invitations] = await Promise.all([
        getDocs(collection(db, 'businesses')),
        getDocs(collection(db, 'invitations')),
    ])

    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

    const totalBusinesses = businesses.size
    const newThisMonth = businesses.docs.filter(d => d.data().createdAt > thirtyDaysAgo).length

    const invDocs = invitations.docs.map(d => d.data())
    const totalInvitations = invDocs.length
    const usedInvitations = invDocs.filter(d => d.used).length
    const availableInvitations = totalInvitations - usedInvitations

    return { totalBusinesses, newThisMonth, totalInvitations, usedInvitations, availableInvitations }
}

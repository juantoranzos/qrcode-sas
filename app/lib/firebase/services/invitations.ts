import { doc, getDoc, updateDoc, setDoc, collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/app/lib/firebase/config'

const COLLECTION = 'invitations'

export interface Invitation {
    code: string
    note: string
    used: boolean
    usedBy?: string
    createdAt: number
    usedAt?: number
}

export async function validateInviteCode(code: string): Promise<boolean> {
    const ref = doc(db, COLLECTION, code.trim().toUpperCase())
    const snap = await getDoc(ref)
    if (!snap.exists()) return false
    return snap.data().used === false
}

export async function consumeInviteCode(code: string, userId: string, email: string): Promise<void> {
    const ref = doc(db, COLLECTION, code.trim().toUpperCase())
    await updateDoc(ref, {
        used: true,
        usedBy: email,
        userId,
        usedAt: Date.now(),
    })
}

export async function createInviteCode(code: string, note: string): Promise<void> {
    const key = code.trim().toUpperCase()
    const ref = doc(db, COLLECTION, key)
    const snap = await getDoc(ref)
    if (snap.exists()) throw new Error('Ese código ya existe.')
    await setDoc(ref, {
        note,
        used: false,
        createdAt: Date.now(),
    })
}

export async function listInvitations(): Promise<Invitation[]> {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ code: d.id, ...d.data() } as Invitation))
}

export async function deleteInviteCode(code: string): Promise<void> {
    const { deleteDoc } = await import('firebase/firestore')
    const ref = doc(db, COLLECTION, code)
    await deleteDoc(ref)
}

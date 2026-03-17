import { db } from '../config';
import { collection, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';

export interface DaySchedule {
    isOpen: boolean;
    openTime: string; // ej: "19:00"
    closeTime: string; // ej: "23:30"
}

export type ScheduleConfig = Record<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday', DaySchedule>;

export interface BusinessProfile {
    id?: string;
    userId: string;
    businessName: string;
    slug: string;
    logoUrl?: string;
    themeColor?: string;
    schedule?: ScheduleConfig;
    createdAt: number;
}

// Obtener el perfil del negocio de un usuario
export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
    const q = query(collection(db, 'businesses'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as BusinessProfile;
}

// Verificar si un slug ya existe (para que no haya dos locales con la misma URL)
export async function isSlugAvailable(slug: string, currentBusinessId?: string): Promise<boolean> {
    const q = query(collection(db, 'businesses'), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return true;

    // Si existe pero es del mismo negocio que estamos editando, está disponible
    if (currentBusinessId && querySnapshot.docs[0].id === currentBusinessId) return true;

    return false;
}

// Crear o actualizar un negocio
export async function saveBusinessProfile(userId: string, data: Omit<BusinessProfile, 'createdAt' | 'userId'>, businessId?: string) {
    const collectionRef = collection(db, 'businesses');

    // Si ya tiene un negocio, actualizamos el documento existente
    if (businessId) {
        const docRef = doc(db, 'businesses', businessId);
        await setDoc(docRef, { ...data, userId }, { merge: true });
        return businessId;
    }

    // Si no tiene, creamos uno nuevo usando el UID del usuario como ID del documento (1 user = 1 negocio por ahora)
    const newDocRef = doc(db, 'businesses', userId);
    await setDoc(newDocRef, {
        ...data,
        userId,
        createdAt: Date.now()
    });

    return userId;
}

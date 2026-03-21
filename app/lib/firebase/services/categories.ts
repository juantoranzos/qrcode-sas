import { db } from '../config';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc, orderBy, serverTimestamp, writeBatch } from 'firebase/firestore';

export interface Category {
    id: string;
    businessId: string;
    name: string;
    order: number;
    createdAt?: any;
}

// Obtener todas las categorías de un negocio ordenadas por el campo 'order'
export async function getCategories(businessId: string): Promise<Category[]> {
    const q = query(
        collection(db, 'categories'),
        where('businessId', '==', businessId),
        orderBy('order', 'asc') // Requiere crear un índice en Firestore más adelante
    );

    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    } catch (error: any) {
        // Si falla por falta de índice (muy común la primera vez en Firestore con orderBy + where)
        // Hacemos un fallback sin orderBy y lo ordenamos en el cliente
        if (error.code === 'failed-precondition') {
            console.warn("Falta índice en Firestore. Ordenando localmente...");
            const fallbackQuery = query(collection(db, 'categories'), where('businessId', '==', businessId));
            const fallbackSnapshot = await getDocs(fallbackQuery);
            const data = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
            return data.sort((a, b) => a.order - b.order);
        }
        throw error;
    }
}

// Crear una nueva categoría
export async function addCategory(businessId: string, name: string, currentTotal: number) {
    const newDocRef = doc(collection(db, 'categories'));

    const categoryData = {
        businessId,
        name,
        order: currentTotal, // Se agrega al final de la lista por defecto
        createdAt: serverTimestamp()
    };

    await setDoc(newDocRef, categoryData);
    return { id: newDocRef.id, ...categoryData };
}

// Guardar el nuevo orden de categorías en batch
export async function reorderCategories(categories: { id: string; order: number }[]) {
    const batch = writeBatch(db);
    categories.forEach(({ id, order }) => {
        batch.update(doc(db, 'categories', id), { order });
    });
    await batch.commit();
}

// Eliminar una categoría
export async function deleteCategory(categoryId: string) {
    await deleteDoc(doc(db, 'categories', categoryId));
    // IMPORTANTE: En un entorno real, aquí también habría que buscar y borrar 
    // (o desvincular) todos los productos que pertenecían a esta categoría.
}

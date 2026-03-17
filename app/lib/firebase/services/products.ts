import { db } from '../config';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export interface Product {
    id: string;
    businessId: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    isAvailable: boolean;
    createdAt?: any;
}

// Crear un nuevo producto
export async function addProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newDocRef = doc(collection(db, 'products'));

    const productData = {
        ...data,
        createdAt: serverTimestamp()
    };

    await setDoc(newDocRef, productData);
    return { id: newDocRef.id, ...data } as Product;
}

// Obtener todos los productos de un negocio (esto sirve tanto para el Dashboard como para el Menú Público)
export async function getProducts(businessId: string): Promise<Product[]> {
    const q = query(collection(db, 'products'), where('businessId', '==', businessId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

// Eliminar un producto
export async function deleteProduct(productId: string) {
    await deleteDoc(doc(db, 'products', productId));
}

// Actualizar un producto (como por ejemplo prender/apagar su disponibilidad)
export async function updateProduct(productId: string, data: Partial<Omit<Product, 'id' | 'businessId' | 'createdAt'>>) {
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, data);
}

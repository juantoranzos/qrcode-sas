import 'server-only'

import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

type ServiceAccountConfig = {
    projectId: string
    clientEmail: string
    privateKey: string
}

function getServiceAccountConfig(): ServiceAccountConfig | null {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (!projectId || !clientEmail || !privateKey) return null

    return { projectId, clientEmail, privateKey }
}

function getAdminApp() {
    if (getApps().length > 0) return getApps()[0]

    const serviceAccount = getServiceAccountConfig()

    if (serviceAccount) {
        return initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.projectId,
        })
    }

    return initializeApp({
        credential: applicationDefault(),
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })
}

export function getAdminDb() {
    return getFirestore(getAdminApp())
}

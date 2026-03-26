import { db } from '../config';
import { doc, getDoc } from 'firebase/firestore';

export interface DailyScanCount {
    date: string; // YYYY-MM-DD
    count: number;
}

export interface ScanStats {
    total: number;
    today: number;
    thisWeek: number;
    last7Days: DailyScanCount[];
}

function toDateString(date: Date = new Date()): string {
    // Use local date to match the user's timezone
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export async function recordScan(businessId: string): Promise<void> {
    const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        keepalive: true,
        body: JSON.stringify({ businessId }),
    });

    if (!response.ok) {
        throw new Error('No se pudo registrar el escaneo');
    }
}

/**
 * Returns scan statistics for a business.
 * Fetches each day doc by its known ID to avoid needing a composite Firestore index.
 */
export async function getScanStats(businessId: string): Promise<ScanStats> {
    const today = new Date();
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(toDateString(d));
    }

    // Fetch business doc (for totalScans) + each day doc in parallel — no index needed
    const [businessSnap, ...daySnaps] = await Promise.all([
        getDoc(doc(db, 'businesses', businessId)),
        ...dates.map(date => getDoc(doc(db, 'scansByDay', `${businessId}_${date}`))),
    ]);

    const total = (businessSnap.data()?.totalScans as number) || 0;

    const last7Days: DailyScanCount[] = dates.map((date, i) => ({
        date,
        count: (daySnaps[i].data()?.count as number) || 0,
    }));

    const todayStr = toDateString();
    const todayCount = last7Days.find(d => d.date === todayStr)?.count || 0;
    const thisWeek = last7Days.reduce((sum, d) => sum + d.count, 0);

    return { total, today: todayCount, thisWeek, last7Days };
}

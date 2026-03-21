import { db } from '../config';
import { doc, collection, getDoc, query, where, getDocs, setDoc, increment } from 'firebase/firestore';

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

/**
 * Records a QR scan for a business.
 * - Increments `totalScans` on the business document.
 * - Increments the daily counter in the `scansByDay` collection.
 *
 * NOTE: Firestore rules must allow unauthenticated writes to `scansByDay`
 * and updates to the `totalScans` field on `businesses`.
 */
export async function recordScan(businessId: string): Promise<void> {
    const today = toDateString();
    const dayDocId = `${businessId}_${today}`;

    const businessRef = doc(db, 'businesses', businessId);
    const dayRef = doc(db, 'scansByDay', dayDocId);

    await Promise.all([
        setDoc(businessRef, { totalScans: increment(1) }, { merge: true }),
        setDoc(dayRef, { businessId, date: today, count: increment(1) }, { merge: true }),
    ]);
}

/**
 * Returns scan statistics for a business:
 * total all-time, today, this week (last 7 days), and daily breakdown.
 */
export async function getScanStats(businessId: string): Promise<ScanStats> {
    const businessDoc = await getDoc(doc(db, 'businesses', businessId));
    const total = (businessDoc.data()?.totalScans as number) || 0;

    // Build the last-7-days date range
    const today = new Date();
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(toDateString(d));
    }
    const sevenDaysAgo = dates[0];

    const q = query(
        collection(db, 'scansByDay'),
        where('businessId', '==', businessId),
        where('date', '>=', sevenDaysAgo),
    );
    const snapshot = await getDocs(q);

    const dayMap = new Map<string, number>();
    snapshot.forEach(docSnap => {
        const data = docSnap.data();
        dayMap.set(data.date as string, data.count as number);
    });

    const last7Days: DailyScanCount[] = dates.map(date => ({
        date,
        count: dayMap.get(date) || 0,
    }));

    const todayStr = toDateString();
    const todayCount = dayMap.get(todayStr) || 0;
    const thisWeek = last7Days.reduce((sum, d) => sum + d.count, 0);

    return { total, today: todayCount, thisWeek, last7Days };
}

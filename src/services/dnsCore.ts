import { initializeApp, getApps } from 'firebase/app';
import { collection, getDocs, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAgxv6Z45-AfrusbFnCSyvYChRUBu6-vXc',
  authDomain: 'dns-core.firebaseapp.com',
  projectId: 'dns-core',
  storageBucket: 'dns-core.firebasestorage.app',
  messagingSenderId: '387653285986',
  appId: '1:387653285986:web:27ad6f2e9a41ea1aebb93b',
  measurementId: 'G-2G56PRYNME',
};

export const app = getApps()[0] ?? initializeApp(firebaseConfig);
export const db = getFirestore(app);
const MASTER_COLLECTIONS = ['reportingAreas','destinations','organizations','organizationRelationships','seasons'] as const;

export type DNSCoreStatus =
  | { state:'loading'; text:string }
  | { state:'ready'; text:string; counts:Record<string,number> }
  | { state:'error'; text:string };

export async function loadDNSCoreMaster(): Promise<DNSCoreStatus> {
  try {
    const entries = await Promise.all(MASTER_COLLECTIONS.map(async name => {
      const snap = await getDocs(collection(db,name));
      return [name,snap.size] as const;
    }));
    const counts=Object.fromEntries(entries);
    return {
      state:'ready',
      text:`DNS_Core · connected · ${counts.reportingAreas}/${counts.organizations}`,
      counts,
    };
  } catch {
    return { state:'error', text:'DNS_Core · offline · local datasets' };
  }
}

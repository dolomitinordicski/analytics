import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { app, db } from './dnsCore';

export const auth = getAuth(app);

export type AnalyticsAccessContext = {
  isAdmin: boolean;
  canReadTicketSales: boolean;
  canReadKp: boolean;
};

function active(item: { active?: boolean; validFrom?: string; validTo?: string }) {
  if (item.active !== true) return false;
  const today = new Date().toISOString().slice(0,10);
  if (item.validFrom && item.validFrom > today) return false;
  if (item.validTo && item.validTo < today) return false;
  return true;
}

export function subscribeAnalyticsAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function signInAnalytics(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signOutAnalytics() {
  return firebaseSignOut(auth);
}

export async function loadAnalyticsAccess(uid: string): Promise<AnalyticsAccessContext> {
  const [profileSnap, grantsSnap] = await Promise.all([
    getDoc(doc(db,'users',uid)),
    getDocs(query(collection(db,'accessGrants'), where('userId','==',uid))),
  ]);
  const profile = profileSnap.exists() ? profileSnap.data() : null;
  const isAdmin = profile?.active === true
    && Array.isArray(profile.globalRoles)
    && profile.globalRoles.includes('dns-admin');

  const grants = grantsSnap.docs.map(d=>d.data()).filter(active);
  const has = (permission:string) => grants.some((g:any) =>
    Array.isArray(g.permissions)
    && g.permissions.includes(permission)
    && g.scopeType === 'network'
    && g.scopeId === 'dolomiti-nordicski'
  );

  return {
    isAdmin,
    canReadTicketSales: isAdmin || has('ticketSales.read'),
    canReadKp: isAdmin || has('kp.read'),
  };
}

import { addDoc, collection, doc, getDoc, getDocs, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';

export type DisputeStatus = 'open' | 'in_review' | 'resolved' | 'dismissed';

export interface Dispute {
  id: string;
  contractId: string;
  raisedBy: 'client' | 'freelancer';
  title: string;
  description: string;
  status: DisputeStatus;
  adminNotes?: string;
  attachmentUrl?: string; // optional file/screenshot URL
  createdAt: any;
  updatedAt: any;
}

/** Create a new dispute */
export const createDispute = async (
  contractId: string,
  raisedBy: 'client' | 'freelancer',
  title: string,
  description: string,
  attachmentUrl?: string
): Promise<string> => {
  const docRef = await addDoc(collection(firebaseDb, 'disputes'), {
    contractId,
    raisedBy,
    title,
    description,
    status: 'open',
    attachmentUrl: attachmentUrl || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/** List disputes for a specific user (client or freelancer) */
export const listUserDisputes = async (
  userId: string,
  role: 'client' | 'freelancer'
): Promise<Dispute[]> => {
  // Find contracts where the user is the client or freelancer
  const contractsSnap = await getDocs(
    query(
      collection(firebaseDb, 'contracts'),
      role === 'client' ? where('clientId', '==', userId) : where('freelancerId', '==', userId)
    )
  );
  const contractIds = contractsSnap.docs.map((d) => d.id);
  if (contractIds.length === 0) return [];
  const disputesSnap = await getDocs(
    query(
      collection(firebaseDb, 'disputes'),
      where('contractId', 'in', contractIds)
    )
  );
  return disputesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Dispute));
};

/** Get a single dispute */
export const getDispute = async (disputeId: string): Promise<Dispute | null> => {
  const snap = await getDoc(doc(firebaseDb, 'disputes', disputeId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Dispute;
};

/** Update dispute status or admin notes */
export const updateDispute = async (
  disputeId: string,
  updates: Partial<Pick<Dispute, 'status' | 'adminNotes'>>
): Promise<void> => {
  await updateDoc(doc(firebaseDb, 'disputes', disputeId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

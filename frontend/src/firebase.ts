import { Appliance, Complaint, HomeProperty, MarketplaceListing, UserProfile } from './types';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  query, 
  onSnapshot, 
  writeBatch,
  where
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBXjjyMOLHN3s2xolVUT4F-R4fAsJp0zHk",
  authDomain: "applora-4506e.firebaseapp.com",
  projectId: "applora-4506e",
  storageBucket: "applora-4506e.firebasestorage.app",
  messagingSenderId: "52080466826",
  appId: "1:52080466826:web:d19aba4f16a11c3edd8673",
  measurementId: "G-TQJ9SFX89V"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function getUserProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
  } catch (err) {
    console.error('Error fetching user profile from Firestore:', err);
  }
  return null;
}

export async function deleteUserAccountAndData(userId: string): Promise<void> {
  console.log(`Deletion of user ${userId} requested. Should be handled securely on backend.`);
}

export async function saveUserToFirestore(user: UserProfile): Promise<void> {
  if (user.id === 'usr-guest') return;
  try {
    await setDoc(doc(db, 'users', user.id), user, { merge: true });
  } catch (err) {
    console.error('Error saving user profile to Firestore:', err);
  }
}

export async function saveHomesToFirestore(homes: HomeProperty[], userId?: string): Promise<void> {
  if (userId === 'usr-guest') return;
  try {
    const batch = writeBatch(db);
    homes.forEach(home => {
      if (home.userId === 'usr-guest') return;
      const homeData = userId ? { ...home, userId } : home;
      const ref = doc(db, 'homes', home.id);
      batch.set(ref, homeData, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Error saving homes to Firestore:', err);
  }
}

export async function saveApplianceToFirestore(appliance: Appliance, userId?: string): Promise<void> {
  if (userId === 'usr-guest') return;
  try {
    await setDoc(doc(db, 'appliances', appliance.id), appliance, { merge: true });
  } catch (err) {
    console.error('Error saving appliance to Firestore:', err);
  }
}

export async function saveAllAppliancesToFirestore(appliances: Appliance[], userId?: string): Promise<void> {
  if (userId === 'usr-guest') return;
  try {
    const batch = writeBatch(db);
    appliances.forEach(appliance => {
      const ref = doc(db, 'appliances', appliance.id);
      batch.set(ref, appliance, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Error saving appliances batch to Firestore:', err);
  }
}

export async function deleteApplianceFromFirestore(applianceId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'appliances', applianceId));
  } catch (err) {
    console.error('Error deleting appliance from Firestore:', err);
  }
}

export async function saveComplaintToFirestore(complaint: Complaint, userId?: string): Promise<void> {
  if (userId === 'usr-guest') return;
  try {
    await setDoc(doc(db, 'complaints', complaint.id), complaint, { merge: true });
  } catch (err) {
    console.error('Error saving complaint to Firestore:', err);
  }
}

export async function saveMarketplaceListingToFirestore(marketplaceListing: MarketplaceListing): Promise<void> {
  try {
    await setDoc(doc(db, 'marketplace', marketplaceListing.id), marketplaceListing, { merge: true });
  } catch (err) {
    console.error('Error saving marketplace listing to Firestore:', err);
  }
}

export async function deleteMarketplaceListingFromFirestore(listingId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'marketplace', listingId));
  } catch (err) {
    console.error('Error deleting listing from Firestore:', err);
  }
}

export function subscribeToAppliances(callback: (appliances: Appliance[]) => void, userId?: string) {
  const q = query(collection(db, 'appliances'));
  return onSnapshot(q, (snapshot) => {
    const appliances = snapshot.docs.map(doc => doc.data() as Appliance);
    callback(appliances);
  }, (err) => {
    console.error('Appliances subscription error:', err);
  });
}

export function subscribeToComplaints(callback: (complaints: Complaint[]) => void, userId?: string) {
  const q = query(collection(db, 'complaints'));
  return onSnapshot(q, (snapshot) => {
    const complaints = snapshot.docs.map(doc => doc.data() as Complaint);
    callback(complaints);
  }, (err) => {
    console.error('Complaints subscription error:', err);
  });
}

export function subscribeToMarketplace(callback: (listings: MarketplaceListing[]) => void) {
  const q = query(collection(db, 'marketplace'));
  return onSnapshot(q, (snapshot) => {
    const listings = snapshot.docs.map(doc => doc.data() as MarketplaceListing);
    callback(listings);
  }, (err) => {
    console.error('Marketplace subscription error:', err);
  });
}

export function subscribeToHomes(callback: (homes: HomeProperty[]) => void, userId?: string) {
  const q = userId ? query(collection(db, 'homes'), where('userId', '==', userId)) : query(collection(db, 'homes'));
  return onSnapshot(q, (snapshot) => {
    const homes = snapshot.docs.map(doc => doc.data() as HomeProperty);
    callback(homes);
  }, (err) => {
    console.error('Homes subscription error:', err);
  });
}

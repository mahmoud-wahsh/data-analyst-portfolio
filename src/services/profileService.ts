import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { ProfileData } from '../types';
import { uploadProfileImage, uploadProjectImage } from './cloudinaryService';

export { uploadProfileImage, uploadProjectImage };

/**
 * Initial profile data based on existing portfolio content
 */
export const INITIAL_PROFILE_DATA: ProfileData = {
  fullName: 'Alex Rivera',
  professionalTitle: 'Data Analyst',
  headline:
    'Aspiring Data Analyst passionate about turning raw, unstructured data into clear, actionable business stories and data-driven decisions.',
  about:
    'I am an entry-level Data Analyst with a rigorous foundation in quantitative reasoning, data modeling, and business intelligence reporting. My focus is on writing efficient SQL queries, building intuitive interactive dashboards in Power BI and Tableau, and automating analytical workflows with Python. I thrive on collaborating with cross-functional teams to uncover anomalies, track core performance indicators, and communicate data findings in plain, impactful language.',
  email: 'alex.rivera.analytics@example.com',
  whatsapp: '+1 (555) 019-2834',
  linkedin: 'https://linkedin.com/in/alex-rivera-data',
  github: 'https://github.com/alexrivera-analyst',
  availabilityText: 'Open to Data Analytics Opportunities',
  profileImageUrl: '',
};

/**
 * Firestore reference for the single portfolio profile document
 */
export const PROFILE_COLLECTION = 'portfolio';
export const PROFILE_DOC_ID = 'profile';

export const getProfileDocRef = () => doc(db, PROFILE_COLLECTION, PROFILE_DOC_ID);

/**
 * Read the current profile document from Firestore.
 * Falls back to INITIAL_PROFILE_DATA if document does not exist yet.
 */
export async function getProfile(): Promise<ProfileData> {
  try {
    const docRef = getProfileDocRef();
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        ...INITIAL_PROFILE_DATA,
        ...(docSnap.data() as Partial<ProfileData>),
      };
    }
    return INITIAL_PROFILE_DATA;
  } catch (error) {
    console.warn('Could not fetch profile from Firestore, using initial data:', error);
    return INITIAL_PROFILE_DATA;
  }
}

/**
 * Update the profile document in Firestore (merge update).
 */
export async function updateProfile(data: Partial<ProfileData>): Promise<void> {
  const docRef = getProfileDocRef();
  await setDoc(
    docRef,
    {
      ...data,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Initialize or seed the profile document if it does not exist.
 */
export async function initializeProfile(): Promise<ProfileData> {
  try {
    const docRef = getProfileDocRef();
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await setDoc(docRef, {
        ...INITIAL_PROFILE_DATA,
        updatedAt: new Date().toISOString(),
      });
      return INITIAL_PROFILE_DATA;
    }

    return {
      ...INITIAL_PROFILE_DATA,
      ...(docSnap.data() as Partial<ProfileData>),
    };
  } catch (error) {
    console.warn('Failed to initialize profile in Firestore:', error);
    return INITIAL_PROFILE_DATA;
  }
}

/**
 * Real-time subscription to the profile document.
 * Returns unsubscribe function.
 */
export function subscribeProfile(
  onUpdate: (profile: ProfileData) => void,
  onError?: (error: Error) => void
): () => void {
  const docRef = getProfileDocRef();

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({
          ...INITIAL_PROFILE_DATA,
          ...(docSnap.data() as Partial<ProfileData>),
        });
      } else {
        onUpdate(INITIAL_PROFILE_DATA);
      }
    },
    (error) => {
      if (onError) onError(error);
      else console.warn('Profile subscription error:', error);
    }
  );
}

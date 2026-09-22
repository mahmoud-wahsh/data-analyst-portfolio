import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { CvData } from '../types';

export const CV_COLLECTION = 'portfolio';
export const CV_DOC_ID = 'resume';

export const getCvDocRef = () => doc(db, CV_COLLECTION, CV_DOC_ID);

/**
 * Fetch the current CV metadata from Firestore.
 * Returns null if no CV has been uploaded yet.
 */
export async function getCv(): Promise<CvData | null> {
  try {
    const docRef = getCvDocRef();
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data?.fileUrl && data?.fileName) {
        return {
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileSize: typeof data.fileSize === 'number' ? data.fileSize : undefined,
          uploadedAt: data.uploadedAt || undefined,
          updatedAt: data.updatedAt || undefined,
        };
      }
    }
    return null;
  } catch (error) {
    console.warn('Could not fetch CV metadata from Firestore:', error);
    return null;
  }
}

/**
 * Subscribe to real-time CV updates in Firestore.
 */
export function subscribeCv(callback: (cv: CvData | null) => void): () => void {
  const docRef = getCvDocRef();
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.fileUrl && data?.fileName) {
          callback({
            fileUrl: data.fileUrl,
            fileName: data.fileName,
            fileSize: typeof data.fileSize === 'number' ? data.fileSize : undefined,
            uploadedAt: data.uploadedAt || undefined,
            updatedAt: data.updatedAt || undefined,
          });
          return;
        }
      }
      callback(null);
    },
    (error) => {
      console.error('Error listening to CV updates:', error);
      callback(null);
    }
  );
}

/**
 * Save or replace the CV metadata in Firestore.
 */
export async function saveCv(cv: CvData): Promise<void> {
  const docRef = getCvDocRef();
  const now = new Date().toISOString();
  await setDoc(docRef, {
    fileUrl: cv.fileUrl,
    fileName: cv.fileName,
    fileSize: cv.fileSize || 0,
    uploadedAt: cv.uploadedAt || now,
    updatedAt: now,
  });
}

/**
 * Delete the CV reference from Firestore.
 */
export async function deleteCv(): Promise<void> {
  const docRef = getCvDocRef();
  await deleteDoc(docRef);
}

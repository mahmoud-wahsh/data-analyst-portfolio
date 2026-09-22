import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { SkillItem } from '../types';
import { SKILLS as DEFAULT_SKILLS } from '../data/portfolioData';

export const SKILLS_COLLECTION = 'skills';

/**
 * Initial fallback skills with stable identifiers and orders
 */
export const INITIAL_SKILLS: SkillItem[] = DEFAULT_SKILLS.map((skill, index) => ({
  ...skill,
  id: `default-${skill.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
  order: index + 1,
}));

/**
 * Common skill categories used for Data Analysts & BI engineers
 */
export const COMMON_SKILL_CATEGORIES = [
  'Querying & Extraction',
  'Business Intelligence',
  'Spreadsheets & Modeling',
  'ETL & Transformation',
  'Architecture',
  'Calculation Engine',
  'Data Analysis & Automation',
  'Data Visualization',
  'Statistical Modeling',
  'Cloud & Data Warehousing',
  'Other / Custom',
];

/**
 * Subscribe to real-time updates of the skills collection in Firestore.
 * If the collection in Firestore is empty, it provides INITIAL_SKILLS.
 */
export function subscribeSkills(
  onUpdate: (skills: SkillItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  const colRef = collection(db, SKILLS_COLLECTION);
  const q = query(colRef, orderBy('order', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const skills: SkillItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name || '',
            category: data.category || 'General',
            description: data.description || '',
            order: typeof data.order === 'number' ? data.order : 99,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });

        // Ensure sorted by order, then by name
        skills.sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.name.localeCompare(b.name));
        onUpdate(skills);
      } else {
        // Empty in Firestore -> return initial default skills
        onUpdate(INITIAL_SKILLS);
      }
    },
    (error) => {
      console.warn('Firestore subscription error for skills:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Fetch all skills from Firestore once.
 */
export async function getSkills(): Promise<SkillItem[]> {
  try {
    const colRef = collection(db, SKILLS_COLLECTION);
    const q = query(colRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const skills: SkillItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || '',
          category: data.category || 'General',
          description: data.description || '',
          order: typeof data.order === 'number' ? data.order : 99,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });
      skills.sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.name.localeCompare(b.name));
      return skills;
    }
    return INITIAL_SKILLS;
  } catch (error) {
    console.warn('Could not fetch skills from Firestore, using initial skills:', error);
    return INITIAL_SKILLS;
  }
}

/**
 * Add a new skill to Firestore.
 */
export async function addSkill(
  skill: Omit<SkillItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const colRef = collection(db, SKILLS_COLLECTION);
  const now = new Date().toISOString();

  const docRef = await addDoc(colRef, {
    name: skill.name.trim(),
    category: skill.category.trim() || 'General',
    description: skill.description.trim(),
    order: typeof skill.order === 'number' ? skill.order : 99,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

/**
 * Update an existing skill in Firestore.
 */
export async function updateSkill(id: string, skill: Partial<SkillItem>): Promise<void> {
  // If the skill has a default prefix and doesn't exist as a doc in Firestore, create it
  const docRef = doc(db, SKILLS_COLLECTION, id);
  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    updatedAt: now,
  };

  if (skill.name !== undefined) payload.name = skill.name.trim();
  if (skill.category !== undefined) payload.category = skill.category.trim();
  if (skill.description !== undefined) payload.description = skill.description.trim();
  if (skill.order !== undefined) payload.order = skill.order;

  await updateDoc(docRef, payload);
}

/**
 * Delete a skill from Firestore.
 */
export async function deleteSkill(id: string): Promise<void> {
  const docRef = doc(db, SKILLS_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Populate default portfolio skills into Firestore.
 * Useful when starting with an empty Firestore database.
 */
export async function seedDefaultSkills(): Promise<void> {
  const batch = writeBatch(db);
  const now = new Date().toISOString();

  DEFAULT_SKILLS.forEach((skill, index) => {
    const colRef = collection(db, SKILLS_COLLECTION);
    const newDocRef = doc(colRef);
    batch.set(newDocRef, {
      name: skill.name,
      category: skill.category,
      description: skill.description,
      order: index + 1,
      createdAt: now,
      updatedAt: now,
    });
  });

  await batch.commit();
}

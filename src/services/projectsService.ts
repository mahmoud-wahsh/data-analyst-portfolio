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
import { ProjectItem } from '../types';
import { PROJECTS as DEFAULT_PROJECTS } from '../data/portfolioData';
import { uploadProjectImage } from './cloudinaryService';

export { uploadProjectImage };

export const PROJECTS_COLLECTION = 'projects';

/**
 * Initial fallback projects mapped from portfolioData with category and publish state
 */
export const INITIAL_PROJECTS: ProjectItem[] = DEFAULT_PROJECTS.map((project, index) => {
  let defaultCategory = 'Data Analytics';
  if (project.title.toLowerCase().includes('ecommerce') || project.title.toLowerCase().includes('sales')) {
    defaultCategory = 'E-Commerce & Retail';
  } else if (project.title.toLowerCase().includes('healthcare') || project.title.toLowerCase().includes('hospital')) {
    defaultCategory = 'Healthcare Operations';
  } else if (project.title.toLowerCase().includes('supply chain') || project.title.toLowerCase().includes('inventory')) {
    defaultCategory = 'Supply Chain & Logistics';
  }

  return {
    ...project,
    id: `default-${project.id}`,
    category: defaultCategory,
    published: true,
    order: index + 1,
  };
});

/**
 * Common analytical project categories
 */
export const COMMON_PROJECT_CATEGORIES = [
  'E-Commerce & Retail',
  'Healthcare Operations',
  'Supply Chain & Logistics',
  'Financial Analytics',
  'Marketing & Customer Analytics',
  'Business Intelligence',
  'Predictive Modeling',
  'Other / Custom',
];

/**
 * Subscribe to real-time updates of all projects for Admin management.
 */
export function subscribeProjects(
  onUpdate: (projects: ProjectItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  const colRef = collection(db, PROJECTS_COLLECTION);

  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const projects: ProjectItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || '',
            category: data.category || 'Data Analytics',
            description: data.description || '',
            tools: Array.isArray(data.tools) ? data.tools : [],
            published: data.published !== false,
            order: typeof data.order === 'number' ? data.order : 99,
            highlights: Array.isArray(data.highlights) ? data.highlights : undefined,
            keyInsight: data.keyInsight || data.keyInsights || undefined,
            keyInsights: data.keyInsights || data.keyInsight || undefined,
            detailedDescription: data.detailedDescription || undefined,
            objective: data.objective || undefined,
            analysis: data.analysis || undefined,
            recommendations: data.recommendations || undefined,
            imageUrl: data.imageUrl || undefined,
            screenshots: Array.isArray(data.screenshots) ? data.screenshots : undefined,
            githubUrl: data.githubUrl || undefined,
            liveUrl: data.liveUrl || undefined,
            slug: data.slug || undefined,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });

        projects.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
        onUpdate(projects);
      } else {
        onUpdate(INITIAL_PROJECTS);
      }
    },
    (error) => {
      console.warn('Firestore subscription error for projects:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Subscribe to published projects only for the public portfolio.
 */
export function subscribePublishedProjects(
  onUpdate: (projects: ProjectItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  return subscribeProjects((allProjects) => {
    const published = allProjects.filter((p) => p.published !== false);
    onUpdate(published);
  }, onError);
}

/**
 * Add a new project to Firestore.
 */
export async function addProject(
  project: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const colRef = collection(db, PROJECTS_COLLECTION);
  const now = new Date().toISOString();

  const docRef = await addDoc(colRef, {
    title: project.title.trim(),
    category: project.category?.trim() || 'Data Analytics',
    description: project.description.trim(),
    tools: project.tools.map((t) => t.trim()).filter(Boolean),
    published: project.published !== undefined ? project.published : true,
    order: typeof project.order === 'number' ? project.order : 1,
    imageUrl: project.imageUrl?.trim() || '',
    detailedDescription: project.detailedDescription?.trim() || '',
    objective: project.objective?.trim() || '',
    analysis: project.analysis?.trim() || '',
    keyInsights: project.keyInsights?.trim() || project.keyInsight?.trim() || '',
    keyInsight: project.keyInsights?.trim() || project.keyInsight?.trim() || '',
    recommendations: project.recommendations?.trim() || '',
    screenshots: Array.isArray(project.screenshots)
      ? project.screenshots.map((s) => s.trim()).filter(Boolean)
      : [],
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

/**
 * Update an existing project in Firestore.
 */
export async function updateProject(id: string, project: Partial<ProjectItem>): Promise<void> {
  const docRef = doc(db, PROJECTS_COLLECTION, id);
  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    updatedAt: now,
  };

  if (project.title !== undefined) payload.title = project.title.trim();
  if (project.category !== undefined) payload.category = project.category.trim();
  if (project.description !== undefined) payload.description = project.description.trim();
  if (project.tools !== undefined) {
    payload.tools = project.tools.map((t) => t.trim()).filter(Boolean);
  }
  if (project.published !== undefined) payload.published = Boolean(project.published);
  if (project.order !== undefined) payload.order = project.order;
  if (project.imageUrl !== undefined) payload.imageUrl = project.imageUrl.trim();
  if (project.detailedDescription !== undefined) payload.detailedDescription = project.detailedDescription.trim();
  if (project.objective !== undefined) payload.objective = project.objective.trim();
  if (project.analysis !== undefined) payload.analysis = project.analysis.trim();
  if (project.keyInsights !== undefined) {
    payload.keyInsights = project.keyInsights.trim();
    payload.keyInsight = project.keyInsights.trim();
  } else if (project.keyInsight !== undefined) {
    payload.keyInsight = project.keyInsight.trim();
    payload.keyInsights = project.keyInsight.trim();
  }
  if (project.recommendations !== undefined) payload.recommendations = project.recommendations.trim();
  if (project.screenshots !== undefined) {
    payload.screenshots = project.screenshots.map((s) => s.trim()).filter(Boolean);
  }

  await updateDoc(docRef, payload);
}

/**
 * Delete a project from Firestore.
 */
export async function deleteProject(id: string): Promise<void> {
  const docRef = doc(db, PROJECTS_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Toggle published state of a project.
 */
export async function toggleProjectPublish(id: string, currentPublished: boolean): Promise<void> {
  await updateProject(id, { published: !currentPublished });
}

/**
 * Seed initial default projects into Firestore.
 */
export async function seedDefaultProjects(): Promise<void> {
  const batch = writeBatch(db);
  const now = new Date().toISOString();

  INITIAL_PROJECTS.forEach((project, index) => {
    const colRef = collection(db, PROJECTS_COLLECTION);
    const newDocRef = doc(colRef);
    batch.set(newDocRef, {
      title: project.title,
      category: project.category || 'Data Analytics',
      description: project.description,
      tools: project.tools,
      published: true,
      order: index + 1,
      highlights: project.highlights || [],
      keyInsight: project.keyInsight || '',
      keyInsights: project.keyInsights || project.keyInsight || '',
      detailedDescription: project.detailedDescription || '',
      objective: project.objective || '',
      analysis: project.analysis || '',
      recommendations: project.recommendations || '',
      imageUrl: project.imageUrl || '',
      screenshots: project.screenshots || [],
      createdAt: now,
      updatedAt: now,
    });
  });

  await batch.commit();
}

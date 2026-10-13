import { ProjectItem } from '../types';

/**
 * Returns a URL-safe, clean slug for a project.
 * Uses explicit slug if present, falls back to cleaned id, or kebab-cased title.
 */
export function getProjectSlug(project: ProjectItem): string {
  if (project.slug && project.slug.trim()) {
    return project.slug.trim().toLowerCase();
  }

  if (project.id) {
    const cleanId = project.id.replace(/^default-/, '').trim().toLowerCase();
    if (cleanId) {
      return cleanId;
    }
  }

  const rawTitle = project.title || 'untitled-project';
  return rawTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Finds a project in an array by slug or ID with robust fallbacks.
 */
export function findProjectBySlug(
  projects: ProjectItem[],
  targetSlug: string
): ProjectItem | null {
  if (!targetSlug) return null;
  const normalized = targetSlug.trim().toLowerCase();

  return (
    projects.find((p) => {
      if (!p) return false;

      // 1. Check explicit slug
      if (p.slug && p.slug.trim().toLowerCase() === normalized) {
        return true;
      }

      // 2. Check derived project slug
      const computedSlug = getProjectSlug(p);
      if (computedSlug === normalized) {
        return true;
      }

      // 3. Check raw and cleaned id
      if (p.id) {
        const rawId = p.id.trim().toLowerCase();
        const cleanId = rawId.replace(/^default-/, '');
        if (rawId === normalized || cleanId === normalized) {
          return true;
        }
      }

      // 4. Check title-based slug
      const titleSlug = (p.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      if (titleSlug === normalized) {
        return true;
      }

      return false;
    }) || null
  );
}

/**
 * Strips Cloudinary image transformation parameters to ensure original image fidelity.
 */
export function getOriginalImageUrl(url?: string): string {
  if (!url) return '';
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace(/\/upload\/(?:[a-z]{1,4}_[^/]+,?[^/]*\/)+/gi, '/upload/');
  }
  return url;
}

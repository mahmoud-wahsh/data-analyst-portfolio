import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Briefcase,
  Layers,
  Search,
  X,
  Eye,
  EyeOff,
  Sparkles,
  RotateCcw,
  Tag,
  Wrench,
  UploadCloud,
  Camera,
  Image as ImageIcon,
  Images,
} from 'lucide-react';
import { ProjectItem } from '../types';
import {
  subscribeProjects,
  addProject,
  updateProject,
  deleteProject,
  toggleProjectPublish,
  seedDefaultProjects,
  uploadProjectImage,
  COMMON_PROJECT_CATEGORIES,
} from '../services/projectsService';

export const ProjectsManagement: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  // Form Fields (Basic fields + publish status & order)
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>(COMMON_PROJECT_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formToolsInput, setFormToolsInput] = useState<string>('');
  const [formDetailedDescription, setFormDetailedDescription] = useState<string>('');
  const [formObjective, setFormObjective] = useState<string>('');
  const [formAnalysis, setFormAnalysis] = useState<string>('');
  const [formKeyInsights, setFormKeyInsights] = useState<string>('');
  const [formRecommendations, setFormRecommendations] = useState<string>('');
  const [formPublished, setFormPublished] = useState<boolean>(true);
  const [formOrder, setFormOrder] = useState<number>(1);

  // Single Project Thumbnail Image state (Cloudinary)
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [uploadingThumbnail, setUploadingThumbnail] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);

  // Multiple Project Screenshots state (Cloudinary)
  const [formScreenshots, setFormScreenshots] = useState<string[]>([]);
  const [uploadingScreenshots, setUploadingScreenshots] = useState<boolean>(false);
  const [screenshotsUploadStatus, setScreenshotsUploadStatus] = useState<string>('');
  const [screenshotsError, setScreenshotsError] = useState<string | null>(null);
  const screenshotsInputRef = useRef<HTMLInputElement | null>(null);

  // Status feedback states
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ProjectItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-dismiss success notification
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Subscribe to real-time projects in Firestore
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeProjects(
      (loadedProjects) => {
        setProjects(loadedProjects);
        setIsLoading(false);
      },
      (err) => {
        console.error('Projects subscription error:', err);
        setErrorMessage('Failed to load real-time projects from Firestore.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Check if projects are still default unseeded items
  const hasOnlyDefaults =
    projects.length > 0 && projects.every((p) => p.id?.startsWith('default-'));

  // Open Add modal
  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormTitle('');
    setFormCategory(COMMON_PROJECT_CATEGORIES[0]);
    setCustomCategory('');
    setFormDescription('');
    setFormToolsInput('');
    setFormDetailedDescription('');
    setFormObjective('');
    setFormAnalysis('');
    setFormKeyInsights('');
    setFormRecommendations('');
    setFormPublished(true);
    setFormOrder(projects.length + 1);
    setFormImageUrl('');
    setThumbnailError(null);
    setUploadingThumbnail(false);
    setUploadProgress(0);
    setFormScreenshots([]);
    setUploadingScreenshots(false);
    setScreenshotsUploadStatus('');
    setScreenshotsError(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEditModal = (project: ProjectItem) => {
    setEditingProject(project);
    setFormTitle(project.title);

    const isCommon = COMMON_PROJECT_CATEGORIES.includes(project.category || '');
    if (isCommon) {
      setFormCategory(project.category || COMMON_PROJECT_CATEGORIES[0]);
      setCustomCategory('');
    } else {
      setFormCategory('Other / Custom');
      setCustomCategory(project.category || '');
    }

    setFormDescription(project.description);
    setFormToolsInput(project.tools.join(', '));
    setFormDetailedDescription(project.detailedDescription || '');
    setFormObjective(project.objective || '');
    setFormAnalysis(project.analysis || '');
    setFormKeyInsights(project.keyInsights || project.keyInsight || '');
    setFormRecommendations(project.recommendations || '');
    setFormPublished(project.published !== false);
    setFormOrder(project.order || 1);
    setFormImageUrl(project.imageUrl || '');
    setThumbnailError(null);
    setUploadingThumbnail(false);
    setUploadProgress(0);
    setFormScreenshots(Array.isArray(project.screenshots) ? [...project.screenshots] : []);
    setUploadingScreenshots(false);
    setScreenshotsUploadStatus('');
    setScreenshotsError(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormImageUrl('');
    setThumbnailError(null);
    setUploadingThumbnail(false);
    setUploadProgress(0);
    setFormScreenshots([]);
    setUploadingScreenshots(false);
    setScreenshotsUploadStatus('');
    setScreenshotsError(null);
    setFormDetailedDescription('');
    setFormObjective('');
    setFormAnalysis('');
    setFormKeyInsights('');
    setFormRecommendations('');
    setErrorMessage(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    if (screenshotsInputRef.current) screenshotsInputRef.current.value = '';
  };

  // Handle single Project Thumbnail image file upload via Cloudinary
  const handleThumbnailFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailError(null);

    // Validate MIME type
    if (!file.type.startsWith('image/')) {
      setThumbnailError('Please select a valid image file (JPEG, PNG, WebP, GIF, etc.).');
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
      return;
    }

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setThumbnailError(`Selected image (${sizeMB}MB) exceeds the 10MB limit. Please choose a smaller file.`);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
      return;
    }

    setUploadingThumbnail(true);
    setUploadProgress(0);

    try {
      const secureUrl = await uploadProjectImage(file, (progress) => {
        setUploadProgress(progress);
      });
      setFormImageUrl(secureUrl);
    } catch (err: any) {
      console.error('Failed to upload project thumbnail:', err);
      setThumbnailError(err?.message || 'Failed to upload project thumbnail to Cloudinary.');
    } finally {
      setUploadingThumbnail(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    }
  };

  // Remove thumbnail
  const handleRemoveThumbnail = () => {
    setFormImageUrl('');
    setThumbnailError(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  // Handle multiple project screenshots upload via Cloudinary
  const handleScreenshotsFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setScreenshotsError(null);
    const fileList = Array.from(files);

    // Validate MIME type & file size for each selected file (max 10MB per Cloudinary unsigned config)
    const MAX_SIZE = 10 * 1024 * 1024;
    for (const file of fileList) {
      if (!file.type.startsWith('image/')) {
        setScreenshotsError(`"${file.name}" is not a valid image file. Please upload images only (JPEG, PNG, WebP, GIF).`);
        if (screenshotsInputRef.current) screenshotsInputRef.current.value = '';
        return;
      }
      if (file.size > MAX_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setScreenshotsError(`"${file.name}" (${sizeMB}MB) exceeds the 10MB limit. Please choose smaller files.`);
        if (screenshotsInputRef.current) screenshotsInputRef.current.value = '';
        return;
      }
    }

    setUploadingScreenshots(true);
    const totalFiles = fileList.length;
    const uploadedUrls: string[] = [];
    const failedUploads: string[] = [];

    for (let i = 0; i < totalFiles; i++) {
      const file = fileList[i];
      setScreenshotsUploadStatus(`Uploading screenshot ${i + 1} of ${totalFiles}...`);
      try {
        const url = await uploadProjectImage(file);
        uploadedUrls.push(url);
      } catch (err: any) {
        console.error(`Failed to upload screenshot ${file.name}:`, err);
        failedUploads.push(file.name);
      }
    }

    if (uploadedUrls.length > 0) {
      setFormScreenshots((prev) => [...prev, ...uploadedUrls]);
    }

    if (failedUploads.length > 0) {
      setScreenshotsError(`Failed to upload ${failedUploads.length} image(s): ${failedUploads.join(', ')}`);
    }

    setUploadingScreenshots(false);
    setScreenshotsUploadStatus('');
    if (screenshotsInputRef.current) screenshotsInputRef.current.value = '';
  };

  // Delete individual screenshot
  const handleRemoveScreenshot = (indexToRemove: number) => {
    setFormScreenshots((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Parse tools helper
  const parseTools = (input: string): string[] => {
    return input
      .split(/[,;\n]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  };

  // Save project (Add or Edit)
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      setErrorMessage('Please enter a project title.');
      return;
    }

    const finalCategory =
      formCategory === 'Other / Custom' ? customCategory.trim() : formCategory.trim();

    if (!finalCategory) {
      setErrorMessage('Please provide a project category.');
      return;
    }

    if (!formDescription.trim()) {
      setErrorMessage('Please provide a short description.');
      return;
    }

    const tools = parseTools(formToolsInput);
    if (tools.length === 0) {
      setErrorMessage('Please list at least one tool used (e.g., SQL, Power BI, Excel).');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (editingProject) {
        // If editing a default unseeded project, write it to Firestore
        if (editingProject.id && !editingProject.id.startsWith('default-')) {
          await updateProject(editingProject.id, {
            title: formTitle.trim(),
            category: finalCategory,
            description: formDescription.trim(),
            tools,
            published: formPublished,
            order: Number(formOrder) || 1,
            imageUrl: formImageUrl.trim(),
            detailedDescription: formDetailedDescription.trim(),
            objective: formObjective.trim(),
            analysis: formAnalysis.trim(),
            keyInsights: formKeyInsights.trim(),
            recommendations: formRecommendations.trim(),
            screenshots: formScreenshots,
          });
          setSuccessMessage(`Project "${formTitle.trim()}" updated successfully.`);
        } else {
          await addProject({
            title: formTitle.trim(),
            category: finalCategory,
            description: formDescription.trim(),
            tools,
            published: formPublished,
            order: Number(formOrder) || 1,
            imageUrl: formImageUrl.trim(),
            detailedDescription: formDetailedDescription.trim(),
            objective: formObjective.trim(),
            analysis: formAnalysis.trim(),
            keyInsights: formKeyInsights.trim(),
            recommendations: formRecommendations.trim(),
            screenshots: formScreenshots,
          });
          setSuccessMessage(`Project "${formTitle.trim()}" created in Firestore.`);
        }
      } else {
        await addProject({
          title: formTitle.trim(),
          category: finalCategory,
          description: formDescription.trim(),
          tools,
          published: formPublished,
          order: Number(formOrder) || 1,
          imageUrl: formImageUrl.trim(),
          detailedDescription: formDetailedDescription.trim(),
          objective: formObjective.trim(),
          analysis: formAnalysis.trim(),
          keyInsights: formKeyInsights.trim(),
          recommendations: formRecommendations.trim(),
          screenshots: formScreenshots,
        });
        setSuccessMessage(`Project "${formTitle.trim()}" added successfully.`);
      }

      handleCloseModal();
    } catch (err: any) {
      console.error('Failed to save project:', err);
      setErrorMessage(err?.message || 'Failed to save project to Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle publish status
  const handleTogglePublish = async (project: ProjectItem) => {
    if (!project.id) return;
    setTogglingId(project.id);
    setErrorMessage(null);

    try {
      const newStatus = project.published === false ? true : false;
      if (project.id.startsWith('default-')) {
        // Save to Firestore with toggled state
        await addProject({
          title: project.title,
          category: project.category || 'Data Analytics',
          description: project.description,
          tools: project.tools,
          published: newStatus,
          order: project.order || 1,
          detailedDescription: project.detailedDescription || '',
          objective: project.objective || '',
          analysis: project.analysis || '',
          keyInsights: project.keyInsights || project.keyInsight || '',
          recommendations: project.recommendations || '',
          imageUrl: project.imageUrl || '',
          screenshots: project.screenshots || [],
        });
      } else {
        await toggleProjectPublish(project.id, project.published !== false);
      }
      setSuccessMessage(
        `Project "${project.title}" is now ${newStatus ? 'Published' : 'Draft / Unpublished'}.`
      );
    } catch (err: any) {
      console.error('Failed to toggle project publish state:', err);
      setErrorMessage(err?.message || 'Failed to update publish state.');
    } finally {
      setTogglingId(null);
    }
  };

  // Delete project
  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      if (deleteCandidate.id && !deleteCandidate.id.startsWith('default-')) {
        await deleteProject(deleteCandidate.id);
        setSuccessMessage(`Project "${deleteCandidate.title}" deleted.`);
      } else {
        setSuccessMessage(`Project "${deleteCandidate.title}" removed.`);
      }
      setDeleteCandidate(null);
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      setErrorMessage(err?.message || 'Failed to delete project from Firestore.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Seed default portfolio projects into Firestore
  const handleSeedDefaults = async () => {
    setIsSeeding(true);
    setErrorMessage(null);
    try {
      await seedDefaultProjects();
      setSuccessMessage('Default portfolio projects successfully saved to Firestore.');
    } catch (err: any) {
      console.error('Failed to seed projects:', err);
      setErrorMessage(err?.message || 'Failed to initialize default projects in Firestore.');
    } finally {
      setIsSeeding(false);
    }
  };

  // Categories list
  const availableCategories = [
    'All',
    ...Array.from(new Set(projects.map((p) => p.category || 'Data Analytics'))),
  ];

  // Filtered projects
  const filteredProjects = projects.filter((project) => {
    // Status filter
    if (statusFilter === 'published' && project.published === false) return false;
    if (statusFilter === 'draft' && project.published !== false) return false;

    // Category filter
    if (
      categoryFilter !== 'All' &&
      (project.category || '').toLowerCase() !== categoryFilter.toLowerCase()
    ) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = project.title.toLowerCase().includes(q);
      const matchDesc = project.description.toLowerCase().includes(q);
      const matchCat = (project.category || '').toLowerCase().includes(q);
      const matchTools = project.tools.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchCat && !matchTools) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Alerts */}
      {successMessage && (
        <div
          id="projects-success-alert"
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3 animate-in fade-in"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMessage}</div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div
          id="projects-error-alert"
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Main Controls */}
      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Briefcase className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">Project Management</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Add, edit, delete, and control publication of case studies shown on your public portfolio.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {hasOnlyDefaults && (
              <button
                id="seed-projects-btn"
                type="button"
                onClick={handleSeedDefaults}
                disabled={isSeeding}
                title="Save existing default projects to Firestore documents"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-medium transition-colors border border-zinc-700 disabled:opacity-50"
              >
                {isSeeding ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                ) : (
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                )}
                <span>Sync Defaults to Firestore</span>
              </button>
            )}

            <button
              id="add-project-btn"
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs sm:text-sm font-semibold transition-colors shadow-lg shadow-emerald-900/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Project</span>
            </button>
          </div>
        </div>

        {/* Filter Bar: Search, Publication Status, Categories */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-2 border-t border-zinc-800/80">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="projects-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by title, category, tool, or description..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0">
            <button
              type="button"
              id="filter-status-all"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({projects.length})
            </button>
            <button
              type="button"
              id="filter-status-published"
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === 'published'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Published ({projects.filter((p) => p.published !== false).length})
            </button>
            <button
              type="button"
              id="filter-status-draft"
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === 'draft'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Drafts ({projects.filter((p) => p.published === false).length})
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {availableCategories.map((category) => {
              const isSelected = categoryFilter.toLowerCase() === category.toLowerCase();
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setCategoryFilter(category)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Projects Cards List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-zinc-900/30 border border-zinc-800">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
          <p className="text-sm text-zinc-400">Loading projects from Firestore...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-zinc-900/30 border border-zinc-800 text-center">
          <Briefcase className="w-10 h-10 text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-zinc-200 mb-1">No projects found</h3>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mb-4">
            {searchQuery || categoryFilter !== 'All' || statusFilter !== 'all'
              ? 'No projects match your current filters.'
              : 'You have not added any projects yet.'}
          </p>
          {(searchQuery || categoryFilter !== 'All' || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setStatusFilter('all');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project, index) => {
            const isPublished = project.published !== false;
            const isToggling = togglingId === project.id;
            const projectSlug = (project.title || `project-${index}`)
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '-');

            return (
              <div
                key={project.id || project.title}
                id={`admin-project-card-${projectSlug}`}
                className={`p-5 rounded-2xl bg-zinc-900/50 border transition-all flex flex-col justify-between group ${
                  isPublished
                    ? 'border-zinc-800 hover:border-zinc-700'
                    : 'border-zinc-800/60 opacity-80 hover:opacity-100 hover:border-amber-500/40'
                }`}
              >
                <div>
                  {/* Top Status & Category Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-800 truncate max-w-[170px]">
                      {project.category || 'Data Analytics'}
                    </span>

                    {/* Publish Status Badge & Toggle Button */}
                    <button
                      type="button"
                      id={`toggle-publish-btn-${projectSlug}`}
                      onClick={() => handleTogglePublish(project)}
                      disabled={isToggling}
                      title={isPublished ? 'Click to unpublish' : 'Click to publish'}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                        isPublished
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                      }`}
                    >
                      {isToggling ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isPublished ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                      <span>{isPublished ? 'Published' : 'Draft'}</span>
                    </button>
                  </div>

                  {/* Project Thumbnail Preview if available */}
                  {project.imageUrl && (
                    <div className="mb-3.5 rounded-lg overflow-hidden border border-zinc-800 h-32 bg-zinc-950/60">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Screenshots count badge if available */}
                  {project.screenshots && project.screenshots.length > 0 && (
                    <div className="mb-2.5 flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300">
                        <Images className="w-3 h-3 text-emerald-400" />
                        <span>
                          {project.screenshots.length} screenshot{project.screenshots.length > 1 ? 's' : ''}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Project Title */}
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors mb-2 leading-snug">
                    {project.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Tools Used */}
                  <div className="pt-3 border-t border-zinc-800/80">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-2">
                      <Wrench className="w-3 h-3 text-emerald-400" />
                      <span className="font-medium">Tools Used:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tools.map((tool) => (
                        <span
                          key={tool}
                          className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: Edit, Delete, Order */}
                <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-zinc-800/80">
                  <div className="text-[10px] text-zinc-500">
                    {typeof project.order === 'number' && `Order #${project.order}`}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id={`edit-project-btn-${projectSlug}`}
                      onClick={() => handleOpenEditModal(project)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors border border-zinc-700"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      id={`delete-project-btn-${projectSlug}`}
                      onClick={() => setDeleteCandidate(project)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Project Modal (ONLY the 4 required basic fields) */}
      {isModalOpen && (
        <div
          id="project-form-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingProject ? 'Edit Project' : 'Add New Project'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Specify the required project details to showcase your analytics work.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              {/* Field 1: Project Title */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Project Title <span className="text-red-400">*</span>
                </label>
                <input
                  id="project-title-input"
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Customer Churn & Cohort Retention Analysis"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
                />
              </div>

              {/* Field 2: Category */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  id="project-category-select"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
                >
                  {COMMON_PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {formCategory === 'Other / Custom' && (
                  <div className="mt-2.5">
                    <input
                      id="project-custom-category-input"
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Type your custom project domain or category..."
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Field 3: Short Description */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Short Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="project-description-textarea"
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summarize the analytical objective, dataset, and core business problem solved..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm leading-relaxed"
                />
              </div>

              {/* Field 4: Tools Used */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Tools Used <span className="text-red-400">*</span>
                </label>
                <input
                  id="project-tools-input"
                  type="text"
                  required
                  value={formToolsInput}
                  onChange={(e) => setFormToolsInput(e.target.value)}
                  placeholder="e.g., SQL, Power BI, DAX, Python (separated by commas)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Separate tools with commas (e.g. "SQL, Power BI, Excel").
                </p>
              </div>

              {/* Field 5: Detailed Description (Optional) */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Detailed Description <span className="text-zinc-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="project-detailed-description-textarea"
                  rows={4}
                  value={formDetailedDescription}
                  onChange={(e) => setFormDetailedDescription(e.target.value)}
                  placeholder="Detailed project context, dataset description, domain background, and methodology..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm leading-relaxed"
                />
              </div>

              {/* Field 6: Objective (Optional) */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Objective <span className="text-zinc-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="project-objective-textarea"
                  rows={2}
                  value={formObjective}
                  onChange={(e) => setFormObjective(e.target.value)}
                  placeholder="Primary business objectives, core research questions, or KPI targets..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm leading-relaxed"
                />
              </div>

              {/* Field 7: Analysis (Optional) */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Analysis <span className="text-zinc-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="project-analysis-textarea"
                  rows={3}
                  value={formAnalysis}
                  onChange={(e) => setFormAnalysis(e.target.value)}
                  placeholder="Analytical techniques, SQL queries, data transformations, statistical tests, or models..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm leading-relaxed"
                />
              </div>

              {/* Field 8: Key Insights (Optional) */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Key Insights <span className="text-zinc-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="project-key-insights-textarea"
                  rows={3}
                  value={formKeyInsights}
                  onChange={(e) => setFormKeyInsights(e.target.value)}
                  placeholder="Main data findings, percentage shifts, patterns discovered, and notable takeaways..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm leading-relaxed"
                />
              </div>

              {/* Field 9: Recommendations (Optional) */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Recommendations <span className="text-zinc-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="project-recommendations-textarea"
                  rows={3}
                  value={formRecommendations}
                  onChange={(e) => setFormRecommendations(e.target.value)}
                  placeholder="Actionable recommendations, operational adjustments, or future project phases..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm leading-relaxed"
                />
              </div>

              {/* Field: Project Thumbnail Image (Cloudinary) */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-zinc-300">
                    Project Thumbnail <span className="text-zinc-500 font-normal">(Optional)</span>
                  </label>
                  {formImageUrl && (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Thumbnail attached</span>
                    </span>
                  )}
                </div>

                {/* Error message if upload fails */}
                {thumbnailError && (
                  <div
                    id="project-thumbnail-error-alert"
                    className="mb-2.5 p-2.5 rounded-xl bg-red-950/40 border border-red-800/60 flex items-center gap-2 text-xs text-red-300"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{thumbnailError}</span>
                  </div>
                )}

                {/* Hidden input */}
                <input
                  id="project-thumbnail-file-input"
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailFileChange}
                  disabled={uploadingThumbnail || isSaving}
                  className="hidden"
                />

                {formImageUrl ? (
                  /* Preview with Replace & Remove buttons */
                  <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
                    <div className="h-40 w-full relative bg-zinc-950/80">
                      <img
                        id="project-thumbnail-preview-img"
                        src={formImageUrl}
                        alt="Project Thumbnail Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {uploadingThumbnail && (
                        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-emerald-400">
                          <Loader2 className="w-6 h-6 animate-spin mb-1 text-emerald-400" />
                          <span className="text-xs font-semibold">Uploading to Cloudinary ({uploadProgress}%)</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-zinc-400 truncate max-w-[200px] sm:max-w-xs flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">Cloudinary thumbnail ready</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          id="replace-thumbnail-btn"
                          onClick={() => thumbnailInputRef.current?.click()}
                          disabled={uploadingThumbnail || isSaving}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors border border-zinc-700 inline-flex items-center gap-1.5"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Replace</span>
                        </button>
                        <button
                          type="button"
                          id="remove-thumbnail-btn"
                          onClick={handleRemoveThumbnail}
                          disabled={uploadingThumbnail || isSaving}
                          className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Upload Drop/Click Area */
                  <div
                    id="project-thumbnail-upload-box"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (!uploadingThumbnail && !isSaving) {
                        thumbnailInputRef.current?.click();
                      }
                    }}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && !uploadingThumbnail && !isSaving) {
                        thumbnailInputRef.current?.click();
                      }
                    }}
                    className={`rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      uploadingThumbnail ? 'pointer-events-none opacity-80' : ''
                    }`}
                  >
                    {uploadingThumbnail ? (
                      <div className="flex flex-col items-center py-2">
                        <Loader2 className="w-7 h-7 animate-spin text-emerald-400 mb-2" />
                        <span className="text-xs text-zinc-300 font-medium">
                          Uploading to Cloudinary... ({uploadProgress}%)
                        </span>
                        <div className="w-48 h-1.5 bg-zinc-800 rounded-full mt-2.5 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-150 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-2">
                          <UploadCloud className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-xs font-medium text-zinc-200">
                          Click to upload project thumbnail
                        </span>
                        <span className="text-[11px] text-zinc-500 mt-1">
                          PNG, JPG, WebP, GIF up to 10MB (Stored on Cloudinary)
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Field: Project Screenshots (Multiple Cloudinary Uploads) */}
              <div className="pt-2 border-t border-zinc-800/80">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-zinc-300">
                    Project Screenshots <span className="text-zinc-500 font-normal">(Multiple images)</span>
                  </label>
                  {formScreenshots.length > 0 && (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{formScreenshots.length} screenshot{formScreenshots.length > 1 ? 's' : ''} attached</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mb-2.5">
                  Upload multiple dashboard views, charts, or deliverables to showcase in the public project gallery.
                </p>

                {/* Error message if upload fails */}
                {screenshotsError && (
                  <div
                    id="project-screenshots-error-alert"
                    className="mb-2.5 p-2.5 rounded-xl bg-red-950/40 border border-red-800/60 flex items-center gap-2 text-xs text-red-300"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{screenshotsError}</span>
                  </div>
                )}

                {/* Hidden input for multiple screenshots */}
                <input
                  id="project-screenshots-file-input"
                  ref={screenshotsInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleScreenshotsFilesChange}
                  disabled={uploadingScreenshots || isSaving}
                  className="hidden"
                />

                {/* Uploaded screenshots previews grid with individual delete button */}
                {formScreenshots.length > 0 && (
                  <div className="mb-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {formScreenshots.map((url, idx) => (
                        <div
                          key={`${url}-${idx}`}
                          className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 aspect-video flex items-center justify-center"
                        >
                          <img
                            src={url}
                            alt={`Screenshot ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <div className="flex justify-between items-center w-full">
                              <span className="text-[10px] font-semibold text-white bg-zinc-900/90 px-1.5 py-0.5 rounded border border-zinc-700">
                                #{idx + 1}
                              </span>
                              <button
                                type="button"
                                id={`delete-screenshot-btn-${idx}`}
                                onClick={() => handleRemoveScreenshot(idx)}
                                disabled={uploadingScreenshots || isSaving}
                                title="Delete screenshot"
                                className="p-1 rounded-md bg-red-500/90 hover:bg-red-500 text-white transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drop / Click upload box */}
                <div
                  id="project-screenshots-upload-box"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (!uploadingScreenshots && !isSaving) {
                      screenshotsInputRef.current?.click();
                    }
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !uploadingScreenshots && !isSaving) {
                      screenshotsInputRef.current?.click();
                    }
                  }}
                  className={`rounded-xl border border-dashed border-zinc-800 hover:border-emerald-500/50 bg-zinc-950/60 p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    uploadingScreenshots ? 'pointer-events-none opacity-80' : ''
                  }`}
                >
                  {uploadingScreenshots ? (
                    <div className="flex flex-col items-center py-2">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mb-2" />
                      <span className="text-xs text-zinc-200 font-medium">
                        {screenshotsUploadStatus || 'Uploading screenshots to Cloudinary...'}
                      </span>
                      <span className="text-[11px] text-zinc-500 mt-1">
                        Please wait while images are uploaded to Cloudinary
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-1.5">
                        <Images className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-xs font-medium text-zinc-200">
                        {formScreenshots.length > 0 ? '+ Add more screenshots' : 'Click to upload project screenshots'}
                      </span>
                      <span className="text-[11px] text-zinc-500 mt-0.5">
                        You can select multiple files at once (PNG, JPG, WebP up to 10MB each)
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Publication Status & Sequence Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Publication Status
                  </label>
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                    <input
                      id="project-published-checkbox"
                      type="checkbox"
                      checked={formPublished}
                      onChange={(e) => setFormPublished(e.target.checked)}
                      className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-xs text-zinc-200">
                      {formPublished ? 'Published (Visible)' : 'Draft (Hidden)'}
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Display Order
                  </label>
                  <input
                    id="project-order-input"
                    type="number"
                    min="1"
                    max="100"
                    value={formOrder}
                    onChange={(e) => setFormOrder(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs sm:text-sm font-medium transition-colors border border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-project-submit-btn"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingProject ? 'Update Project' : 'Save Project'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div
          id="delete-project-confirm-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Project</h3>
                <p className="text-xs text-zinc-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-white">"{deleteCandidate.title}"</span>? It will be
              permanently removed from Firestore and will no longer appear on your public website.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs sm:text-sm font-medium transition-colors border border-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-project-btn"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

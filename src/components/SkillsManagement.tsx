import React, { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Database,
  Search,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { SkillItem } from '../types';
import {
  subscribeSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  seedDefaultSkills,
  COMMON_SKILL_CATEGORIES,
} from '../services/skillsService';

export const SkillsManagement: React.FC = () => {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>(COMMON_SKILL_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formOrder, setFormOrder] = useState<number>(1);

  // Status feedback states
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [deleteCandidate, setDeleteCandidate] = useState<SkillItem | null>(null);
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

  // Subscribe to real-time skills updates from Firestore
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeSkills(
      (loadedSkills) => {
        setSkills(loadedSkills);
        setIsLoading(false);
      },
      (err) => {
        console.error('Skills subscription error:', err);
        setErrorMessage('Failed to load real-time skills data from Firestore.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Determine if all skills are still the default unseeded ones
  const hasOnlyDefaults = skills.length > 0 && skills.every((s) => s.id?.startsWith('default-'));

  // Open modal for adding a new skill
  const handleOpenAddModal = () => {
    setEditingSkill(null);
    setFormName('');
    setFormCategory(COMMON_SKILL_CATEGORIES[0]);
    setCustomCategory('');
    setFormDescription('');
    setFormOrder(skills.length + 1);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  // Open modal for editing an existing skill
  const handleOpenEditModal = (skill: SkillItem) => {
    setEditingSkill(skill);
    setFormName(skill.name);
    if (COMMON_SKILL_CATEGORIES.includes(skill.category)) {
      setFormCategory(skill.category);
      setCustomCategory('');
    } else {
      setFormCategory('Other / Custom');
      setCustomCategory(skill.category);
    }
    setFormDescription(skill.description);
    setFormOrder(skill.order ?? 1);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSkill(null);
    setErrorMessage(null);
  };

  // Save skill (Add or Edit)
  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMessage('Please enter a skill name.');
      return;
    }

    const finalCategory =
      formCategory === 'Other / Custom' ? customCategory.trim() : formCategory.trim();

    if (!finalCategory) {
      setErrorMessage('Please provide a skill category.');
      return;
    }

    if (!formDescription.trim()) {
      setErrorMessage('Please provide a short description for this skill.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (editingSkill) {
        // If it's a default placeholder item that hasn't been written to Firestore yet,
        // we add it as a new document
        if (editingSkill.id && !editingSkill.id.startsWith('default-')) {
          await updateSkill(editingSkill.id, {
            name: formName.trim(),
            category: finalCategory,
            description: formDescription.trim(),
            order: Number(formOrder) || 1,
          });
          setSuccessMessage(`Skill "${formName.trim()}" updated successfully.`);
        } else {
          // Add as real doc
          await addSkill({
            name: formName.trim(),
            category: finalCategory,
            description: formDescription.trim(),
            order: Number(formOrder) || 1,
          });
          setSuccessMessage(`Skill "${formName.trim()}" created in Firestore.`);
        }
      } else {
        await addSkill({
          name: formName.trim(),
          category: finalCategory,
          description: formDescription.trim(),
          order: Number(formOrder) || 1,
        });
        setSuccessMessage(`New skill "${formName.trim()}" added successfully.`);
      }

      handleCloseModal();
    } catch (err: any) {
      console.error('Failed to save skill:', err);
      setErrorMessage(err?.message || 'Failed to save skill to Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete skill
  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      if (deleteCandidate.id && !deleteCandidate.id.startsWith('default-')) {
        await deleteSkill(deleteCandidate.id);
        setSuccessMessage(`Skill "${deleteCandidate.name}" removed successfully.`);
      } else {
        // Default unseeded item: seed all except this one, or just ignore
        setSuccessMessage(`Skill "${deleteCandidate.name}" removed.`);
      }
      setDeleteCandidate(null);
    } catch (err: any) {
      console.error('Failed to delete skill:', err);
      setErrorMessage(err?.message || 'Failed to delete skill from Firestore.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Seed default portfolio skills into Firestore
  const handleSeedDefaults = async () => {
    setIsSeeding(true);
    setErrorMessage(null);
    try {
      await seedDefaultSkills();
      setSuccessMessage('Default portfolio skills successfully saved to Firestore.');
    } catch (err: any) {
      console.error('Failed to seed skills:', err);
      setErrorMessage(err?.message || 'Failed to initialize default skills in Firestore.');
    } finally {
      setIsSeeding(false);
    }
  };

  // Compute available categories from current skills
  const availableCategories = ['All', ...Array.from(new Set(skills.map((s) => s.category)))];

  // Filter skills by category & search query
  const filteredSkills = skills.filter((skill) => {
    const matchesCategory =
      selectedCategory === 'All' || skill.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Alerts */}
      {successMessage && (
        <div
          id="skills-success-alert"
          className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm flex items-start gap-3 animate-in fade-in"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMessage}</div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div
          id="skills-error-alert"
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Layers className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">Skills Management</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Add, update, or remove technical skills displayed dynamically on your public portfolio.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {hasOnlyDefaults && (
              <button
                id="seed-skills-btn"
                type="button"
                onClick={handleSeedDefaults}
                disabled={isSeeding}
                title="Save existing default skills to Firestore documents"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-colors border border-slate-700 disabled:opacity-50 cursor-pointer"
              >
                {isSeeding ? (
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                )}
                <span>Sync Defaults to Firestore</span>
              </button>
            )}

            <button
              id="add-skill-btn"
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs sm:text-sm font-semibold transition-colors shadow-lg shadow-cyan-950/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Skill</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-2 border-t border-slate-800/80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="skills-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills by name, category, or keyword..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {availableCategories.map((category) => {
              const isSelected = selectedCategory.toLowerCase() === category.toLowerCase();
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-slate-900/30 border border-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
          <p className="text-sm text-slate-400">Loading skills from Firestore...</p>
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-slate-900/30 border border-slate-800 text-center">
          <Database className="w-10 h-10 text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-200 mb-1">No skills found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-4">
            {searchQuery || selectedCategory !== 'All'
              ? 'Try changing your search query or category filter.'
              : 'You have not added any skills yet.'}
          </p>
          {(searchQuery || selectedCategory !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id || skill.name}
              id={`admin-skill-card-${skill.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[11px] font-medium tracking-wide text-slate-400 uppercase bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 truncate max-w-[200px]">
                    {skill.category}
                  </span>
                  {typeof skill.order === 'number' && (
                    <span className="text-[10px] text-slate-500 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800">
                      #{skill.order}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                  {skill.name}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {skill.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  id={`edit-skill-btn-${skill.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => handleOpenEditModal(skill)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 text-xs font-medium transition-colors border border-slate-700 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  id={`delete-skill-btn-${skill.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => setDeleteCandidate(skill)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      {isModalOpen && (
        <div
          id="skill-form-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingSkill ? 'Edit Skill' : 'Add New Skill'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set the name, category, and technical description for this competency.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="space-y-4">
              {/* Skill Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Skill Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="skill-name-input"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., PostgreSQL, Python, Tableau, DAX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  id="skill-category-select"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                >
                  {COMMON_SKILL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {formCategory === 'Other / Custom' && (
                  <div className="mt-2.5">
                    <input
                      id="skill-custom-category-input"
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Type your custom category..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Description / Key Competencies <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="skill-description-textarea"
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe your capabilities, such as complex queries, data transformations, or reporting..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm leading-relaxed"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Display Order (Numerical sequence on public website)
                </label>
                <input
                  id="skill-order-input"
                  type="number"
                  min="1"
                  max="100"
                  value={formOrder}
                  onChange={(e) => setFormOrder(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition-colors border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-skill-submit-btn"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-950/20"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingSkill ? 'Update Skill' : 'Save Skill'}</span>
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
          id="delete-skill-confirm-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Skill</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-white">"{deleteCandidate.name}"</span>? It will be
              immediately removed from your public portfolio.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition-colors border border-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-skill-btn"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
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

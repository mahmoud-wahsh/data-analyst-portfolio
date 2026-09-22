import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Briefcase,
  Mail,
  Phone,
  Linkedin,
  Github,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  Camera,
  UploadCloud,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { ProfileData } from '../types';
import {
  getProfile,
  updateProfile,
  uploadProfileImage,
  INITIAL_PROFILE_DATA,
} from '../services/profileService';

export const ProfileManagement: React.FC = () => {
  const [formData, setFormData] = useState<ProfileData>(INITIAL_PROFILE_DATA);
  const [initialData, setInitialData] = useState<ProfileData>(INITIAL_PROFILE_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile image upload states
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [imageSuccess, setImageSuccess] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const profile = await getProfile();
        if (isMounted) {
          setFormData(profile);
          setInitialData(profile);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load profile:', err);
          setErrorMessage(err?.message || 'Failed to load profile data. Using defaults.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear status messages upon editing
    if (successMessage) setSuccessMessage(null);
    if (errorMessage) setErrorMessage(null);
  };

  const handleReset = () => {
    setFormData(initialData);
    setSuccessMessage(null);
    setErrorMessage(null);
    setImageError(null);
    setImageSuccess(null);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    setImageSuccess(null);

    // Validate MIME type
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (JPEG, PNG, WebP, GIF, etc.).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setImageError(`Selected image (${sizeMB}MB) exceeds the 10MB limit. Please choose a smaller file.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingImage(true);
    setUploadProgress(0);

    try {
      const downloadUrl = await uploadProfileImage(file, (progress) => {
        setUploadProgress(progress);
      });

      // Save download URL to Firestore profile document immediately
      await updateProfile({ profileImageUrl: downloadUrl });

      setFormData((prev) => ({
        ...prev,
        profileImageUrl: downloadUrl,
      }));
      setInitialData((prev) => ({
        ...prev,
        profileImageUrl: downloadUrl,
      }));

      setImageSuccess('Profile image uploaded and saved successfully!');
      setTimeout(() => {
        setImageSuccess(null);
      }, 5000);
    } catch (err: any) {
      console.error('Failed to upload profile image:', err);
      setImageError(err?.message || 'Failed to upload profile image. Please try again.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    setImageError(null);
    setImageSuccess(null);

    try {
      await updateProfile({ profileImageUrl: '' });
      setFormData((prev) => ({
        ...prev,
        profileImageUrl: '',
      }));
      setInitialData((prev) => ({
        ...prev,
        profileImageUrl: '',
      }));
      setImageSuccess('Profile image removed successfully.');
      setTimeout(() => {
        setImageSuccess(null);
      }, 4000);
    } catch (err: any) {
      console.error('Failed to remove profile image:', err);
      setImageError(err?.message || 'Failed to remove image.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      if (!formData.fullName.trim()) {
        throw new Error('Full name is required.');
      }
      if (!formData.email.trim()) {
        throw new Error('Email address is required.');
      }

      await updateProfile(formData);
      setInitialData(formData);
      setSuccessMessage('Profile data successfully saved to Firestore!');

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage((current) =>
          current === 'Profile data successfully saved to Firestore!' ? null : current
        );
      }, 5000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setErrorMessage(
        err?.message || 'Failed to save changes. Please verify permissions and try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  if (isLoading) {
    return (
      <div
        id="profile-loading-indicator"
        className="min-h-[360px] flex flex-col items-center justify-center p-8 text-zinc-400 bg-zinc-900/50 border border-zinc-800 rounded-2xl"
      >
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <span className="text-sm font-medium">Loading profile from Firestore...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <User className="w-5 h-5 text-emerald-400" />
            <span>Profile Management</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Update your public personal details, professional headline, and contact links stored in Cloud Firestore.
          </p>
        </div>

        {hasUnsavedChanges && (
          <span className="self-start sm:self-auto text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
            Unsaved Changes
          </span>
        )}
      </div>

      {/* Form Alerts */}
      <div className="px-6 pt-6 space-y-3">
        {successMessage && (
          <div
            id="profile-success-alert"
            className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-3 text-xs sm:text-sm text-emerald-300"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {errorMessage && (
          <div
            id="profile-error-alert"
            className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 flex items-start gap-3 text-xs sm:text-sm text-red-300"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section: Profile Image */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-800/60 flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Profile Photo</span>
          </h3>

          {/* Dedicated Image Alerts */}
          {imageSuccess && (
            <div
              id="profile-image-success-alert"
              className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-300"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{imageSuccess}</span>
            </div>
          )}

          {imageError && (
            <div
              id="profile-image-error-alert"
              className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 flex items-center gap-2.5 text-xs text-red-300"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{imageError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            {/* Image Preview / Placeholder */}
            <div className="relative group shrink-0 self-center sm:self-auto">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center relative shadow-inner">
                {formData.profileImageUrl ? (
                  <img
                    id="profile-image-preview"
                    src={formData.profileImageUrl}
                    alt={formData.fullName || 'Profile Preview'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-500 gap-1 p-2 text-center">
                    <User className="w-10 h-10 text-zinc-600" />
                    <span className="text-[10px] text-zinc-500 font-medium">No Photo</span>
                  </div>
                )}

                {/* Uploading Spinner Overlay */}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-emerald-400 p-2">
                    <Loader2 className="w-6 h-6 animate-spin mb-1 text-emerald-400" />
                    <span className="text-[11px] font-semibold">{uploadProgress}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Controls & Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">
                  {formData.profileImageUrl ? 'Current Profile Image' : 'Add Profile Image'}
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Select a photo from your device. It will be uploaded to Cloudinary and linked directly to your public portfolio profile.
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Supported formats: JPG, PNG, WebP, GIF (Max 10MB)
                </p>
              </div>

              {/* Progress bar during upload */}
              {uploadingImage && (
                <div className="space-y-1.5 max-w-sm">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <UploadCloud className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>Uploading to Cloudinary...</span>
                    </span>
                    <span className="font-semibold text-emerald-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-150 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {/* Hidden File Input */}
                <input
                  id="profile-image-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={uploadingImage || isSaving}
                  className="hidden"
                />

                <button
                  id="select-profile-image-btn"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage || isSaving}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 hover:border-zinc-600 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      <span>Uploading...</span>
                    </>
                  ) : formData.profileImageUrl ? (
                    <>
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Replace Photo</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Select Photo</span>
                    </>
                  )}
                </button>

                {formData.profileImageUrl && !uploadingImage && (
                  <button
                    id="remove-profile-image-btn"
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-red-950/40 text-zinc-400 hover:text-red-300 text-xs font-medium border border-zinc-800 hover:border-red-900/50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Basic Identity */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-800/60 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Identity & Title</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* fullName */}
            <div>
              <label
                htmlFor="profile-fullName"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Full Name <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="profile-fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* professionalTitle */}
            <div>
              <label
                htmlFor="profile-professionalTitle"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Professional Title <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  id="profile-professionalTitle"
                  name="professionalTitle"
                  type="text"
                  required
                  value={formData.professionalTitle}
                  onChange={handleChange}
                  placeholder="e.g. Data Analyst"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* availabilityText */}
            <div className="md:col-span-2">
              <label
                htmlFor="profile-availabilityText"
                className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hero Availability Badge</span>
                </span>
                <span className="text-[11px] text-zinc-500 font-normal">
                  Leave empty to hide badge from Home section
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Sparkles className="w-4 h-4" />
                </div>
                <input
                  id="profile-availabilityText"
                  name="availabilityText"
                  type="text"
                  value={formData.availabilityText ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. Open to Data Analytics Opportunities"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Headline & Bio */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-800/60 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Narrative & Bio</span>
          </h3>

          {/* headline */}
          <div>
            <label
              htmlFor="profile-headline"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              Headline / Mission Statement
            </label>
            <input
              id="profile-headline"
              name="headline"
              type="text"
              value={formData.headline}
              onChange={handleChange}
              placeholder="Brief tagline or statement of focus"
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* about */}
          <div>
            <label
              htmlFor="profile-about"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              About / Background Narrative
            </label>
            <textarea
              id="profile-about"
              name="about"
              rows={4}
              value={formData.about}
              onChange={handleChange}
              placeholder="Detailed summary of your expertise, methodologies, and technical stack..."
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors resize-y leading-relaxed"
            />
          </div>
        </div>

        {/* Section: Contact & Social Channels */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-800/60 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span>Contact & Social Links</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* email */}
            <div>
              <label
                htmlFor="profile-email"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Email Address <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* whatsapp */}
            <div>
              <label
                htmlFor="profile-whatsapp"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                WhatsApp Number / Link
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="profile-whatsapp"
                  name="whatsapp"
                  type="text"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2834"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* linkedin */}
            <div>
              <label
                htmlFor="profile-linkedin"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Linkedin className="w-4 h-4" />
                </div>
                <input
                  id="profile-linkedin"
                  name="linkedin"
                  type="text"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* github */}
            <div>
              <label
                htmlFor="profile-github"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                GitHub Profile URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Github className="w-4 h-4" />
                </div>
                <input
                  id="profile-github"
                  name="github"
                  type="text"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-zinc-800/80 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          {hasUnsavedChanges && (
            <button
              id="reset-profile-btn"
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Discard Changes</span>
            </button>
          )}

          <button
            id="save-profile-btn"
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-950/40"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                <span>Saving to Firestore...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-zinc-950" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

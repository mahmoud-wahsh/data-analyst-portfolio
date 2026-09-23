import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCw,
  ExternalLink,
  FileCheck,
  Calendar,
  HardDrive,
  AlertTriangle,
} from 'lucide-react';
import { CvData } from '../types';
import { subscribeCv, saveCv, deleteCv } from '../services/cvService';
import { uploadCvToCloudinary, validatePdfFile } from '../services/cloudinaryService';

export const CvManagement: React.FC = () => {
  const [cvData, setCvData] = useState<CvData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Subscribe to real-time CV updates
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeCv((cv) => {
      setCvData(cv);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes <= 0) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (isoString?: string): string => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const handleFileSelection = async (file: File) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // Validate PDF format and size
      validatePdfFile(file);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Please select a valid PDF file.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadResult = await uploadCvToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });

      const newCv: CvData = {
        fileUrl: uploadResult.secure_url,
        fileName: file.name,
        fileSize: uploadResult.bytes || file.size,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveCv(newCv);
      setSuccessMessage(
        cvData
          ? `CV successfully replaced with "${file.name}".`
          : `CV "${file.name}" successfully uploaded and saved.`
      );
    } catch (err: any) {
      console.error('Failed to upload CV:', err);
      setErrorMessage(
        err?.message || 'An error occurred during CV upload. Please try again.'
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await deleteCv();
      setShowDeleteConfirm(false);
      setSuccessMessage('Current CV reference removed successfully.');
    } catch (err: any) {
      console.error('Failed to delete CV:', err);
      setErrorMessage(err?.message || 'Failed to remove CV reference.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div
        id="cv-management-loading"
        className="flex flex-col items-center justify-center p-12 bg-slate-900/60 rounded-2xl border border-slate-800"
      >
        <Loader2 className="w-7 h-7 text-cyan-400 animate-spin mb-3" />
        <p className="text-slate-400 text-sm">Loading resume status...</p>
      </div>
    );
  }

  return (
    <div
      id="cv-management-container"
      className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-800/80"
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Resume / CV Management
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Upload, replace, and manage your official PDF resume document.
            </p>
          </div>

          {/* Status Badge */}
          <div>
            {cvData ? (
              <span
                id="cv-status-badge"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Active & Ready</span>
              </span>
            ) : (
              <span
                id="cv-status-badge-empty"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 border border-slate-700 text-slate-400"
              >
                <span>No CV Uploaded</span>
              </span>
            )}
          </div>
        </div>

        {/* Global Feedback Messages */}
        {successMessage && (
          <div
            id="cv-success-alert"
            className="mt-4 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-start gap-3 text-xs sm:text-sm text-cyan-300"
          >
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {errorMessage && (
          <div
            id="cv-error-alert"
            className="mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 flex items-start gap-3 text-xs sm:text-sm text-red-300"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        id="cv-file-input"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={onFileInputChange}
      />

      {/* Uploading Progress Bar Banner */}
      {isUploading && (
        <div id="cv-upload-progress-banner" className="p-5 bg-slate-950/80">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="flex items-center gap-2 font-medium">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Uploading CV to secure storage...</span>
            </span>
            <span className="font-mono text-cyan-400 font-semibold">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="p-6 space-y-6">
        {cvData ? (
          /* Currently Uploaded CV Card */
          <div
            id="current-cv-card"
            className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/30 transition-colors space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0 mt-0.5">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
                    Current Document
                  </span>
                  <h3
                    id="cv-current-filename"
                    className="text-base font-semibold text-slate-100 break-all"
                  >
                    {cvData.fileName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatFileSize(cvData.fileSize)}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Uploaded {formatDate(cvData.uploadedAt)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 sm:pt-0">
                {/* View / Open PDF */}
                <a
                  id="cv-view-pdf-link"
                  href={cvData.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium transition-colors border border-slate-700 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Preview PDF</span>
                </a>

                {/* Replace CV Button */}
                <button
                  id="cv-replace-btn"
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-cyan-950/20 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                  <span>Replace CV</span>
                </button>

                {/* Delete CV Button */}
                <button
                  id="cv-delete-btn"
                  type="button"
                  disabled={isUploading || isDeleting}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-950/50 text-slate-400 hover:text-red-300 text-xs font-medium transition-colors border border-slate-700 hover:border-red-800/60 cursor-pointer"
                  title="Remove CV"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Remove</span>
                </button>
              </div>
            </div>

            {/* Confirm Delete Banner */}
            {showDeleteConfirm && (
              <div
                id="cv-delete-confirm-box"
                className="mt-3 p-4 rounded-xl bg-red-950/30 border border-red-800/60 space-y-3"
              >
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Remove Current Resume?</span>
                    <span className="text-slate-400 text-xs">
                      This will remove the current CV reference. You will be able to upload a new one at any time.
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    id="cv-cancel-delete-btn"
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="cv-confirm-delete-btn"
                    type="button"
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isDeleting && <Loader2 className="w-3 h-3 animate-spin" />}
                    <span>Confirm Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State: Upload Box */
          <div
            id="cv-dropzone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-cyan-500 bg-cyan-500/10 scale-[0.99]'
                : 'border-slate-800 hover:border-cyan-500/40 bg-slate-950/40 hover:bg-slate-950/70'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400 shadow-inner">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-200">
                  Click or drag and drop your PDF resume
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Upload your CV in standard PDF format (up to 15MB). The document will be securely stored and linked to your portfolio.
                </p>
              </div>
              <button
                id="cv-browse-files-btn"
                type="button"
                disabled={isUploading}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Select PDF Document</span>
              </button>
            </div>
          </div>
        )}

        {/* Informational Guidance Note */}
        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400 space-y-1">
          <span className="font-semibold text-slate-300 block">Resume Storage & Format Note</span>
          <p className="leading-relaxed">
            Uploaded resumes are stored in Cloudinary with metadata recorded in Firestore. Only valid PDF files up to 15MB are accepted. Replacing an existing CV automatically updates the active reference.
          </p>
        </div>
      </div>
    </div>
  );
};

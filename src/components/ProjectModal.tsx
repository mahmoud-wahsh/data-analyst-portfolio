import React, { useEffect, useState } from 'react';
import {
  X,
  CheckCircle2,
  Wrench,
  Sparkles,
  Images,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FileText,
  Target,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { ProjectItem } from '../types';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState<number>(0);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Reset screenshot index when project changes
  useEffect(() => {
    setActiveScreenshotIdx(0);
    setLightboxUrl(null);
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxUrl) {
          setLightboxUrl(null);
        } else {
          onClose();
        }
      } else if (project?.screenshots && project.screenshots.length > 1) {
        if (e.key === 'ArrowLeft') {
          setActiveScreenshotIdx((prev) =>
            prev === 0 ? project.screenshots!.length - 1 : prev - 1
          );
        } else if (e.key === 'ArrowRight') {
          setActiveScreenshotIdx((prev) =>
            prev === project.screenshots!.length - 1 ? 0 : prev + 1
          );
        }
      }
    };

    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose, lightboxUrl]);

  if (!project) return null;

  const screenshots = project.screenshots || [];
  const hasScreenshots = screenshots.length > 0;
  const currentScreenshot = hasScreenshots ? screenshots[activeScreenshotIdx] || screenshots[0] : null;

  return (
    <>
      <div
        id="project-detail-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-3xl max-h-[90vh] bg-zinc-900 border border-zinc-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                {project.category || 'Project Overview'}
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {project.title}
              </h3>
            </div>
            <button
              id="close-modal-btn"
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Project Thumbnail Image (Separate from Screenshots) */}
          {project.imageUrl && (
            <div className="mb-6 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/60 max-h-64 sm:max-h-72 flex items-center justify-center">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Description (Short summary if present and distinct from detailedDescription) */}
          {project.description && (!project.detailedDescription?.trim() || project.description.trim() !== project.detailedDescription.trim()) && (
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6">
              {project.description}
            </p>
          )}

          {/* Detailed Description -> Project Overview */}
          {project.detailedDescription?.trim() && (
            <div className="mb-6">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Project Overview</span>
              </div>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {project.detailedDescription.trim()}
              </p>
            </div>
          )}

          {/* Objective */}
          {project.objective?.trim() && (
            <div className="mb-6">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Objective</span>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                {project.objective.trim()}
              </p>
            </div>
          )}

          {/* Tools used */}
          <div className="mb-6">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
              <Wrench className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tools & Technologies</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.tools.map((tool) => (
                <span
                  key={tool}
                  className="px-3 py-1 text-xs font-medium rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Analysis */}
          {project.analysis?.trim() && (
            <div className="mb-6">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Analysis</span>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                {project.analysis.trim()}
              </p>
            </div>
          )}

          {/* Highlights */}
          {project.highlights && project.highlights.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
                Key Methodology & Deliverables
              </h4>
              <ul className="space-y-2">
                {project.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Insights */}
          {(project.keyInsights?.trim() || project.keyInsight?.trim()) && (
            <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-start gap-3 mb-6">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="w-full">
                <span className="text-xs font-semibold text-emerald-400 uppercase block tracking-wider mb-1">
                  Key Insights
                </span>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                  {project.keyInsights?.trim() || project.keyInsight?.trim()}
                </p>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {project.recommendations?.trim() && (
            <div className="mb-6">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Recommendations</span>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                {project.recommendations.trim()}
              </p>
            </div>
          )}

          {/* Project Screenshots Gallery */}
          {hasScreenshots && (
            <div id="project-screenshots-gallery" className="mb-6 pt-5 border-t border-zinc-800/80">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Images className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Project Screenshots & Visual Gallery
                  </h4>
                </div>
                <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2.5 py-0.5 rounded-md border border-zinc-800">
                  {activeScreenshotIdx + 1} of {screenshots.length}
                </span>
              </div>

              {/* Active Screenshot Display with Previous/Next Controls */}
              {currentScreenshot && (
                <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/90 group mb-3 shadow-md">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setLightboxUrl(currentScreenshot)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setLightboxUrl(currentScreenshot);
                    }}
                    title="Click to view full resolution"
                    className="w-full flex items-center justify-center cursor-zoom-in max-h-96 min-h-60 overflow-hidden bg-zinc-950"
                  >
                    <img
                      id="active-project-screenshot"
                      src={currentScreenshot}
                      alt={`${project.title} screenshot ${activeScreenshotIdx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>

                  {/* Expand Lightbox Button */}
                  <button
                    type="button"
                    id="expand-screenshot-btn"
                    onClick={() => setLightboxUrl(currentScreenshot)}
                    title="View high resolution"
                    className="absolute top-3 right-3 p-2 rounded-lg bg-black/70 hover:bg-black/90 text-zinc-300 hover:text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-xs"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  {/* Previous / Next buttons if multiple screenshots */}
                  {screenshots.length > 1 && (
                    <>
                      <button
                        type="button"
                        id="prev-screenshot-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveScreenshotIdx((prev) =>
                            prev === 0 ? screenshots.length - 1 : prev - 1
                          );
                        }}
                        aria-label="Previous screenshot"
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/80 transition-all opacity-80 hover:opacity-100 shadow-lg"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        id="next-screenshot-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveScreenshotIdx((prev) =>
                            prev === screenshots.length - 1 ? 0 : prev + 1
                          );
                        }}
                        aria-label="Next screenshot"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/80 transition-all opacity-80 hover:opacity-100 shadow-lg"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Thumbnails row / strip if more than 1 screenshot */}
              {screenshots.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {screenshots.map((url, idx) => {
                    const isActive = idx === activeScreenshotIdx;
                    return (
                      <button
                        key={`${url}-${idx}`}
                        type="button"
                        id={`gallery-thumb-btn-${idx}`}
                        onClick={() => setActiveScreenshotIdx(idx)}
                        className={`relative rounded-lg overflow-hidden border aspect-video transition-all ${
                          isActive
                            ? 'border-emerald-400 ring-2 ring-emerald-400/40 opacity-100 scale-98'
                            : 'border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-700'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-3 border-t border-zinc-800">
            <button
              id="modal-dismiss-btn"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors"
            >
              Close Overview
            </button>
          </div>
        </div>
      </div>

      {/* Full-screen high-resolution lightbox if user clicks to inspect a screenshot */}
      {lightboxUrl && (
        <div
          id="screenshot-lightbox-overlay"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            id="close-lightbox-btn"
            onClick={() => setLightboxUrl(null)}
            aria-label="Close high-res view"
            className="absolute top-4 right-4 p-2.5 rounded-full bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="max-w-5xl max-h-[92vh] flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxUrl}
              alt="High resolution screenshot"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[92vh] object-contain rounded-xl border border-zinc-800 shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};

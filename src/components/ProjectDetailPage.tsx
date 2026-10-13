import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2,
  Images,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Target,
  BarChart3,
  TrendingUp,
  Tag,
  AlertCircle,
  FolderGit2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectItem } from '../types';
import { getOriginalImageUrl, getProjectSlug } from '../utils/projectUtils';

interface ProjectDetailPageProps {
  project: ProjectItem | null;
  slug: string;
  allProjects?: ProjectItem[];
  onBackToProjects: () => void;
  onNavigateToProject?: (slug: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  project,
  slug,
  allProjects = [],
  onBackToProjects,
  onNavigateToProject,
}) => {
  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState<number>(0);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Reset screenshot state on project change
  useEffect(() => {
    setActiveScreenshotIdx(0);
    setLightboxUrl(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [project, slug]);

  // Handle keyboard events for screenshot navigation and lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxUrl) {
          setLightboxUrl(null);
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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, lightboxUrl]);

  // Lock body scroll only when lightbox modal is open
  useEffect(() => {
    if (lightboxUrl) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [lightboxUrl]);

  // 1. Not Found State: when project URL doesn't match any project
  if (!project) {
    const otherProjects = allProjects.filter((p) => p.published !== false);

    return (
      <div
        id="project-not-found-page"
        className="min-h-screen py-16 px-4 sm:px-6 max-w-4xl mx-auto flex flex-col justify-center"
      >
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center shadow-xl">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-5">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Project Not Found
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto mb-6 leading-relaxed">
            The project at <code className="text-cyan-300 bg-slate-950 px-2 py-0.5 rounded font-mono text-xs">/projects/{slug}</code> could not be found or may have been unpublished.
          </p>

          <button
            id="back-to-projects-btn-404"
            type="button"
            onClick={onBackToProjects}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold transition-all shadow-lg shadow-cyan-950/40 cursor-pointer mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </button>

          {otherProjects.length > 0 && (
            <div className="pt-8 border-t border-slate-800/80 text-left">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Explore Available Analytics Projects:
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {otherProjects.map((p) => {
                  const pSlug = getProjectSlug(p);
                  return (
                    <button
                      key={p.id || p.title}
                      type="button"
                      onClick={() => {
                        if (onNavigateToProject) {
                          onNavigateToProject(pSlug);
                        } else {
                          window.history.pushState(null, '', `/projects/${pSlug}`);
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }
                      }}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group cursor-pointer"
                    >
                      <span className="text-xs text-cyan-400 font-mono block mb-1">
                        {p.category || 'Data Analytics'}
                      </span>
                      <span className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors block">
                        {p.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Found Project Detail View
  const screenshots = (project.screenshots || []).filter((s) => Boolean(s && s.trim()));
  const hasScreenshots = screenshots.length > 0;
  const currentScreenshot = hasScreenshots ? screenshots[activeScreenshotIdx] || screenshots[0] : null;

  // Determine overview content
  const hasDetailedDesc = Boolean(project.detailedDescription?.trim());
  const hasShortDesc = Boolean(project.description?.trim());
  const isDetailedDifferent =
    hasDetailedDesc && (!hasShortDesc || project.detailedDescription?.trim() !== project.description?.trim());

  // Check for external links
  const hasGithub = Boolean(project.githubUrl && project.githubUrl.trim());
  const hasLive = Boolean(project.liveUrl && project.liveUrl.trim());

  // Check for other optional sections
  const hasObjective = Boolean(project.objective?.trim());
  const hasAnalysis = Boolean(project.analysis?.trim());
  const hasHighlights = Boolean(project.highlights && project.highlights.length > 0);
  const keyInsightsText = project.keyInsights?.trim() || project.keyInsight?.trim() || '';
  const hasKeyInsights = Boolean(keyInsightsText);
  const hasRecommendations = Boolean(project.recommendations?.trim());

  return (
    <article
      id="project-detail-page"
      className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 max-w-5xl mx-auto"
    >
      {/* Top Navigation & Breadcrumb Bar */}
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80"
      >
        <button
          id="back-to-projects-top-btn"
          type="button"
          onClick={onBackToProjects}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 hover:text-cyan-300 text-slate-300 text-sm font-medium transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Projects</span>
        </button>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <button
            type="button"
            onClick={onBackToProjects}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Projects
          </button>
          <span>/</span>
          {project.category && (
            <>
              <span className="text-slate-400 hidden sm:inline">{project.category}</span>
              <span className="hidden sm:inline">/</span>
            </>
          )}
          <span className="text-cyan-300 truncate max-w-[200px] sm:max-w-[320px]">
            {project.title}
          </span>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="mb-10">
        {project.category && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900/90 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Tag className="w-3.5 h-3.5" />
            <span>{project.category}</span>
          </div>
        )}

        <h1
          id="project-detail-title"
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4"
        >
          {project.title}
        </h1>

        {/* Short Summary Description */}
        {hasShortDesc && (
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-4xl mb-6">
            {project.description}
          </p>
        )}

        {/* External Links: GitHub & Live Demo (Rendered ONLY if data exists) */}
        {(hasGithub || hasLive) && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {hasGithub && (
              <a
                id="project-github-link"
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/40 text-slate-200 hover:text-white text-xs sm:text-sm font-medium transition-colors shadow-sm"
              >
                <FolderGit2 className="w-4 h-4 text-cyan-400" />
                <span>View on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}

            {hasLive && (
              <a
                id="project-live-link"
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs sm:text-sm font-semibold transition-colors shadow-lg shadow-cyan-950/40"
              >
                <span>Live Project / Dashboard</span>
                <ExternalLink className="w-4 h-4 text-slate-950" />
              </a>
            )}
          </div>
        )}

        {/* Tools and Technologies Metadata Bar */}
        {project.tools && project.tools.length > 0 && (
          <div
            id="project-tools-bar"
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center gap-2.5"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Tools Used:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.tools.map((tool) => (
                <span
                  key={tool}
                  className="px-3 py-1 rounded-md bg-slate-950/90 border border-slate-800 text-slate-200 text-xs font-medium font-mono"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Featured Cover / Image (Only if present) */}
      {project.imageUrl && (
        <section
          aria-label="Project Preview"
          className="mb-12 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 shadow-2xl"
        >
          <img
            src={getOriginalImageUrl(project.imageUrl)}
            alt={project.title}
            className="w-full max-h-[500px] object-contain mx-auto"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </section>
      )}

      {/* Main Content Sections (Rendered ONLY if data exists) */}
      <div className="space-y-10">
        {/* Section: Detailed Overview */}
        {isDetailedDifferent && (
          <section id="project-overview-section" className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h2>Overview</h2>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {project.detailedDescription!.trim()}
            </div>
          </section>
        )}

        {/* Section: Objective */}
        {hasObjective && (
          <section id="project-objective-section" className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Target className="w-4 h-4 text-cyan-400" />
              <h2>Objective & Business Problem</h2>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {project.objective!.trim()}
            </div>
          </section>
        )}

        {/* Section: Analysis & Methodology */}
        {hasAnalysis && (
          <section id="project-analysis-section" className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <h2>Analysis & Analytical Approach</h2>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {project.analysis!.trim()}
            </div>
          </section>
        )}

        {/* Section: Key Methodology / Highlights */}
        {hasHighlights && (
          <section id="project-highlights-section" className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <h2>Key Methodology & Deliverables</h2>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <ul className="space-y-3">
                {project.highlights!.map((highlight, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm sm:text-base text-slate-300 leading-relaxed"
                  >
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Section: Key Insights */}
        {hasKeyInsights && (
          <section id="project-key-insights-section" className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2>Key Insights</h2>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/30 text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line shadow-lg shadow-cyan-950/20">
              {keyInsightsText}
            </div>
          </section>
        )}

        {/* Section: Recommendations */}
        {hasRecommendations && (
          <section id="project-recommendations-section" className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h2>Strategic Recommendations</h2>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {project.recommendations!.trim()}
            </div>
          </section>
        )}

        {/* Section: Screenshots & Visual Gallery (Rendered ONLY if screenshots exist) */}
        {hasScreenshots && (
          <section
            id="project-screenshots-section"
            className="space-y-4 pt-6 border-t border-slate-800/80"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Images className="w-4 h-4 text-cyan-400" />
                <h2>Screenshots & Visual Reports</h2>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                {activeScreenshotIdx + 1} of {screenshots.length}
              </span>
            </div>

            {/* Active Screenshot Display with Previous/Next Controls */}
            {currentScreenshot && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/90 group shadow-xl">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setLightboxUrl(currentScreenshot)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setLightboxUrl(currentScreenshot);
                  }}
                  title="Click to view full resolution"
                  className="w-full flex items-center justify-center cursor-zoom-in max-h-[520px] min-h-64 overflow-hidden bg-slate-950"
                >
                  <img
                    id="active-project-screenshot"
                    src={getOriginalImageUrl(currentScreenshot)}
                    alt={`${project.title} screenshot ${activeScreenshotIdx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto max-h-[520px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                </div>

                {/* Expand Lightbox Button */}
                <button
                  type="button"
                  id="expand-screenshot-btn"
                  onClick={() => setLightboxUrl(currentScreenshot)}
                  title="View full resolution"
                  className="absolute top-3.5 right-3.5 p-2 rounded-lg bg-black/70 hover:bg-black/90 text-slate-300 hover:text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-xs cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Navigation arrows if multiple screenshots */}
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition-all opacity-80 hover:opacity-100 shadow-lg cursor-pointer"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition-all opacity-80 hover:opacity-100 shadow-lg cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Thumbnails Row if multiple screenshots */}
            {screenshots.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-2">
                {screenshots.map((url, idx) => {
                  const isActive = idx === activeScreenshotIdx;
                  return (
                    <button
                      key={`${url}-${idx}`}
                      type="button"
                      id={`gallery-thumb-btn-${idx}`}
                      onClick={() => setActiveScreenshotIdx(idx)}
                      className={`relative rounded-lg overflow-hidden border aspect-video transition-all cursor-pointer ${
                        isActive
                          ? 'border-cyan-400 ring-2 ring-cyan-400/40 opacity-100 scale-98'
                          : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={getOriginalImageUrl(url)}
                        alt={`Screenshot ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Bottom Navigation CTA */}
      <footer className="mt-16 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          id="back-to-projects-bottom-btn"
          type="button"
          onClick={onBackToProjects}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 hover:text-cyan-300 text-slate-200 text-sm font-medium transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to All Projects</span>
        </button>

        <span className="text-xs text-slate-500 font-mono">
          Case Study: {project.title}
        </span>
      </footer>

      {/* Lightbox for full-resolution screenshot inspection */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            id="screenshot-lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
            onClick={() => setLightboxUrl(null)}
          >
            <button
              type="button"
              id="close-lightbox-btn"
              onClick={() => setLightboxUrl(null)}
              aria-label="Close high-res view"
              className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="max-w-6xl max-h-[92vh] flex items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getOriginalImageUrl(lightboxUrl)}
                alt="High resolution screenshot"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[92vh] object-contain rounded-xl border border-slate-800 shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
};

import React, { useState, useEffect } from 'react';
import { ArrowRight, Mail, FolderGit2, CheckCircle2, FileText, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { ProfileData, CvData } from '../types';
import { subscribeCv } from '../services/cvService';

interface HomeSectionProps {
  onNavigate: (sectionId: string) => void;
  profile?: ProfileData | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  onNavigate,
  profile,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const [cvData, setCvData] = useState<CvData | null>(null);

  // Subscribe to real-time CV updates from Firestore
  useEffect(() => {
    const unsubscribe = subscribeCv((cv) => {
      setCvData(cv);
    });
    return () => unsubscribe();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.11,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  // Clean error / fallback state if Firestore profile data fails to load
  if (error && !profile) {
    return (
      <section
        id="home"
        aria-label="Profile load error"
        className="min-h-[88vh] flex flex-col justify-center pt-28 pb-16 px-4 sm:px-6 max-w-6xl mx-auto"
      >
        <div className="max-w-xl">
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 shadow-2xl backdrop-blur-xs">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="font-semibold text-white text-base">Unable to load profile data</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              We were unable to retrieve the latest profile information. Please check your network connection and try again.
            </p>
            {onRetry && (
              <button
                type="button"
                id="hero-retry-profile-btn"
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-100 text-xs font-medium transition-colors border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Retry Loading</span>
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Proper loading state: wait for Firestore profile data to finish loading before rendering profile-dependent content
  if (isLoading || !profile) {
    return (
      <section
        id="home"
        aria-busy="true"
        aria-label="Loading profile"
        className="min-h-[88vh] flex flex-col justify-center pt-28 pb-16 px-4 sm:px-6 max-w-6xl mx-auto"
      >
        <div className="max-w-3xl">
          {/* Role Pill Skeleton */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400/40 animate-pulse" />
            <div className="h-3 w-48 bg-slate-800 rounded animate-pulse" />
          </div>

          {/* Name & Title Skeleton */}
          <div className="h-10 sm:h-12 md:h-14 w-64 sm:w-80 bg-slate-900/90 border border-slate-800/80 rounded-lg animate-pulse mb-3" />
          <div className="h-6 sm:h-7 w-40 sm:w-48 bg-slate-900/70 border border-slate-800/50 rounded-md animate-pulse mb-6" />

          {/* Short introduction / Headline Skeleton */}
          <div className="space-y-2.5 mb-8 max-w-2xl py-1">
            <div className="h-4 bg-slate-900 rounded animate-pulse w-full" />
            <div className="h-4 bg-slate-900 rounded animate-pulse w-11/12" />
            <div className="h-4 bg-slate-900 rounded animate-pulse w-4/5" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <button
              id="home-view-projects-btn"
              onClick={() => onNavigate('projects')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-slate-100 text-slate-950 font-medium text-sm hover:bg-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 cursor-pointer"
            >
              <FolderGit2 className="w-4 h-4" />
              <span>View Projects</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {cvData?.fileUrl && (
              <a
                id="home-view-cv-btn"
                href={cvData.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-200 font-medium text-sm hover:bg-slate-800 hover:border-cyan-500/40 hover:text-cyan-300 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/40 shadow-sm"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>View CV</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}

            <button
              id="home-contact-btn"
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-200 font-medium text-sm hover:bg-slate-800 hover:border-cyan-500/40 hover:text-cyan-300 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>Contact Me</span>
            </button>
          </div>

          {/* Quick Highlights / Proof Points */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2.5 text-slate-400 text-sm">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>SQL & Relational Modeling</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-400 text-sm">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Power BI & Tableau Reporting</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-400 text-sm">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Python & Spreadsheet Analytics</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="home"
      className="min-h-[88vh] flex flex-col justify-center pt-28 pb-16 px-4 sm:px-6 max-w-6xl mx-auto"
    >
      <motion.div
        className="max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Role Pill / Availability Badge */}
        {profile.availabilityText && profile.availabilityText.trim().length > 0 && (
          <motion.div
            variants={itemVariants}
            id="hero-availability-badge"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/20 text-slate-300 text-xs font-medium mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{profile.availabilityText}</span>
          </motion.div>
        )}

        {/* Name & Title */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-3"
        >
          {profile.fullName}
        </motion.h1>
        
        <motion.div
          variants={itemVariants}
          className="text-xl sm:text-2xl font-semibold text-cyan-400 tracking-tight mb-6"
        >
          {profile.professionalTitle}
        </motion.div>

        {/* Short introduction / Headline */}
        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl"
        >
          {profile.headline}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center gap-4 mb-12"
        >
          <motion.button
            id="home-view-projects-btn"
            onClick={() => onNavigate('projects')}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-slate-100 text-slate-950 font-medium text-sm hover:bg-white hover:text-slate-900 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 cursor-pointer"
          >
            <FolderGit2 className="w-4 h-4" />
            <span>View Projects</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          {cvData?.fileUrl && (
            <motion.a
              id="home-view-cv-btn"
              href={cvData.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-200 font-medium text-sm hover:bg-slate-800 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/40 shadow-sm"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>View CV</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </motion.a>
          )}

          <motion.button
            id="home-contact-btn"
            onClick={() => onNavigate('contact')}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-200 font-medium text-sm hover:bg-slate-800 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
          >
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>Contact Me</span>
          </motion.button>
        </motion.div>

        {/* Quick Highlights / Proof Points */}
        <motion.div
          variants={itemVariants}
          className="pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="flex items-center gap-2.5 text-slate-400 text-sm">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>SQL & Relational Modeling</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400 text-sm">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Power BI & Tableau Reporting</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400 text-sm">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Python & Spreadsheet Analytics</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

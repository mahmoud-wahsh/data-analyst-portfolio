import React, { useState, useEffect } from 'react';
import { ArrowRight, Mail, FolderGit2, CheckCircle2, FileText, ExternalLink } from 'lucide-react';
import { ProfileData, CvData } from '../types';
import { INITIAL_PROFILE_DATA } from '../services/profileService';
import { subscribeCv } from '../services/cvService';

interface HomeSectionProps {
  onNavigate: (sectionId: string) => void;
  profile?: ProfileData;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  onNavigate,
  profile = INITIAL_PROFILE_DATA,
}) => {
  const [cvData, setCvData] = useState<CvData | null>(null);

  // Subscribe to real-time CV updates from Firestore
  useEffect(() => {
    const unsubscribe = subscribeCv((cv) => {
      setCvData(cv);
    });
    return () => unsubscribe();
  }, []);

  return (
    <section
      id="home"
      className="min-h-[88vh] flex flex-col justify-center pt-28 pb-16 px-4 sm:px-6 max-w-6xl mx-auto"
    >
      <div className="max-w-3xl">
        {/* Role Pill / Availability Badge */}
        {profile.availabilityText && profile.availabilityText.trim().length > 0 && (
          <div
            id="hero-availability-badge"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{profile.availabilityText}</span>
          </div>
        )}

        {/* Name & Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-3">
          {profile.fullName}
        </h1>
        
        <div className="text-xl sm:text-2xl font-semibold text-emerald-400 tracking-tight mb-6">
          {profile.professionalTitle}
        </div>

        {/* Short introduction / Headline */}
        <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-8 max-w-2xl">
          {profile.headline}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 mb-12">
          <button
            id="home-view-projects-btn"
            onClick={() => onNavigate('projects')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-zinc-100 text-zinc-950 font-medium text-sm hover:bg-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
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
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 font-medium text-sm hover:bg-zinc-800 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-zinc-700 shadow-sm"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>View CV</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </a>
          )}

          <button
            id="home-contact-btn"
            onClick={() => onNavigate('contact')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 font-medium text-sm hover:bg-zinc-800 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-zinc-700"
          >
            <Mail className="w-4 h-4 text-emerald-400" />
            <span>Contact Me</span>
          </button>
        </div>

        {/* Quick Highlights / Proof Points */}
        <div className="pt-6 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2.5 text-zinc-400 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>SQL & Relational Modeling</span>
          </div>
          <div className="flex items-center gap-2.5 text-zinc-400 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Power BI & Tableau Reporting</span>
          </div>
          <div className="flex items-center gap-2.5 text-zinc-400 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Python & Spreadsheet Analytics</span>
          </div>
        </div>
      </div>
    </section>
  );
};

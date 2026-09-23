import React from 'react';
import { ArrowUp } from 'lucide-react';
import { NAV_ITEMS } from '../data/portfolioData';
import { ProfileData } from '../types';
import { INITIAL_PROFILE_DATA } from '../services/profileService';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onAdminClick?: () => void;
  profile?: ProfileData | null;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onAdminClick,
  profile,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          {profile?.fullName ? (
            <>
              <div className="text-sm font-semibold text-slate-200">{profile.fullName}</div>
              <p className="text-xs text-slate-400 mt-0.5">
                {profile.professionalTitle} Portfolio
              </p>
            </>
          ) : (
            <div className="space-y-1.5 py-0.5">
              <div className="h-4 w-28 bg-slate-900 border border-slate-800/80 rounded animate-pulse" />
              <div className="h-3 w-36 bg-slate-900 border border-slate-800/50 rounded animate-pulse" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
          {onAdminClick && (
            <button
              id="footer-admin-link"
              onClick={onAdminClick}
              className="hover:text-cyan-300 text-slate-500 transition-colors cursor-pointer"
            >
              Admin Login
            </button>
          )}
        </div>

        <button
          id="scroll-to-top-btn"
          onClick={scrollToTop}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 text-xs font-medium transition-colors cursor-pointer"
        >
          <span>Top</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};

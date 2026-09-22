import React from 'react';
import { ArrowUp } from 'lucide-react';
import { NAV_ITEMS } from '../data/portfolioData';
import { ProfileData } from '../types';
import { INITIAL_PROFILE_DATA } from '../services/profileService';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onAdminClick?: () => void;
  profile?: ProfileData;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onAdminClick,
  profile = INITIAL_PROFILE_DATA,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="text-sm font-semibold text-zinc-200">{profile.fullName}</div>
          <p className="text-xs text-zinc-400 mt-0.5">
            {profile.professionalTitle} Portfolio
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-400">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="hover:text-zinc-200 transition-colors"
            >
              {item.label}
            </button>
          ))}
          {onAdminClick && (
            <button
              id="footer-admin-link"
              onClick={onAdminClick}
              className="hover:text-zinc-200 text-zinc-500 transition-colors"
            >
              Admin Login
            </button>
          )}
        </div>

        <button
          id="scroll-to-top-btn"
          onClick={scrollToTop}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 text-xs font-medium transition-colors"
        >
          <span>Top</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};

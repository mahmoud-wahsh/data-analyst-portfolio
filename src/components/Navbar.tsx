import React, { useState, useEffect } from 'react';
import { Menu, X, User } from 'lucide-react';
import { NAV_ITEMS } from '../data/portfolioData';
import { ProfileData } from '../types';
import { INITIAL_PROFILE_DATA } from '../services/profileService';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  profile?: ProfileData | null;
  isAuthenticated?: boolean;
  onProfileClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  profile,
  isAuthenticated = false,
  onProfileClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Reset image error state whenever profileImageUrl changes
  useEffect(() => {
    setImageError(false);
  }, [profile?.profileImageUrl]);

  // Handle escape key and body overflow for profile photo lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isViewerOpen) {
        setIsViewerOpen(false);
      }
    };

    if (isViewerOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isViewerOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <>
      <header
        id="main-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 py-3 shadow-lg shadow-black/30'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Brand / Logo */}
          <div className="flex items-center gap-2.5">
            <button
              id="navbar-profile-image-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (profile?.profileImageUrl && !imageError) {
                  setIsViewerOpen(true);
                } else {
                  handleLinkClick('home');
                }
              }}
              title={profile?.profileImageUrl && !imageError ? 'View profile photo' : undefined}
              aria-label={profile?.profileImageUrl && !imageError ? 'View profile photo' : 'Go to home'}
              className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-750 flex items-center justify-center text-slate-100 group hover:border-cyan-400/80 hover:ring-2 hover:ring-cyan-500/25 transition-all overflow-hidden shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {profile?.profileImageUrl && !imageError ? (
                <img
                  id="navbar-profile-image"
                  src={profile.profileImageUrl}
                  alt={profile.fullName || 'Profile'}
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
                />
              ) : (
                <User id="navbar-profile-placeholder" className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <button
              id="brand-logo-btn"
              type="button"
              onClick={() => handleLinkClick('home')}
              className="text-left group focus:outline-none cursor-pointer"
            >
              {profile?.fullName ? (
                <>
                  <span className="font-semibold text-slate-100 tracking-tight text-base block group-hover:text-cyan-300 transition-colors">
                    {profile.fullName}
                  </span>
                  <span className="text-xs text-slate-400 block tracking-normal">
                    {profile.professionalTitle}
                  </span>
                </>
              ) : (
                <div className="space-y-1.5 py-0.5">
                  <div className="h-4 w-28 bg-slate-900 border border-slate-800/80 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-slate-900 border border-slate-800/50 rounded animate-pulse" />
                </div>
              )}
            </button>
          </div>

        {/* Desktop Navigation */}
        <nav id="desktop-nav" aria-label="Main Navigation" className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleLinkClick(item.id)}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ease-out active:scale-97 cursor-pointer ${
                  isActive
                    ? 'text-white bg-slate-850 border border-cyan-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Profile Navigation Button (Visible only when authenticated) */}
          {isAuthenticated && onProfileClick && (
            <button
              id="nav-link-profile"
              onClick={() => {
                onProfileClick();
                setIsOpen(false);
              }}
              className="ml-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all duration-200 active:scale-97 flex items-center gap-1.5 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            id="mobile-menu-toggle-btn"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 focus:outline-none transition-all duration-200 active:scale-95 cursor-pointer"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div
          id="mobile-nav-menu"
          className="md:hidden bg-[#090d16]/95 border-b border-slate-800 backdrop-blur-xl px-4 pt-3 pb-5 space-y-1 shadow-2xl"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-link-${item.id}`}
                onClick={() => handleLinkClick(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-base font-medium transition-all duration-200 active:scale-98 cursor-pointer ${
                  isActive
                    ? 'bg-slate-850 text-white border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Profile Navigation Button in Mobile Dropdown (Visible only when authenticated) */}
          {isAuthenticated && onProfileClick && (
            <button
              id="mobile-nav-link-profile"
              onClick={() => {
                onProfileClick();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-lg text-base font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all duration-200 active:scale-98 flex items-center gap-2 mt-2 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          )}
        </div>
      )}
    </header>

    {/* Lightbox / Modal for Profile Image (Instagram / WhatsApp Style) */}
    {isViewerOpen && profile?.profileImageUrl && (
      <div
        id="profile-image-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Profile Photo Viewer"
        onClick={() => setIsViewerOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm"
      >
        {/* Close Button */}
        <button
          id="close-profile-viewer-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsViewerOpen(false);
          }}
          aria-label="Close profile photo"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-2xl cursor-pointer"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Modal Container */}
        <div
          id="profile-image-modal-content"
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center max-w-sm sm:max-w-md w-full"
        >
          {/* Circular Profile Photo Frame */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-slate-900 ring-4 ring-slate-800/80 flex items-center justify-center shrink-0">
            <img
              id="modal-profile-image"
              src={profile.profileImageUrl}
              alt={profile.fullName || 'Profile'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Profile Name & Title */}
          <div className="mt-4 sm:mt-5 text-center px-4">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {profile?.fullName || ''}
            </h3>
            <p className="text-xs sm:text-sm text-cyan-400 font-medium mt-0.5">
              {profile?.professionalTitle || ''}
            </p>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

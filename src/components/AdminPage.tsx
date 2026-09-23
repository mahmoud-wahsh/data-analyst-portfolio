import React, { useState } from 'react';
import { User, signOut } from 'firebase/auth';
import { LogOut, ArrowLeft, Shield, User as UserIcon, Layers, Briefcase, FileText } from 'lucide-react';
import { auth } from '../firebase';
import { ProfileManagement } from './ProfileManagement';
import { SkillsManagement } from './SkillsManagement';
import { ProjectsManagement } from './ProjectsManagement';
import { CvManagement } from './CvManagement';

interface AdminPageProps {
  user: User;
  onBackToPortfolio: () => void;
  onLogout: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  user,
  onBackToPortfolio,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'projects' | 'resume'>('profile');

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Admin Top Navigation Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              id="admin-back-to-portfolio-btn"
              onClick={onBackToPortfolio}
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-cyan-300 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-slate-800/60 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portfolio</span>
            </button>
            <span className="h-4 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Area</span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block leading-tight">Signed in as</span>
              <span className="text-xs text-slate-300 font-medium truncate max-w-[200px] block">
                {user.email}
              </span>
            </div>
            <button
              id="admin-logout-btn"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 text-xs font-medium transition-colors border border-slate-700 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/60 border border-slate-800 w-fit max-w-full overflow-x-auto">
          <button
            id="admin-tab-profile"
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <UserIcon className="w-4 h-4 text-cyan-400" />
            <span>Profile</span>
          </button>
          <button
            id="admin-tab-skills"
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'skills'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Skills</span>
          </button>
          <button
            id="admin-tab-projects"
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Briefcase className="w-4 h-4 text-cyan-400" />
            <span>Projects</span>
          </button>
          <button
            id="admin-tab-resume"
            type="button"
            onClick={() => setActiveTab('resume')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'resume'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Resume / CV</span>
          </button>
        </div>

        {/* Dynamic Admin View */}
        <main>
          {activeTab === 'profile' && <ProfileManagement />}
          {activeTab === 'skills' && <SkillsManagement />}
          {activeTab === 'projects' && <ProjectsManagement />}
          {activeTab === 'resume' && <CvManagement />}
        </main>
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { auth } from './firebase';
import { Navbar } from './components/Navbar';
import { HomeSection } from './components/HomeSection';
import { AboutSection } from './components/AboutSection';
import { SkillsSection } from './components/SkillsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ProjectDetailPage } from './components/ProjectDetailPage';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/AdminLogin';
import { AdminPage } from './components/AdminPage';
import { ProfileData, ProjectItem } from './types';
import { subscribeProfile } from './services/profileService';
import { subscribePublishedProjects, INITIAL_PROJECTS } from './services/projectsService';
import { findProjectBySlug, getProjectSlug } from './utils/projectUtils';

const EMPTY_PROFILE_PLACEHOLDER: ProfileData = {
  fullName: '',
  professionalTitle: '',
  headline: '',
  about: '',
  email: '',
  whatsapp: '',
  linkedin: '',
  github: '',
  availabilityText: '',
  profileImageUrl: '',
};

type RouteState =
  | { type: 'portfolio' }
  | { type: 'project-detail'; slug: string }
  | { type: 'login' }
  | { type: 'admin' };

function parseCurrentRoute(): RouteState {
  const path = window.location.pathname;
  const hash = window.location.hash.toLowerCase();

  if (path === '/admin' || hash === '#admin') return { type: 'admin' };
  if (path === '/login' || hash === '#login') return { type: 'login' };

  // Match /projects/:slug pattern in clean URL pathname
  const projectPathMatch = path.match(/^\/projects\/([^/?#]+)/i);
  if (projectPathMatch && projectPathMatch[1]) {
    return {
      type: 'project-detail',
      slug: decodeURIComponent(projectPathMatch[1]),
    };
  }

  // Hash-based project URL fallback (e.g. #/projects/slug or #projects/slug)
  const hashProjectMatch = window.location.hash.match(/^#\/?projects\/([^/?#]+)/i);
  if (hashProjectMatch && hashProjectMatch[1]) {
    return {
      type: 'project-detail',
      slug: decodeURIComponent(hashProjectMatch[1]),
    };
  }

  return { type: 'portfolio' };
}

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [route, setRoute] = useState<RouteState>(parseCurrentRoute);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [projectsLoading, setProjectsLoading] = useState<boolean>(true);

  // Subscribe to real-time published projects from Firestore (with initial fallback)
  useEffect(() => {
    let isSubscribed = true;
    setProjectsLoading(true);

    const unsubscribe = subscribePublishedProjects(
      (loadedProjects) => {
        if (!isSubscribed) return;
        if (loadedProjects && loadedProjects.length > 0) {
          setProjects(loadedProjects);
        } else {
          setProjects(INITIAL_PROJECTS);
        }
        setProjectsLoading(false);
      },
      (error) => {
        if (!isSubscribed) return;
        console.warn('Real-time projects subscription error in App, using initial projects:', error);
        setProjectsLoading(false);
      }
    );

    // Timeout safety fallback so loading doesn't hang if offline
    const timer = setTimeout(() => {
      if (isSubscribed) {
        setProjectsLoading(false);
      }
    }, 4000);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Load and subscribe to real-time Profile updates from Firestore
  useEffect(() => {
    let isSubscribed = true;
    setProfileLoading(true);
    setProfileError(null);

    const unsubscribe = subscribeProfile(
      (data) => {
        if (!isSubscribed) return;
        setProfile(data);
        setProfileLoading(false);
        setProfileError(null);
      },
      (error) => {
        if (!isSubscribed) return;
        console.error('Realtime profile subscription failed:', error);
        setProfileLoading(false);
        setProfileError(error.message || 'Failed to load profile data.');
      }
    );
    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [retryTrigger]);

  const handleRetryProfile = () => {
    setProfileLoading(true);
    setProfileError(null);
    setRetryTrigger((prev) => prev + 1);
  };

  // Monitor Firebase Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Synchronize browser history and navigation events (popstate & hashchange)
  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(parseCurrentRoute());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Navigation helpers
  const navigateToAuth = (target: 'admin' | 'login') => {
    if (target === 'admin') {
      window.location.hash = 'admin';
      setRoute({ type: 'admin' });
    } else {
      window.location.hash = 'login';
      setRoute({ type: 'login' });
    }
  };

  const navigateToProject = (projectOrSlug: ProjectItem | string) => {
    const targetSlug =
      typeof projectOrSlug === 'string' ? projectOrSlug : getProjectSlug(projectOrSlug);
    const targetPath = `/projects/${targetSlug}`;

    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    setRoute({ type: 'project-detail', slug: targetSlug });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBackToProjects = () => {
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
    if (window.location.hash) {
      window.location.hash = '';
    }
    setRoute({ type: 'portfolio' });
    setActiveSection('projects');

    setTimeout(() => {
      const element = document.getElementById('projects');
      if (element) {
        const yOffset = -70;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  };

  // Route Protection: Redirect unauthenticated users trying to access /admin
  useEffect(() => {
    if (!authLoading && route.type === 'admin' && !currentUser) {
      navigateToAuth('login');
    }
  }, [route, currentUser, authLoading]);

  // Handle smooth navigation to specific section ID on the portfolio
  const handleNavigateSection = (sectionId: string) => {
    if (route.type !== 'portfolio') {
      if (window.location.pathname !== '/') {
        window.history.pushState(null, '', '/');
      }
      if (window.location.hash) {
        window.location.hash = '';
      }
      setRoute({ type: 'portfolio' });
    }
    setActiveSection(sectionId);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const yOffset = -70;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 60);
  };

  // Scroll spy to update active section in navbar automatically on public portfolio
  useEffect(() => {
    if (route.type !== 'portfolio') return;

    const sections = ['home', 'about', 'skills', 'projects', 'contact'];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const sectionTop = section.offsetTop;
          if (scrollPosition >= sectionTop) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [route]);

  // Loading state while checking Firebase Auth status on protected routes
  if (authLoading && (route.type === 'admin' || route.type === 'login')) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-2.5">
          <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
          <span className="text-sm">Verifying authentication...</span>
        </div>
      </div>
    );
  }

  // Protected /admin route: Only authenticated users can access
  if (route.type === 'admin') {
    if (currentUser) {
      return (
        <AdminPage
          user={currentUser}
          onBackToPortfolio={() => {
            window.location.hash = '';
            window.history.replaceState(null, '', '/');
            setRoute({ type: 'portfolio' });
          }}
          onLogout={() => {
            navigateToAuth('login');
          }}
        />
      );
    }
    return null;
  }

  // /login route
  if (route.type === 'login') {
    return (
      <AdminLogin
        onBack={() => {
          window.location.hash = '';
          window.history.replaceState(null, '', '/');
          setRoute({ type: 'portfolio' });
        }}
        onLoginSuccess={() => {
          navigateToAuth('admin');
        }}
      />
    );
  }

  // Dedicated Project Detail Route: /projects/:slug
  if (route.type === 'project-detail') {
    const currentProject = findProjectBySlug(projects, route.slug);
    const isProjectLoading = projectsLoading && !currentProject;

    return (
      <div className="min-h-screen bg-transparent text-slate-100 selection:bg-cyan-500/25 selection:text-cyan-200 font-sans antialiased">
        <Navbar
          activeSection="projects"
          onNavigate={handleNavigateSection}
          profile={profile}
          isAuthenticated={!!currentUser}
          onProfileClick={() => navigateToAuth('admin')}
        />

        <main id="main-content" className="pt-20">
          <ProjectDetailPage
            project={currentProject}
            slug={route.slug}
            isLoading={isProjectLoading}
            allProjects={projects}
            onBackToProjects={handleBackToProjects}
            onNavigateToProject={navigateToProject}
          />
        </main>

        <Footer
          onNavigate={handleNavigateSection}
          profile={profile}
          onAdminClick={() => {
            navigateToAuth('admin');
          }}
        />
      </div>
    );
  }

  // Public Portfolio Sectional Home Page
  return (
    <div className="min-h-screen bg-transparent text-slate-100 selection:bg-cyan-500/25 selection:text-cyan-200 font-sans antialiased">
      {/* Responsive Navbar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigateSection}
        profile={profile}
        isAuthenticated={!!currentUser}
        onProfileClick={() => navigateToAuth('admin')}
      />

      {/* Main Content Area: 5 Sections */}
      <main id="main-content">
        {/* 1. Home */}
        <HomeSection
          onNavigate={handleNavigateSection}
          profile={profile}
          isLoading={profileLoading}
          error={profileError}
          onRetry={handleRetryProfile}
        />

        {/* 2. About */}
        <AboutSection profile={profile} />

        {/* 3. Skills */}
        <SkillsSection />

        {/* 4. Projects */}
        <ProjectsSection
          projects={projects}
          onViewProject={navigateToProject}
        />

        {/* 5. Contact */}
        <ContactSection profile={profile || EMPTY_PROFILE_PLACEHOLDER} />
      </main>

      {/* Simple Footer */}
      <Footer
        onNavigate={handleNavigateSection}
        profile={profile}
        onAdminClick={() => {
          navigateToAuth('admin');
        }}
      />
    </div>
  );
}

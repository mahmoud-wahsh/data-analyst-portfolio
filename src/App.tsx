import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { auth } from './firebase';
import { Navbar } from './components/Navbar';
import { HomeSection } from './components/HomeSection';
import { AboutSection } from './components/AboutSection';
import { SkillsSection } from './components/SkillsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/AdminLogin';
import { AdminPage } from './components/AdminPage';
import { ProfileData } from './types';
import { subscribeProfile, INITIAL_PROFILE_DATA } from './services/profileService';

type AppRoute = 'portfolio' | 'login' | 'admin';

function getInitialRoute(): AppRoute {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  if (path === '/admin' || hash === '#admin') return 'admin';
  if (path === '/login' || hash === '#login') return 'login';
  return 'portfolio';
}

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [route, setRoute] = useState<AppRoute>(getInitialRoute);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE_DATA);

  // Load and subscribe to real-time Profile updates from Firestore
  useEffect(() => {
    const unsubscribe = subscribeProfile(
      (data) => {
        setProfile(data);
      },
      (error) => {
        console.warn('Realtime profile subscription failed, keeping current data:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Monitor Firebase Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen for browser hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getInitialRoute());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Safe navigation helper that keeps URL hash in sync
  const navigateTo = (targetRoute: AppRoute) => {
    setRoute(targetRoute);
    if (targetRoute === 'admin') {
      window.location.hash = 'admin';
    } else if (targetRoute === 'login') {
      window.location.hash = 'login';
    } else {
      if (window.location.hash === '#admin' || window.location.hash === '#login') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  };

  // Route Protection: Redirect unauthenticated users trying to access /admin
  useEffect(() => {
    if (!authLoading && route === 'admin' && !currentUser) {
      // Unauthenticated user attempted to access /admin -> redirect to login
      navigateTo('login');
    }
  }, [route, currentUser, authLoading]);

  // Handle smooth navigation to specific section ID on the portfolio
  const handleNavigateSection = (sectionId: string) => {
    if (route !== 'portfolio') {
      navigateTo('portfolio');
    }
    setActiveSection(sectionId);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const yOffset = -70;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };

  // Scroll spy to update active section in navbar automatically
  useEffect(() => {
    if (route !== 'portfolio') return;

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
  if (authLoading && (route === 'admin' || route === 'login')) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        <div className="flex items-center gap-2.5">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span className="text-sm">Verifying authentication...</span>
        </div>
      </div>
    );
  }

  // Protected /admin route: Only authenticated users can access
  if (route === 'admin') {
    if (currentUser) {
      return (
        <AdminPage
          user={currentUser}
          onBackToPortfolio={() => navigateTo('portfolio')}
          onLogout={() => {
            // Logout removes access to /admin and redirects to login
            navigateTo('login');
          }}
        />
      );
    }
    // Fallback while redirect effect fires
    return null;
  }

  // /login route
  if (route === 'login') {
    return (
      <AdminLogin
        onBack={() => navigateTo('portfolio')}
        onLoginSuccess={() => {
          // Redirect authenticated user to /admin
          navigateTo('admin');
        }}
      />
    );
  }

  // Public Portfolio (Unchanged)
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300 font-sans antialiased">
      {/* Responsive Navbar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigateSection}
        profile={profile}
        isAuthenticated={!!currentUser}
        onProfileClick={() => navigateTo('admin')}
      />

      {/* Main Content Area: 5 Sections */}
      <main id="main-content">
        {/* 1. Home */}
        <HomeSection onNavigate={handleNavigateSection} profile={profile} />

        {/* 2. About */}
        <AboutSection profile={profile} />

        {/* 3. Skills */}
        <SkillsSection />

        {/* 4. Projects */}
        <ProjectsSection />

        {/* 5. Contact */}
        <ContactSection profile={profile} />
      </main>

      {/* Simple Footer */}
      <Footer
        onNavigate={handleNavigateSection}
        profile={profile}
        onAdminClick={() => {
          // If already logged in, navigate directly to admin; otherwise, redirect to login
          if (currentUser) {
            navigateTo('admin');
          } else {
            navigateTo('admin'); // triggers protected route redirect to login
          }
        }}
      />
    </div>
  );
}

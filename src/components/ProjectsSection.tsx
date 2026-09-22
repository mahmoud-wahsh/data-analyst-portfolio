import React, { useState, useEffect } from 'react';
import { Layers, ArrowUpRight } from 'lucide-react';
import { ProjectItem } from '../types';
import { ProjectModal } from './ProjectModal';
import { subscribePublishedProjects, INITIAL_PROJECTS } from '../services/projectsService';

interface ProjectsSectionProps {
  projects?: ProjectItem[];
}

// Helper to ensure the public card displays the thumbnail in its original image quality without low-quality transforms or compression
const getOriginalImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace(/\/upload\/(?:[a-z]{1,4}_[^/]+,?[^/]*\/)+/gi, '/upload/');
  }
  return url;
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects: initialProjectsProp }) => {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjectsProp || INITIAL_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Subscribe to real-time published projects from Firestore
  useEffect(() => {
    if (initialProjectsProp && initialProjectsProp.length > 0) {
      setProjects(initialProjectsProp);
      return;
    }

    const unsubscribe = subscribePublishedProjects(
      (loadedProjects) => {
        if (loadedProjects && loadedProjects.length > 0) {
          setProjects(loadedProjects);
        } else {
          setProjects([]);
        }
      },
      (error) => {
        console.warn('Real-time projects subscription error, using cached/initial projects:', error);
      }
    );

    return () => unsubscribe();
  }, [initialProjectsProp]);

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-zinc-850">
      <div className="mb-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-medium uppercase tracking-wider mb-3">
          Case Studies
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
          Featured Analytics Projects
        </h2>
        <p className="text-zinc-400 text-base">
          Practical data analytics projects focused on data preparation, analysis, dashboards, meaningful insights, and data storytelling.
        </p>
      </div>

      {/* Dynamic Project Cards Grid */}
      {projects.length === 0 ? (
        <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center">
          <p className="text-sm text-zinc-400">No published projects are currently featured.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project, index) => {
            const projectSlug = (project.title || `project-${index}`)
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '-');

            return (
              <div
                key={project.id || project.title}
                id={`project-card-${projectSlug}`}
                className="group rounded-xl bg-zinc-900/60 border border-zinc-800/90 hover:border-zinc-700 flex flex-col justify-between p-6 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div>
                  {/* Card Top Pill: Case Study number + Category */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-4">
                    <span className="truncate max-w-[200px]">
                      {project.category ? project.category : `0${index + 1} / Case Study`}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0" />
                  </div>

                  {/* Project Thumbnail with Original Quality & No Cropping */}
                  {project.imageUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950/80 aspect-video flex items-center justify-center">
                      <img
                        src={getOriginalImageUrl(project.imageUrl)}
                        alt={project.title}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Project title */}
                  <h3 className="text-xl font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors mb-3 leading-snug">
                    {project.title}
                  </h3>

                  {/* Short description */}
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                    {project.description}
                  </p>
                </div>

                <div>
                  {/* Tools */}
                  <div className="mb-6 pt-4 border-t border-zinc-800/80">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-medium">Tools:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tools.map((tool) => (
                        <span
                          key={tool}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* View Project button */}
                  <button
                    id={`view-project-btn-${projectSlug}`}
                    onClick={() => setSelectedProject(project)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-800/90 border border-zinc-700/80 text-zinc-200 text-sm font-medium hover:bg-zinc-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-600"
                  >
                    <span>View Project</span>
                    <ArrowUpRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Modal for detailed view */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};


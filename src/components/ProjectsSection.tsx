import React, { useState, useEffect } from 'react';
import { Layers, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ProjectItem } from '../types';
import { subscribePublishedProjects, INITIAL_PROJECTS } from '../services/projectsService';
import { getProjectSlug, getOriginalImageUrl } from '../utils/projectUtils';

interface ProjectsSectionProps {
  projects?: ProjectItem[];
  onViewProject?: (project: ProjectItem) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects: initialProjectsProp,
  onViewProject,
}) => {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjectsProp || INITIAL_PROJECTS);

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

  const handleProjectClick = (project: ProjectItem) => {
    if (onViewProject) {
      onViewProject(project);
    } else {
      const slug = getProjectSlug(project);
      window.history.pushState(null, '', `/projects/${slug}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-slate-800/80">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900/80 border border-cyan-500/20 text-cyan-400 text-xs font-medium uppercase tracking-wider mb-3">
            Case Studies
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Featured Analytics Projects
          </h2>
          <p className="text-slate-400 text-base">
            Practical data analytics projects focused on data preparation, analysis, dashboards, meaningful insights, and data storytelling.
          </p>
        </div>

        {/* Dynamic Project Cards Grid */}
        {projects.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
            <p className="text-sm text-slate-400">No published projects are currently featured.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project, index) => {
              const projectSlug = getProjectSlug(project);

              return (
                <motion.div
                  key={project.id || project.title}
                  id={`project-card-${projectSlug}`}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="group rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/30 flex flex-col justify-between p-6 transition-colors duration-200"
                >
                  <div>
                    {/* Card Top Pill: Case Study number + Category */}
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-4">
                      <span className="truncate max-w-[200px]">
                        {project.category ? project.category : `0${index + 1} / Case Study`}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 shrink-0" />
                    </div>

                    {/* Project Thumbnail with Original Quality & Subtle Hover Zoom */}
                    {project.imageUrl && (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => handleProjectClick(project)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') handleProjectClick(project);
                        }}
                        className="mb-4 rounded-lg overflow-hidden border border-slate-800 bg-slate-950/80 aspect-video flex items-center justify-center cursor-pointer"
                        title="View Project"
                      >
                        <img
                          src={getOriginalImageUrl(project.imageUrl)}
                          alt={project.title}
                          className="w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.07]"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {/* Project title */}
                    <h3
                      role="button"
                      tabIndex={0}
                      onClick={() => handleProjectClick(project)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') handleProjectClick(project);
                      }}
                      className="text-xl font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-3 leading-snug cursor-pointer"
                    >
                      {project.title}
                    </h3>

                    {/* Short description */}
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">
                      {project.description}
                    </p>
                  </div>

                  <div>
                    {/* Tools */}
                    <div className="mb-6 pt-4 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-medium">Tools:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {project.tools.map((tool) => (
                          <span
                            key={tool}
                            className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-950/70 border border-slate-800 text-slate-300"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* View Project button */}
                    <motion.button
                      id={`view-project-btn-${projectSlug}`}
                      onClick={() => handleProjectClick(project)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700/80 text-slate-200 text-sm font-medium hover:bg-slate-750 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
                    >
                      <span>View Project</span>
                      <ArrowUpRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </section>
  );
};


import React from 'react';
import { UserCheck, Target, Lightbulb, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';
import { ProfileData } from '../types';

interface AboutSectionProps {
  profile?: ProfileData | null;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  profile,
}) => {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-slate-800/80">
      <motion.div
        className="max-w-3xl"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900/80 border border-cyan-500/20 text-cyan-400 text-xs font-medium uppercase tracking-wider mb-3">
          About Me
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">
          Analytical Mindset, Business Focus
        </h2>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 sm:p-8 mb-8 backdrop-blur-xs">
          <div className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6 min-h-[4.5rem]">
            {profile?.about ? (
              <p>{profile.about}</p>
            ) : (
              <div className="space-y-2.5 py-1">
                <div className="h-4 bg-slate-800/80 rounded animate-pulse w-full" />
                <div className="h-4 bg-slate-800/80 rounded animate-pulse w-11/12" />
                <div className="h-4 bg-slate-800/80 rounded animate-pulse w-4/5" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="flex items-start gap-3 p-2.5 -m-2.5 rounded-lg hover:bg-slate-800/40 hover:border hover:border-cyan-500/20 transition-colors"
            >
              <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700/50 shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Outcome-Driven</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Turning business questions into meaningful metrics and clear dashboards.
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="flex items-start gap-3 p-2.5 -m-2.5 rounded-lg hover:bg-slate-800/40 hover:border hover:border-cyan-500/20 transition-colors"
            >
              <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700/50 shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Data Quality</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cleaning, validating, and preparing data for accurate analysis and reporting.
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="flex items-start gap-3 p-2.5 -m-2.5 rounded-lg hover:bg-slate-800/40 hover:border hover:border-cyan-500/20 transition-colors"
            >
              <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700/50 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Clear Communication</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Presenting analytical findings clearly through concise insights and visualizations.
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="flex items-start gap-3 p-2.5 -m-2.5 rounded-lg hover:bg-slate-800/40 hover:border hover:border-cyan-500/20 transition-colors"
            >
              <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700/50 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Continuous Learner</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Continuously developing my skills in data analysis, visualization, and analytical tools.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

import React from 'react';
import { UserCheck, Target, Lightbulb, GraduationCap } from 'lucide-react';
import { ProfileData } from '../types';
import { INITIAL_PROFILE_DATA } from '../services/profileService';

interface AboutSectionProps {
  profile?: ProfileData;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  profile = INITIAL_PROFILE_DATA,
}) => {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-zinc-850">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-medium uppercase tracking-wider mb-3">
          About Me
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">
          Analytical Mindset, Business Focus
        </h2>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 sm:p-8 mb-8 backdrop-blur-xs">
          <p className="text-zinc-300 text-base sm:text-lg leading-relaxed mb-6">
            {profile.about}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-800/80">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-zinc-800 text-emerald-400 shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100">Outcome-Driven</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Turning business questions into meaningful metrics and clear dashboards.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-zinc-800 text-emerald-400 shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100">Data Quality</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Cleaning, validating, and preparing data for accurate analysis and reporting.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-zinc-800 text-emerald-400 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100">Clear Communication</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Presenting analytical findings clearly through concise insights and visualizations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-zinc-800 text-emerald-400 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100">Continuous Learner</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Continuously developing my skills in data analysis, visualization, and analytical tools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

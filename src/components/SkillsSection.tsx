import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Database,
  FileSpreadsheet,
  BarChart2,
  Layers,
  Cpu,
  Code2,
  LineChart,
  Binary,
  Terminal,
  Server,
} from 'lucide-react';
import { SkillItem } from '../types';
import { subscribeSkills, INITIAL_SKILLS } from '../services/skillsService';

// Icon map for common technical skills
const skillIcons: Record<string, React.ReactNode> = {
  sql: <Database className="w-5 h-5 text-cyan-400" />,
  excel: <FileSpreadsheet className="w-5 h-5 text-cyan-400" />,
  'power bi': <BarChart2 className="w-5 h-5 text-cyan-400" />,
  'power query': <Layers className="w-5 h-5 text-cyan-400" />,
  'data modeling': <Cpu className="w-5 h-5 text-cyan-400" />,
  dax: <Binary className="w-5 h-5 text-cyan-400" />,
  python: <Code2 className="w-5 h-5 text-cyan-400" />,
  tableau: <LineChart className="w-5 h-5 text-cyan-400" />,
};

function getSkillIcon(name: string, category: string): React.ReactNode {
  const normName = name.toLowerCase().trim();
  if (skillIcons[normName]) return skillIcons[normName];

  if (
    normName.includes('sql') ||
    normName.includes('postgres') ||
    normName.includes('mysql') ||
    normName.includes('bigquery') ||
    normName.includes('snowflake') ||
    normName.includes('database')
  ) {
    return <Database className="w-5 h-5 text-cyan-400" />;
  }
  if (normName.includes('excel') || normName.includes('sheet') || normName.includes('csv')) {
    return <FileSpreadsheet className="w-5 h-5 text-cyan-400" />;
  }
  if (normName.includes('power bi') || normName.includes('report') || normName.includes('kpi')) {
    return <BarChart2 className="w-5 h-5 text-cyan-400" />;
  }
  if (normName.includes('query') || normName.includes('etl') || normName.includes('pipeline')) {
    return <Layers className="w-5 h-5 text-cyan-400" />;
  }
  if (normName.includes('model') || normName.includes('schema') || normName.includes('arch')) {
    return <Cpu className="w-5 h-5 text-cyan-400" />;
  }
  if (normName.includes('dax') || normName.includes('math') || normName.includes('stat')) {
    return <Binary className="w-5 h-5 text-cyan-400" />;
  }
  if (
    normName.includes('python') ||
    normName.includes('code') ||
    normName.includes('r') ||
    normName.includes('script')
  ) {
    return <Code2 className="w-5 h-5 text-cyan-400" />;
  }
  if (normName.includes('tableau') || normName.includes('visual') || normName.includes('chart')) {
    return <LineChart className="w-5 h-5 text-cyan-400" />;
  }
  if (normName.includes('server') || normName.includes('cloud') || normName.includes('aws') || normName.includes('gcp')) {
    return <Server className="w-5 h-5 text-cyan-400" />;
  }

  // Fallback by category
  const normCat = category.toLowerCase();
  if (normCat.includes('visual') || normCat.includes('bi')) return <BarChart2 className="w-5 h-5 text-cyan-400" />;
  if (normCat.includes('query') || normCat.includes('extract') || normCat.includes('data'))
    return <Database className="w-5 h-5 text-cyan-400" />;
  if (normCat.includes('model') || normCat.includes('arch')) return <Cpu className="w-5 h-5 text-cyan-400" />;
  if (normCat.includes('etl') || normCat.includes('transform')) return <Layers className="w-5 h-5 text-cyan-400" />;
  if (normCat.includes('sheet')) return <FileSpreadsheet className="w-5 h-5 text-cyan-400" />;
  if (normCat.includes('code') || normCat.includes('program') || normCat.includes('auto'))
    return <Code2 className="w-5 h-5 text-cyan-400" />;

  return <Terminal className="w-5 h-5 text-cyan-400" />;
}

interface SkillsSectionProps {
  skills?: SkillItem[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills: initialSkillsProp }) => {
  const [skills, setSkills] = useState<SkillItem[]>(initialSkillsProp || INITIAL_SKILLS);

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    if (initialSkillsProp && initialSkillsProp.length > 0) {
      setSkills(initialSkillsProp);
      return;
    }

    const unsubscribe = subscribeSkills(
      (loadedSkills) => {
        if (loadedSkills && loadedSkills.length > 0) {
          setSkills(loadedSkills);
        }
      },
      (error) => {
        console.warn('Real-time skills subscription error, using cached/initial skills:', error);
      }
    );

    return () => unsubscribe();
  }, [initialSkillsProp]);

  return (
    <section id="skills" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-slate-800/80">
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
            Technical Toolkit
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Skills & Proficiencies
          </h2>
          <p className="text-slate-400 text-base">
            Practical skills in data analysis, data preparation, modeling, and business visualization.
          </p>
        </div>

        {/* Grid of dynamically loaded skills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {skills.map((skill) => (
            <motion.div
              key={skill.id || skill.name}
              id={`skill-card-${skill.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="group p-5 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/30 hover:bg-slate-900/90 transition-colors duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 group-hover:border-cyan-500/30 transition-colors">
                    {getSkillIcon(skill.name, skill.category)}
                  </div>
                  <span className="text-[11px] font-medium tracking-wide text-slate-400 uppercase bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/80 truncate max-w-[150px]">
                    {skill.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors mb-1.5">
                  {skill.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {skill.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

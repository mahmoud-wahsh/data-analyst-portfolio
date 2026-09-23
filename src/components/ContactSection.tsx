import React, { useState } from 'react';
import { Mail, Linkedin, Github, MessageCircle, Copy, Check, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ContactInfo, ProfileData } from '../types';
import { INITIAL_PROFILE_DATA } from '../services/profileService';

interface ContactSectionProps {
  profile?: ProfileData;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  profile = INITIAL_PROFILE_DATA,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const formatHref = (type: string, val: string) => {
    if (!val) return '#';
    if (type === 'email') return val.startsWith('mailto:') ? val : `mailto:${val}`;
    if (type === 'whatsapp') {
      if (val.startsWith('http')) return val;
      const digits = val.replace(/[^0-9]/g, '');
      return `https://wa.me/${digits}`;
    }
    if (val.startsWith('http://') || val.startsWith('https://')) return val;
    return `https://${val}`;
  };

  const contactChannels: ContactInfo[] = [
    {
      type: 'email',
      label: 'Email',
      value: profile.email,
      href: formatHref('email', profile.email),
    },
    {
      type: 'linkedin',
      label: 'LinkedIn',
      value: profile.linkedin,
      href: formatHref('linkedin', profile.linkedin),
    },
    {
      type: 'github',
      label: 'GitHub',
      value: profile.github,
      href: formatHref('github', profile.github),
    },
    {
      type: 'whatsapp',
      label: 'WhatsApp',
      value: profile.whatsapp,
      href: formatHref('whatsapp', profile.whatsapp),
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5 text-cyan-400" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5 text-cyan-400" />;
      case 'github':
        return <Github className="w-5 h-5 text-cyan-400" />;
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5 text-cyan-400" />;
      default:
        return <Mail className="w-5 h-5 text-cyan-400" />;
    }
  };

  const handleCopy = (type: string, value: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-slate-800/80">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900/80 border border-cyan-500/20 text-cyan-400 text-xs font-medium uppercase tracking-wider mb-3">
            Get in Touch
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Let’s Connect
          </h2>
          <p className="text-slate-400 text-base">
            I’m open to data analytics opportunities, projects, and professional collaborations. Feel free to reach out through any of these channels.
          </p>
        </div>

        {/* 4 Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
          {contactChannels.map((channel) => (
            <motion.div
              key={channel.type}
              id={`contact-card-${channel.type}`}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="group p-5 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/30 hover:bg-slate-900 transition-colors flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 group-hover:border-cyan-500/30 transition-colors">
                  {getIcon(channel.type)}
                </div>

                <div className="flex items-center gap-1.5">
                  <motion.button
                    id={`copy-btn-${channel.type}`}
                    onClick={(e) => handleCopy(channel.type, channel.value, e)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.93 }}
                    title="Copy to clipboard"
                    className="p-1.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-colors text-xs inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedType === channel.type ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[10px] text-cyan-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Copy</span>
                      </>
                    )}
                  </motion.button>

                  <motion.a
                    id={`open-link-${channel.type}`}
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.93 }}
                    className="p-1.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-colors inline-flex items-center justify-center cursor-pointer"
                    title={`Open ${channel.label}`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </motion.a>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                  {channel.label}
                </span>
                <a
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors break-all"
                >
                  {channel.value}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

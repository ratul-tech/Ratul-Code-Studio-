import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, Maximize2, X } from 'lucide-react';
import profilePhoto from '../assets/images/ratul_profile.jpg';

interface AnimatedProfilePhotoProps {
  name?: string;
  title?: string;
  imageUrl?: string;
}

export function AnimatedProfilePhoto({
  name = "Shahriar Islam Ratul",
  title = "Software Prototyper",
  imageUrl
}: AnimatedProfilePhotoProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(imageUrl && imageUrl.trim() ? imageUrl.trim() : profilePhoto);

  // Sync with imageUrl changes if admin edits it
  useEffect(() => {
    if (imageUrl && imageUrl.trim()) {
      setImgSrc(imageUrl.trim());
    } else {
      setImgSrc(profilePhoto);
    }
  }, [imageUrl]);

  return (
    <>
      <div className="relative flex items-center justify-center p-4 sm:p-8 select-none">
        {/* Ambient Pulsing Aura Layers */}
        <motion.div
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.35, 0.65, 0.35],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -inset-2 sm:-inset-6 bg-gradient-to-tr from-emerald-500/25 via-teal-500/20 to-emerald-400/15 rounded-[3rem] blur-3xl -z-10 pointer-events-none"
        />

        {/* Rotating Orbital Dashed Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -inset-4 sm:-inset-8 border border-dashed border-emerald-500/25 rounded-[3.2rem] pointer-events-none -z-10"
        />

        {/* Outer Floating Container */}
        <motion.div
          animate={{
            y: [-8, 8, -8],
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          whileHover={{ scale: 1.03, y: -4 }}
          className="relative group cursor-pointer"
          onClick={() => setIsZoomed(true)}
          title="Click to view full photo"
        >
          {/* Glowing Border Accent */}
          <div className="absolute -inset-1 bg-gradient-to-b from-emerald-400/40 via-emerald-500/20 to-teal-500/40 rounded-[2.6rem] blur-[2px] opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Main Card Frame */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[22rem] lg:h-[22rem] rounded-[2.5rem] overflow-hidden p-2.5 bg-neutral-950/80 backdrop-blur-xl border border-white/15 shadow-2xl shadow-emerald-950/50 flex items-center justify-center">
            {/* Inner Image Wrapper */}
            <div className="relative w-full h-full rounded-[2.1rem] overflow-hidden bg-neutral-900">
              <img
                src={imgSrc}
                alt={name}
                referrerPolicy="no-referrer"
                onError={() => {
                  if (imgSrc !== profilePhoto) setImgSrc(profilePhoto);
                }}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Subtle hover expand tag */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <span className="px-3.5 py-1.5 glass rounded-full text-xs text-white font-medium flex items-center gap-1.5 shadow-lg border border-white/20">
                  <Maximize2 size={13} /> Click to expand
                </span>
              </div>
            </div>
          </div>

          {/* Floating Status Badge (Top-Right) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="absolute -top-3 -right-2 sm:-right-4 glass px-3.5 py-1.5 rounded-full border border-white/15 shadow-xl flex items-center gap-2 backdrop-blur-md"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-semibold tracking-wide text-neutral-200">
              Available to Build
            </span>
          </motion.div>

          {/* Floating Skill Badge (Bottom-Left) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="absolute -bottom-3 -left-2 sm:-left-4 glass px-4 py-2 rounded-2xl border border-white/15 shadow-xl flex items-center gap-2.5 backdrop-blur-md"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <Zap size={13} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 leading-none">
                Since 2025
              </p>
              <p className="text-xs font-bold text-white leading-tight mt-0.5">
                Modern AI &amp; LLMs
              </p>
            </div>
          </motion.div>

          {/* Micro Sparkle Tag (Bottom-Right) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="hidden sm:flex absolute bottom-8 -right-4 glass px-3 py-1 rounded-xl border border-emerald-500/30 shadow-lg items-center gap-1.5 text-[11px] text-emerald-400 font-medium"
          >
            <Sparkles size={12} className="text-emerald-400" />
            <span>Fast Prototyping</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Expanded Lightbox Modal for Photo */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setIsZoomed(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-lg w-full glass rounded-3xl p-4 overflow-hidden border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-6 right-6 z-10 p-2 glass rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="rounded-2xl overflow-hidden aspect-square bg-neutral-900 mb-4 border border-white/10">
              <img
                src={imgSrc}
                alt={name}
                referrerPolicy="no-referrer"
                onError={() => {
                  if (imgSrc !== profilePhoto) setImgSrc(profilePhoto);
                }}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="px-2 pb-2 text-center">
              <h3 className="text-xl font-display font-bold text-white">{name}</h3>
              <p className="text-sm text-emerald-400 mt-0.5">{title}</p>
              <p className="text-xs text-neutral-400 mt-2 font-light">
                Independent web developer &amp; modern software prototyping specialist.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

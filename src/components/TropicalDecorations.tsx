import React from 'react';
import { motion } from 'motion/react';
import { LaMalokaOfficialLogoSVG, LaMalokaLogoBadge, LaMalokaWatermarkBackground } from './LaMalokaOfficialLogo';

export { LaMalokaOfficialLogoSVG, LaMalokaLogoBadge, LaMalokaWatermarkBackground };

export const MonsteraLeafSVG: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Monstera leaf path */}
    <path d="M50 5C30 5 15 25 15 50C15 65 22 78 35 87L38 83C28 75 22 63 22 50C22 46 23 42 24 38L32 44C33 40 35 36 38 33L42 38C44 32 48 28 53 26L51 34C56 34 60 37 63 41L67 36C69 41 70 46 69 51L77 47C76 53 74 58 70 62L76 67C72 73 66 78 59 81L59 95L50 95L50 82C43 82 37 79 32 75L35 71C39 74 44 76 50 76C56 76 61 74 65 71L61 67C65 64 67 60 69 55L61 55C62 50 61 46 59 42L53 47C53 42 50 38 46 36L44 43C40 41 38 43 36 46L29 40C27 45 26 50 27 55L34 52C34 58 37 63 42 66L39 71C35 67 32 61 32 55C32 53 32 51 33 49L25 54C25 57 26 60 27 63L20 59C19 56 19 53 19 50C19 28 33 10 50 10C67 10 81 28 81 50C81 65 73 78 61 86L58 81C68 74 74 63 74 50C74 28 65 5 50 5Z" />
  </svg>
);

export const HibiscusSVG: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Hibiscus flower path with petals and stamen */}
    <g>
      {/* Petal 1 */}
      <path d="M50 50 C40 30 25 20 15 35 C8 45 15 60 35 55" />
      {/* Petal 2 */}
      <path d="M50 50 C30 65 20 80 35 90 C45 97 60 90 55 70" />
      {/* Petal 3 */}
      <path d="M50 50 C70 60 85 75 92 60 C98 48 85 38 65 48" />
      {/* Petal 4 */}
      <path d="M50 50 C65 30 80 15 65 10 C52 6 42 20 48 40" />
      {/* Petal 5 */}
      <path d="M50 50 C28 45 10 55 12 70 C14 82 30 80 45 62" />
      {/* Stamen/Pistil */}
      <path d="M50 50 Q75 35 85 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="85" cy="20" r="3" fill="#FBBF24" />
      <circle cx="81" cy="22" r="2.5" fill="#FBBF24" />
      <circle cx="86" cy="26" r="2" fill="#FBBF24" />
      <circle cx="77" cy="26" r="2" fill="#FBBF24" />
    </g>
  </svg>
);

export const FloatingMonstera: React.FC<{ delay?: number; size?: string; className?: string }> = ({
  delay = 0,
  size = 'w-32 h-32',
  className = 'absolute text-emerald-800/10 dark:text-emerald-500/5',
}) => {
  return (
    <motion.div
      className={`${className} ${size} pointer-events-none select-none`}
      initial={{ y: 0, rotate: 0 }}
      animate={{
        y: [0, -12, 0, 12, 0],
        rotate: [0, 5, 0, -5, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      <MonsteraLeafSVG className="w-full h-full" />
    </motion.div>
  );
};

export const FloatingHibiscus: React.FC<{ delay?: number; size?: string; className?: string }> = ({
  delay = 1,
  size = 'w-24 h-24',
  className = 'absolute text-orange-500/10 dark:text-orange-400/5',
}) => {
  return (
    <motion.div
      className={`${className} ${size} pointer-events-none select-none`}
      initial={{ y: 0, rotate: 0, scale: 1 }}
      animate={{
        y: [0, 10, -5, 10, 0],
        rotate: [0, -8, 8, -8, 0],
        scale: [1, 1.03, 0.98, 1.03, 1],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      <HibiscusSVG className="w-full h-full" />
    </motion.div>
  );
};

export const FloatingParrot: React.FC<{ delay?: number; className?: string }> = ({
  delay = 2,
  className = 'absolute text-rose-500/10 dark:text-rose-400/5 w-28 h-28 pointer-events-none select-none',
}) => {
  return (
    <motion.div
      className={className}
      initial={{ y: 0, x: 0, rotate: 0 }}
      animate={{
        y: [0, -15, 5, -15, 0],
        x: [0, 5, -5, 5, 0],
        rotate: [0, 4, -4, 4, 0],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Artistic minimalist silhouette of a parrot/exotic bird on branch */}
        <path d="M45 15 C45 10 55 5 60 10 C62 12 60 18 58 20 C65 22 70 28 68 35 C66 42 58 48 55 55 C53 60 55 68 57 78 L53 85 L48 85 L49 75 C45 70 41 62 41 52 C41 40 45 28 45 15 Z" />
        {/* Beak */}
        <path d="M58 12 Q68 12 66 18 Q59 18 58 12" fill="#FBBF24" />
        {/* Tail long feather */}
        <path d="M53 85 C55 90 58 98 59 100 C56 98 51 90 49 85 Z" fill="#EF4444" />
        {/* Wing layer */}
        <path d="M46 32 C50 32 55 38 54 48 C53 58 48 68 45 72 C46 62 48 45 46 32" fill="#3B82F6" />
        {/* Eye */}
        <circle cx="53" cy="14" r="1.5" fill="#111827" />
        {/* Branch */}
        <path d="M30 83 L75 80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
};

export const TropicalPatternBG: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Official Association Watermark (Fondo de agua / Arrière-plan filigrane) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[780px] max-w-[88vw] opacity-[0.04] dark:opacity-[0.06] select-none pointer-events-none">
        <LaMalokaOfficialLogoSVG />
      </div>

      <FloatingMonstera delay={0} size="w-48 h-48" className="absolute -top-10 -left-10 text-emerald-500/10" />
      <FloatingMonstera delay={4} size="w-64 h-64" className="absolute -bottom-20 -right-20 text-emerald-600/10 rotate-45" />
      <FloatingHibiscus delay={2} size="w-36 h-36" className="absolute top-1/4 -right-12 text-rose-500/10" />
      <FloatingHibiscus delay={6} size="w-32 h-32" className="absolute bottom-1/3 -left-12 text-amber-500/10" />
      <FloatingParrot delay={3} className="absolute top-10 right-1/4 text-rose-500/5 w-24 h-24" />
      <FloatingParrot delay={9} className="absolute bottom-10 left-1/4 text-cyan-500/5 w-24 h-24 -scale-x-100" />
    </div>
  );
};

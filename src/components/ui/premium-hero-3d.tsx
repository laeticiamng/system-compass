import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumHero3DProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'bold';
}

const intensityMap = {
  subtle: {
    orb: 'h-40 w-40 blur-2xl',
    sphere: 'h-28 w-28',
    tilt: 10,
  },
  medium: {
    orb: 'h-52 w-52 blur-3xl',
    sphere: 'h-36 w-36',
    tilt: 14,
  },
  bold: {
    orb: 'h-64 w-64 blur-3xl',
    sphere: 'h-44 w-44',
    tilt: 18,
  },
} as const;

export function PremiumHero3D({ className, intensity = 'medium' }: PremiumHero3DProps) {
  const config = intensityMap[intensity];

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden [perspective:1400px]', className)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_40%),linear-gradient(135deg,rgba(120,119,198,0.12),transparent_55%),linear-gradient(225deg,rgba(14,165,233,0.12),transparent_45%)]" />

      <motion.div
        className={cn('absolute left-[8%] top-[8%] rounded-full bg-primary/25', config.orb)}
        animate={{ y: [0, -18, 0], x: [0, 12, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={cn('absolute right-[10%] top-[18%] rounded-full bg-cyan-400/20', config.orb)}
        animate={{ y: [0, 20, 0], x: [0, -10, 0], scale: [1, 0.96, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={cn('absolute bottom-[8%] left-[28%] rounded-full bg-fuchsia-500/15', config.orb)}
        animate={{ y: [0, -12, 0], x: [0, 8, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute left-[12%] top-[22%] hidden md:block"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateX: [config.tilt, config.tilt - 4, config.tilt], rotateY: [-14, -6, -14], y: [0, -12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className={cn('rounded-[2rem] border border-white/15 bg-white/[0.08] shadow-[0_25px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl', config.sphere)} />
      </motion.div>

      <motion.div
        className="absolute right-[16%] bottom-[16%] hidden lg:block"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateX: [-config.tilt, -config.tilt + 5, -config.tilt], rotateY: [18, 8, 18], y: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="h-32 w-32 rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/0 shadow-[0_30px_90px_rgba(14,165,233,0.18)] backdrop-blur-xl" />
      </motion.div>

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
    </div>
  );
}

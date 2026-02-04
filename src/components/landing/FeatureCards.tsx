/**
 * FeatureCards - Premium feature and tool cards for landing page
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  XCircle, 
  CheckCircle, 
  Check
} from 'lucide-react';

// Animated section wrapper
export function AnimatedSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Premium feature card
export function FeatureCardPremium({ 
  icon, 
  number, 
  title, 
  description,
  delay = 0
}: { 
  icon: React.ReactNode; 
  number: string; 
  title: string; 
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative p-6 md:p-8 lg:p-10">
        <div className="text-primary/20 font-mono text-sm mb-4 md:mb-6 tracking-widest">{number}</div>
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary/10 text-primary mb-6 md:mb-8 group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-500">
          {icon}
        </div>
        <h3 className="font-display text-lg md:text-xl lg:text-2xl font-semibold mb-3 md:mb-4">{title}</h3>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// Premium tool card
export function ToolCardPremium({
  icon,
  title,
  description,
  onClick,
  primary = false,
  index = 0
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
  index?: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left p-5 md:p-7 rounded-2xl md:rounded-3xl border transition-all duration-500 group ${
        primary 
          ? 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 hover:border-primary/40 hover:shadow-[0_0_40px_hsl(var(--primary)/0.15)]' 
          : 'bg-card/50 backdrop-blur-sm border-border/30 hover:border-border/50 hover:bg-card/80'
      }`}
    >
      <div className={`inline-flex items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl mb-4 md:mb-5 transition-all duration-300 ${
        primary ? 'bg-primary text-primary-foreground group-hover:scale-110' : 'bg-muted text-foreground group-hover:bg-muted/80'
      }`}>
        {icon}
      </div>
      <h3 className="font-semibold text-base md:text-lg mb-1.5 md:mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.button>
  );
}

// Pricing card
export function PricingCard({
  icon,
  title,
  price,
  features,
  highlighted = false
}: {
  icon: React.ReactNode;
  title: string;
  price?: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`p-6 md:p-8 rounded-2xl md:rounded-3xl text-left transition-all duration-300 ${
        highlighted 
          ? 'bg-gradient-to-br from-primary/10 via-primary/5 to-amber-500/5 border border-primary/20' 
          : 'bg-muted/30 border border-border/30'
      }`}
    >
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className={`p-2 rounded-xl ${highlighted ? 'bg-primary/20 text-primary' : 'bg-muted text-foreground'}`}>
          {icon}
        </div>
        <span className="font-semibold text-base md:text-lg">{title}</span>
        {price && <span className="text-xs md:text-sm text-muted-foreground ml-auto">{price}</span>}
      </div>
      <ul className="space-y-2.5 md:space-y-3 text-xs md:text-sm text-muted-foreground">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2.5 md:gap-3">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// Not do item
export function NotDoItem({ text }: { text: string }) {
  return (
    <motion.div 
      className="flex items-start gap-3 md:gap-4 text-muted-foreground"
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <XCircle className="w-5 h-5 text-destructive/70 flex-shrink-0 mt-0.5" />
      <span className="text-sm md:text-base leading-relaxed">{text}</span>
    </motion.div>
  );
}

// Do item
export function DoItem({ text }: { text: string }) {
  return (
    <motion.div 
      className="flex items-start gap-3 md:gap-4"
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
      <span className="text-sm md:text-base leading-relaxed">{text}</span>
    </motion.div>
  );
}

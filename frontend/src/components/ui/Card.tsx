'use client';

import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

export function Card({ className, hover = true, glow = false, children, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'bg-surface border border-white/5 rounded-card p-6',
        glow && 'shadow-glow',
        className
      )}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

'use client';

import { useEffect, useRef } from 'react';

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
}

export function RevealOnScroll({ children, className }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const revealNodes = el.querySelectorAll('.reveal');
    revealNodes.forEach((node) => observer.observe(node));

    return () => {
      revealNodes.forEach((node) => observer.unobserve(node));
    };
  }, [children]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

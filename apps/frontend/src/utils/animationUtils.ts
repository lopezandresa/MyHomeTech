// Performance optimizations for animations
export const shouldReduceMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Optimized animation variants that respect user preferences
export const createOptimizedVariants = (baseVariants: any) => {
  if (shouldReduceMotion()) {
    // Return simplified variants for users who prefer reduced motion
    return {
      ...baseVariants,
      animate: { opacity: 1 },
      initial: { opacity: 0 },
      transition: { duration: 0.2 }
    }
  }
  return baseVariants
}

// Performance-focused animation configurations
export const performanceAnimations = {
  // Faster, lighter animations for better performance
  fast: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" }
  },
  
  stagger: {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: (index: number) => ({
      duration: 0.4,
      delay: index * 0.08,
      ease: "easeOut"
    })
  },
  
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.3, ease: "easeOut" }
  },
  
  slide: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.4, ease: "easeOut" }
  }
}

// Common style properties for performance
export const performanceStyles = {
  willChangeTransform: { willChange: 'transform' },
  willChangeOpacity: { willChange: 'opacity' },
  willChangeAuto: { willChange: 'auto' },
  
  // GPU acceleration helpers
  gpuAccelerated: {
    transform: 'translateZ(0)',
    willChange: 'transform'
  }
}
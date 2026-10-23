import { useEffect, useState, type RefObject } from 'react';

/**
 * True while the element is on screen or within `margin` of it.
 * Lets a long list keep heavy content (3D cans) only where the visitor looks.
 */
export function useNearViewport(ref: RefObject<Element | null>, margin = '400px'): boolean {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: margin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, margin]);

  return near;
}

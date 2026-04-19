import { useState, useEffect, useRef, RefObject } from 'react';

export function useIntersection(
  options: IntersectionObserverInit = {}
): [RefObject<any>, boolean] {
  const ref = useRef<Element>(null);
  const [visible, setVisible] = useState(false);
  // Stabiliser les options pour éviter de recréer l'observer à chaque render
  const thresholdRef = useRef(options.threshold);
  const rootMarginRef = useRef(options.rootMargin);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      {
        threshold: thresholdRef.current,
        rootMargin: rootMarginRef.current,
      }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, visible];
}
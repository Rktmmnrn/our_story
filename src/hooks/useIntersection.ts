import { useState, useEffect, useRef, RefObject } from 'react';

export function useIntersection(
  options: IntersectionObserverInit = {}
): [RefObject<any>, boolean] {
  const ref = useRef<Element>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      options
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return [ref, visible];
}

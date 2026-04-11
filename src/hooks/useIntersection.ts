import { useState, useEffect, RefObject } from 'react';

// ============================================================
//  HOOK — useIntersection
// ============================================================
function useIntersection(
  ref: RefObject<Element | null>,
  options: IntersectionObserverInit = {}
): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      options
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return visible;
}

export default useIntersection;

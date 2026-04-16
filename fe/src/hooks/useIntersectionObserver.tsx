import { useEffect, useRef, useState } from "react";

type UseIntersectionObserverParams = {
  enabled?: boolean;
  options?: IntersectionObserverInit;
};

export const useIntersectionObserver = <T extends Element>({
  enabled = true,
  options,
}: UseIntersectionObserverParams = {}) => {
  const targetRef = useRef<T | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!enabled || !targetRef.current) {
      observerRef.current?.disconnect();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsIntersecting(false);
      return;
    }

    observerRef.current = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observerRef.current.observe(targetRef.current);

    return () => observerRef.current?.disconnect();
  }, [enabled, options]);

  return { targetRef, isIntersecting };
};

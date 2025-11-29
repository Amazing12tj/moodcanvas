// src/hooks/useThrottledEffect.ts
import { useEffect, useRef } from 'react';

export const useThrottledEffect = (callback: () => void, delay: number, deps: any[] = []) => {
  const lastRan = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handler = () => {
      if (Date.now() - lastRan.current >= delay) {
        callback();
        lastRan.current = Date.now();
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          callback();
          lastRan.current = Date.now();
        }, delay - (Date.now() - lastRan.current));
      }
    };

    handler();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useThrottledEffect;
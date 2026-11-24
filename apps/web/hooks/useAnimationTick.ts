import { useCallback, useEffect, useRef } from "react";

export function useAnimationTick(
  callback: (deltaTile: number) => void,
  { autoStart }: { autoStart: boolean },
) {
  const animationRequestRef = useRef<number>(null);
  const previousTimeRef = useRef<number>(null);
  const isRunningRef = useRef(false);

  const tickRef = useRef<(time: number) => void>(null);

  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const startAnimate = useCallback(() => {
    if (isRunningRef.current) return;

    isRunningRef.current = true;
    previousTimeRef.current = null;

    if (tickRef.current) {
      animationRequestRef.current = requestAnimationFrame(tickRef.current);
    }
  }, []);

  const stopAnimate = useCallback(() => {
    isRunningRef.current = false;

    if (animationRequestRef.current !== null) {
      cancelAnimationFrame(animationRequestRef.current);
      animationRequestRef.current = null;
    }
  }, []);

  useEffect(() => {
    tickRef.current = (timestamp: number) => {
      if (!isRunningRef.current) return;

      if (previousTimeRef.current !== null) {
        const deltaTime = timestamp - previousTimeRef.current;
        callbackRef.current(deltaTime);
      }

      previousTimeRef.current = timestamp;
      if (tickRef.current) {
        animationRequestRef.current = requestAnimationFrame(tickRef.current);
      }
    };

    if (autoStart) {
      startAnimate();
    }

    return () => {
      stopAnimate();
    };
  }, [autoStart, startAnimate, stopAnimate]);
}

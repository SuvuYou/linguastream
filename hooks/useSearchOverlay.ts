"use client";

import { useCallback, useEffect, useState } from "react";
import Events from "@/events";
import { useAppStore } from "@/lib/initializations/store";

export function useSearchOverlay() {
  const { overlayOpen, setOverlayOpen } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);

  const handleToggleOverlay = useCallback(() => {
    setIsOpen(!isOpen);
    setOverlayOpen(!isOpen);
    Events.overlay.toggleOverlay(!isOpen);
  }, [isOpen, setOverlayOpen]);

  const handleSetOverlay = useCallback(
    ({ isOpen }: { isOpen: boolean }) => {
      setOverlayOpen(isOpen);
      Events.overlay.toggleOverlay(isOpen);
      setIsOpen(isOpen);
    },
    [setOverlayOpen],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();

        handleToggleOverlay();
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [handleToggleOverlay]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();

        handleSetOverlay({ isOpen: false });
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [handleSetOverlay]);

  return {
    isOpen: overlayOpen,
    open: () => handleSetOverlay({ isOpen: true }),
    close: () => handleSetOverlay({ isOpen: false }),
  };
}

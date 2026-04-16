"use client";

import { useEffect, useRef } from "react";
import "plyr/dist/plyr.css";

export default function Player({
  title,
  streamUrl,
}: {
  title: string;
  streamUrl: string;
}) {
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const plyrRef = useRef<Plyr>(null);

  useEffect(() => {
    const setupPlyr = async () => {
      if (!videoPlayerRef.current || typeof window === "undefined") return;

      const modulePlyr = await import("plyr");
      const PlyrPlayer = modulePlyr.default ?? modulePlyr;

      plyrRef.current = new PlyrPlayer(videoPlayerRef.current, {
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "duration",
          "mute",
          "volume",
          "fullscreen",
        ],
      });
    };

    setupPlyr();

    return () => {
      plyrRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!plyrRef.current) return;

    plyrRef.current.source = {
      type: "video",
      sources: [{ src: streamUrl, type: "video/mp4" }],
    };
  }, [streamUrl]);

  return (
    <div className="w-full max-w-5xl">
      <video ref={videoPlayerRef} title={title} playsInline>
        <source src={streamUrl} type="video/mp4" />
      </video>
    </div>
  );
}

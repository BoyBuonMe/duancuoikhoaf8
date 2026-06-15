"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type HomeHeroMediaProps = {
  desktopVideoSrc?: string;
  mobileVideoSrc?: string;
  posterSrc: string;
  fallbackImageSrc: string;
  alt: string;
  videoLabel: string;
  priority?: boolean;
};

export function HomeHeroMedia({
  desktopVideoSrc,
  mobileVideoSrc,
  posterSrc,
  fallbackImageSrc,
  alt,
  videoLabel,
  priority = false,
}: HomeHeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(Boolean(desktopVideoSrc));
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const hasVideo = Boolean(desktopVideoSrc);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReducedMotion = () => {
      setPrefersReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) {
        videoRef.current?.pause();
        setIsPlaying(false);
      }
    };

    syncReducedMotion();
    mediaQuery.addEventListener("change", syncReducedMotion);

    return () => mediaQuery.removeEventListener("change", syncReducedMotion);
  }, []);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    video.pause();
    setIsPlaying(false);
  };

  if (!hasVideo || prefersReducedMotion) {
    return (
      <Image
        src={posterSrc || fallbackImageSrc}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
      />
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        poster={posterSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={videoLabel}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        {mobileVideoSrc ? (
          <source src={mobileVideoSrc} media="(max-width: 767px)" type="video/mp4" />
        ) : null}
        <source src={desktopVideoSrc} type="video/mp4" />
      </video>

      <button
        type="button"
        onClick={togglePlayback}
        className="absolute bottom-5 right-5 z-20 inline-flex h-11 w-11 items-center justify-center bg-black/60 text-white transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label={isPlaying ? "Pause hero video" : "Play hero video"}
        title={isPlaying ? "Pause hero video" : "Play hero video"}
      >
        {isPlaying ? <Pause aria-hidden="true" size={20} /> : <Play aria-hidden="true" size={20} />}
      </button>
    </>
  );
}

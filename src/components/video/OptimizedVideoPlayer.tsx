"use client";
import React, { useRef, useEffect, useCallback, useState } from "react";

interface OptimizedVideoPlayerProps {
  src: string;
  isActive: boolean;
  isPriority: boolean;
  muted: boolean;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onPlayStateChange?: (playing: boolean) => void;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}


export const OptimizedVideoPlayer: React.FC<OptimizedVideoPlayerProps> = ({
  src,
  isActive,
  isPriority,
  muted,
  onLoadStart,
  onLoadComplete,
  onPlayStateChange,
  onClick,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const playAttemptRef = useRef<Promise<void> | null>(null);
  const rafRef = useRef<number | null>(null);

  // Preload strategy based on priority
  const preloadStrategy = isPriority ? "auto" : "metadata";

  // Handle video loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      onLoadComplete?.();
    };

    const handleLoadStart = () => {
      onLoadStart?.();
    };

    const handleError = (e: Event) => {
      console.error("Video load error:", e);
      setHasError(true);
    };

    const handleWaiting = () => {
      if (isActive) {
        console.log("Video buffering...");
      }
    };

    const handleStalled = () => {
      if (isActive && video.readyState < 3) {
        video.load();
      }
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("error", handleError);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("stalled", handleStalled);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("error", handleError);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("stalled", handleStalled);
    };
  }, [isActive, onLoadComplete, onLoadStart]);

  // ✅ FIX #2: Safari iOS autoplay handling logic
  const smoothPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !src) return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      video.muted = true; // Safari only allows autoplay if muted
    }

    // Cancel any pending play attempt
    if (playAttemptRef.current) {
      try {
        await playAttemptRef.current;
      } catch (_) {
        // ignore
      }
    }

    // Reset video if it ended
    if (video.ended) {
      video.currentTime = 0;
    }

    let retries = 3;
    while (retries > 0) {
      try {
        // Wait for the video to be ready
        if (video.readyState < 2) {
          await new Promise<void>((resolve) => {
            const checkReady = () => {
              if (video.readyState >= 2) {
                resolve();
              } else {
                rafRef.current = requestAnimationFrame(checkReady);
              }
            };
            checkReady();
          });
        }

        playAttemptRef.current = video.play();
        await playAttemptRef.current;
        onPlayStateChange?.(true);
        break; // success
      } catch (error: any) {
        if (error.name === "NotAllowedError" && isIOS) {
          console.warn("Safari autoplay blocked — waiting for user gesture...");
          break; // stop retrying, user must interact
        } else if (error.name === "AbortError") {
          // Try again after small delay
          retries--;
          await new Promise((resolve) => setTimeout(resolve, 100));
        } else {
          console.warn("Video play failed:", error.name, error.message);
          break;
        }
      }
    }
  }, [muted, onPlayStateChange, src]);

  const smoothPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (!video.paused) {
      video.pause();
      onPlayStateChange?.(false);
    }
  }, [onPlayStateChange]);

  // Handle active state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const handleActivation = async () => {
      if (isActive) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        smoothPlay();
      } else {
        smoothPause();
        if (video.currentTime > 0) {
          video.currentTime = 0;
        }
      }
    };

    handleActivation();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isActive, smoothPlay, smoothPause, src]);

  // Handle mute changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isActive) return;

    video.muted = muted;

    if (!muted && video.paused && isActive) {
      smoothPlay();
    }
  }, [muted, isActive, smoothPlay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.src = "";
        video.load();
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  if (hasError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-900`}>
        <p className="text-white text-sm">Failed to load video</p>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      loop
      playsInline
      muted={muted}
      preload={preloadStrategy}
      onClick={onClick}
      controls={false}
      disablePictureInPicture
      disableRemotePlayback
      style={{
        objectFit: "cover",
        willChange: isActive ? "transform" : "auto",
      }}
    />
  );
};

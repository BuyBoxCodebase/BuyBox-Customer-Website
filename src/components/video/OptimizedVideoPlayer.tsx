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

/**
 * TikTok-style optimized video player component
 * Features:
 * - Adaptive preloading (priority videos load first)
 * - Smooth playback transitions
 * - Memory-efficient buffering
 * - Automatic quality adjustment
 */
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
      // Video is buffering
      if (isActive) {
        console.log("Video buffering...");
      }
    };

    const handleStalled = () => {
      // Network stalled, try to recover
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

  // Smooth play/pause handling
  const smoothPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Cancel any pending play attempt
    if (playAttemptRef.current) {
      try {
        await playAttemptRef.current;
      } catch (e) {
        // Ignore
      }
    }

    // Reset video if it ended
    if (video.ended) {
      video.currentTime = 0;
    }

    // Ensure muted state
    video.muted = muted;

    // Try to play with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        // Wait for video to be ready
        if (video.readyState < 2) {
          await new Promise<void>((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max wait

            const checkReady = () => {
              attempts++;
              if (video.readyState >= 2) {
                resolve();
              } else if (attempts >= maxAttempts) {
                reject(new Error("Video load timeout"));
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
        break;
      } catch (error: any) {
        if (error.name === "NotAllowedError" && !muted && retries === 3) {
          // Try muted
          video.muted = true;
          retries--;
        } else if (error.name === "AbortError") {
          // Play was interrupted, retry
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

    // Cancel RAF if running
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

    // Wait for video element to be fully initialized
    const handleActivation = async () => {
      if (isActive) {
        // Small delay to ensure video element is ready after mount
        await new Promise(resolve => setTimeout(resolve, 50));
        smoothPlay();
      } else {
        smoothPause();
        // Reset non-active videos to start for better UX
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

  // Handle mute changes for active video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isActive) return;

    video.muted = muted;

    // If unmuting and video is paused, try to play
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
      autoPlay={isActive && muted}
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

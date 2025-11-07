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
  const [hasInteracted, setHasInteracted] = useState(false);
  const playAttemptRef = useRef<Promise<void> | null>(null);
  const isPlayingRef = useRef(false);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect Safari
  const isSafari = useRef(
    typeof window !== 'undefined' && 
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  );

  // Handle video loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      onLoadComplete?.();
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };

    const handleLoadedData = () => {
      setIsLoaded(true);
      onLoadComplete?.();
    };

    const handleLoadStart = () => {
      onLoadStart?.();
      // Set a timeout for loading
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      loadTimeoutRef.current = setTimeout(() => {
        if (!isLoaded && video.readyState < 2) {
          console.warn("Video load timeout, attempting reload");
          video.load();
        }
      }, 5000);
    };

    const handleError = (e: Event) => {
      console.error("Video load error:", e);
      setHasError(true);
    };

    const handlePlaying = () => {
      isPlayingRef.current = true;
    };

    const handlePause = () => {
      isPlayingRef.current = false;
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("error", handleError);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);

    // Load the video immediately
    video.load();

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("error", handleError);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [src, onLoadComplete, onLoadStart, isLoaded]);

  // Smooth play handling with Safari fixes
  const smoothPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !src) return;

    // For Safari, wait for user interaction on first play
    if (isSafari.current && !hasInteracted && !muted) {
      console.log("Safari: Waiting for user interaction");
      return;
    }

    // Cancel any pending play attempt
    if (playAttemptRef.current) {
      try {
        await playAttemptRef.current;
      } catch (e) {
        // Ignore
      }
    }

    // Don't try to play if already playing
    if (isPlayingRef.current && !video.paused) {
      return;
    }

    // Reset video if it ended
    if (video.ended) {
      video.currentTime = 0;
    }

    // Ensure muted state is set BEFORE play
    video.muted = muted;

    try {
      // For Safari iOS, ensure video is loaded
      if (isSafari.current && video.readyState < 2) {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Load timeout")), 3000);
          
          const checkReady = () => {
            if (video.readyState >= 2) {
              clearTimeout(timeout);
              resolve();
            } else {
              requestAnimationFrame(checkReady);
            }
          };
          checkReady();
        });
      }

      playAttemptRef.current = video.play();
      await playAttemptRef.current;
      isPlayingRef.current = true;
      onPlayStateChange?.(true);
    } catch (error: any) {
      console.warn("Video play failed:", error.name, error.message);
      
      // If NotAllowedError and not muted, Safari needs interaction
      if (error.name === "NotAllowedError") {
        if (isSafari.current && !muted) {
          // Try muted playback
          video.muted = true;
          try {
            await video.play();
            isPlayingRef.current = true;
            onPlayStateChange?.(true);
          } catch (e) {
            console.error("Muted play also failed:", e);
          }
        }
      } else if (error.name === "AbortError") {
        // Play was interrupted, will retry on next isActive change
        console.log("Play aborted, will retry");
      }
    }
  }, [muted, onPlayStateChange, src, hasInteracted]);

  const smoothPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlayingRef.current || !video.paused) {
      video.pause();
      isPlayingRef.current = false;
      onPlayStateChange?.(false);
    }
  }, [onPlayStateChange]);

  // Handle click for Safari user interaction
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    onClick?.(e);
  }, [hasInteracted, onClick]);

  // Handle active state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (isActive) {
      // Give Safari a moment to settle
      const playTimeout = setTimeout(() => {
        smoothPlay();
      }, isSafari.current ? 100 : 50);

      return () => clearTimeout(playTimeout);
    } else {
      smoothPause();
      // Reset non-active videos
      if (video.currentTime > 0) {
        video.currentTime = 0;
      }
    }
  }, [isActive, smoothPlay, smoothPause, src]);

  // Handle mute changes for active video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isActive) return;

    video.muted = muted;

    // If unmuting and video is paused, try to play
    if (!muted && video.paused && isActive) {
      setHasInteracted(true); // User action to unmute
      smoothPlay();
    }
  }, [muted, isActive, smoothPlay]);

  // Handle source changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset state when source changes
    setIsLoaded(false);
    setHasError(false);
    isPlayingRef.current = false;

    // Pause and reset
    video.pause();
    video.currentTime = 0;
    
    // Give Safari time to process source change
    if (isSafari.current) {
      setTimeout(() => {
        video.load();
      }, 50);
    } else {
      video.load();
    }
  }, [src]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
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
      preload={isSafari.current ? "metadata" : (isPriority ? "auto" : "metadata")}
      onClick={handleClick}
      controls={false}
      disablePictureInPicture
      disableRemotePlayback
      // Critical for iOS Safari
      webkit-playsinline="true"
      x-webkit-airplay="deny"
      style={{
        objectFit: "cover",
        willChange: isActive ? "transform" : "auto",
      }}
    />
  );
};
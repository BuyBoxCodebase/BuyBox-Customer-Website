"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import useGetAllVideo from "@/hooks/videos/useGetVideos";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { OptimizedVideoPlayer } from "@/components/video/OptimizedVideoPlayer";

const ForYouPage = () => {
  const { videos, loading } = useGetAllVideo();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayPause, setShowPlayPause] = useState(false);
  const [showPlayPrompt, setShowPlayPrompt] = useState(false);
  const [videoStates, setVideoStates] = useState<{ [key: string]: boolean }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const playPauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Intersection observer for current video detection
  useEffect(() => {
    if (!containerRef.current || videos.length === 0 || loading) return;

    // Small delay to ensure DOM is fully ready
    const setupObserver = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = wrapperRefs.current.findIndex((el) => el === entry.target);
            if (index === -1) return;
            if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
              setCurrentIndex(index);
              setIsPlaying(true);
              setShowPlayPrompt(false);
            }
          });
        },
        { 
          root: containerRef.current, 
          threshold: [0.5, 0.7, 0.9],
          rootMargin: "0px"
        }
      );

      wrapperRefs.current.forEach((el) => {
        if (el) observer.observe(el);
      });

      return observer;
    };

    const timeoutId = setTimeout(() => {
      const observer = setupObserver();
      return () => observer?.disconnect();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [videos.length, loading]);

  // Handle play state changes from OptimizedVideoPlayer
  const handlePlayStateChange = (playing: boolean) => {
    setIsPlaying(playing);
    if (!playing) {
      setShowPlayPrompt(true);
    }
  };

  // Handle manual play
  const handleManualPlay = () => {
    setIsPlaying(true);
    setShowPlayPrompt(false);
  };

  // Tap to play/pause
  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (showPlayPrompt) {
      handleManualPlay();
      return;
    }

    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    showPlayPauseIcon(newPlayingState);
  };

  // Show temporary play/pause icon overlay
  const showPlayPauseIcon = (playing: boolean) => {
    setShowPlayPause(true);
    if (playPauseTimeoutRef.current) clearTimeout(playPauseTimeoutRef.current);
    playPauseTimeoutRef.current = setTimeout(() => setShowPlayPause(false), 800);
  };

  const handleBuyClick = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    router.push(`/product/${productId}`);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted(!muted);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <>
      <div className="h-screen w-full flex items-center justify-center ">
        <style jsx global>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          @keyframes fadeInOut {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            20% {
              opacity: 1;
              transform: scale(1);
            }
            80% {
              opacity: 1;
              transform: scale(1);
            }
            100% {
              opacity: 0;
              transform: scale(0.8);
            }
          }
          .animate-fade-in-out {
            animation: fadeInOut 0.8s ease-in-out;
          }
          @keyframes pulse {
            0%,
            100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }
          .animate-pulse-slow {
            animation: pulse 2s ease-in-out infinite;
          }
        `}</style>

        <div className="relative h-full w-full max-w-md mx-auto bg-black shadow-2xl">
          <div
            ref={containerRef}
            className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar"
          >
            {videos.map((video, index) => {
              const isCurrentVideo = index === currentIndex;
              const isPriorityVideo = Math.abs(index - currentIndex) <= 1; // Current, prev, and next

              return (
                <div
                  key={video.id}
                  ref={(el) => {
                    wrapperRefs.current[index] = el;
                  }}
                  className="relative h-full w-full snap-start snap-always flex items-center justify-center"
                >
                  <OptimizedVideoPlayer
                    src={video.videoUrl}
                    isActive={isCurrentVideo && isPlaying}
                    isPriority={isPriorityVideo}
                    muted={muted}
                    onPlayStateChange={handlePlayStateChange}
                    onClick={handleVideoClick}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                  />

                  {/* Play Prompt Overlay */}
                  {isCurrentVideo && showPlayPrompt && (
                  <div
                    className="absolute inset-0 flex items-center justify-center z-30 bg-black/40 cursor-pointer"
                    onClick={handleManualPlay}
                  >
                    <div className="flex flex-col items-center gap-4 animate-pulse-slow">
                      <div className="bg-white rounded-full p-6 shadow-2xl">
                        <Play className="h-16 w-16 text-black fill-black" />
                      </div>
                      <p className="text-white text-lg font-semibold">Tap to play</p>
                    </div>
                  </div>
                  )}

                  {/* Play/Pause Overlay */}
                  {isCurrentVideo && showPlayPause && !showPlayPrompt && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="bg-black/50 rounded-full p-6 backdrop-blur-sm animate-fade-in-out">
                      {isPlaying ? (
                        <Pause className="h-16 w-16 text-white" />
                      ) : (
                        <Play className="h-16 w-16 text-white" />
                      )}
                    </div>
                  </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Bottom caption */}
                  <div className="absolute bottom-20 left-4 right-20 z-10 pointer-events-none">
                    <p className="text-white text-lg font-semibold mb-2 drop-shadow-lg">
                      {video.caption}
                    </p>
                    <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-white text-sm font-medium">
                        Size: {video.size}
                      </span>
                    </div>
                  </div>

                  {/* Buy button */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
                    <Button
                      onClick={(e) => handleBuyClick(e, video.productId)}
                      size="icon"
                      className="h-14 w-14 rounded-full bg-white hover:bg-gray-100 shadow-lg"
                    >
                      <ShoppingCart className="h-6 w-6 text-black" />
                    </Button>
                  </div>

                  {/* Mute button */}
                  <div className="absolute bottom-20 right-4 z-10">
                    <Button
                      onClick={toggleMute}
                      size="icon"
                      variant="ghost"
                      className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                    >
                      {muted ? (
                        <VolumeX className="h-5 w-5 text-white" />
                      ) : (
                        <Volume2 className="h-5 w-5 text-white" />
                      )}
                    </Button>
                  </div>

                  {/* Video indicator dots */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-1 z-10 pointer-events-none">
                    {videos.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1 rounded-full transition-all ${
                          idx === index ? "w-8 bg-white" : "w-1 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ForYouPage;

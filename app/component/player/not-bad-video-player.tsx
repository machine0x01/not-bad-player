"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BaselinePlayArrow,
  BaselinePause,
  SoundOff,
  SoundLoud,
  SubtitleLine,
  TwotoneFullscreen,
} from "@/app/component/icons/icons";
import { useSubtitles } from "./hooks/useSubtitles";
import useVideoPlayer from "./hooks/useVideoPlayer";

interface SubtitleFiles {
  [key: string]: string | null;
}

interface NotBadVideoPlayerProps {
  subtitleFiles?: SubtitleFiles;
  source : string
  playOnlyInView?: Boolean
  customStyles?: {
    progressBar: string
  }
}

const NotBadVideoPlayer: React.FC<NotBadVideoPlayerProps> = ({
  subtitleFiles,
  source,
  playOnlyInView,
  customStyles= {progressBar:"#22c55e"}
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isPlaying, togglePlayPause, duration, currentTime, seek } =
    useVideoPlayer(videoRef);

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showCenterIcon, setShowCenterIcon] = useState(true);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>("off");
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const subtitleText = subtitleFiles
    ? useSubtitles(subtitleFiles, selectedSubtitle, currentTime)
    : null;

  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const resetHideControlsTimer = () => {
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    setShowControls(true);
    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };

  const handleToggle = () => {
    togglePlayPause();
    setShowCenterIcon(true);
    setTimeout(() => setShowCenterIcon(false), 800);
  };

  const toggleMute = () => setIsMuted((prev) => !prev);

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
          );
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    resetHideControlsTimer();
    return () => {
      if (hideControlsTimeout.current)
        clearTimeout(hideControlsTimeout.current);
    };
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement !== document.body) return;

      if (e.code === "Space") {
        e.preventDefault();
        handleToggle();
      }

      if (e.code === "ArrowRight" && videoRef.current) {
        e.preventDefault();
        videoRef.current.currentTime = Math.min(
          videoRef.current.currentTime + 5,
          videoRef.current.duration
        );
      }

      if (e.code === "ArrowLeft" && videoRef.current) {
        e.preventDefault();
        videoRef.current.currentTime = Math.max(
          videoRef.current.currentTime - 5,
          0
        );
      }

      if (e.code === "KeyM" && videoRef.current) {
        e.preventDefault();
        toggleMute();
      }

      if (e.code === "KeyF") {
        e.preventDefault();
        toggleFullscreen();
      }

      if (e.code === "Escape" && isFullscreen) {
        e.preventDefault();
        document.exitFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    if (!playOnlyInView || !containerRef.current || !videoRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;

        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {
          });
        } else {
          videoRef.current.pause();
        }
      },
      {
        threshold: 0.5, 
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [playOnlyInView]);

  return (
    <div
      onClick={handleToggle}
      className="cursor-pointer flex items-center justify-center"
    >
      <div
        ref={containerRef}
        className={`relative overflow-hidden ${
          isFullscreen 
            ? "w-screen h-screen bg-black" 
            : "rounded-xl"
        }`}
        onMouseMove={resetHideControlsTimer}
        onMouseEnter={resetHideControlsTimer}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          key="video-player"
          ref={videoRef}
          preload="auto"
          controls={false}
          controlsList="nodownload"
          autoPlay={false}
          className={`${
            isFullscreen 
              ? "w-full h-full object-contain" 
              : "w-full"
          }`}
        >
          <source src={source} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <AnimatePresence>
          {showCenterIcon && (
            <motion.div
              key="center-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-black/50 p-4 rounded-full">
                {isPlaying ? (
                  <BaselinePause className="text-white w-10 h-10" />
                ) : (
                  <BaselinePlayArrow className="text-white w-10 h-10" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showSubtitles && selectedSubtitle !== "off" && subtitleText && (
          <div
            className={`absolute ${
              showControls ? (isFullscreen ? "bottom-24" : "bottom-20") : (isFullscreen ? "bottom-12" : "bottom-7")
            } w-full text-center px-6`}
          >
            <p className={`text-white ${isFullscreen ? "text-2xl" : "text-lg"} bg-black/50 drop-shadow-lg inline-block px-4 py-1 rounded-lg whitespace-pre-line`}>
              {subtitleText}
            </p>
          </div>
        )}

        <AnimatePresence>
          {showControls && (
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3 }}
              className={`${
                isFullscreen ? "h-20" : "h-14"
              } bg-black/10 backdrop-blur-2xl gap-6 absolute w-full bottom-0 flex items-center ${
                isFullscreen ? "px-8" : "px-6"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle();
                  }}
                  className={`${
                    isFullscreen ? "p-3" : "p-2"
                  } text-white rounded hover:bg-white/20 hover:backdrop-blur`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isPlaying ? (
                      <motion.div
                        key="pause"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <BaselinePause className={isFullscreen ? "w-6 h-6" : ""} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="play"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <BaselinePlayArrow className={isFullscreen ? "w-6 h-6" : ""} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className={`${
                    isFullscreen ? "p-3" : "p-2"
                  } text-white rounded hover:bg-white/20 hover:backdrop-blur`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isMuted ? (
                      <motion.div
                        key="muted"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SoundOff className={isFullscreen ? "w-6 h-6" : ""} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="unmuted"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SoundLoud className={isFullscreen ? "w-6 h-6" : ""} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                <div>
                  {duration !== null && (
                    <p className={`text-white ${isFullscreen ? "text-base" : "text-sm"}`}>
                      {Math.floor(currentTime / 60)}:
                      {Math.floor(currentTime % 60)
                        .toString()
                        .padStart(2, "0")}{" "}
                      / {Math.floor(duration / 60)}:
                      {Math.floor(duration % 60)
                        .toString()
                        .padStart(2, "0")}
                    </p>
                  )}
                </div>
              </div>

              <div
                className="w-full flex-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percentage =
                    ((e.clientX - rect.left) / rect.width) * 100;
                  seek(percentage);
                }}
              >
                <div className={`w-full ${isFullscreen ? "h-3" : "h-2"} bg-white/20 rounded-full`}>
                  <div

                    className="h-full  rounded-full transition-all duration-200"
                    style={{ width: `${progressPercentage}%`, backgroundColor:customStyles.progressBar }}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSubtitleMenu((prev) => !prev);
                      resetHideControlsTimer();
                    }}
                    className={`${
                      isFullscreen ? "p-3" : "p-2"
                    } text-white rounded hover:bg-white/20 hover:backdrop-blur`}
                  >
                    <SubtitleLine fontSize={isFullscreen ? 24 : 20} />
                  </button>

                  <AnimatePresence>
                    {showSubtitleMenu && subtitleFiles && (
                      <motion.div
                        key="subtitle-menu"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute bottom-full ${
                          isFullscreen ? "mb-4" : "mb-2"
                        } right-0 bg-black/90 rounded-md ${
                          isFullscreen ? "p-3" : "p-2"
                        } flex flex-col gap-2 z-10`}
                      >
                        {Object.keys({
                          ...(subtitleFiles || {}),
                          off: "off",
                        }).map((lang) => (
                          <button
                            key={lang}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubtitle(lang);
                              setShowSubtitleMenu(false);
                            }}
                            className={`${
                              isFullscreen ? "px-4 py-2" : "px-3 py-1"
                            } rounded text-white hover:bg-white/20 hover:backdrop-blur ${
                              selectedSubtitle === lang
                                ? "bg-blue-600 font-semibold"
                                : ""
                            } ${isFullscreen ? "text-base" : "text-sm"}`}
                          >
                            {lang === "off" ? "Off" : lang.toUpperCase()}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  className={`${
                    isFullscreen ? "p-3" : "p-2"
                  } text-white rounded hover:bg-white/20 hover:backdrop-blur`}
                >
                  <TwotoneFullscreen fontSize={isFullscreen ? 24 : 20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotBadVideoPlayer;
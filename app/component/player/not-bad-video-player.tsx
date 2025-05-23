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

const NotBadVideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isPlaying, togglePlayPause, duration, currentTime, seek } =
    useVideoPlayer(videoRef);

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showCenterIcon, setShowCenterIcon] = useState(true);
  const subtitleText = useSubtitles("/assets/eng-sub.vtt", currentTime);

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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      onClick={handleToggle}
      className="cursor-pointer flex items-center justify-center"
    >
      <div
        className="relative rounded-xl overflow-hidden"
        onMouseMove={resetHideControlsTimer}
        onMouseEnter={resetHideControlsTimer}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          key="video-player"
          ref={videoRef}
          preload="auto"
          autoPlay={false}
          className="w-full"
        >
          <source src="/assets/video.mp4" type="video/mp4" />
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
              className="absolute inset-0 flex items-center justify-center"
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

        {/* Subtitles */}
        {subtitleText && (
          <div
            className={`absolute ${
              showControls ? "bottom-20" : "bottom-7"
            } w-full text-center px-6`}
          >
            <p className="text-white text-lg bg-black/50 drop-shadow-lg inline-block px-4 py-1 rounded-lg">
              {subtitleText}
            </p>
          </div>
        )}

        {/* Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
            onClick={(e) => e.stopPropagation()}  
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3 }}
              className="h-14 bg-black/10 backdrop-blur-2xl gap-6 absolute w-full bottom-0 flex items-center px-6"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle();
                  }}
                  className="p-2 text-white rounded hover:bg-white/20 hover:backdrop-blur"
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
                        <BaselinePause />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="play"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <BaselinePlayArrow />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="p-2 text-white rounded hover:bg-white/20 hover:backdrop-blur"
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
                        <SoundOff />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="unmuted"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SoundLoud />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                <div>
                  {duration !== null && (
                    <p className="text-white text-sm">
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
                className="w-2/3 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percentage =
                    ((e.clientX - rect.left) / rect.width) * 100;
                  seek(percentage);
                }}
              >
                <div className="w-full h-2 bg-white/20 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-200"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div>
                  <SubtitleLine fontSize={20} />
                </div>                
                
                <div>
                  <TwotoneFullscreen fontSize={20} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotBadVideoPlayer;

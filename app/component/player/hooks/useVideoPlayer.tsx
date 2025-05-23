import { RefObject } from "react";
import { useState, useEffect } from "react";
const useVideoPlayer = (videoRef: RefObject<HTMLVideoElement | null>) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
  
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
  
      video.load();
  
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        setCurrentTime(0);
      };
  
      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
      };
  
      const handleEnded = () => {
        setIsPlaying(false);
      };
  
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("ended", handleEnded);
  
      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("ended", handleEnded);
      };
    }, [videoRef]);
  
    const togglePlayPause = () => {
      const video = videoRef.current;
      if (video) {
        if (video.paused) {
          video.play();
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      }
    };
  
    const seek = (percentage: number) => {
      if (videoRef.current && duration) {
        const newTime = (percentage / 100) * duration;
        videoRef.current.currentTime = newTime;
      }
    };
  
    return { isPlaying, togglePlayPause, duration, currentTime, seek };
  };

export default useVideoPlayer
"use client"
import { useEffect, useState } from "react";

export interface Cue {
  start: number;
  end: number;
  text: string;
}

const parseVTTTime = (time: string) => {
  const [h, m, s] = time.split(":");
  const [sec, ms] = s.split(".");
  return (
    parseInt(h) * 3600 +
    parseInt(m) * 60 +
    parseInt(sec) +
    parseInt(ms) / 1000
  );
};

const parseVTT = async (url: string): Promise<Cue[]> => {
  const res = await fetch(url);
  const text = await res.text();

  const cues: Cue[] = [];
  const blocks = text.split("\n\n");

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length >= 2) {
      const [start, end] = lines[0].split(" --> ");
      const text = lines.slice(1).join("\n");
      cues.push({
        start: parseVTTTime(start),
        end: parseVTTTime(end),
        text,
      });
    }
  }

  return cues;
};

export const useSubtitles = (subtitleUrl: string, currentTime: number) => {
  const [cues, setCues] = useState<Cue[]>([]);
  const [subtitleText, setSubtitleText] = useState("");

  useEffect(() => {
    parseVTT(subtitleUrl).then(setCues);
  }, [subtitleUrl]);

  useEffect(() => {
    const cue = cues.find(
      (cue) => currentTime >= cue.start && currentTime <= cue.end
    );
    setSubtitleText(cue?.text || "");
  }, [currentTime, cues]);

  return subtitleText;
};

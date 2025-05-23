"use client";
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
    (ms ? parseInt(ms) / 1000 : 0)
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
      if (!start || !end) continue;
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

// subtitleUrls is a map of lang code to URL, e.g. { eng: "/eng.vtt", spa: "/spa.vtt" }
export const useSubtitles = (
  subtitleUrls: Record<string, string | null>,
  selectedLang: string,
  currentTime: number
) => {
  const [cuesMap, setCuesMap] = useState<Record<string, Cue[]>>({});
  const [subtitleText, setSubtitleText] = useState("");

  useEffect(() => {
    const loadAll = async () => {
      const newCuesMap: Record<string, Cue[]> = {};
      await Promise.all(
        Object.entries(subtitleUrls).map(async ([lang, url]) => {
          if (url) {
            try {
              const cues = await parseVTT(url);
              newCuesMap[lang] = cues;
            } catch {
              newCuesMap[lang] = [];
            }
          } else {
            newCuesMap[lang] = [];
          }
        })
      );
      setCuesMap(newCuesMap);
    };
    loadAll();
  }, [subtitleUrls]);

  useEffect(() => {
    if (!selectedLang || !cuesMap[selectedLang]) {
      setSubtitleText("");
      return;
    }
    const cue = cuesMap[selectedLang].find(
      (cue) => currentTime >= cue.start && currentTime <= cue.end
    );
    setSubtitleText(cue?.text || "");
  }, [currentTime, selectedLang, cuesMap]);

  return subtitleText;
};

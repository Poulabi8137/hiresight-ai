"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Maximize2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type VideoInterviewPlayerProps = {
  src: string;
  candidateName: string;
  candidateInitials: string;
  title?: string;
  className?: string;
  onCinemaMode?: () => void;
  showCinemaButton?: boolean;
};

export function VideoInterviewPlayer({
  src,
  candidateName,
  candidateInitials,
  title = "Interview review",
  className,
  onCinemaMode,
  showCinemaButton = true
}: VideoInterviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => {
      if (!video.duration) return;
      setProgress((video.currentTime / video.duration) * 100);
    };

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadeddata", () => setReady(true));
    return () => {
      video.removeEventListener("timeupdate", onTime);
    };
  }, [src]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div className={cn("relative overflow-hidden bg-slate-950", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(45,212,191,0.28),transparent_40%),radial-gradient(circle_at_82%_78%,rgba(251,146,60,0.2),transparent_38%),linear-gradient(160deg,rgba(15,23,42,0.35),rgba(2,6,23,0.92))]" />

      {!ready ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8">
          <motion.div
            animate={{ scale: [1, 1.04, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-24 w-24 items-center justify-center rounded-full border border-teal-400/40 bg-teal-400/10 text-2xl font-semibold text-teal-100 shadow-[0_0_60px_rgba(45,212,191,0.35)]"
          >
            {candidateInitials}
          </motion.div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Preparing stream</p>
            <p className="mt-2 text-lg font-medium text-white/85">{candidateName}</p>
          </div>
        </div>
      ) : null}

      <video
        ref={videoRef}
        key={src}
        src={src}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-500",
          ready ? "opacity-90" : "opacity-0"
        )}
        muted={muted}
        playsInline
        preload="metadata"
        onClick={togglePlay}
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.55)_0%,transparent_28%,transparent_62%,rgba(2,6,23,0.88)_100%)]" />

      <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2 sm:left-5 sm:top-5">
        <span className="rounded-full bg-red-500/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_0_24px_rgba(239,68,68,0.55)]">
          {title}
        </span>
        <span className="rounded-full border border-white/15 bg-black/45 px-3 py-1 text-xs text-white/75 backdrop-blur-md">
          AI transcript active
        </span>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5">
        <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/12">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-orange-400"
            style={{ width: `${progress}%` }}
            layout
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={togglePlay}
              className="h-10 w-10 border-white/20 bg-black/50 text-white hover:bg-white/10"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => {
                const video = videoRef.current;
                if (!video) return;
                video.muted = !video.muted;
                setMuted(video.muted);
              }}
              className="h-10 w-10 border-white/20 bg-black/50 text-white hover:bg-white/10"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
          {showCinemaButton && onCinemaMode ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onCinemaMode}
              className="border-white/20 bg-black/45 text-white hover:bg-white/10"
            >
              <Maximize2 className="h-4 w-4" />
              Cinema mode
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

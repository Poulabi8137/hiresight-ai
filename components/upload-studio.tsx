"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Camera,
  CheckCircle2,
  FileVideo,
  FileUp,
  Loader2,
  Mic,
  PlayCircle,
  Radio,
  ShieldCheck,
  Sparkles,
  Square,
  UploadCloud
} from "lucide-react";
import { useHireSightStore, useUploadsByKind, useUploadProgress, type StoredUpload } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type UploadKind = "resume" | "video_resume" | "interview" | "avatar";

const limits: Record<UploadKind, string[]> = {
  resume: ["application/pdf"],
  video_resume: ["video/mp4", "video/webm", "video/quicktime"],
  interview: ["video/mp4", "video/webm", "video/quicktime"],
  avatar: ["image/png", "image/jpeg", "image/webp"]
};

const demoVideos = [
  {
    label: "Strong interview sample",
    fileName: "strong-ai-interview.mp4",
    url: "/demo-videos/strong-ai-interview.mp4",
    score: 94,
    tone: "confident, structured, high signal"
  },
  {
    label: "Average interview sample",
    fileName: "average-ai-interview.mp4",
    url: "/demo-videos/average-ai-interview.mp4",
    score: 68,
    tone: "clear but less specific"
  }
];

export function UploadStudio() {
  const [kind, setKind] = useState<UploadKind>("video_resume");
  const [file, setFile] = useState<File | null>(null);
  const [demoUrl, setDemoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState("Drop a video or PDF to begin.");
  const [cameraState, setCameraState] = useState<"idle" | "starting" | "live" | "recording">("idle");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const uploadProgress = useUploadProgress();
  const uploadsByKind = useUploadsByKind();
  const setUploadProgress = useHireSightStore((s) => s.setUploadProgress);
  const addUpload = useHireSightStore((s) => s.addUpload);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  const activeUpload: StoredUpload | null = useMemo(
    () => uploadsByKind[kind]?.[0] ?? null,
    [uploadsByKind, kind]
  );

  const progress = useMemo(() => {
    if (status === "uploading" || status === "done") return uploadProgress[kind] ?? 0;
    if (activeUpload && !file && status === "idle") return 100;
    return uploadProgress[kind] ?? 0;
  }, [status, uploadProgress, kind, activeUpload, file]);

  const preview = useMemo(() => {
    if (demoUrl) return demoUrl;
    if (file) {
      if (file.type.startsWith("video/") || file.type.startsWith("image/")) {
        return URL.createObjectURL(file);
      }
      return null;
    }
    if (signedUrl) return signedUrl;
    return null;
  }, [demoUrl, file, signedUrl]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (!activeUpload) {
      setSignedUrl(null);
      return;
    }

    let cancelled = false;

    const fetchSignedUrl = async () => {
      try {
        const res = await fetch("/api/storage/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bucket: activeUpload.bucket, path: activeUpload.storage_path })
        });
        const data = await res.json();
        if (!cancelled && data.signedUrl) {
          setSignedUrl(data.signedUrl);
        }
      } catch {
        if (!cancelled) setSignedUrl(null);
      }
    };

    fetchSignedUrl();

    return () => {
      cancelled = true;
    };
  }, [activeUpload]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const acceptFile = (incoming: File | undefined) => {
    if (!incoming) return;
    if (!limits[kind].includes(incoming.type)) {
      setStatus("error");
      setMessage("Unsupported file type for this upload lane.");
      return;
    }
    setFile(incoming);
    setDemoUrl(null);
    setStatus("idle");
    setMessage(`${incoming.name} ready for secure upload.`);
    setUploadProgress(kind, 8);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    acceptFile(event.dataTransfer.files[0]);
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    acceptFile(event.target.files?.[0]);
  };

  const doUpload = (retries = 2): Promise<void> => {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.set("kind", kind);
      form.set("file", file!);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/storage/upload");
      xhr.responseType = "json";

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const next = Math.max(6, Math.min(96, Math.round((event.loaded / event.total) * 96)));
        setUploadProgress(kind, next);
      };

      xhr.onerror = () => reject(new Error("Upload failed. Check your connection and retry."));

      xhr.onload = () => {
        const ok = xhr.status >= 200 && xhr.status < 300;
        if (!ok) {
          const err = (xhr.response as any)?.error ?? "Upload service returned an error.";
          reject(new Error(String(err)));
          return;
        }

        const record = (xhr.response as any)?.upload;
        if (record && record.bucket && record.storage_path) {
          addUpload(kind, record);
        }
        resolve();
      };

      xhr.send(form);
    });
  };

  const upload = async () => {
    if (!file) return;
    setStatus("uploading");
    setMessage("Uploading securely to private Supabase Storage…");
    setUploadProgress(kind, 4);

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await doUpload(attempt);
        setUploadProgress(kind, 100);
        setStatus("done");
        setMessage("Upload complete. Stored as a durable bucket/path reference with signed URLs generated on demand.");
        return;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error("Upload failed.");
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          setMessage(`Retrying… (attempt ${attempt + 2}/3)`);
        }
      }
    }

    setStatus("error");
    setMessage(lastError?.message ?? "Upload failed after 3 attempts.");
    setUploadProgress(kind, 0);
  };

  const loadDemoVideo = async (sample: (typeof demoVideos)[number]) => {
    setKind("interview");
    setStatus("idle");
    setMessage(`Loading ${sample.label.toLowerCase()}...`);
    const response = await fetch(sample.url);
    const blob = await response.blob();
    const demoFile = new File([blob], sample.fileName, { type: "video/mp4" });
    setFile(demoFile);
    setDemoUrl(sample.url);
    setUploadProgress("interview", 14);
    setMessage(`${sample.label} loaded. Score expectation: ${sample.score}%.`);
  };

  const startCamera = async () => {
    setKind("interview");
    setCameraState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState("live");
      setMessage("Live interview preview is running. Record when ready.");
    } catch {
      setCameraState("idle");
      setStatus("error");
      setMessage("Camera permission was blocked or no camera is available.");
    }
  };

  const stopCamera = () => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setCameraState("idle");
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const recorded = new File([blob], `live-interview-${Date.now()}.webm`, { type: "video/webm" });
      setFile(recorded);
      setDemoUrl(null);
      setUploadProgress("interview", 18);
      setMessage("Recorded interview preview is ready to upload.");
      setCameraState(streamRef.current ? "live" : "idle");
    };
    recorderRef.current = recorder;
    recorder.start();
    setCameraState("recording");
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
  };

  const renderPreview = () => {
    if (cameraState === "live" || cameraState === "recording") {
      return <video ref={videoRef} muted playsInline className="aspect-video h-full w-full object-cover" />;
    }

    if (preview) {
      if (file?.type.startsWith("image/")) {
        return (
          <div className="relative aspect-video h-full w-full">
            <Image src={preview} alt="Upload preview" fill className="object-cover" />
          </div>
        );
      }
      return (
        <video
          src={preview}
          controls
          playsInline
          preload="metadata"
          className="aspect-video h-full w-full object-cover"
        />
      );
    }

    if (file) {
      return (
        <div className="flex aspect-video items-center justify-center p-8 text-center text-white">
          <div>
            <FileUp className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-3 text-sm">{file.name}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex aspect-video items-center justify-center p-8 text-center text-white">
        <div>
          <FileVideo className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 text-2xl font-semibold">Preview appears here instantly</h2>
          <p className="mt-2 text-sm text-slate-300">Use camera, demo samples, or drag a file.</p>
        </div>
      </div>
    );
  };

  return (
    <main className="container py-8">
      <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_0.42fr] lg:items-end">
        <div>
          <Badge className="bg-background/80">Upload studio</Badge>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal sm:text-6xl">
            Capture the signal before the resume.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Drag in files, load judge-ready interview samples, or open a live camera preview to record a candidate response.
          </p>
        </div>
        <div className="glass rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Radio className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium">Live preview</p>
              <p className="text-xs text-muted-foreground">Camera, local file, and demo video ready</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.34fr_0.66fr]">
        <Card className="glass p-5">
          <div className="grid gap-3">
            {[
              ["resume", "Resume PDF"],
              ["video_resume", "Video resume"],
              ["interview", "Interview recording"],
              ["avatar", "Avatar image"]
            ].map(([value, label]) => (
              <Button
                key={value}
                variant={kind === value ? "default" : "outline"}
                onClick={() => {
                  setKind(value as UploadKind);
                  setFile(null);
                  setDemoUrl(null);
                  setStatus("idle");
                }}
                className="justify-start"
              >
                <FileUp className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              Demo interview videos
            </div>
            {demoVideos.map((sample) => (
              <button
                key={sample.fileName}
                type="button"
                onClick={() => void loadDemoVideo(sample)}
                className="w-full rounded-lg border bg-background/65 p-3 text-left transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{sample.label}</span>
                  <Badge>{sample.score}%</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{sample.tone}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-lg border bg-background/70 p-4">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-semibold">Validation rules</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              PDFs are accepted for resumes. MP4, WebM, and MOV files are accepted for video lanes. Metadata is stored through the uploads API.
            </p>
          </div>
        </Card>

        <motion.div
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          className="glass rounded-lg p-4 sm:p-6"
        >
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative overflow-hidden rounded-lg border bg-slate-950">
              {renderPreview()}
              <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {cameraState === "recording" ? "Recording" : cameraState === "live" ? "Live camera" : file ? file.name : activeUpload ? activeUpload.file_name : "No file selected"}
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4">
              <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-primary/40 bg-background/50 p-6 text-center transition hover:bg-primary/5" role="button" aria-label={`Upload ${kind.replace("_", " ")} file`}>
                <UploadCloud className="h-9 w-9 text-primary" aria-hidden="true" />
                <h2 className="mt-4 text-xl font-semibold">Drag, drop, preview, upload</h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
                <input
                  type="file"
                  className="sr-only"
                  accept={limits[kind].join(",")}
                  onChange={onChange}
                  aria-label={`Select ${kind.replace("_", " ")} file`}
                />
              </label>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant={cameraState === "idle" ? "outline" : "default"}
                  onClick={cameraState === "idle" ? startCamera : stopCamera}
                  type="button"
                  aria-label={cameraState === "idle" ? `Start camera for ${kind.replace("_", " ")}` : "Stop camera"}
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  {cameraState === "idle" ? "Start camera" : "Stop camera"}
                </Button>
                <Button
                  variant={cameraState === "recording" ? "secondary" : "outline"}
                  disabled={cameraState !== "live" && cameraState !== "recording"}
                  onClick={cameraState === "recording" ? stopRecording : startRecording}
                  type="button"
                  aria-label={cameraState === "recording" ? "Stop recording" : "Start recording"}
                >
                  {cameraState === "recording" ? <Square className="h-4 w-4" aria-hidden="true" /> : <Mic className="h-4 w-4" aria-hidden="true" />}
                  {cameraState === "recording" ? "Stop recording" : "Record answer"}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <Progress value={progress} aria-label={`Upload progress: ${progress}%`} />
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">{progress}% complete</p>
              <Button disabled={!file || status === "uploading"} onClick={upload} aria-label={status === "done" ? "File uploaded" : status === "uploading" ? "Uploading file" : "Upload file"}>
                {status === "uploading" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : status === "done" ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <PlayCircle className="h-4 w-4" aria-hidden="true" />}
                {status === "done" ? "Uploaded" : "Upload"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

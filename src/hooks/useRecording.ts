import { useCallback, useEffect, useRef, useState } from 'react';
import { useUIStore } from '../stores/uiStore';

export interface UseRecordingReturn {
  isRecording: boolean;
  recordingToast: string | null;
  startRecording: () => void;
  stopRecording: () => void;
}

export function useRecording(canvasRef: React.RefObject<HTMLCanvasElement | null>): UseRecordingReturn {
  const { recordEnabled, recordingFilename } = useUIStore();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingToast, setRecordingToast] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const sanitizeFilename = (name: string) => name.replace(/[^a-z0-9-_]+/gi, "_");

  const startRecording = useCallback(() => {
    if (!recordEnabled) {
      setRecordingToast("Enable recording in Visual Settings first");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) {
      setRecordingToast("Canvas not ready");
      return;
    }

    const fps = 60;
    const stream: MediaStream | null = (canvas as any).captureStream
      ? canvas.captureStream(fps)
      : (canvas as any).mozCaptureStream
      ? (canvas as any).mozCaptureStream(fps)
      : null;

    if (!stream) {
      setRecordingToast("Recording not supported in this browser");
      return;
    }

    const candidates = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm"
    ];
    let mimeType = "";
    if (typeof MediaRecorder !== "undefined") {
      for (const type of candidates) {
        if ((MediaRecorder as any).isTypeSupported?.(type)) { mimeType = type; break; }
      }
    }

    let recorder: MediaRecorder;
    try {
      // Ultra quality settings: 20 Mbps video bitrate
      const options: MediaRecorderOptions = mimeType
        ? { mimeType, videoBitsPerSecond: 20000000 }
        : { videoBitsPerSecond: 20000000 };
      recorder = new MediaRecorder(stream, options);
    } catch (e) {
      setRecordingToast("Failed to start recorder");
      return;
    }
    mediaRecorderRef.current = recorder;
    recordedChunksRef.current = [];

    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    recorder.onerror = () => {
      setRecordingToast("Recording error");
    };
    recorder.onstop = () => {
      try {
        if (recordedChunksRef.current.length === 0) {
          setRecordingToast("No data captured");
        } else {
          const outType = recorder.mimeType || "video/webm";
          const blob = new Blob(recordedChunksRef.current, { type: outType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${sanitizeFilename(recordingFilename || "grid-recording")}-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          setRecordingToast("Recording saved");
        }
      } finally {
        stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);
      }
    };

    try {
      recorder.start(100);
      setIsRecording(true);
      setRecordingToast("Recording started (press R to stop)");
    } catch (e) {
      setRecordingToast("Recorder start failed");
    }
  }, [recordEnabled, recordingFilename, canvasRef]);

  const stopRecording = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      try {
        rec.requestData?.();
      } catch {}
      rec.stop();
      setRecordingToast("Stopping recording…");
    }
  }, []);

  useEffect(() => {
    const handleRecordingShortcut = (e: KeyboardEvent) => {
      if (e.key && e.key.toLowerCase() === "r" && recordEnabled) {
        e.preventDefault();
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      }
    };
    window.addEventListener("keydown", handleRecordingShortcut);
    return () => window.removeEventListener("keydown", handleRecordingShortcut);
  }, [isRecording, recordEnabled, startRecording, stopRecording]);

  useEffect(() => {
    if (recordingToast) {
      const t = setTimeout(() => setRecordingToast(null), 1400);
      return () => clearTimeout(t);
    }
  }, [recordingToast]);

  return {
    isRecording,
    recordingToast,
    startRecording,
    stopRecording,
  };
}

import { useCallback, useRef, useState } from 'react';

// Helper function to sanitize filenames
const sanitizeFilename = (name: string) => name.replace(/[^a-z0-9-_]+/gi, "_");

export interface UseRecordingReturn {
  recordEnabled: boolean;
  setRecordEnabled: (enabled: boolean) => void;
  isRecording: boolean;
  recordingFilename: string;
  setRecordingFilename: (filename: string) => void;
  recordingToast: string | null;
  setRecordingToast: (toast: string | null) => void;
  startRecording: () => void;
  stopRecording: () => void;
}

export function useRecording(canvasRef: React.RefObject<HTMLCanvasElement>): UseRecordingReturn {
  const [recordEnabled, setRecordEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingFilename, setRecordingFilename] = useState("grid-recording");
  const [recordingToast, setRecordingToast] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // CRITICAL: These functions are properly scoped at component level using useCallback
  // They will be accessible to keyboard handlers and won't cause scope issues
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

    const fps = 30;
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
        if ((MediaRecorder as any).isTypeSupported?.(type)) {
          mimeType = type;
          break;
        }
      }
    }

    let recorder: MediaRecorder;
    try {
      recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
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
        // Always stop stream tracks
        stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);
      }
    };

    try {
      recorder.start(1000); // 1s timeslice ensures dataavailable fires
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

  return {
    recordEnabled,
    setRecordEnabled,
    isRecording,
    recordingFilename,
    setRecordingFilename,
    recordingToast,
    setRecordingToast,
    startRecording,
    stopRecording
  };
}

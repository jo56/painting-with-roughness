export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9-_]+/gi, "_");
}

export interface StartRecordingParams {
  canvas: HTMLCanvasElement;
  recordEnabled: boolean;
  recordingFilename: string;
  onToast: (message: string) => void;
  onRecordingStart: () => void;
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  recordedChunksRef: React.MutableRefObject<Blob[]>;
  setIsRecording: (isRecording: boolean) => void;
}

export function startRecording({
  canvas,
  recordEnabled,
  recordingFilename,
  onToast,
  onRecordingStart,
  mediaRecorderRef,
  recordedChunksRef,
  setIsRecording,
}: StartRecordingParams): void {
  if (!recordEnabled) {
    onToast("Enable recording in Visual Settings first");
    return;
  }
  if (!canvas) {
    onToast("Canvas not ready");
    return;
  }

  const fps = 30;
  const stream: MediaStream | null = (canvas as any).captureStream
    ? canvas.captureStream(fps)
    : (canvas as any).mozCaptureStream
    ? (canvas as any).mozCaptureStream(fps)
    : null;

  if (!stream) {
    onToast("Recording not supported in this browser");
    return;
  }

  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
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
    onToast("Failed to start recorder");
    return;
  }
  mediaRecorderRef.current = recorder;
  recordedChunksRef.current = [];

  recorder.ondataavailable = (e: BlobEvent) => {
    if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
  };
  recorder.onerror = () => {
    onToast("Recording error");
  };
  recorder.onstop = () => {
    try {
      if (recordedChunksRef.current.length === 0) {
        onToast("No data captured");
      } else {
        const outType = recorder.mimeType || "video/webm";
        const blob = new Blob(recordedChunksRef.current, { type: outType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${sanitizeFilename(
          recordingFilename || "grid-recording"
        )}-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        onToast("Recording saved");
      }
    } finally {
      stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
    }
  };

  try {
    recorder.start(1000);
    setIsRecording(true);
    onToast("Recording started (press R to stop)");
    onRecordingStart();
  } catch (e) {
    onToast("Recorder start failed");
  }
}

export interface StopRecordingParams {
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  onToast: (message: string) => void;
}

export function stopRecording({
  mediaRecorderRef,
  onToast,
}: StopRecordingParams): void {
  const rec = mediaRecorderRef.current;
  if (rec && rec.state !== "inactive") {
    try {
      rec.requestData?.();
    } catch {}
    rec.stop();
    onToast("Stopping recording…");
  }
}

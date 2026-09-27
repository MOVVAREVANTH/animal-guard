import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  ImageUp,
  Loader2,
  ScanSearch,
  Sparkles,
  X,
} from "lucide-react";
import { apiPost } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SnapshotWithBox from "@/components/SnapshotWithBox";
import type { DetectionCategory, IdentifyResult } from "@/types/detection";

const MAX_EDGE = 900; // downscale before upload — keeps payloads small
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

const CATEGORY_STYLES: Record<DetectionCategory, string> = {
  wild: "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]",
  cattle: "border-[#FDE68A] bg-[#FEF3C7] text-[#92400E]",
  domestic: "border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46]",
};

/** Draw any image source onto a canvas, capped at MAX_EDGE, as a JPEG data URL. */
function toResizedJpeg(source: HTMLImageElement | HTMLVideoElement, w: number, h: number): string {
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function fileToResizedJpeg(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("could not read that file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("that file is not a readable image"));
      img.onload = () => {
        try {
          resolve(toResizedJpeg(img, img.naturalWidth, img.naturalHeight));
        } catch (err) {
          reject(err instanceof Error ? err : new Error("resize failed"));
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export default function LiveIdentify({ onLogged }: { onLogged: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [camOn, setCamOn] = useState(false);
  const [dragging, setDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOn(false);
  };

  // Release the webcam if the component unmounts mid-session.
  useEffect(() => stopCamera, []);

  const identify = useMutation({
    mutationFn: (dataUrl: string) =>
      apiPost<IdentifyResult>("/detections/identify", {
        image_base64: dataUrl,
        mime_type: "image/jpeg",
      }),
    onSuccess: (res) => {
      setResult(res);
      if (res.is_animal) {
        toast.success(
          `${res.species} identified — ${res.category} · ${(res.confidence ?? 0).toFixed(1)}%`,
          { description: "Logged to the dashboard with alerts dispatched." },
        );
        onLogged();
      } else {
        toast(res.note ?? "No animal found in that image.");
      }
    },
    onError: () =>
      toast.error("Identification failed — the vision service may be busy. Try again."),
  });

  const acceptImage = async (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Use a JPEG, PNG or WebP image.");
      return;
    }
    try {
      const dataUrl = await fileToResizedJpeg(file);
      setResult(null);
      setPreview(dataUrl);
      identify.mutate(dataUrl);
    } catch {
      toast.error("Could not read that image.");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      setCamOn(true);
      setResult(null);
      setPreview(null);
      // the <video> mounts with camOn — attach on the next frame
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      toast.error("No camera access — allow the permission or upload a photo instead.");
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      toast.error("Camera is still warming up — try again in a second.");
      return;
    }
    try {
      const dataUrl = toResizedJpeg(video, video.videoWidth, video.videoHeight);
      stopCamera();
      setResult(null);
      setPreview(dataUrl);
      identify.mutate(dataUrl);
    } catch {
      toast.error("Could not capture that frame.");
    }
  };

  const reset = () => {
    setPreview(null);
    setResult(null);
    identify.reset();
  };

  return (
    <Card data-testid="live-identify-panel" className="gap-0 py-0">
      <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start">
        <div className="lg:w-2/5">
          <p className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#C85A17]">
            <Sparkles className="h-3.5 w-3.5" />
            Live identify
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-[#142416]">
            Test it with a real animal
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#526756]">
            Upload a photo or snap one with your camera. The vision model names the species,
            sorts it into wild, cattle or domestic, and logs it to the dashboard exactly like a
            Raspberry Pi detection — alerts included.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              data-testid="identify-upload-button"
              variant="outline"
              className="gap-2"
              disabled={identify.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageUp className="h-4 w-4" />
              Upload photo
            </Button>
            {camOn ? (
              <>
                <Button
                  data-testid="identify-capture-button"
                  className="gap-2 bg-[#C85A17] text-white hover:bg-[#A84A12]"
                  onClick={captureFrame}
                  disabled={identify.isPending}
                >
                  <ScanSearch className="h-4 w-4" />
                  Capture & identify
                </Button>
                <Button
                  data-testid="identify-stop-camera-button"
                  variant="ghost"
                  className="gap-2"
                  onClick={stopCamera}
                >
                  <CameraOff className="h-4 w-4" />
                  Stop
                </Button>
              </>
            ) : (
              <Button
                data-testid="identify-camera-button"
                variant="outline"
                className="gap-2"
                disabled={identify.isPending}
                onClick={() => void startCamera()}
              >
                <Camera className="h-4 w-4" />
                Use my camera
              </Button>
            )}
            {(preview || result) && !identify.isPending && (
              <Button
                data-testid="identify-reset-button"
                variant="ghost"
                className="gap-2"
                onClick={reset}
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            data-testid="identify-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void acceptImage(file);
              e.target.value = ""; // allow re-picking the same file
            }}
          />

          {/* Result readout */}
          <div className="mt-5" data-testid="identify-result">
            {identify.isPending ? (
              <p className="inline-flex items-center gap-2 text-sm font-medium text-[#526756]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analysing the frame…
              </p>
            ) : result?.is_animal ? (
              <div className="rounded-xl border border-[#E5E0D3] bg-[#F2EFE8] p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#2D6A4F]" />
                  <span
                    data-testid="identify-result-species"
                    className="font-heading text-lg font-bold text-[#142416]"
                  >
                    {result.species}
                  </span>
                  {result.category && (
                    <Badge
                      variant="outline"
                      data-testid="identify-result-category"
                      className={CATEGORY_STYLES[result.category]}
                    >
                      {result.category}
                    </Badge>
                  )}
                </div>
                <p
                  data-testid="identify-result-confidence"
                  className="mt-2 font-mono text-xs text-[#526756]"
                >
                  confidence {(result.confidence ?? 0).toFixed(1)}% · logged as WEB DEMO · alerts
                  sent
                </p>
              </div>
            ) : result ? (
              <p
                data-testid="identify-result-none"
                className="rounded-xl border border-[#FDE68A] bg-[#FEF3C7] p-4 text-sm text-[#92400E]"
              >
                {result.note ?? "No animal found in that image."}
              </p>
            ) : (
              <p className="text-xs text-[#526756]">
                JPEG, PNG or WebP · images are resized in your browser before upload.
              </p>
            )}
          </div>
        </div>

        {/* Preview / camera stage */}
        <div className="lg:w-3/5">
          {camOn ? (
            <div className="relative overflow-hidden rounded-xl border border-[#E5E0D3] bg-black">
              <video
                ref={videoRef}
                data-testid="identify-video"
                playsInline
                muted
                className="aspect-video w-full object-cover"
              />
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded bg-black/60 px-2 py-0.5 font-mono text-[11px] text-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                LIVE CAMERA
              </span>
            </div>
          ) : preview ? (
            <div
              data-testid="identify-preview"
              className="relative overflow-hidden rounded-xl border border-[#E5E0D3] bg-[#F2EFE8]"
            >
              <SnapshotWithBox
                src={preview}
                alt="Frame submitted for identification"
                box={result?.is_animal ? result.box : null}
                label={
                  result?.is_animal && result.species
                    ? `${result.species} · ${(result.confidence ?? 0).toFixed(0)}%`
                    : undefined
                }
                testId="identify-bbox"
                className="aspect-video w-full"
              />
              {identify.isPending && (
                <div className="absolute inset-x-0 h-14 animate-[scan_2.2s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-[#6EE7B7]/40 to-transparent" />
              )}
            </div>
          ) : (
            <label
              data-testid="identify-dropzone"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) void acceptImage(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 text-center transition-colors duration-200 ${
                dragging
                  ? "border-[#2D6A4F] bg-[#2D6A4F]/5"
                  : "border-[#2D6A4F]/25 bg-[#FBF9F4] hover:border-[#2D6A4F]/50"
              }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F]">
                <ImageUp className="h-5 w-5" />
              </span>
              <span className="mt-4 font-heading text-base font-semibold text-[#1C2A1E]">
                Drop an animal photo here
              </span>
              <span className="mt-1 text-xs text-[#526756]">
                or click to browse — then watch it appear in the gallery below
              </span>
            </label>
          )}
        </div>
      </div>
    </Card>
  );
}

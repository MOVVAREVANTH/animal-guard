import type { ComponentType } from "react";
import { format } from "date-fns";
import { Camera, Clock, ExternalLink, Images, Loader2, Mail, MessageSquare, RotateCcw, Sparkles } from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import SnapshotWithBox from "@/components/SnapshotWithBox";
import type { AlertChannel, Detection, DetectionCategory } from "@/types/detection";

const CATEGORY_STYLES: Record<DetectionCategory, { label: string; className: string }> = {
  wild: { label: "Wild", className: "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]" },
  cattle: { label: "Cattle", className: "border-[#FDE68A] bg-[#FEF3C7] text-[#92400E]" },
  domestic: { label: "Domestic", className: "border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46]" },
};

const CHANNEL_META: Record<
  AlertChannel,
  { label: string; icon: ComponentType<{ className?: string; title?: string }> }
> = {
  email: { label: "Email", icon: Mail },
  sms: { label: "SMS", icon: MessageSquare },
  whatsapp: { label: "WhatsApp", icon: SiWhatsapp },
};

function confidenceTone(confidence: number): string {
  if (confidence >= 90) return "bg-[#2D6A4F]";
  if (confidence >= 80) return "bg-[#C85A17]";
  return "bg-[#B91C1C]";
}

function SnapshotPane({
  src,
  alt,
  label,
}: {
  src: string;
  alt: string;
  label: string;
}) {
  return (
    <figure className="relative overflow-hidden rounded-lg border border-[#E5E0D3] bg-[#F2EFE8]">
      <img src={src} alt={alt} loading="lazy" className="aspect-square w-full object-cover" />
      <figcaption className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-white">
        {label}
      </figcaption>
    </figure>
  );
}

export default function DetectionCard({
  detection,
  onReplay,
  replayPending = false,
}: {
  detection: Detection;
  onReplay: () => void;
  replayPending?: boolean;
}) {
  const category = CATEGORY_STYLES[detection.category];
  const recorded = new Date(detection.created_at);

  return (
    <Card
      data-testid={`detection-card-${detection.id}`}
      className="gap-0 overflow-hidden py-0 transition duration-200 hover:-translate-y-1 hover:border-[#2D6A4F]/40 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-xl font-bold text-[#142416]">
            {detection.species}
          </h3>
          <p
            data-testid={`detection-timestamp-${detection.id}`}
            className="mt-0.5 font-mono text-xs text-[#526756]"
            title={recorded.toISOString()}
          >
            {format(recorded, "MMM d, yyyy · HH:mm:ss")}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`shrink-0 ${category.className}`}
          data-testid={`detection-category-${detection.id}`}
        >
          {category.label}
        </Badge>
      </div>

      {detection.source === "web-demo" && (
        <div className="px-5 pb-3">
          <span
            data-testid={`detection-source-${detection.id}`}
            className="inline-flex items-center gap-1 rounded-full border border-[#E5E0D3] bg-[#FBF9F4] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[#C85A17]"
          >
            <Sparkles className="h-3 w-3" />
            Web demo
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 px-5">
        {detection.bbox ? (
          <SnapshotWithBox
            src={detection.image_url}
            alt={`${detection.species} — camera snapshot with detection box`}
            box={detection.bbox}
            label={`${detection.species} · ${detection.confidence.toFixed(0)}%`}
            caption="Camera snapshot"
            testId={`detection-bbox-${detection.id}`}
            className="aspect-square w-full rounded-lg border border-[#E5E0D3]"
          />
        ) : (
          <SnapshotPane
            src={detection.image_url}
            alt={`${detection.species} — camera snapshot`}
            label="Camera snapshot"
          />
        )}
        <SnapshotPane
          src={detection.flickr_reference_url}
          alt={`${detection.species} — Flickr reference`}
          label="Flickr reference"
        />
      </div>

      <div className="space-y-3 p-5">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#526756]">Confidence</span>
            <span
              data-testid={`detection-confidence-${detection.id}`}
              className="font-mono font-semibold text-[#142416]"
            >
              {detection.confidence.toFixed(1)}%
            </span>
          </div>
          <div
            data-testid={`detection-confidence-bar-${detection.id}`}
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F2EFE8]"
          >
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${confidenceTone(detection.confidence)}`}
              style={{ width: `${Math.min(100, Math.max(0, detection.confidence))}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          {detection.camera ? (
            <span
              data-testid={`detection-camera-${detection.id}`}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-[#526756]"
            >
              <Camera className="h-3.5 w-3.5" />
              {detection.camera}
            </span>
          ) : (
            <span />
          )}
          {(detection.alert_channels?.length ?? 0) > 0 && (
            <div
              className="flex flex-wrap items-center gap-1.5"
              data-testid={`detection-alerts-${detection.id}`}
            >
              {detection.alert_channels!.map((channel) => {
                const ChannelIcon = CHANNEL_META[channel].icon;
                return (
                  <Badge
                    key={channel}
                    variant="outline"
                    className="gap-1 border-[#E5E0D3] bg-[#F2EFE8] px-1.5 py-0 font-mono text-[10px] text-[#526756]"
                  >
                    <ChannelIcon className="h-3 w-3" title="" aria-hidden />
                    {CHANNEL_META[channel].label}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#526756]">
            <Clock className="h-3.5 w-3.5" />
            Detected {format(recorded, "MMM d · HH:mm")}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid={`detection-replay-${detection.id}`}
              onClick={onReplay}
              disabled={replayPending}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#526756] transition-colors duration-200 hover:text-[#C85A17] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {replayPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              Replay alerts
            </button>
            <a
              href={detection.flickr_page_url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`detection-flickr-link-${detection.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2D6A4F] transition-colors duration-200 hover:text-[#C85A17]"
            >
              <Images className="h-4 w-4" />
              More Flickr photos
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}

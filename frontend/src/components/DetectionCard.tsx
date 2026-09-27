import { format } from "date-fns";
import { Clock, ExternalLink, Images } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Detection, DetectionCategory } from "@/types/detection";

const CATEGORY_STYLES: Record<DetectionCategory, { label: string; className: string }> = {
  wild: { label: "Wild", className: "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]" },
  cattle: { label: "Cattle", className: "border-[#FDE68A] bg-[#FEF3C7] text-[#92400E]" },
  domestic: { label: "Domestic", className: "border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46]" },
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

export default function DetectionCard({ detection }: { detection: Detection }) {
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

      <div className="grid grid-cols-2 gap-2 px-5">
        <SnapshotPane
          src={detection.image_url}
          alt={`${detection.species} — camera snapshot`}
          label="Camera snapshot"
        />
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

        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#526756]">
            <Clock className="h-3.5 w-3.5" />
            Detected {format(recorded, "MMM d · HH:mm")}
          </span>
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
    </Card>
  );
}

import type { BoundingBox } from "@/types/detection";

/**
 * An image with an optional YOLO-style bounding box drawn over it.
 *
 * The box coordinates are fractions of the IMAGE, so the <img> is wrapped in a
 * shrink-to-fit inline-block: with `object-contain` letterboxing the wrapper would
 * be larger than the rendered pixels and the box would drift.
 */
export default function SnapshotWithBox({
  src,
  alt,
  box,
  label,
  caption,
  className = "",
  testId,
}: {
  src: string;
  alt: string;
  box?: BoundingBox | null;
  label?: string;
  caption?: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div className={`flex items-center justify-center overflow-hidden bg-black ${className}`}>
      <div className="relative inline-block max-h-full max-w-full leading-none">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="block max-h-full max-w-full object-contain"
        />
        {box && (
          <div
            data-testid={testId}
            className="pointer-events-none absolute rounded-sm border-2 border-[#FBBF24] shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
            style={{
              left: `${box.x * 100}%`,
              top: `${box.y * 100}%`,
              width: `${box.w * 100}%`,
              height: `${box.h * 100}%`,
            }}
          >
            {label && (
              <span className="absolute left-0 top-0 max-w-full -translate-y-full truncate rounded-t-sm bg-[#FBBF24] px-1 py-px font-mono text-[10px] font-semibold leading-tight text-[#142B1B]">
                {label}
              </span>
            )}
          </div>
        )}
        {caption && (
          <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-white">
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}

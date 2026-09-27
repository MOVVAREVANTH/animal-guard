import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Bird,
  Dog,
  FlaskConical,
  Loader2,
  PawPrint,
  Radar,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DetectionCard from "@/components/DetectionCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import type { CategoryFilter, Detection, DetectionStats } from "@/types/detection";

const POLL_MS = 10_000;

const FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "wild", label: "Wild" },
  { value: "cattle", label: "Cattle" },
  { value: "domestic", label: "Domestic" },
];

const CATEGORY_LABEL: Record<CategoryFilter, string> = {
  all: "all categories",
  wild: "wild",
  cattle: "cattle",
  domestic: "domestic",
};

export default function Dashboard() {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const queryClient = useQueryClient();

  const detectionsQuery = useQuery({
    queryKey: ["detections", filter],
    queryFn: () => {
      const params = new URLSearchParams({ limit: "50" });
      if (filter !== "all") params.set("category", filter);
      return apiGet<Detection[]>(`/detections?${params.toString()}`);
    },
    refetchInterval: POLL_MS,
  });

  const statsQuery = useQuery({
    queryKey: ["stats"],
    queryFn: () => apiGet<DetectionStats>("/stats"),
    refetchInterval: POLL_MS,
  });

  const simulate = useMutation({
    mutationFn: (category: CategoryFilter) =>
      apiPost<Detection>(
        `/detections/simulate${category !== "all" ? `?category=${category}` : ""}`,
      ),
    onSuccess: (detection) => {
      void queryClient.invalidateQueries({ queryKey: ["detections"] });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success(
        `${detection.species} detected — ${CATEGORY_LABEL[detection.category]} · ${detection.confidence.toFixed(1)}% confidence`,
      );
    },
    onError: () => toast.error("Could not record the detection — is the backend running?"),
  });

  const stats = statsQuery.data;
  const detections = detectionsQuery.data;
  const statsCards: { testid: string; label: string; value: number | null; icon: LucideIcon }[] = [
    { testid: "stat-total", label: "Total Detections", value: stats?.total ?? null, icon: Radar },
    { testid: "stat-wild", label: "Wild Animals", value: stats?.wild ?? null, icon: Bird },
    { testid: "stat-cattle", label: "Cattle & Livestock", value: stats?.cattle ?? null, icon: PawPrint },
    { testid: "stat-domestic", label: "Domestic Animals", value: stats?.domestic ?? null, icon: Dog },
  ];

  return (
    <div className="min-h-svh bg-[#FBF9F4] text-[#1C2A1E]">
      <Navbar />

      <main>
        {/* Page header */}
        <section className="bg-gradient-to-br from-[#142B1B] via-[#1B4332] to-[#274F33] text-[#F5F8F5]">
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p
                  data-testid="live-indicator"
                  className="inline-flex items-center gap-2 rounded-full border border-[#6EE7B7]/30 bg-[#6EE7B7]/10 px-3 py-1 font-mono text-xs text-[#6EE7B7]"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6EE7B7] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6EE7B7]" />
                  </span>
                  LIVE · AUTO-REFRESH EVERY 10S
                </p>
                <h1
                  data-testid="dashboard-title"
                  className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl"
                >
                  Live Detections
                </h1>
                <p className="mt-3 max-w-2xl text-[#D1E7D6]">
                  Every animal Animal Guard spots on your cameras — newest first, with the
                  on-device snapshot beside its Flickr reference photo.
                </p>
              </div>
              <Button
                data-testid="simulate-detection-button"
                onClick={() => simulate.mutate(filter)}
                disabled={simulate.isPending}
                className="shrink-0 gap-2 bg-[#C85A17] text-white hover:bg-[#A84A12]"
              >
                {simulate.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FlaskConical className="h-4 w-4" />
                )}
                Simulate Detection
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
          {/* Stats bar */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4" data-testid="stats-bar">
            {statsCards.map((card) => (
              <Card key={card.testid} data-testid={card.testid} className="gap-0 py-0">
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-[#526756]">
                      {card.label}
                    </p>
                    <card.icon className="h-4 w-4 shrink-0 text-[#2D6A4F]" />
                  </div>
                  <p
                    data-testid={`${card.testid}-value`}
                    className="mt-3 font-mono text-3xl font-bold text-[#142416] sm:text-4xl"
                  >
                    {card.value ?? "—"}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filter by category"
              data-testid="category-filters"
            >
              {FILTERS.map((f) => (
                <Button
                  key={f.value}
                  data-testid={`filter-${f.value}`}
                  size="sm"
                  variant={filter === f.value ? "default" : "outline"}
                  onClick={() => setFilter(f.value)}
                  className="rounded-full"
                >
                  {f.label}
                </Button>
              ))}
            </div>
            <p data-testid="last-updated" className="font-mono text-xs text-[#526756]">
              {detectionsQuery.dataUpdatedAt
                ? `updated ${format(new Date(detectionsQuery.dataUpdatedAt), "HH:mm:ss")}`
                : "connecting…"}
            </p>
          </div>

          {detectionsQuery.isError && (
            <div
              data-testid="detections-error"
              className="mt-6 flex items-center gap-3 rounded-xl border border-[#FDE68A] bg-[#FEF3C7] px-4 py-3 text-sm text-[#92400E]"
            >
              <WifiOff className="h-4 w-4 shrink-0" />
              Can&apos;t reach the backend right now — retrying every 10 seconds.
            </div>
          )}

          {/* Gallery */}
          <div className="mt-6">
            {detectionsQuery.isPending ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    data-testid="detections-skeleton"
                    className="h-72 animate-pulse rounded-xl bg-[#F2EFE8]"
                  />
                ))}
              </div>
            ) : detections && detections.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" data-testid="detections-gallery">
                {detections.map((detection) => (
                  <DetectionCard key={detection.id} detection={detection} />
                ))}
              </div>
            ) : (
              <div
                data-testid="detection-empty-state"
                className="rounded-2xl border-2 border-dashed border-[#2D6A4F]/25 bg-white px-6 py-16 text-center"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F]">
                  <Radar className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-heading text-xl font-bold text-[#1C2A1E]">
                  {filter === "all" ? "No detections yet" : `No ${CATEGORY_LABEL[filter]} detections yet`}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-[#526756]">
                  {filter === "all"
                    ? "Animal Guard is watching. The moment a camera spots an animal, its snapshot lands here within seconds."
                    : "Nothing logged in this category so far — wait for the next event or check another filter."}
                </p>
                {filter === "all" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-6 gap-2"
                    data-testid="empty-state-simulate-button"
                    onClick={() => simulate.mutate(filter)}
                    disabled={simulate.isPending}
                  >
                    <FlaskConical className="h-4 w-4" />
                    Simulate a detection
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

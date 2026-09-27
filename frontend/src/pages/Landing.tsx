import { Fragment } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  BellRing,
  Bird,
  Camera,
  Cpu,
  Images,
  LayoutDashboard,
  PawPrint,
  Radar,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1542997830-49fc838e4c61?w=1600&q=75&auto=format&fit=crop";
const WILDLIFE_IMAGE =
  "https://images.unsplash.com/photo-1588508435560-585279aa19de?w=900&q=75&auto=format&fit=crop";
const CATTLE_IMAGE =
  "https://images.unsplash.com/photo-1569858241634-5aee6e47091a?w=900&q=75&auto=format&fit=crop";

interface Step {
  icon: LucideIcon;
  title: string;
  text: string;
  testid: string;
}

interface Feature {
  icon: LucideIcon;
  title: string;
  text: string;
  testid: string;
  image?: string;
  badges?: string[];
}

const STEPS: Step[] = [
  {
    icon: Camera,
    title: "The Pi keeps watch",
    text: "A Raspberry Pi camera stares at your fence line, barn door, or yard — day, night, and weather.",
    testid: "step-card-watch",
  },
  {
    icon: Cpu,
    title: "YOLOv8 detects on-device",
    text: "The model runs right on the Pi and classifies what it sees — wild animal, cattle, or domestic pet — without touching the cloud.",
    testid: "step-card-detect",
  },
  {
    icon: Images,
    title: "Flickr confirms the species",
    text: "The system fetches a reference photo of the detected species from Flickr so you can verify the match at a glance.",
    testid: "step-card-verify",
  },
  {
    icon: BellRing,
    title: "You get alerted instantly",
    text: "An email, an SMS, and a WhatsApp message arrive within seconds — each with the camera snapshot attached.",
    testid: "step-card-alert",
  },
];

const FEATURES: Feature[] = [
  {
    icon: Bird,
    title: "Wild Animal Detection",
    text: "Spots intruders at the perimeter before they reach the herd — trained on the species that matter to farms.",
    badges: ["bird", "bear", "elephant", "zebra", "giraffe"],
    image: WILDLIFE_IMAGE,
    testid: "feature-card-wild",
  },
  {
    icon: PawPrint,
    title: "Cattle & Livestock Watch",
    text: "Tracks the herd through the day and flags when animals wander into restricted zones — or strays show up uninvited.",
    badges: ["cow", "horse", "sheep"],
    image: CATTLE_IMAGE,
    testid: "feature-card-cattle",
  },
  {
    icon: BellRing,
    title: "Multi-Channel Alerts",
    text: "One detection, every channel. Email, SMS, and WhatsApp messages fire in parallel via Twilio the moment the model fires.",
    testid: "feature-card-alerts",
  },
  {
    icon: Images,
    title: "Flickr Species References",
    text: "Every alert carries a curated reference photo of the species pulled from Flickr, so verification takes one glance.",
    testid: "feature-card-flickr",
  },
  {
    icon: LayoutDashboard,
    title: "Live Web Dashboard",
    text: "A real-time gallery with the full detection history, category stats, and filters — polling fresh results every 10 seconds.",
    testid: "feature-card-dashboard",
  },
  {
    icon: Cpu,
    title: "Affordable Hardware",
    text: "Runs on a Raspberry Pi 4/5 and a standard camera module. No GPU cluster, no cloud inference bills.",
    testid: "feature-card-hardware",
  },
];

const ARCH_NODES = [
  {
    icon: Camera,
    title: "Raspberry Pi 5 + Camera",
    mono: "12MP sensor · IR night mode",
    testid: "arch-node-pi",
  },
  {
    icon: Cpu,
    title: "Edge AI — YOLOv8",
    mono: "on-device inference · species classifier",
    testid: "arch-node-ai",
  },
  {
    icon: BellRing,
    title: "Verify & Alert",
    mono: "Flickr reference fetch · Twilio dispatch",
    testid: "arch-node-alert",
  },
  {
    icon: LayoutDashboard,
    title: "Live Dashboard",
    mono: "GET /api/detections · 10s poll",
    testid: "arch-node-dashboard",
  },
];

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  // Mount-time (not scroll-triggered) so content is present in full-page renders,
  // prints, and static captures — motion is polish, never a visibility gate.
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#C85A17]">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-[#1C2A1E] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-[#4B5E4F]">{text}</p>
    </div>
  );
}

function FlowArrows() {
  return (
    <>
      <ArrowDown className="mx-auto h-5 w-5 shrink-0 self-center text-[#C85A17] lg:hidden" />
      <ArrowRight className="hidden h-5 w-5 shrink-0 self-center text-[#C85A17] lg:block" />
    </>
  );
}

export default function Landing() {
  return (
    <div className="min-h-svh bg-[#FBF9F4] text-[#1C2A1E]">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#142B1B] text-[#F5F8F5]">
          <img
            src={HERO_IMAGE}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#142B1B]/95 via-[#16301F]/90 to-[#274F33]/80" />
          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p
                data-testid="hero-badge"
                className="inline-flex items-center gap-2 rounded-full border border-[#6EE7B7]/30 bg-[#6EE7B7]/10 px-3 py-1 font-mono text-xs text-[#6EE7B7]"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6EE7B7] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6EE7B7]" />
                </span>
                LIVE — 4 CAMERAS MONITORING NOW
              </p>
              <h1
                data-testid="hero-title"
                className="mt-6 font-heading text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem]"
              >
                <span className="text-[#FBBF24]">Animal Guard</span> — Know the Moment an Animal
                Gets Close
              </h1>
              <p className="mt-5 max-w-xl text-lg text-[#D1E7D6]">
                Protect your farm and home from wild animals and stray livestock. A Raspberry Pi
                camera runs on-device AI that spots intruders the moment they appear, verifies the
                species, and alerts you by email, SMS, and WhatsApp.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/dashboard"
                  data-testid="hero-cta-dashboard"
                  className={buttonVariants({
                    size: "lg",
                    class: "gap-2 bg-[#C85A17] text-white hover:bg-[#A84A12]",
                  })}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  View Live Dashboard
                </Link>
                <a
                  href="#how-it-works"
                  data-testid="hero-cta-how-it-works"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    class:
                      "gap-2 border-white/25 bg-white/5 text-[#F5F8F5] hover:bg-white/15 hover:text-white",
                  })}
                >
                  How It Works
                  <ArrowDown className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-[#B2CEB8]">
                Raspberry Pi 5 · YOLOv8-nano · Twilio · Flickr verify
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div
                data-testid="hero-viewfinder"
                className="relative overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl"
              >
                <img
                  src={HERO_IMAGE}
                  alt="Simulated live camera view of a deer at the field perimeter"
                  className="aspect-[4/3] w-full object-cover opacity-90"
                />
                <div className="absolute inset-x-0 h-14 animate-[scan_3.4s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-[#6EE7B7]/25 to-transparent" />
                <div className="absolute left-[22%] top-[28%] h-[44%] w-[48%] rounded-sm border-2 border-[#FBBF24]/90">
                  <span className="absolute -top-7 left-0 rounded-sm bg-[#FBBF24] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#142B1B]">
                    Deer · 91.4%
                  </span>
                </div>
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                  <span className="inline-flex items-center gap-1.5 rounded bg-black/55 px-2 py-0.5 font-mono text-[11px] text-white">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    REC
                  </span>
                  <span className="rounded bg-black/55 px-2 py-0.5 font-mono text-[11px] text-white">
                    CAM 01 · NORTH FENCE
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-t from-black/75 to-transparent p-3 font-mono text-[11px] text-[#D1E7D6]">
                  <span>SPECIES deer</span>
                  <span>CONFIDENCE 91.4%</span>
                  <span>ALERT email · sms · whatsapp</span>
                </div>
              </div>
              <p className="mt-3 text-center font-mono text-xs text-[#9FB8A4]">
                Simulated camera feed — what your dashboard shows on a detection
              </p>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" data-testid="how-it-works-section" className="scroll-mt-20 py-20 sm:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="How it works"
              title="From camera to alert in four steps"
              text="Everything happens on the edge, next to your animals — the cloud only carries the result."
            />
            <div className="mt-14 flex flex-col gap-4 lg:flex-row lg:items-stretch">
              {STEPS.map((step, i) => (
                <Fragment key={step.testid}>
                  <Reveal delay={i * 0.08} className="flex-1">
                    <Card className="h-full gap-0 py-0">
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F]">
                            <step.icon className="h-5 w-5" />
                          </span>
                          <span className="font-mono text-sm font-semibold text-[#C85A17]">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <h3
                          className="mt-4 font-heading text-lg font-bold text-[#1C2A1E]"
                          data-testid={step.testid}
                        >
                          {step.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#4B5E4F]">{step.text}</p>
                      </div>
                    </Card>
                  </Reveal>
                  {i < STEPS.length - 1 && <FlowArrows />}
                </Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          data-testid="features-section"
          className="scroll-mt-20 bg-[#F2EFE8] py-20 sm:py-24"
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Features"
              title="Everything a perimeter needs"
              text="Detection, verification, alerting, and history — one affordable box at the gate."
            />
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {FEATURES.map((feature, i) => (
                <Reveal key={feature.testid} delay={(i % 3) * 0.08} className="h-full">
                  <Card
                    data-testid={feature.testid}
                    className="h-full gap-0 overflow-hidden py-0 transition duration-200 hover:-translate-y-1 hover:border-[#2D6A4F]/40 hover:shadow-lg"
                  >
                    <div className="p-6">
                      {feature.image && (
                        <img
                          src={feature.image}
                          alt={feature.title}
                          loading="lazy"
                          className="mb-5 aspect-[16/9] w-full rounded-lg object-cover"
                        />
                      )}
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F]">
                        <feature.icon className="h-5 w-5" />
                      </span>
                      <h3 className="mt-4 font-heading text-lg font-bold text-[#1C2A1E]">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#4B5E4F]">{feature.text}</p>
                      {feature.badges && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {feature.badges.map((badge) => (
                            <Badge
                              key={badge}
                              variant="outline"
                              className="border-[#E5E0D3] bg-white font-mono text-[11px] text-[#4B5E4F]"
                            >
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section id="architecture" data-testid="architecture-section" className="scroll-mt-20 py-20 sm:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Architecture"
              title="One Pi, one API, one dashboard"
              text="Every hop of the pipeline is observable — from photon to push notification."
            />
            <Reveal className="mt-14">
              <Card data-testid="architecture-diagram" className="gap-0 bg-[#142B1B] py-0 text-[#F5F8F5]">
                <div className="flex flex-col items-stretch gap-4 p-6 sm:p-10 lg:flex-row">
                  {ARCH_NODES.map((node, i) => (
                    <Fragment key={node.testid}>
                      <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-5">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C85A17]/15 text-[#FBBF24]">
                          <node.icon className="h-5 w-5" />
                        </span>
                        <h3 className="mt-4 font-heading text-base font-bold" data-testid={node.testid}>
                          {node.title}
                        </h3>
                        <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-[#B2CEB8]">
                          {node.mono}
                        </p>
                      </div>
                      {i < ARCH_NODES.length - 1 && <FlowArrows />}
                    </Fragment>
                  ))}
                </div>
                <div className="border-t border-white/10 px-6 py-4 sm:px-10">
                  <p
                    data-testid="architecture-api-sample"
                    className="overflow-x-auto whitespace-nowrap font-mono text-xs text-[#B2CEB8]"
                  >
                    POST /api/detections → {"{ \"species\": \"elephant\", \"category\": \"wild\", \"confidence\": 91.4, \"image_url\": \"…jpg\" }"}
                  </p>
                </div>
              </Card>
            </Reveal>
          </div>
        </section>

        {/* CTA band */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 sm:pb-24">
          <Reveal>
            <div
              data-testid="cta-band"
              className="rounded-3xl border border-[#E5E0D3] bg-white px-6 py-12 text-center sm:px-12"
            >
              <Radar className="mx-auto h-8 w-8 text-[#C85A17]" />
              <h2 className="mt-4 font-heading text-2xl font-bold text-[#1C2A1E] sm:text-3xl">
                Ready when the wild gets close.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[#4B5E4F]">
                Open the live dashboard to see detections, stats, and reference photos updating in
                real time.
              </p>
              <Link
                to="/dashboard"
                data-testid="cta-band-button"
                className={buttonVariants({ size: "lg", class: "mt-6 gap-2" })}
              >
                <LayoutDashboard className="h-4 w-4" />
                View Live Dashboard
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}

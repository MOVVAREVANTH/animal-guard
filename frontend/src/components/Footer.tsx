import { Link } from "react-router-dom";
import { BookOpen, Download, ShieldCheck } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";

const EXPLORE_LINKS = [
  { label: "Live Dashboard", href: "/dashboard", testid: "footer-link-dashboard" },
  { label: "How It Works", href: "/#how-it-works", testid: "footer-link-how-it-works" },
  { label: "Features", href: "/#features", testid: "footer-link-features" },
];

const RESOURCE_LINKS = [
  {
    label: "Documentation",
    href: "https://github.com/animal-guard/animal-guard#readme",
    testid: "footer-link-docs",
    icon: BookOpen,
  },
  {
    label: "Setup Guide",
    href: "https://github.com/animal-guard/animal-guard#setup",
    testid: "footer-link-setup",
    icon: BookOpen,
  },
  {
    label: "GitHub Repository",
    href: "https://github.com/animal-guard/animal-guard",
    testid: "footer-link-github",
    icon: SiGithub,
  },
  {
    label: "Download Image",
    href: "https://github.com/animal-guard/animal-guard/releases",
    testid: "footer-link-download",
    icon: Download,
  },
];

export default function Footer() {
  return (
    <footer data-testid="footer" className="bg-[#0D1E12] text-[#F5F8F5]">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2D6A4F] text-[#F5F8F5]">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="font-heading text-lg font-bold tracking-tight">Animal Guard</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#9FB8A4]">
              A Raspberry Pi, a camera, and on-device AI — keeping watch over your farm and home,
              so you know the moment an animal gets close.
            </p>
            <p
              data-testid="footer-status"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#2D6A4F]/50 bg-[#142B1B] px-3 py-1 font-mono text-xs text-[#B2CEB8]"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6EE7B7] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6EE7B7]" />
              </span>
              All systems operational
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-[#B2CEB8]">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.testid}>
                  <Link
                    to={link.href}
                    data-testid={link.testid}
                    className="text-sm text-[#D1E7D6] transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-[#B2CEB8]">
              Resources
            </h3>
            <ul className="mt-4 space-y-2.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.testid}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={link.testid}
                    className="inline-flex items-center gap-2 text-sm text-[#D1E7D6] transition-colors duration-200 hover:text-white"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-[#9FB8A4]">
            © {new Date().getFullYear()} Animal Guard. All rights reserved.
          </p>
          <p className="font-mono text-xs text-[#9FB8A4]">
            YOLOv8 · Twilio · Flickr · Raspberry Pi
          </p>
        </div>
      </div>
    </footer>
  );
}

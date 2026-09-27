import { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Menu, ShieldCheck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const SECTION_LINKS = [
  { label: "How It Works", href: "/#how-it-works", testid: "nav-link-how-it-works" },
  { label: "Features", href: "/#features", testid: "nav-link-features" },
  { label: "Architecture", href: "/#architecture", testid: "nav-link-architecture" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      data-testid="navbar"
      className="sticky top-0 z-50 border-b border-[#E5E0D3] bg-[#FBF9F4]/90 backdrop-blur"
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" data-testid="navbar-brand" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2D6A4F] text-[#F5F8F5]">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="font-heading text-lg font-bold tracking-tight text-[#1C2A1E]">
            Animal Guard
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {SECTION_LINKS.map((link) => (
            <a
              key={link.testid}
              href={link.href}
              data-testid={link.testid}
              className="text-sm font-medium text-[#4B5E4F] transition-colors duration-200 hover:text-[#2D6A4F]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            data-testid="nav-cta-dashboard"
            className={buttonVariants({ size: "sm", class: "gap-2" })}
          >
            <LayoutDashboard className="h-4 w-4" />
            Open Dashboard
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                  data-testid="navbar-menu-button"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="font-heading">Animal Guard</SheetTitle>
              <nav className="mt-4 flex flex-col gap-1">
                <Link
                  to="/"
                  data-testid="mobile-nav-link-home"
                  className="rounded-md px-3 py-2 text-sm font-medium text-[#1C2A1E] hover:bg-[#F2EFE8]"
                >
                  Home
                </Link>
                {SECTION_LINKS.map((link) => (
                  <a
                    key={link.testid}
                    href={link.href}
                    data-testid={`mobile-${link.testid}`}
                    className="rounded-md px-3 py-2 text-sm font-medium text-[#4B5E4F] hover:bg-[#F2EFE8]"
                  >
                    {link.label}
                  </a>
                ))}
                <Link
                  to="/dashboard"
                  data-testid="mobile-nav-cta-dashboard"
                  className="mt-2 rounded-md bg-[#2D6A4F] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[#245742]"
                >
                  Open Dashboard
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

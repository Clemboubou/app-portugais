"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Languages,
  BookA,
  Headphones,
  Mic,
  FileText,
  PenLine,
  RotateCcw,
  Newspaper,
  BarChart3,
  Menu,
  ClipboardList,
  Search,
  GraduationCap,
  Globe,
  MessageCircle,
  Volume2,
  AlertTriangle,
  Film,
  Layers,
  BrainCircuit,
  CalendarDays,
  BookOpenText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface NavSection {
  title: string;
  items: { href: string; label: string; icon: typeof LayoutDashboard }[];
}

const navSections: NavSection[] = [
  {
    title: "Principal",
    items: [
      { href: "/", label: "Accueil", icon: LayoutDashboard },
      { href: "/lessons", label: "Leçons", icon: BookOpen },
      { href: "/review", label: "Révisions", icon: RotateCcw },
      { href: "/stats", label: "Statistiques", icon: BarChart3 },
    ],
  },
  {
    title: "Compétences",
    items: [
      { href: "/vocabulary", label: "Vocabulaire", icon: Languages },
      { href: "/anki", label: "Anki", icon: Layers },
      { href: "/mini-stories", label: "Mini-stories", icon: BookOpenText },
      { href: "/grammar", label: "Grammaire", icon: BookA },
      { href: "/listening", label: "Écoute", icon: Headphones },
      { href: "/speaking", label: "Parler", icon: Mic },
      { href: "/reading", label: "Lire", icon: FileText },
      { href: "/writing", label: "Écrire", icon: PenLine },
      { href: "/pronunciation", label: "Prononciation", icon: Volume2 },
    ],
  },
  {
    title: "Enrichissement",
    items: [
      { href: "/culture", label: "Culture", icon: Globe },
      { href: "/idioms", label: "Expressions", icon: MessageCircle },
      { href: "/common-mistakes", label: "Erreurs", icon: AlertTriangle },
      { href: "/media", label: "Médias", icon: Film },
      { href: "/authentic", label: "Presse PT", icon: Newspaper },
      { href: "/dictionary", label: "Dictionnaire", icon: Search },
    ],
  },
  {
    title: "IA",
    items: [
      { href: "/professeur", label: "Professeur IA", icon: BrainCircuit },
      { href: "/myplan", label: "Mon Plan 6 mois", icon: CalendarDays },
    ],
  },
  {
    title: "Évaluation",
    items: [
      { href: "/placement", label: "Test de niveau", icon: ClipboardList },
      { href: "/exam", label: "Examens", icon: GraduationCap },
    ],
  },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-3 py-4">
      {navSections.map((section, sectionIdx) => (
        <div key={section.title} className={cn(sectionIdx > 0 && "mt-4")}>
          <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-white/30 select-none">
            {section.title}
          </p>
          {section.items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-[hsl(221,83%,53%)] text-white shadow-sm shadow-blue-900/30"
                    : "text-white/60 hover:bg-white/8 hover:text-white/90"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
                  )}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SidebarShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-[hsl(224,71%,4%)]">
      {children}
    </div>
  );
}

function SidebarLogo() {
  return (
    <div className="flex h-16 shrink-0 items-center border-b border-white/8 px-5">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#006600] via-[#CC0000] to-[#006600] text-base shadow-md">
          🇵🇹
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white leading-tight tracking-tight">
            Portugais
          </p>
          <p className="text-[10px] text-white/40 font-medium">
            A1 → C1 · Européen
          </p>
        </div>
      </Link>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 md:flex flex-col overflow-hidden">
      <SidebarShell>
        <SidebarLogo />
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
      </SidebarShell>
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-60 p-0 border-r-0">
        <SidebarShell>
          <SidebarLogo />
          <div className="flex-1 overflow-y-auto">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </SidebarShell>
      </SheetContent>
    </Sheet>
  );
}

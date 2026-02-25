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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/lessons", label: "Leçons", icon: BookOpen },
  { href: "/vocabulary", label: "Vocabulaire", icon: Languages },
  { href: "/grammar", label: "Grammaire", icon: BookA },
  { href: "/listening", label: "Écoute", icon: Headphones },
  { href: "/speaking", label: "Parler", icon: Mic },
  { href: "/reading", label: "Lire", icon: FileText },
  { href: "/writing", label: "Écrire", icon: PenLine },
  { href: "/review", label: "Révisions", icon: RotateCcw },
  { href: "/placement", label: "Test de niveau", icon: ClipboardList },
  { href: "/exam", label: "Examens", icon: GraduationCap },
  { href: "/dictionary", label: "Dictionnaire", icon: Search },
  { href: "/authentic", label: "Contenu authentique", icon: Newspaper },
  { href: "/stats", label: "Statistiques", icon: BarChart3 },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">🇵🇹</span>
          <span>Portugais</span>
        </Link>
      </div>
      <NavLinks />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-lg">🇵🇹</span>
          <span className="ml-2 font-semibold">Portugais</span>
        </div>
        <NavLinks onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

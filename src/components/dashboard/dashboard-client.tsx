"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardClientProps {
  dueCount: number;
  completedLessons: number;
  studyTimeMinutes: number;
}

interface StoredPlacement {
  level: string;
  score: number;
  date: string;
}

export function DashboardClient({
  dueCount,
  completedLessons,
  studyTimeMinutes,
}: DashboardClientProps) {
  const [placement, setPlacement] = useState<StoredPlacement | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("placementResult");
    if (stored) {
      try {
        setPlacement(JSON.parse(stored) as StoredPlacement);
      } catch {
        // Ignore
      }
    }
  }, []);

  const hours = Math.floor(studyTimeMinutes / 60);
  const minutes = studyTimeMinutes % 60;
  const studyTimeLabel =
    hours > 0
      ? `${hours}h ${minutes > 0 ? `${minutes}min` : ""}`
      : `${minutes} min`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>

      {/* Niveau détecté */}
      {placement ? (
        <Card className="border-[#1A56DB]/20 bg-blue-50/30">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Votre niveau détecté</p>
              <div className="flex items-center gap-3 mt-1">
                <Badge className="text-lg px-4 py-1.5 bg-[#1A56DB]">
                  {placement.level}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Score : {placement.score}%
                </span>
              </div>
            </div>
            <Link href="/placement">
              <Button variant="outline" size="sm">
                Refaire le test
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Pas encore de test de positionnement</p>
              <p className="text-sm text-muted-foreground">
                Évaluez votre niveau pour commencer au bon endroit.
              </p>
            </div>
            <Link href="/placement">
              <Button className="bg-[#1A56DB] hover:bg-[#1A56DB]/90" size="sm">
                Faire le test
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Révisions dues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-[#1A56DB]">{dueCount}</span>
              <span className="text-sm text-muted-foreground mb-1">cartes</span>
            </div>
            {dueCount > 0 && (
              <Link href="/review" className="mt-2 block">
                <Button size="sm" className="w-full bg-[#1A56DB] hover:bg-[#1A56DB]/90">
                  Commencer les révisions
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leçons complétées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{completedLessons}</span>
              <span className="text-sm text-muted-foreground mb-1">leçons</span>
            </div>
            <Link href="/lessons" className="mt-2 block">
              <Button size="sm" variant="outline" className="w-full">
                Continuer les leçons
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Temps d&apos;étude total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">
                {studyTimeMinutes > 0 ? studyTimeLabel : "—"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {studyTimeMinutes === 0 ? "Commencez à étudier !" : "Continuez comme ça !"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Raccourcis rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Accès rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { href: "/lessons", label: "Leçons", emoji: "📚" },
              { href: "/speaking", label: "Parler", emoji: "🎤" },
              { href: "/listening", label: "Écouter", emoji: "🎧" },
              { href: "/vocabulary", label: "Vocabulaire", emoji: "📝" },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-3 pb-3 text-center">
                    <p className="text-2xl">{item.emoji}</p>
                    <p className="text-xs font-medium mt-1">{item.label}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

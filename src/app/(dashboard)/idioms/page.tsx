"use client";

import { useState } from "react";
import { LevelSelector } from "@/components/level-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import idiomsData from "@/../content/idioms.json";

type Level = "A1" | "A2" | "B1" | "B2" | "C1";

interface Idiom {
  id: string;
  level: string;
  portuguese: string;
  french: string;
  meaning: string;
  example: string;
  context: string;
}

export default function IdiomsPage() {
  const [level, setLevel] = useState<Level>("A2");

  const items = (idiomsData.idioms as Idiom[]).filter(
    (i) => i.level === level
  );

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expressions idiomatiques</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Les expressions et locutions typiques du portugais européen.
          </p>
        </div>
        <LevelSelector selected={level} onChange={setLevel} />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">{items.length} expressions</span>
        <span>·</span>
        <span>Niveau {level}</span>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Aucune expression pour ce niveau.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((idiom) => (
            <Card key={idiom.id} className="rounded-2xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-primary">
                  {idiom.portuguese}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{idiom.french}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{idiom.meaning}</p>
                <div className="rounded-md bg-muted p-2">
                  <p className="text-sm italic">&ldquo;{idiom.example}&rdquo;</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {idiom.context}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

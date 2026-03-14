"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AudioPlayer } from "@/components/audio/audio-player";
import {
  Search,
  Volume2,
  Plus,
  Check,
  Loader2,
  BookOpen,
} from "lucide-react";

interface Definition {
  partOfSpeech: string;
  definitions: string[];
}

type Example = string | { pt: string; fr: string };

interface LookupResult {
  word: string;
  phonetic: string;
  definitions: Definition[];
  audioUrl: string | null;
  examples: Example[];
  etymology: string | null;
  source?: string;
}

export function DictionarySearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Recherche en cours…");
  const [error, setError] = useState<string | null>(null);
  const [addedToSrs, setAddedToSrs] = useState(false);
  const [isAddingSrs, setIsAddingSrs] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Première traduction française extraite des définitions
  const mainTranslation = result?.definitions?.[0]?.definitions?.[0] ?? null;

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setLoadingMsg("Recherche en cours…");
    setError(null);
    setResult(null);
    setAddedToSrs(false);

    // Après 3s sans résultat, indiquer que l'IA prend le relais
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => {
      setLoadingMsg("Wiktionary n'a pas trouvé ce mot — l'IA génère la définition…");
    }, 3000);

    try {
      const res = await fetch(
        `/api/dictionary/lookup?word=${encodeURIComponent(query.trim())}`
      );
      if (res.ok) {
        setResult((await res.json()) as LookupResult);
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Mot non trouvé.");
      }
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setIsLoading(false);
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    }
  };

  const handlePlayNative = () => {
    if (!result?.audioUrl) return;
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(result.audioUrl);
    audioRef.current = audio;
    audio.play();
  };

  const handleAddToSrs = async () => {
    if (!result) return;
    setIsAddingSrs(true);
    try {
      await fetch("/api/vocabulary/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portuguese: result.word,
          phonetic: result.phonetic,
          french: mainTranslation ?? result.word,
          level: "A2",
          tags: ["dictionnaire"],
        }),
      });
      setAddedToSrs(true);
    } catch {
      // Silently fail
    } finally {
      setIsAddingSrs(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void handleSearch(); }}
            placeholder="Chercher un mot en portugais..."
            className="w-full h-10 pl-9 pr-4 border rounded-lg text-sm bg-background"
          />
        </div>
        <Button
          onClick={() => void handleSearch()}
          disabled={isLoading || !query.trim()}
          className="bg-[#1A56DB] hover:bg-[#1A56DB]/90"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Chercher"}
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              <span>{loadingMsg}</span>
            </div>
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      )}

      {/* Erreur */}
      {error && (
        <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Résultat */}
      {result && (
        <Card>
          <CardHeader className="pb-3">
            {/* Mot + traduction principale */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl font-bold">{result.word}</span>
                </div>
                {/* Phonétique + source */}
                <div className="flex items-center gap-2">
                  {result.phonetic && (
                    <span className="text-muted-foreground text-sm font-mono">
                      {result.phonetic}
                    </span>
                  )}
                  {result.source === "ollama" && (
                    <Badge variant="outline" className="text-xs">IA</Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Audio natif (Wiktionary) */}
                {result.audioUrl && (
                  <Button variant="outline" size="sm" onClick={handlePlayNative} title="Enregistrement natif">
                    <Volume2 className="h-4 w-4 mr-1" />
                    Natif
                  </Button>
                )}
                {/* TTS synthétisé */}
                <AudioPlayer text={result.word} voice="female" />

                {/* Ajouter au deck SRS */}
                <Button
                  variant={addedToSrs ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => void handleAddToSrs()}
                  disabled={addedToSrs || isAddingSrs}
                >
                  {isAddingSrs ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : addedToSrs ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  {addedToSrs ? "Ajouté" : "Ajouter"}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Définitions par partie du discours */}
            {result.definitions.map((def, i) => (
              <div key={i}>
                <Badge variant="outline" className="mb-2 text-xs">
                  {def.partOfSpeech}
                </Badge>
                <ol className="list-decimal list-inside space-y-1">
                  {def.definitions.map((d, j) => (
                    <li key={j} className="text-sm text-foreground/80">
                      {d}
                    </li>
                  ))}
                </ol>
              </div>
            ))}

            {/* Exemples avec TTS */}
            {result.examples.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  Exemples
                </h4>
                <ul className="space-y-3">
                  {result.examples.map((ex, i) => {
                    const ptText = typeof ex === "string" ? ex : ex.pt;
                    const frText = typeof ex === "string" ? null : ex.fr;
                    return (
                      <li
                        key={i}
                        className="pl-3 border-l-2 border-[#1A56DB]/30 space-y-0.5"
                      >
                        <div className="flex items-start gap-2">
                          <AudioPlayer text={ptText} voice="female" className="mt-0.5 shrink-0" />
                          <span className="text-sm text-foreground/80 italic">{ptText}</span>
                        </div>
                        {frText && (
                          <p className="text-xs text-muted-foreground pl-8">{frText}</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Étymologie */}
            {result.etymology && (
              <div className="pt-3 border-t">
                <h4 className="text-xs font-semibold text-muted-foreground mb-1">
                  Étymologie
                </h4>
                <p className="text-xs text-muted-foreground">{result.etymology}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

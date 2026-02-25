"use client";

import { useState, useEffect, useCallback } from "react";
import { ArticleCard } from "@/components/authentic/article-card";
import { ArticleReader } from "@/components/authentic/article-reader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ChevronLeft } from "lucide-react";

interface Article {
  id: number;
  title: string;
  source: string;
  content: string;
  level: string;
  theme: string | null;
  savedAt: string;
  url: string;
  isRead: boolean;
}

type ThemeKey =
  | "geral"
  | "politica"
  | "economia"
  | "desporto"
  | "cultura"
  | "tecnologia"
  | "saude"
  | "internacional";

const THEMES: { key: ThemeKey; label: string; emoji: string; description: string }[] = [
  { key: "geral",         label: "Actualités",     emoji: "📰", description: "Toutes les actualités" },
  { key: "politica",      label: "Politique",       emoji: "🏛️", description: "Gouvernement, élections, parlement" },
  { key: "economia",      label: "Économie",        emoji: "📈", description: "Finance, entreprises, marchés" },
  { key: "desporto",      label: "Sports",          emoji: "⚽", description: "Football, sport portugais" },
  { key: "cultura",       label: "Culture",         emoji: "🎭", description: "Cinéma, musique, arts, fado" },
  { key: "tecnologia",    label: "Technologie",     emoji: "💻", description: "IA, numérique, innovation" },
  { key: "saude",         label: "Santé",           emoji: "🏥", description: "Médecine, SNS, santé publique" },
  { key: "internacional", label: "International",   emoji: "🌍", description: "Monde, Europe, diplomatie" },
];

type LevelFilter = "all" | "A1" | "A2" | "B1" | "B2";

export default function AuthenticPage() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [fetchMessage, setFetchMessage] = useState<string | null>(null);

  const loadArticles = useCallback(async () => {
    if (!selectedTheme) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (levelFilter !== "all") params.set("level", levelFilter);
      if (selectedTheme !== "geral") params.set("theme", selectedTheme);
      const res = await fetch(`/api/authentic/items?${params.toString()}`);
      const data = (await res.json()) as { items?: Article[] };
      setArticles(data.items ?? []);
    } catch {
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTheme, levelFilter]);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  const handleFetchRss = async () => {
    setIsFetching(true);
    setFetchMessage(null);
    try {
      const body =
        selectedTheme && selectedTheme !== "geral"
          ? JSON.stringify({ theme: selectedTheme })
          : "{}";
      const res = await fetch("/api/authentic/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const data = (await res.json()) as {
        fetched?: number;
        saved?: number;
        error?: string;
      };
      if (data.error) {
        setFetchMessage(`Erreur : ${data.error}`);
      } else {
        setFetchMessage(
          `${data.fetched ?? 0} articles récupérés, ${data.saved ?? 0} nouveaux sauvegardés.`
        );
        await loadArticles();
      }
    } catch {
      setFetchMessage("Impossible de récupérer les articles. Vérifiez la connexion.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleMarkRead = (id: number) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    );
    if (selectedArticle?.id === id) {
      setSelectedArticle((prev) => (prev ? { ...prev, isRead: true } : null));
    }
  };

  const filtered =
    levelFilter === "all"
      ? articles
      : articles.filter((a) => a.level === levelFilter);
  const readCount = articles.filter((a) => a.isRead).length;
  const currentTheme = THEMES.find((t) => t.key === selectedTheme);

  // ─── Écran de sélection de thème ────────────────────────────────────────────
  if (!selectedTheme) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Contenu authentique</h1>
          <p className="text-muted-foreground">
            Choisissez un thème pour lire des articles de presse portugaise.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {THEMES.map((theme) => (
            <button
              key={theme.key}
              onClick={() => setSelectedTheme(theme.key)}
              className="group flex flex-col items-start gap-2 rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:border-[#1A56DB] hover:shadow-md active:scale-[0.98]"
            >
              <span className="text-3xl">{theme.emoji}</span>
              <div>
                <p className="font-semibold text-sm">{theme.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {theme.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Vue articles d'un thème ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setSelectedTheme(null); setArticles([]); setFetchMessage(null); }}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Thèmes
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>{currentTheme?.emoji}</span>
            {currentTheme?.label}
          </h1>
          <p className="text-muted-foreground text-sm">
            {currentTheme?.description}
          </p>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "A1", "A2", "B1", "B2"] as LevelFilter[]).map((l) => (
            <Button
              key={l}
              variant={levelFilter === l ? "default" : "outline"}
              size="sm"
              onClick={() => setLevelFilter(l)}
              className={levelFilter === l ? "bg-[#1A56DB]" : ""}
            >
              {l === "all" ? "Tous niveaux" : l}
            </Button>
          ))}
          {articles.length > 0 && (
            <Badge variant="outline" className="ml-1">
              {readCount}/{articles.length} lus
            </Badge>
          )}
        </div>
        <Button
          onClick={() => void handleFetchRss()}
          disabled={isFetching}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Chargement RSS..." : "Actualiser"}
        </Button>
      </div>

      {/* Message fetch */}
      {fetchMessage && (
        <p
          className={`text-sm px-3 py-2 rounded-md ${
            fetchMessage.startsWith("Erreur")
              ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
              : "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
          }`}
        >
          {fetchMessage}
        </p>
      )}

      {/* Grille articles */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-2">Aucun article sur ce thème</p>
          <p className="text-sm mb-4">
            Cliquez sur &quot;Actualiser&quot; pour récupérer des articles de presse portugaise.
          </p>
          <Button
            onClick={() => void handleFetchRss()}
            disabled={isFetching}
            className="bg-[#1A56DB] hover:bg-[#1A56DB]/90"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Charger les articles
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((article) => (
            <ArticleCard
              key={article.id}
              {...article}
              onClick={() => setSelectedArticle(article)}
            />
          ))}
        </div>
      )}

      {/* Lecteur d'article */}
      {selectedArticle && (
        <ArticleReader
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onMarkRead={handleMarkRead}
        />
      )}
    </div>
  );
}

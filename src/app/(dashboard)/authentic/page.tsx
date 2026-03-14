"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ArticleCard } from "@/components/authentic/article-card";
import { ArticleReader } from "@/components/authentic/article-reader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, ChevronLeft, Sparkles, Search, Tag, ClipboardPaste } from "lucide-react";

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
  | "internacional"
  | "__custom__";

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

interface CustomThemeData {
  label: string;
  emoji: string;
  keywords: string[];
}

export default function AuthenticPage() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [fetchMessage, setFetchMessage] = useState<string | null>(null);

  // Thème libre
  const [customInput, setCustomInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [customThemeData, setCustomThemeData] = useState<CustomThemeData | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mode "Coller du texte"
  const [showPasteForm, setShowPasteForm] = useState(false);
  const [pastedTitle, setPastedTitle] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [pastedLevel, setPastedLevel] = useState("B1");

  const loadArticles = useCallback(async () => {
    if (!selectedTheme || selectedTheme === "__custom__") return;
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

  // Quand le niveau change sur un thème custom, relancer la recherche IA
  useEffect(() => {
    if (selectedTheme !== "__custom__" || !customThemeData) return;
    void reloadCustomArticles(customThemeData.keywords);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelFilter]);

  const reloadCustomArticles = async (keywords: string[]) => {
    setIsLoading(true);
    try {
      const level = levelFilter !== "all" ? levelFilter : undefined;
      const res = await fetch("/api/authentic/ai-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: customInput, level }),
      });
      const data = (await res.json()) as {
        label?: string;
        emoji?: string;
        keywords?: string[];
        articles?: Article[];
        error?: string;
      };
      if (data.articles) setArticles(data.articles);
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
    void keywords; // juste pour satisfaire la signature
  };

  const handleGenerateCustomTheme = async () => {
    const topic = customInput.trim();
    if (!topic) return;
    setIsGenerating(true);
    setCustomError(null);
    try {
      const level = levelFilter !== "all" ? levelFilter : undefined;
      const res = await fetch("/api/authentic/ai-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level }),
      });
      const data = (await res.json()) as {
        label?: string;
        emoji?: string;
        keywords?: string[];
        articles?: Article[];
        error?: string;
      };
      if (data.error) {
        setCustomError(data.error);
        return;
      }
      setCustomThemeData({
        label: data.label ?? topic,
        emoji: data.emoji ?? "🔍",
        keywords: data.keywords ?? [],
      });
      setArticles(data.articles ?? []);
      setSelectedTheme("__custom__");
    } catch {
      setCustomError("Impossible de contacter Ollama. Vérifiez qu'il est démarré.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFetchRss = async () => {
    setIsFetching(true);
    setFetchMessage(null);
    try {
      const body =
        selectedTheme && selectedTheme !== "geral" && selectedTheme !== "__custom__"
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
        if (selectedTheme === "__custom__" && customThemeData) {
          await reloadCustomArticles(customThemeData.keywords);
        } else {
          await loadArticles();
        }
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

  const handleBack = () => {
    setSelectedTheme(null);
    setArticles([]);
    setFetchMessage(null);
    setCustomThemeData(null);
    setCustomInput("");
    setCustomError(null);
  };

  function handleAnalysePasted() {
    const text = pastedText.trim();
    if (!text) return;
    const tempArticle: Article = {
      id: -1, // article temporaire, non sauvegardé en DB
      title: pastedTitle.trim() || "Texte collé",
      source: "Copié-collé",
      content: text,
      level: pastedLevel,
      theme: null,
      savedAt: new Date().toISOString(),
      url: "",
      isRead: false,
    };
    setSelectedArticle(tempArticle);
  }

  const filtered =
    levelFilter === "all"
      ? articles
      : articles.filter((a) => a.level === levelFilter);
  const readCount = articles.filter((a) => a.isRead).length;
  const currentTheme =
    selectedTheme === "__custom__"
      ? customThemeData
        ? { emoji: customThemeData.emoji, label: customThemeData.label, description: `Thème généré par IA · ${customThemeData.keywords.slice(0, 4).join(", ")}…` }
        : null
      : THEMES.find((t) => t.key === selectedTheme);

  // ─── Écran de sélection de thème ────────────────────────────────────────────
  if (!selectedTheme) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Contenu authentique</h1>
          <p className="text-muted-foreground">
            Choisissez un thème prédéfini ou laissez l&apos;IA rechercher des articles sur un sujet de votre choix.
          </p>
        </div>

        {/* Thèmes prédéfinis */}
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

        {/* Séparateur */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">ou</span>
          <div className="flex-1 border-t" />
        </div>

        {/* Thème libre IA */}
        <div className="rounded-xl border-2 border-dashed border-[#1A56DB]/40 bg-blue-50/50 dark:bg-blue-950/20 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#1A56DB]" />
            <h2 className="font-semibold text-[#1A56DB]">Thème libre avec l&apos;IA</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Tapez n&apos;importe quel sujet en français ou en portugais. L&apos;IA génère les mots-clés et recherche des articles correspondants.
          </p>
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={customInput}
              onChange={(e) => { setCustomInput(e.target.value); setCustomError(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") void handleGenerateCustomTheme(); }}
              placeholder="Ex : environnement, tourisme au Portugal, immigration…"
              className="flex-1"
              disabled={isGenerating}
            />
            <Button
              onClick={() => void handleGenerateCustomTheme()}
              disabled={isGenerating || !customInput.trim()}
              className="bg-[#1A56DB] hover:bg-[#1A56DB]/90 gap-2 shrink-0"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Génération…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Rechercher
                </>
              )}
            </Button>
          </div>
          {customError && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md">
              {customError}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Exemples : <span className="italic">réchauffement climatique, vinho verde, élections municipales, tourisme à Lisbonne, start-ups portugaises</span>
          </p>
        </div>

        {/* Séparateur */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">ou</span>
          <div className="flex-1 border-t" />
        </div>

        {/* Zone coller du texte */}
        <div className="rounded-xl border-2 border-dashed border-orange-400/40 bg-orange-50/50 dark:bg-orange-950/20 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardPaste className="h-5 w-5 text-orange-500" />
            <h2 className="font-semibold text-orange-600 dark:text-orange-400">
              Coller votre propre texte
            </h2>
          </div>

          {!showPasteForm ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Lisez un article sur RTP, Público, Observador… copiez le texte et collez-le ici pour l&apos;analyser (résumé, vocabulaire, questions, TTS).
              </p>
              <Button
                variant="outline"
                onClick={() => setShowPasteForm(true)}
                className="gap-2 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/30"
              >
                <ClipboardPaste className="h-4 w-4 text-orange-500" />
                Coller du texte
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={pastedTitle}
                onChange={(e) => setPastedTitle(e.target.value)}
                placeholder="Titre de l'article (optionnel)"
                className="w-full h-9 text-sm border rounded-md px-3 bg-white dark:bg-gray-800 dark:border-gray-700"
              />
              <Textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Collez ici le texte de l'article…"
                rows={7}
                className="resize-y text-sm"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Niveau estimé :</span>
                {(["A1", "A2", "B1", "B2", "C1"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setPastedLevel(l)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      pastedLevel === l
                        ? "bg-orange-500 text-white"
                        : "bg-muted text-muted-foreground hover:bg-orange-100 dark:hover:bg-orange-900/30"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAnalysePasted}
                  disabled={!pastedText.trim()}
                  className="bg-orange-500 hover:bg-orange-600 gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Analyser
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowPasteForm(false);
                    setPastedText("");
                    setPastedTitle("");
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ArticleReader pour texte collé (overlay même sur l'écran de sélection) */}
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

  // ─── Vue articles d'un thème ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Thèmes
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>{currentTheme?.emoji}</span>
            {currentTheme?.label}
            {selectedTheme === "__custom__" && (
              <Badge variant="outline" className="text-[#1A56DB] border-[#1A56DB]/40 gap-1 ml-1">
                <Sparkles className="h-3 w-3" />
                IA
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground text-sm truncate">
            {currentTheme?.description}
          </p>
        </div>
      </div>

      {/* Mots-clés générés (thème custom) */}
      {selectedTheme === "__custom__" && customThemeData && (
        <div className="flex flex-wrap gap-1.5">
          {customThemeData.keywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
            >
              <Tag className="h-2.5 w-2.5" />
              {kw}
            </span>
          ))}
        </div>
      )}

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
          <p className="text-lg mb-2">Aucun article trouvé</p>
          <p className="text-sm mb-4">
            {selectedTheme === "__custom__"
              ? "Aucun article ne correspond aux mots-clés générés. Actualisez le flux RSS ou essayez un autre sujet."
              : `Cliquez sur "Actualiser" pour récupérer des articles de presse portugaise.`}
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

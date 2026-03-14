"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, Tv, Radio, Music, BookOpen, Subtitles } from "lucide-react";
import { YouTubePlayer } from "@/components/media/youtube-player";
import mediaData from "@/../content/media-recommendations.json";

interface MediaItem {
  id: string;
  title: string;
  creator: string;
  level: string;
  description_fr: string;
  why_useful: string;
  where_to_find: string;
  language_notes: string;
  youtube_id?: string | null;
  youtube_search?: string;
}

interface MediaCategory {
  type: string;
  items: MediaItem[];
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  films: Film,
  series: Tv,
  podcasts: Radio,
  music: Music,
  books: BookOpen,
};

const TYPE_LABELS: Record<string, string> = {
  films: "Films",
  series: "Séries",
  podcasts: "Podcasts",
  music: "Musique",
  books: "Livres",
};

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  A2: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  B1: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  B2: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  C1: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

export default function MediaPage() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const categories = mediaData.categories as MediaCategory[];

  const allItems = categories.flatMap((cat) =>
    cat.items.map((item) => ({ ...item, type: cat.type }))
  );

  const filtered = allItems.filter((item) => {
    const typeOk = selectedType === "all" || item.type === selectedType;
    const levelOk = selectedLevel === "all" || item.level === selectedLevel;
    return typeOk && levelOk;
  });

  const types = categories.map((c) => c.type);
  const levels = ["A1", "A2", "B1", "B2", "C1"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Médias recommandés</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Films, séries, podcasts et musique pour s&apos;immerger dans le portugais européen.
        </p>
      </div>

      {/* Conseil sous-titres */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800/40 p-4 text-sm">
        <Subtitles className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-blue-900 dark:text-blue-200">Comprehensible Input — méthode des sous-titres ciblés</p>
          <p className="text-blue-700 dark:text-blue-300 text-xs leading-relaxed">
            Regardez avec les sous-titres en <strong>portugais européen</strong> (jamais en français).
            Visez 30-60% de compréhension. Sur YouTube, ajoutez{" "}
            <kbd className="rounded bg-blue-200 dark:bg-blue-800 px-1 py-0.5 text-xs">easy portuguese</kbd>{" "}
            ou <kbd className="rounded bg-blue-200 dark:bg-blue-800 px-1 py-0.5 text-xs">português europeu fácil</kbd>{" "}
            dans la recherche pour trouver du contenu adapté.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedType === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            Tous types
          </button>
          {types.map((type) => {
            const Icon = TYPE_ICONS[type] ?? Film;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-3 w-3" />
                {TYPE_LABELS[type] ?? type}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedLevel("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedLevel === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            Tous niveaux
          </button>
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedLevel === lvl
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">{filtered.length} ressources</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((item) => {
          const Icon = TYPE_ICONS[item.type] ?? Film;
          const isYouTubeSource =
            item.where_to_find.toLowerCase().includes("youtube") ||
            item.type === "series" ||
            item.type === "podcasts";

          return (
            <Card key={item.id} className="rounded-2xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <CardTitle className="text-sm font-semibold">
                      {item.title}
                    </CardTitle>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      LEVEL_COLORS[item.level] ?? ""
                    }`}
                  >
                    {item.level}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  {item.creator}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{item.description_fr}</p>
                <div className="rounded-md bg-muted p-2 space-y-1">
                  <p className="text-xs font-medium">Pourquoi c&apos;est utile</p>
                  <p className="text-xs text-muted-foreground">{item.why_useful}</p>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>
                    <span className="font-medium">Où trouver :</span>{" "}
                    {item.where_to_find}
                  </p>
                  <p>
                    <span className="font-medium">Langue :</span>{" "}
                    {item.language_notes}
                  </p>
                </div>

                {/* Lecteur YouTube ou bouton de recherche */}
                {(item.type === "films" || item.type === "series" || item.type === "podcasts" || isYouTubeSource) && (
                  <YouTubePlayer
                    title={item.title}
                    youtubeId={item.youtube_id}
                    searchQuery={`${item.title} ${item.creator} legendas português`}
                    level={item.level}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

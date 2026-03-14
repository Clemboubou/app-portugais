"use client";

import { useState } from "react";
import { Play, ExternalLink, Subtitles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface YouTubePlayerProps {
  title: string;
  youtubeId?: string | null;
  searchQuery?: string;
  level?: string;
}

/**
 * Lecteur YouTube embarqué avec sous-titres PT-PT forcés.
 * Si youtubeId est fourni → iframe embarqué avec cc_lang_pref=pt&cc_load_policy=1
 * Sinon → bouton de recherche YouTube avec la requête pré-remplie
 */
export function YouTubePlayer({ title, youtubeId, searchQuery, level }: YouTubePlayerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    searchQuery ?? `${title} português europeu`
  )}`;

  const embedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?cc_load_policy=1&cc_lang_pref=pt&hl=pt&rel=0&modestbranding=1`
    : null;

  if (embedUrl && isOpen) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Subtitles className="h-3.5 w-3.5 text-primary" />
            <span>Sous-titres PT activés automatiquement</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-7 w-7 p-0"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Si les sous-titres ne s&apos;activent pas automatiquement : cliquez sur{" "}
          <kbd className="rounded bg-muted px-1 py-0.5 text-xs">CC</kbd> dans le lecteur,
          puis sélectionnez <strong>Portugais (Portugal)</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {embedUrl ? (
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="gap-2 h-8 text-xs"
        >
          <Play className="h-3.5 w-3.5" />
          Regarder avec sous-titres PT
        </Button>
      ) : (
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-medium transition-colors h-8"
        >
          <Play className="h-3.5 w-3.5" />
          Chercher sur YouTube
          <ExternalLink className="h-3 w-3 opacity-70" />
        </a>
      )}
      {level && (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Subtitles className="h-3.5 w-3.5" />
          Cherchez «sous-titres PT» ou activez les CC
        </span>
      )}
    </div>
  );
}

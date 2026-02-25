"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ExternalLink,
  BookOpen,
  List,
  Check,
  Volume2,
  Square,
  MessageCircleQuestion,
  Plus,
  Send,
  Loader2,
} from "lucide-react";

interface Article {
  id: number;
  title: string;
  source: string;
  content: string;
  level: string;
  savedAt: string;
  url: string;
  isRead: boolean;
}

interface ArticleReaderProps {
  article: Article;
  onClose: () => void;
  onMarkRead: (id: number) => void;
}

interface VocabWord {
  portuguese: string;
  french: string;
  added: boolean;
}

export function ArticleReader({
  article,
  onClose,
  onMarkRead,
}: ArticleReaderProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [vocabulary, setVocabulary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingVocab, setIsLoadingVocab] = useState(false);
  const [isRead, setIsRead] = useState(article.isRead);

  // TTS
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingTts, setIsLoadingTts] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Q&A
  const [showQA, setShowQA] = useState(false);
  const [question, setQuestion] = useState("");
  const [qaHistory, setQaHistory] = useState<Array<{ q: string; a: string }>>([]);
  const [isLoadingQA, setIsLoadingQA] = useState(false);

  // Ajout vocab
  const [parsedWords, setParsedWords] = useState<VocabWord[]>([]);
  const [addingWord, setAddingWord] = useState<string | null>(null);

  const fetchAi = async (mode: "summary" | "vocabulary") => {
    const setLoading = mode === "summary" ? setIsLoadingSummary : setIsLoadingVocab;
    const setResult = mode === "summary" ? setSummary : setVocabulary;

    setLoading(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          mode,
        }),
      });
      const data = (await res.json()) as { result?: string; error?: string };
      const result = data.result ?? data.error ?? "Erreur lors de la génération.";
      setResult(result);

      // Parser les mots du vocabulaire pour permettre l'ajout
      if (mode === "vocabulary" && data.result) {
        const words: VocabWord[] = [];
        const lines = data.result.split("\n").filter((l) => l.trim());
        for (const line of lines) {
          // Tente de parser "mot portugais - traduction française" ou variantes
          const match = line.match(
            /[•\-\d.]*\s*\*{0,2}(.+?)\*{0,2}\s*[-–:]\s*(.+)/
          );
          if (match) {
            const pt = match[1]
              .replace(/\*+/g, "")
              .replace(/\[.*?\]/g, "")
              .trim();
            const fr = match[2].replace(/\*+/g, "").trim();
            if (pt.length > 1 && fr.length > 1) {
              words.push({ portuguese: pt, french: fr, added: false });
            }
          }
        }
        setParsedWords(words);
      }
    } catch {
      setResult("Impossible de contacter Ollama. Vérifiez qu'il est démarré.");
    } finally {
      setLoading(false);
    }
  };

  const handleTts = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    setIsLoadingTts(true);
    try {
      // Limiter à ~500 caractères pour le TTS (premier paragraphe)
      const textToRead = article.content.substring(0, 1500);
      const res = await fetch("/api/audio/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToRead, voice: "female" }),
      });
      const data = (await res.json()) as { audioUrl?: string; error?: string };
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        audio.play();
        setIsPlaying(true);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoadingTts(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || isLoadingQA) return;

    const q = question.trim();
    setQuestion("");
    setIsLoadingQA(true);
    try {
      const res = await fetch("/api/ai/comprehension", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          question: q,
        }),
      });
      const data = (await res.json()) as { result?: string; error?: string };
      setQaHistory((prev) => [
        ...prev,
        { q, a: data.result ?? data.error ?? "Erreur." },
      ]);
    } catch {
      setQaHistory((prev) => [
        ...prev,
        { q, a: "Impossible de contacter Ollama." },
      ]);
    } finally {
      setIsLoadingQA(false);
    }
  };

  const handleAddWord = async (word: VocabWord) => {
    setAddingWord(word.portuguese);
    try {
      const res = await fetch("/api/vocabulary/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portuguese: word.portuguese,
          phonetic: "",
          french: word.french,
          level: article.level,
          tags: ["article", article.source],
        }),
      });
      const data = (await res.json()) as { created?: boolean };
      setParsedWords((prev) =>
        prev.map((w) =>
          w.portuguese === word.portuguese ? { ...w, added: true } : w
        )
      );
      if (data.created === false) {
        // Word already existed — still mark as added visually
      }
    } catch {
      // Silently fail
    } finally {
      setAddingWord(null);
    }
  };

  const handleMarkRead = async () => {
    await fetch("/api/authentic/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: article.id }),
    });
    setIsRead(true);
    onMarkRead(article.id);
  };

  const date = new Date(article.savedAt).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base leading-snug">{article.title}</h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {article.source}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {article.level}
              </Badge>
              <span className="text-xs text-muted-foreground">{date}</span>
              {isRead && (
                <span className="text-xs text-green-600 font-medium">
                  ✓ Lu
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="shrink-0"
          >
            ✕
          </Button>
        </div>

        <ScrollArea className="flex-1 px-5">
          <div className="py-4 space-y-5">
            {/* Texte article */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-sm leading-relaxed whitespace-pre-line text-gray-800 dark:text-gray-200">
                {article.content || "Contenu non disponible."}
              </p>
            </div>

            {/* Boutons actions */}
            <div className="flex gap-2 flex-wrap border-t pt-4">
              {/* TTS */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleTts}
                disabled={isLoadingTts}
              >
                {isPlaying ? (
                  <Square className="h-3.5 w-3.5 mr-1.5" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5 mr-1.5" />
                )}
                {isLoadingTts
                  ? "Chargement..."
                  : isPlaying
                    ? "Arrêter"
                    : "Écouter"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAi("summary")}
                disabled={isLoadingSummary || !!summary}
              >
                <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                {isLoadingSummary ? "Génération..." : "Résumer en français"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAi("vocabulary")}
                disabled={isLoadingVocab || !!vocabulary}
              >
                <List className="h-3.5 w-3.5 mr-1.5" />
                {isLoadingVocab ? "Génération..." : "Vocabulaire clé"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQA(!showQA)}
              >
                <MessageCircleQuestion className="h-3.5 w-3.5 mr-1.5" />
                Questions
              </Button>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto"
              >
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Source
                </Button>
              </a>
            </div>

            {/* Résumé */}
            {(isLoadingSummary || summary) && (
              <Card className="border-blue-100 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/30">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm text-[#1A56DB]">
                    Résumé (Ollama)
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {isLoadingSummary ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {summary}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Vocabulaire avec boutons d'ajout */}
            {(isLoadingVocab || vocabulary) && (
              <Card className="border-amber-100 bg-amber-50/30 dark:border-amber-900 dark:bg-amber-950/30">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm text-amber-700 dark:text-amber-400">
                    Vocabulaire clé (Ollama)
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {isLoadingVocab ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                        {vocabulary}
                      </p>
                      {parsedWords.length > 0 && (
                        <div className="pt-3 border-t mt-3 space-y-1">
                          <p className="text-xs text-muted-foreground mb-2">
                            Ajouter au deck de révision :
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {parsedWords.map((w) => (
                              <Button
                                key={w.portuguese}
                                variant={w.added ? "secondary" : "outline"}
                                size="sm"
                                className="h-7 text-xs"
                                disabled={w.added || addingWord === w.portuguese}
                                onClick={() => handleAddWord(w)}
                              >
                                {addingWord === w.portuguese ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : w.added ? (
                                  <Check className="h-3 w-3 mr-1" />
                                ) : (
                                  <Plus className="h-3 w-3 mr-1" />
                                )}
                                {w.portuguese}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Q&A */}
            {showQA && (
              <Card className="border-green-100 bg-green-50/30 dark:border-green-900 dark:bg-green-950/30">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm text-green-700 dark:text-green-400">
                    Questions sur l&apos;article
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  {/* Historique Q&A */}
                  {qaHistory.map((item, i) => (
                    <div key={i} className="space-y-1.5">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        Q : {item.q}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap pl-3 border-l-2 border-green-300">
                        {item.a}
                      </p>
                    </div>
                  ))}

                  {isLoadingQA && (
                    <div className="space-y-2 pl-3 border-l-2 border-green-300">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  )}

                  {/* Input question */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAskQuestion();
                      }}
                      placeholder="Que signifie... ? Pourquoi... ?"
                      className="flex-1 h-8 text-sm border rounded-md px-3 bg-white dark:bg-gray-800 dark:border-gray-700"
                    />
                    <Button
                      size="sm"
                      className="h-8 bg-green-600 hover:bg-green-700"
                      onClick={handleAskQuestion}
                      disabled={isLoadingQA || !question.trim()}
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          {!isRead && (
            <Button
              onClick={handleMarkRead}
              className="bg-[#1A56DB] hover:bg-[#1A56DB]/90"
            >
              <Check className="h-4 w-4 mr-2" />
              Marquer comme lu
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

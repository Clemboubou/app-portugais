"use client";

import { useState, useRef, useCallback } from "react";
import { AudioPlayer } from "@/components/audio/audio-player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  HelpCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  List,
  Volume2,
  Square,
  Loader2,
  MessageCircleQuestion,
  Send,
  Plus,
  Check,
} from "lucide-react";

interface StoryVocab {
  pt: string;
  fr: string;
}

interface StoryVariation {
  type: string;
  label: string;
  text: string;
}

interface Story {
  id: string;
  title: string;
  theme: string;
  icon: string;
  main_text: string;
  vocabulary: StoryVocab[];
  variations: StoryVariation[];
}

interface MiniStoryReaderProps {
  stories: Story[];
  level: string;
}

interface VocabWord {
  portuguese: string;
  french: string;
  added: boolean;
}

type Tab = "main" | string;

const VARIATION_ICONS: Record<string, React.ReactNode> = {
  questions: <HelpCircle className="h-3.5 w-3.5" />,
  past: <Clock className="h-3.5 w-3.5" />,
  future: <Clock className="h-3.5 w-3.5" />,
  habitual: <BookOpen className="h-3.5 w-3.5" />,
  imperfect: <Clock className="h-3.5 w-3.5" />,
  conditional: <Clock className="h-3.5 w-3.5" />,
  subjunctive: <BookOpen className="h-3.5 w-3.5" />,
  negative: <XCircle className="h-3.5 w-3.5" />,
};

export function MiniStoryReader({ stories, level }: MiniStoryReaderProps) {
  const [storyIndex, setStoryIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("main");
  const [showVocab, setShowVocab] = useState(false);

  // TTS — lecture complète du texte
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingTts, setIsLoadingTts] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // TTS — clic sur un mot individuel
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const [loadingWord, setLoadingWord] = useState<string | null>(null);
  const wordAudioRef = useRef<HTMLAudioElement | null>(null);

  // IA vocabulaire
  const [aiVocab, setAiVocab] = useState<string | null>(null);
  const [isLoadingAiVocab, setIsLoadingAiVocab] = useState(false);
  const [parsedWords, setParsedWords] = useState<VocabWord[]>([]);
  const [addingWord, setAddingWord] = useState<string | null>(null);

  // IA Q&A
  const [showQA, setShowQA] = useState(false);
  const [question, setQuestion] = useState("");
  const [qaHistory, setQaHistory] = useState<Array<{ q: string; a: string }>>([]);
  const [isLoadingQA, setIsLoadingQA] = useState(false);

  const story = stories[storyIndex];
  if (!story) return null;

  const currentText =
    activeTab === "main"
      ? story.main_text
      : (story.variations.find((v) => v.type === activeTab)?.text ?? story.main_text);

  // ── Navigation ──────────────────────────────────────────────────
  function goNext() {
    setStoryIndex((i) => Math.min(i + 1, stories.length - 1));
    resetState();
  }

  function goPrev() {
    setStoryIndex((i) => Math.max(i - 1, 0));
    resetState();
  }

  function resetState() {
    setActiveTab("main");
    setShowVocab(false);
    setAiVocab(null);
    setParsedWords([]);
    setQaHistory([]);
    setShowQA(false);
    setQuestion("");
    stopAudio();
  }

  // ── TTS ──────────────────────────────────────────────────────────
  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    // Arrêter aussi le mot en cours de lecture
    if (wordAudioRef.current) {
      wordAudioRef.current.pause();
      wordAudioRef.current = null;
    }
    setPlayingWord(null);
    setLoadingWord(null);
  }

  // Nettoyer la ponctuation pour n'envoyer que le mot au TTS
  function cleanWordForTts(raw: string): string {
    return raw.replace(/[.,!?;:"'()\[\]…«»—–\u2019\u2018]/g, "").trim();
  }

  const handleWordClick = useCallback(async (raw: string) => {
    const word = cleanWordForTts(raw);
    if (!word || word.length < 2) return;

    // Arrêter le mot précédent
    if (wordAudioRef.current) {
      wordAudioRef.current.pause();
      wordAudioRef.current = null;
    }

    // Toggle : re-cliquer sur le même mot → arrêt
    if (playingWord === word) {
      setPlayingWord(null);
      return;
    }

    setLoadingWord(word);
    try {
      const res = await fetch("/api/audio/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: word, voice: "female" }),
      });
      const data = (await res.json()) as { audioUrl?: string };

      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        wordAudioRef.current = audio;
        setPlayingWord(word);
        audio.onended = () => { setPlayingWord(null); wordAudioRef.current = null; };
        audio.onerror = () => { setPlayingWord(null); wordAudioRef.current = null; };
        void audio.play();
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingWord(null);
    }
  }, [playingWord]);

  const handleTts = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsLoadingTts(true);
    try {
      const res = await fetch("/api/audio/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentText, voice: "female" }),
      });
      const data = (await res.json()) as {
        audioUrl?: string;
        useWebSpeech?: boolean;
        error?: string;
      };

      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
        void audio.play();
        setIsPlaying(true);
      }
      // Pas de fallback Web Speech API — les voix Windows sont PT-BR
    } catch {
      // Silently fail
    } finally {
      setIsLoadingTts(false);
    }
  };

  // ── IA : vocabulaire clé (même pattern que article-reader.tsx) ──
  const handleAiVocab = async () => {
    setIsLoadingAiVocab(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: story.title,
          content: story.main_text,
          mode: "vocabulary",
        }),
      });
      const data = (await res.json()) as { result?: string; error?: string };
      const result = data.result ?? data.error ?? "Erreur lors de la génération.";
      setAiVocab(result);

      // Parser pour boutons d'ajout SRS (même logique que article-reader)
      const words: VocabWord[] = [];
      const lines = result.split("\n").filter((l) => l.trim());
      for (const line of lines) {
        const match = line.match(/[•\-\d.]*\s*\*{0,2}(.+?)\*{0,2}\s*[-–:]\s*(.+)/);
        if (match) {
          const pt = match[1].replace(/\*+/g, "").replace(/\[.*?\]/g, "").trim();
          const fr = match[2].replace(/\*+/g, "").trim();
          if (pt.length > 1 && fr.length > 1) {
            words.push({ portuguese: pt, french: fr, added: false });
          }
        }
      }
      setParsedWords(words);
    } catch {
      setAiVocab("Impossible de contacter Ollama. Vérifiez qu'il est démarré.");
    } finally {
      setIsLoadingAiVocab(false);
    }
  };

  // ── IA : Q&A (même pattern que article-reader.tsx) ──────────────
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
          title: story.title,
          content: story.main_text,
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

  // ── Ajout mot au SRS (même pattern que article-reader.tsx) ───────
  const handleAddWord = async (word: VocabWord) => {
    setAddingWord(word.portuguese);
    try {
      await fetch("/api/vocabulary/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portuguese: word.portuguese,
          phonetic: "",
          french: word.french,
          level,
          tags: ["mini-story", story.theme],
        }),
      });
      setParsedWords((prev) =>
        prev.map((w) =>
          w.portuguese === word.portuguese ? { ...w, added: true } : w
        )
      );
    } catch {
      // Silently fail
    } finally {
      setAddingWord(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Navigation histoire ── */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goPrev}
          disabled={storyIndex === 0}
          className="gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" />
          Précédente
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {storyIndex + 1} / {stories.length}
          </p>
          <p className="text-sm font-semibold text-foreground">
            {story.icon} {story.title}
          </p>
          <p className="text-xs text-muted-foreground">{story.theme}</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goNext}
          disabled={storyIndex === stories.length - 1}
          className="gap-1.5"
        >
          Suivante
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Onglets de variation ── */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setActiveTab("main"); stopAudio(); }}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "main"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Histoire
        </button>
        {story.variations.map((v) => (
          <button
            key={v.type}
            onClick={() => { setActiveTab(v.type); stopAudio(); }}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === v.type
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {VARIATION_ICONS[v.type] ?? <BookOpen className="h-3.5 w-3.5" />}
            {v.label}
          </button>
        ))}
      </div>

      {/* ── Texte de l'histoire ── */}
      <Card className="rounded-2xl">
        <CardContent className="p-6 space-y-4">
          {/* Texte avec mots cliquables pour TTS */}
          <div className="text-base leading-relaxed text-foreground">
            {currentText.split(/(\n)/).map((segment, segIdx) => {
              if (segment === "\n") return <br key={segIdx} />;
              return (
                <span key={segIdx}>
                  {segment.split(/(\s+)/).map((part, wordIdx) => {
                    if (/^\s+$/.test(part)) {
                      return <span key={`${segIdx}-${wordIdx}`}>{part}</span>;
                    }
                    const clean = cleanWordForTts(part);
                    if (!clean || clean.length < 2) {
                      return <span key={`${segIdx}-${wordIdx}`}>{part}</span>;
                    }
                    const isActive = playingWord === clean;
                    const isLoad   = loadingWord === clean;
                    return (
                      <span
                        key={`${segIdx}-${wordIdx}`}
                        onClick={() => void handleWordClick(part)}
                        className={cn(
                          "cursor-pointer rounded-sm px-0.5 transition-colors select-none",
                          "hover:bg-indigo-100 dark:hover:bg-indigo-900/30",
                          isActive && "bg-indigo-200 dark:bg-indigo-800/40 text-indigo-800 dark:text-indigo-200",
                          isLoad  && "bg-amber-100 dark:bg-amber-900/30 opacity-70",
                        )}
                      >
                        {part}
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground/60 italic">
            Cliquez sur un mot pour l&apos;entendre en portugais européen
          </p>

          {/* Boutons actions (même pattern que article-reader.tsx) */}
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
              {isLoadingTts ? "Chargement…" : isPlaying ? "Arrêter" : "Écouter"}
            </Button>

            {/* Vocabulaire IA */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAiVocab}
              disabled={isLoadingAiVocab || !!aiVocab}
            >
              <List className="h-3.5 w-3.5 mr-1.5" />
              {isLoadingAiVocab ? "Génération…" : "Vocabulaire clé (IA)"}
            </Button>

            {/* Q&A */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQA(!showQA)}
            >
              <MessageCircleQuestion className="h-3.5 w-3.5 mr-1.5" />
              Questions (IA)
            </Button>
          </div>

          {activeTab === "main" && (
            <p className="text-xs text-muted-foreground/60 italic">
              Niveau {level} · Vocabulaire haute fréquence · Répétition des structures de base
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── IA : Vocabulaire clé (même affichage que article-reader.tsx) ── */}
      {(isLoadingAiVocab || aiVocab) && (
        <Card className="border-amber-100 bg-amber-50/30 dark:border-amber-900 dark:bg-amber-950/30">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm text-amber-700 dark:text-amber-400">
              Vocabulaire clé (Ollama)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isLoadingAiVocab ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {aiVocab}
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

      {/* ── IA : Q&A (même affichage que article-reader.tsx) ── */}
      {showQA && (
        <Card className="border-green-100 bg-green-50/30 dark:border-green-900 dark:bg-green-950/30">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm text-green-700 dark:text-green-400">
              Questions sur l&apos;histoire
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
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

            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleAskQuestion();
                }}
                placeholder="Que signifie… ? Pourquoi… ? Expliquez…"
                className="flex-1 h-8 text-sm border rounded-md px-3 bg-white dark:bg-gray-800 dark:border-gray-700"
              />
              <Button
                size="sm"
                className="h-8 bg-green-600 hover:bg-green-700"
                onClick={() => void handleAskQuestion()}
                disabled={isLoadingQA || !question.trim()}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Vocabulaire natif de l'histoire ── */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowVocab((v) => !v)}
          className="gap-2 text-muted-foreground"
        >
          <List className="h-4 w-4" />
          {showVocab
            ? "Masquer le vocabulaire"
            : `Vocabulaire de l'histoire (${story.vocabulary.length} mots)`}
        </Button>

        {showVocab && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {story.vocabulary.map((word) => (
              <div
                key={word.pt}
                className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-2.5 gap-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-sm text-foreground truncate">
                    {word.pt}
                  </span>
                  <AudioPlayer text={word.pt} voice="female" className="h-7 w-7 shrink-0" />
                </div>
                <span className="text-sm text-muted-foreground shrink-0">
                  {word.fr}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

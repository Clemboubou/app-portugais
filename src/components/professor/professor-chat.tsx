"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, BookOpen, RotateCcw } from "lucide-react";
import type { ProfessorData } from "./types";
import { ConjugaisonCard } from "./themes/conjugaison-card";
import { GrammaireCard } from "./themes/grammaire-card";
import { VocabulaireCard } from "./themes/vocabulaire-card";
import { TraductionCard } from "./themes/traduction-card";
import { PrononciationCard } from "./themes/prononciation-card";
import { ExpressionCard } from "./themes/expression-card";
import { CorrectionCard } from "./themes/correction-card";
import { CultureCard } from "./themes/culture-card";

interface Message {
  role: "user" | "assistant";
  content: string;
  parsed?: ProfessorData;
}

const SUGGESTIONS = [
  "Conjugue le verbe vir au présent",
  "Quelle est la différence entre ser et estar ?",
  "Comment dire 'je voudrais' poliment ?",
  "C'est quoi la mésoclise ?",
  "Comment prononcer le -lh- en portugais ?",
  "Traduis 'je suis désolé' en portugais européen",
  "Corrige : 'Eu gosto de tomar banho no banheiro'",
  "Explique-moi le Fado",
];

export function ProfessorChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(question: string) {
    if (!question.trim() || loading) return;

    const userMsg: Message = { role: "user", content: question.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/professor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim(), history }),
      });

      if (!res.ok) throw new Error("Erreur réseau");

      const data = (await res.json()) as ProfessorData;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "theme" in data ? data.theme : "",
          parsed: data,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Désolé, une erreur s'est produite. Vérifie qu'Ollama est lancé.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Suggestions initiales */}
      {messages.length === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Exemples de questions :</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => void sendMessage(s)}
                className="rounded-xl border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-150"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-6">
        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2.5 text-sm">
                {msg.content}
              </div>
            </div>
          ) : (
            <ProfessorAnswer key={i} parsed={msg.parsed} fallback={msg.content} />
          )
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Le professeur réfléchit…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background pt-2 pb-1">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pose ta question… (conjugaison, grammaire, vocabulaire, traduction, expression…)"
            className="min-h-[56px] max-h-[120px] resize-none rounded-xl text-sm"
            rows={1}
          />
          <div className="flex flex-col gap-1">
            <Button
              onClick={() => void sendMessage(input)}
              disabled={!input.trim() || loading}
              size="icon"
              className="rounded-xl h-10 w-10 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMessages([])}
                className="rounded-xl h-10 w-10 shrink-0 text-muted-foreground"
                title="Réinitialiser"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">
          Entrée pour envoyer · Maj+Entrée pour nouvelle ligne
        </p>
      </div>
    </div>
  );
}

function ProfessorAnswer({
  parsed,
  fallback,
}: {
  parsed?: ProfessorData;
  fallback: string;
}) {
  if (!parsed) {
    return (
      <div className="rounded-2xl rounded-bl-md border bg-card p-4 text-sm max-w-[90%]">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
            Professeur
          </span>
        </div>
        {fallback}
      </div>
    );
  }

  return (
    <div className="max-w-[92%] space-y-1">
      {/* Badge thème */}
      <div className="flex items-center gap-2 px-1">
        <BookOpen className="h-3 w-3 text-indigo-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
          {parsed.theme}
        </span>
      </div>

      {/* Composant thématique */}
      {parsed.theme === "conjugaison" && <ConjugaisonCard data={parsed} />}
      {parsed.theme === "grammaire" && <GrammaireCard data={parsed} />}
      {parsed.theme === "vocabulaire" && <VocabulaireCard data={parsed} />}
      {parsed.theme === "traduction" && <TraductionCard data={parsed} />}
      {parsed.theme === "prononciation" && <PrononciationCard data={parsed} />}
      {parsed.theme === "expression" && <ExpressionCard data={parsed} />}
      {parsed.theme === "correction" && <CorrectionCard data={parsed} />}
      {parsed.theme === "culture" && <CultureCard data={parsed} />}
      {/* Fallback si thème inconnu */}
      {!["conjugaison","grammaire","vocabulaire","traduction","prononciation","expression","correction","culture"].includes(parsed.theme) && (
        <div className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground whitespace-pre-wrap">
          {JSON.stringify(parsed, null, 2)}
        </div>
      )}
    </div>
  );
}

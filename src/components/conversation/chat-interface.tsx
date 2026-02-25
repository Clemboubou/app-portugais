"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AudioRecorder } from "@/components/audio/audio-recorder";
import { useTranscription } from "@/hooks/use-transcription";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  qualityBadge?: "A" | "B" | "C" | null;
}

interface ChatInterfaceProps {
  scenario: string;
  level: string;
  onEnd: (transcript: Message[]) => void;
}

const BADGE_COLORS: Record<"A" | "B" | "C", string> = {
  A: "bg-green-100 text-green-800",
  B: "bg-yellow-100 text-yellow-800",
  C: "bg-red-100 text-red-800",
};

export function ChatInterface({ scenario, level, onEnd }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { transcribe } = useTranscription();

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `Olá! Bem-vindo ao nosso cenário: "${scenario}". Vamos começar!`,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [scenario]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/converse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory, scenario, level }),
      });

      const data = (await res.json()) as {
        message?: { role: string; content: string };
        error?: string;
      };

      if (data.message) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message!.content,
            timestamp: new Date().toISOString(),
          },
        ]);
      }

      // Badge qualité silencieux
      evaluateQuality(text.trim(), userMsg.timestamp);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Desculpe, houve um erro. Por favor, tente novamente.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const evaluateQuality = async (text: string, timestamp: string) => {
    try {
      const res = await fetch("/api/ai/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, context: `Scénario: ${scenario}, Niveau: ${level}` }),
      });
      const data = (await res.json()) as { correction?: string };
      if (data.correction) {
        const lower = data.correction.toLowerCase();
        const badge: "A" | "B" | "C" =
          lower.includes("parfait") || lower.includes("excellent") || lower.includes("très bien")
            ? "A"
            : lower.includes("bonne") || lower.includes("bien")
            ? "B"
            : "C";

        setMessages((prev) =>
          prev.map((m) =>
            m.timestamp === timestamp && m.role === "user"
              ? { ...m, qualityBadge: badge }
              : m
          )
        );
      }
    } catch {
      // Silencieux
    }
  };

  const handleRecordingComplete = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const result = await transcribe(blob);
      if (result?.text) {
        setInput(result.text);
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div>
          <p className="font-semibold text-sm">{scenario}</p>
          <Badge variant="outline" className="text-xs mt-0.5">
            Niveau {level}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEnd(messages)}
          disabled={messages.length < 3}
        >
          Terminer
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm relative ${
                  msg.role === "user"
                    ? "bg-[#1A56DB] text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-900 rounded-bl-sm"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.role === "user" && msg.qualityBadge && (
                  <span
                    className={`absolute -bottom-5 right-0 text-xs px-1.5 py-0.5 rounded font-medium ${
                      BADGE_COLORS[msg.qualityBadge]
                    }`}
                  >
                    {msg.qualityBadge}
                  </span>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva a sua mensagem... (Entrée pour envoyer)"
            className="resize-none flex-1 min-h-[60px] max-h-[120px]"
            disabled={isLoading || isTranscribing}
          />
          <div className="flex flex-col gap-2">
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              maxDuration={30}
            />
            <Button
              size="sm"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading || isTranscribing}
              className="bg-[#1A56DB] hover:bg-[#1A56DB]/90"
            >
              Envoyer
            </Button>
          </div>
        </div>
        {isTranscribing && (
          <p className="text-xs text-muted-foreground mt-1 animate-pulse">
            Transcription en cours...
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShadowingExercise } from "@/components/speaking/shadowing-exercise";
import { MinimalPairs } from "@/components/speaking/minimal-pairs";
import { ReadAloud } from "@/components/speaking/read-aloud";
import { TongueTwisters } from "@/components/speaking/tongue-twisters";
import { ScenarioSelector } from "@/components/conversation/scenario-selector";
import { ChatInterface } from "@/components/conversation/chat-interface";
import { ConversationReport } from "@/components/conversation/conversation-report";

type ConversationState = "select" | "chat" | "report";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function SpeakingPage() {
  const [conversationState, setConversationState] =
    useState<ConversationState>("select");
  const [scenario, setScenario] = useState("");
  const [level, setLevel] = useState("A1");
  const [transcript, setTranscript] = useState<Message[]>([]);

  const handleStart = (selectedScenario: string, selectedLevel: string) => {
    setScenario(selectedScenario);
    setLevel(selectedLevel);
    setConversationState("chat");
  };

  const handleEnd = (messages: Message[]) => {
    setTranscript(messages);
    setConversationState("report");
  };

  const handleRestart = () => {
    setConversationState("select");
    setScenario("");
    setTranscript([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Production orale</h1>
        <p className="text-muted-foreground">
          Exercices de prononciation et pratique orale du portugais européen.
        </p>
      </div>

      <Tabs defaultValue="shadowing">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="shadowing">Répétition</TabsTrigger>
          <TabsTrigger value="minimal-pairs">Paires minimales</TabsTrigger>
          <TabsTrigger value="read-aloud">Lecture</TabsTrigger>
          <TabsTrigger value="tongue-twisters">Virelangues</TabsTrigger>
          <TabsTrigger value="conversation">Conversation</TabsTrigger>
        </TabsList>

        <TabsContent value="shadowing" className="mt-6">
          <ShadowingExercise />
        </TabsContent>

        <TabsContent value="minimal-pairs" className="mt-6">
          <MinimalPairs />
        </TabsContent>

        <TabsContent value="read-aloud" className="mt-6">
          <ReadAloud />
        </TabsContent>

        <TabsContent value="tongue-twisters" className="mt-6">
          <TongueTwisters />
        </TabsContent>

        <TabsContent value="conversation" className="mt-6">
          {conversationState === "select" && (
            <ScenarioSelector onStart={handleStart} />
          )}
          {conversationState === "chat" && (
            <ChatInterface
              scenario={scenario}
              level={level}
              onEnd={handleEnd}
            />
          )}
          {conversationState === "report" && (
            <ConversationReport
              transcript={transcript}
              scenario={scenario}
              level={level}
              onRestart={handleRestart}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

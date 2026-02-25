import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

interface TranscriptEntry {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface SaveConversationData {
  scenario: string;
  level: string;
  transcript: TranscriptEntry[];
  score?: number;
  feedback?: string;
}

export function saveConversation(data: SaveConversationData) {
  const now = new Date().toISOString();
  return db
    .insert(conversations)
    .values({
      scenario: data.scenario,
      level: data.level,
      startedAt: now,
      endedAt: now,
      transcriptJson: JSON.stringify(data.transcript),
      score: data.score ?? null,
      feedbackJson: data.feedback
        ? JSON.stringify({ feedback: data.feedback })
        : null,
    })
    .returning({ id: conversations.id })
    .get();
}

export function getConversations(limit = 10) {
  return db
    .select()
    .from(conversations)
    .orderBy(desc(conversations.startedAt))
    .limit(limit)
    .all();
}

export function getConversationById(id: number) {
  return (
    db.select().from(conversations).where(eq(conversations.id, id)).get() ??
    null
  );
}

export function endConversation(
  id: number,
  transcriptJson: string,
  score: number | null,
  feedbackJson: string | null
) {
  return db
    .update(conversations)
    .set({
      endedAt: new Date().toISOString(),
      transcriptJson,
      score,
      feedbackJson,
    })
    .where(eq(conversations.id, id))
    .run();
}

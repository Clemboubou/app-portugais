import { getDueCardsCount } from "@/lib/db/queries/srs";
import { ReviewSession } from "@/components/review/review-session";
import { Badge } from "@/components/ui/badge";

export default function ReviewPage() {
  const dueCount = getDueCardsCount();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Révisions</h1>
        {dueCount > 0 && (
          <Badge>{dueCount} carte{dueCount > 1 ? "s" : ""} à réviser</Badge>
        )}
      </div>
      <p className="text-muted-foreground">
        Répétition espacée (FSRS) — révisez vos cartes de vocabulaire.
      </p>

      <ReviewSession />
    </div>
  );
}

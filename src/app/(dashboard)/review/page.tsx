import { getDueCardsCount } from "@/lib/db/queries/srs";
import { ReviewSession } from "@/components/review/review-session";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";

export default function ReviewPage() {
  const dueCount = getDueCardsCount();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
        <div className="flex items-center gap-3 mb-1">
          <RotateCcw className="h-6 w-6 opacity-90" />
          <h1 className="text-2xl font-bold">Révisions</h1>
          {dueCount > 0 && (
            <Badge className="rounded-full px-3 py-1 text-sm font-semibold bg-white text-blue-600 hover:bg-white/90">
              {dueCount} carte{dueCount > 1 ? "s" : ""} à réviser
            </Badge>
          )}
        </div>
        <p className="text-blue-100 text-sm">
          Répétition espacée (FSRS) — révisez vos cartes de vocabulaire.
        </p>
      </div>

      <ReviewSession />
    </div>
  );
}

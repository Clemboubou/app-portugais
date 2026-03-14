import { AnkiTabs } from "@/components/anki/anki-tabs";
import { getDueCardsCount } from "@/lib/db/queries/srs";
import { getVocabularyCount } from "@/lib/db/queries/vocabulary";
import { Badge } from "@/components/ui/badge";
import { LayersIcon } from "lucide-react";

export default function AnkiPage() {
  const dueCount = getDueCardsCount();
  const totalVocab = getVocabularyCount();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <div className="flex items-center gap-3 mb-1">
          <LayersIcon className="h-6 w-6 opacity-90" />
          <h1 className="text-2xl font-bold">Mode Anki</h1>
          {dueCount > 0 && (
            <Badge className="rounded-full px-3 py-1 text-sm font-semibold bg-white text-indigo-600 hover:bg-white/90">
              {dueCount} à réviser
            </Badge>
          )}
        </div>
        <p className="text-indigo-100 text-sm">
          Apprenez le vocabulaire avec des cartes flip — algorithme FSRS (répétition espacée).
          {" "}{totalVocab} mots disponibles.
        </p>
      </div>

      <AnkiTabs />
    </div>
  );
}

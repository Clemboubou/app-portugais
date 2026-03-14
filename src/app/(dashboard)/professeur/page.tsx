import { ProfessorChat } from "@/components/professor/professor-chat";
import { GraduationCap } from "lucide-react";

export default function ProfesseurPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
        <div className="flex items-center gap-3 mb-1">
          <GraduationCap className="h-6 w-6 opacity-90" />
          <h1 className="text-2xl font-bold">Professeur IA</h1>
        </div>
        <p className="text-indigo-100 text-sm">
          Pose n&apos;importe quelle question sur le portugais européen — conjugaisons, grammaire,
          vocabulaire. Chaque réponse inclut des exemples avec audio.
        </p>
      </div>

      <ProfessorChat />
    </div>
  );
}

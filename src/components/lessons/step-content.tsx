"use client";

import { AudioPlayer } from "@/components/audio/audio-player";

interface StepContentProps {
  title: string;
  content: string;
}

/**
 * Contenu d'une étape de leçon avec support audio automatique.
 * Détecte les balises data-audio="texte" dans le HTML pour insérer
 * des boutons de lecture audio TTS.
 */
export function StepContent({ title, content }: StepContentProps) {
  // Extraire les textes portugais du contenu pour l'audio
  // On cherche les <strong> ou <em> qui contiennent du portugais
  const portugueseTexts = extractPortugueseTexts(content);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div
        className="prose prose-sm max-w-none dark:prose-invert
          prose-headings:text-foreground prose-headings:font-semibold
          prose-p:text-foreground prose-p:leading-relaxed
          prose-strong:text-foreground
          prose-em:text-muted-foreground
          prose-table:text-sm
          prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-3 prose-th:py-2
          prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2
          prose-ul:space-y-1 prose-li:text-foreground"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {/* Boutons audio pour les textes portugais détectés */}
      {portugueseTexts.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {portugueseTexts.map((text, i) => (
            <div key={i} className="flex items-center gap-1 text-sm">
              <AudioPlayer text={text} />
              <span className="text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Extrait les textes portugais du HTML (contenus dans des balises avec data-audio).
 * Fallback: ne retourne rien si pas de marqueurs spéciaux.
 */
function extractPortugueseTexts(html: string): string[] {
  const regex = /data-audio="([^"]+)"/g;
  const texts: string[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    texts.push(match[1]);
  }
  return texts;
}

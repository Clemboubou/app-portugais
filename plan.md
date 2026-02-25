# Phase 4 — Conversations Ollama et Évaluations

## Contexte

Phases 1-3 terminées : navigation, DB 13 tables, curriculum A1, moteur de leçons, 8+3 types d'exercices, flashcards FSRS, edge-tts, Ollama multi-modèles, enregistrement vocal, Whisper navigateur, prononciation, page speaking (4 onglets), page listening.

Phase 4 = conversations simulées via Ollama, interface chat, rapport de conversation, génération de contenu IA, test de positionnement initial.

---

## Étape 1 — Requêtes DB conversations + API routes

Créer la couche données pour persister les conversations.

**Fichiers à créer :**
- `src/lib/db/queries/conversations.ts` — CRUD conversations
  - `createConversation(scenario, level)` → insert + return id
  - `updateConversation(id, { transcriptJson, endedAt, score, feedbackJson })`
  - `getConversationById(id)`
  - `getRecentConversations(limit)` → dernières sessions
  - `getConversationsByLevel(level)`
- `src/app/api/conversations/route.ts` — GET (liste) + POST (créer)
- `src/app/api/conversations/[id]/route.ts` — GET (détail) + PATCH (update)
- `src/app/api/conversations/[id]/message/route.ts` — POST envoyer message
  - Charge le transcript existant depuis DB
  - Ajoute le message user
  - Appelle Ollama (task: "conversation") avec le prompt "ami natif" + scénario + niveau
  - Ajoute la réponse IA
  - Sauvegarde le transcript mis à jour en DB
  - Retourne la réponse IA
- `src/app/api/conversations/[id]/report/route.ts` — POST générer rapport
  - Appelle Ollama (task: "grammar") avec le transcript complet
  - Demande : erreurs fréquentes, vocabulaire manquant, score, feedback
  - Sauvegarde feedbackJson + score en DB

**Réutilise :** `ollamaChat`, `PROMPT_NATIVE_FRIEND`, `PROMPT_PROFESSOR`, `PROMPT_EVALUATOR` existants.

---

## Étape 2 — Données de scénarios

Créer les scénarios de conversation par niveau.

**Fichier à créer :**
- `content/conversations/scenarios.json`
  - Scénarios par niveau CECRL :
    - A1 : au café, se présenter, demander son chemin, au supermarché
    - A2 : à la gare, chez le médecin, louer un appartement, au restaurant
    - B1 : entretien d'embauche, organiser un voyage, discuter d'actualité
    - B2 : débat d'opinion, négociation, culture portugaise
  - Chaque scénario : `{ id, level, title, description, firstMessage, context }`
  - `firstMessage` : premier message de l'IA pour lancer la conversation
  - `context` : instructions spécifiques pour le system prompt

---

## Étape 3 — Interface de conversation (chat)

Créer l'interface chat avec bulles de messages.

**Fichiers à créer :**
- `src/components/conversation/chat-message.tsx` — bulle de message
  - Alignement gauche (IA) / droite (apprenant)
  - Icône avatar (Bot / User)
  - Horodatage
  - Badge de qualité optionnel (A/B/C) sur les messages de l'apprenant
  - Bouton audio TTS sur les messages IA (AudioPlayer)
- `src/components/conversation/chat-input.tsx` — zone de saisie
  - Input texte + bouton envoyer
  - Bouton micro toggle pour input vocal (AudioRecorder → Whisper → texte)
  - Indicateur "IA en train d'écrire…"
  - Désactivé pendant l'attente de réponse
- `src/components/conversation/scenario-picker.tsx` — sélecteur de scénario
  - Grille de cartes par niveau (tabs A1/A2/B1/B2)
  - Chaque carte : titre, description, badge niveau
  - Clic → lance une nouvelle conversation
- `src/components/conversation/conversation-view.tsx` — orchestrateur
  - Si pas de conversation active → affiche ScenarioPicker
  - Si conversation active → affiche messages + ChatInput
  - Bouton "Terminer la conversation" → génère rapport
  - Scroll automatique vers le dernier message

**Réutilise :** `AudioPlayer`, `AudioRecorder`, `useTranscription`, `Button`, `Card`, `Badge`, `Tabs`, `Input`, `ScrollArea` de shadcn/ui. `Mic`, `Send`, `Bot`, `User`, `MessageSquare` de lucide-react.

---

## Étape 4 — Rapport de conversation

Afficher le bilan après une conversation.

**Fichier à créer :**
- `src/components/conversation/conversation-report.tsx`
  - Score global (cercle coloré, comme PronunciationFeedback)
  - Transcription complète annotée (messages avec corrections)
  - Liste des erreurs fréquentes identifiées
  - Vocabulaire manquant suggéré (mots que l'apprenant aurait pu utiliser)
  - Conseil pour s'améliorer
  - Boutons : "Nouvelle conversation" / "Retour"

---

## Étape 5 — Page /speaking mise à jour (onglet Conversations)

Ajouter un 5ème onglet "Conversations" à la page speaking existante.

**Fichier à mettre à jour :**
- `src/app/(dashboard)/speaking/page.tsx`
  - Ajouter un 5ème TabsTrigger "Conversations"
  - TabsContent → `ConversationView`
  - Grid passe de `grid-cols-4` à `grid-cols-5`

---

## Étape 6 — Test de positionnement initial

Algorithme adaptatif pour positionner l'apprenant.

**Fichiers à créer :**
- `content/placement/questions.json` — banque de questions par niveau
  - 10 questions par niveau (A1, A2, B1, B2) = 40 questions
  - Types : mcq (vocabulaire), fill_blank (grammaire), translation, listening (TTS)
  - Chaque question : `{ id, level, type, prompt, correctAnswer, distractors?, audioText? }`
- `src/components/placement/placement-test.tsx` — composant test adaptatif
  - Démarre à A1, 10 questions
  - Si score > 80% → monte au niveau suivant
  - Si score < 50% → arrête, niveau = niveau précédent
  - Sinon → le niveau actuel est le résultat
  - Utilise les composants d'exercices existants (MCQ, FillInTheBlank)
  - Barre de progression
  - À la fin : appel Ollama mode évaluateur pour confirmer le niveau
- `src/components/placement/placement-result.tsx` — affichage résultat
  - Niveau identifié (badge grand)
  - Feedback de l'évaluateur IA
  - Bouton "Commencer l'apprentissage"
- `src/app/api/ai/evaluate/route.ts` — POST évaluation CECRL
  - Envoie les réponses + scores à Ollama mode évaluateur
  - Retourne : `{ level, score, feedback, strengths, weaknesses }`
- `src/app/(dashboard)/placement/page.tsx` — page dédiée
  - Affiche PlacementTest ou PlacementResult selon l'état

---

## Étape 7 — API route génération de contenu

Permettre à Ollama de générer des questions de compréhension et des explications.

**Fichier à créer :**
- `src/app/api/ai/generate/route.ts` — POST génération de contenu
  - Types supportés : `"comprehension_questions"` | `"grammar_explanation"` | `"evaluation"`
  - Pour `comprehension_questions` : reçoit un texte, retourne des questions QCM
  - Pour `grammar_explanation` : reçoit un point de grammaire, retourne une explication détaillée
  - Utilise le modèle `general` (mistral)

---

## Vérification

1. `npm run build` — compilation propre sans erreurs
2. Page `/speaking` onglet "Conversations" — sélectionner un scénario, converser, terminer, voir rapport
3. Input vocal dans la conversation — micro → transcription → envoi
4. TTS sur les messages IA — bouton lecture sur chaque bulle
5. Page `/placement` — test adaptatif, évaluation Ollama, résultat
6. API `/api/ai/generate` — tester génération de questions
7. Persistance DB — vérifier que les conversations sont sauvegardées

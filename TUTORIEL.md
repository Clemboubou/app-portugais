# Tutoriel — App Portugais Européen

## Prérequis

### 1. Node.js (obligatoire)
- Télécharger sur [nodejs.org](https://nodejs.org/) (version LTS recommandée, 20+)
- Vérifier l'installation : `node --version`

### 2. Ollama (recommandé, pour les fonctionnalités IA)
- Télécharger sur [ollama.com/download](https://ollama.com/download)
- Installer et vérifier : `ollama --version`
- **Sans Ollama** : l'app fonctionne mais sans correction IA, conversations, évaluations

---

## Lancement rapide (recommandé)

**Double-cliquez sur `lancer.bat`** — il fait tout automatiquement :
1. Vérifie Node.js et Ollama
2. Démarre Ollama en arrière-plan
3. Télécharge les modèles IA si nécessaire (~8 Go au total)
4. Installe les dépendances npm
5. Crée et remplit la base de données
6. Lance le serveur et ouvre le navigateur

---

## Lancement manuel (étape par étape)

### Étape 1 — Installer les dépendances

```bash
cd C:\Users\Cleme\Desktop\portugal\app-portugais
npm install
```

### Étape 2 — Démarrer Ollama et télécharger les modèles

Ouvrir un terminal séparé :

```bash
ollama serve
```

Dans un autre terminal, télécharger les 3 modèles :

```bash
ollama pull llama3       # ~4.7 Go - grammaire, correction
ollama pull mistral      # ~4.1 Go - évaluations, contenu
ollama pull command-r    # ~4.0 Go - conversations
```

> Le premier téléchargement prend du temps. Une fois fait, les modèles sont en cache.

### Étape 3 — Initialiser la base de données

```bash
npx drizzle-kit push     # Crée le schéma SQLite
npx tsx src/scripts/seed.ts  # Remplit avec le curriculum
```

### Étape 4 — Lancer l'application

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

---

## Structure de l'application

### Pages principales

| Page | Description |
|------|-------------|
| `/` | Tableau de bord — stats, cartes à réviser, niveau |
| `/lessons` | Leçons du curriculum (A1→B2, modules) |
| `/vocabulary` | Flashcards SRS (répétition espacée) |
| `/grammar` | Points de grammaire par niveau |
| `/listening` | Compréhension orale (dictées, QCM) |
| `/speaking` | Expression orale (shadowing, paires minimales, conversations) |
| `/reading` | Compréhension écrite (textes + questions) |
| `/writing` | Production écrite (rédaction + correction IA) |
| `/review` | Révisions SRS (cartes dues) |
| `/placement` | Test de positionnement CECRL |
| `/exam` | Examens de validation par niveau |
| `/dictionary` | Dictionnaire Wiktionary intégré |
| `/authentic` | Actualités en portugais (RSS) |
| `/stats` | Statistiques détaillées |

### Parcours recommandé

1. **Test de positionnement** (`/placement`) — déterminer votre niveau
2. **Leçons** (`/lessons`) — suivre le curriculum dans l'ordre
3. **Révisions** (`/review`) — réviser chaque jour les flashcards dues
4. **Compétences** — alterner écoute, oral, lecture, écriture
5. **Examens** (`/exam`) — valider chaque niveau (70% requis)
6. **Contenu authentique** (`/authentic`) — lire la presse portugaise

---

## Commandes utiles

```bash
npm run dev          # Serveur de développement (port 3000)
npm run build        # Build de production
npm run start        # Lancer le build de production
npm run seed         # Re-peupler la base de données
npm run db:push      # Appliquer le schéma à la base
npm run db:studio    # Interface visuelle de la base (Drizzle Studio)
```

---

## Fonctionnalités IA (Ollama)

| Fonctionnalité | Modèle | Où |
|----------------|--------|----|
| Correction de texte | llama3 | Écriture, exercices |
| Conversations simulées | command-r | Speaking > Conversation |
| Évaluation CECRL | mistral | Test de placement, examens |
| Explication grammaire | llama3 | Grammaire > "Approfondir" |
| Résumé d'articles | mistral | Contenu authentique |
| Feedback prononciation | llama3 | Speaking > exercices |

> Si Ollama n'est pas démarré, les boutons IA afficheront une erreur mais l'app reste fonctionnelle.

---

## Résolution de problèmes

### "ECONNREFUSED localhost:11434"
→ Ollama n'est pas démarré. Lancer `ollama serve` dans un terminal.

### "model not found"
→ Le modèle n'est pas téléchargé. Lancer `ollama pull <nom_du_modele>`.

### La base de données est vide
→ Lancer `npx tsx src/scripts/seed.ts` pour la remplir.

### Le TTS ne fonctionne pas
→ Le TTS utilise edge-tts (voix Microsoft gratuites). Si le module npm n'est pas installé, le fallback WebSocket s'active automatiquement. Aucune action requise.

### L'app est lente au premier chargement
→ Normal : Whisper et les modèles Ollama se chargent la première fois. Les chargements suivants sont plus rapides.

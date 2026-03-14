// ============================================================
// PLAN D'ÉTUDE 5 MOIS — A1 → B2
// Portugais Européen (Lisbonne) — 1h cours actif/jour + immersion
// ============================================================

export interface PlanActivity {
  duration: number;
  label: string;
  description: string;
  url: string;
}

export interface PlanDay {
  day: string;
  activities: PlanActivity[];
}

export interface WeekTheme {
  week: number;
  theme: string;
  content: string[];
  checkpoint?: string;
}

export interface PhaseInfo {
  number: number;
  title: string;
  level: string;
  colorFrom: string;
  colorTo: string;
  badgeClass: string;
  weekRange: [number, number];
  totalWeeks: number;
  description: string;
  goals: string[];
  resources: { label: string; value: string; url: string }[];
  template: PlanDay[];
  weeks: WeekTheme[];
  milestone: string;
  milestoneDetail: string;
}

// ============================================================
// STATISTIQUES GLOBALES DU PLAN
// ============================================================
export const PLAN_STATS = {
  totalWeeks: 22,
  totalDays: 154,
  totalHours: 154,
  minutesPerDay: 60,
  levels: ["A1", "A2", "B1", "B2"],
  content: {
    lessons: 110,
    grammarPoints: 59,
    grammarExercises: 80,
    vocabularyItems: 1157,
    listeningExercises: 91,
    readingTexts: 120,
    writingPrompts: 26,
    minimalPairs: 10,
    tongueTwisters: 8,
    cultureSections: 32,
    idioms: 16,
    commonMistakes: 55,
    exams: 4,
    miniStories: 14,
    mnemonics: 155,
  },
  srsTarget: 800,
  priorities: [
    { label: "Vocabulaire", url: "/vocabulary" },
    { label: "Anki (SRS)", url: "/anki" },
    { label: "Mini-stories", url: "/mini-stories" },
    { label: "Grammaire", url: "/grammar" },
    { label: "Écoute", url: "/listening" },
    { label: "Lecture", url: "/reading" },
    { label: "Écriture", url: "/writing" },
    { label: "Prononciation", url: "/pronunciation" },
  ],
  extras: [
    { label: "Médias PT", url: "/media" },
    { label: "Presse PT", url: "/authentic" },
    { label: "Professeur IA", url: "/professeur" },
    { label: "Culture", url: "/culture" },
    { label: "Expressions", url: "/idioms" },
    { label: "Erreurs courantes", url: "/common-mistakes" },
    { label: "Dictionnaire", url: "/dictionary" },
  ],
};

// ============================================================
// LES 10 TECHNIQUES D'APPRENTISSAGE intégrées dans le plan
// ============================================================
export interface Technique {
  number: number;
  label: string;
  description: string;
  url: string;
  phase: string; // à partir de quelle phase
}

export const TECHNIQUES: Technique[] = [
  {
    number: 1,
    label: "Répétition espacée (SRS)",
    description: "Anki FSRS : révisions au moment exact où l'oubli commence — 90% de rétention garantie. 10 min/jour, jamais sauté.",
    url: "/anki",
    phase: "A1",
  },
  {
    number: 2,
    label: "Comprehensible Input",
    description: "YouTube PT, séries avec sous-titres portugais, presse PT — viser 70% de compréhension. L'input massif construit la fluidité.",
    url: "/media",
    phase: "A2",
  },
  {
    number: 3,
    label: "Vocabulaire fréquent",
    description: "Top 1000+ mots du portugais européen en contexte. 80% du langage courant couvert avec 500 mots de base.",
    url: "/vocabulary",
    phase: "A1",
  },
  {
    number: 4,
    label: "Méthode structurée",
    description: "Curriculum A1→B2 progressif : leçons, exercices, grammaire ciblée. La structure évite les lacunes et les frustrations.",
    url: "/lessons",
    phase: "A1",
  },
  {
    number: 5,
    label: "Flashcards contextuelles",
    description: "Anki avec émoji visuel intégré — les mots en phrases complètes, jamais isolés. Contexte = mémorisation durable.",
    url: "/anki",
    phase: "A1",
  },
  {
    number: 6,
    label: "Mnémotechniques",
    description: "155 associations visuelles et sonores (cravate → gravata, bombeiro → BOMBa de feu) pour ancrer le vocabulaire.",
    url: "/anki",
    phase: "A1",
  },
  {
    number: 7,
    label: "Mini-stories",
    description: "14 histoires répétitives A1→B1 avec TTS accent de Lisbonne, Q&A IA et ajout SRS en un clic. La méthode AJ Hoge.",
    url: "/mini-stories",
    phase: "A1",
  },
  {
    number: 8,
    label: "Lecture extensive",
    description: "Textes, articles de presse PT, extraits littéraires — lire sans tout traduire pour développer la fluidité de lecture.",
    url: "/reading",
    phase: "A2",
  },
  {
    number: 9,
    label: "Shadowing",
    description: "Répéter les audios mot pour mot en imitant l'intonation et le rythme de Lisbonne. 5-10 min/jour dès A1.",
    url: "/pronunciation",
    phase: "A1",
  },
  {
    number: 10,
    label: "Conversations IA",
    description: "Scénarios simulés avec feedback IA en temps réel — parler sans peur des erreurs, progresser par la pratique.",
    url: "/speaking",
    phase: "B1",
  },
];

// ============================================================
// PHASE 1 — A1 : LES FONDATIONS (Semaines 1-4 — Mois 1)
// ============================================================
const PHASE_1: PhaseInfo = {
  number: 1,
  title: "Les Fondations",
  level: "A1",
  colorFrom: "from-emerald-500",
  colorTo: "to-emerald-600",
  badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  weekRange: [1, 4],
  totalWeeks: 4,
  description:
    "1h de cours actif par jour : Anki, grammaire de base, écoute facile. En parallèle, immersion passive maximale — téléphone en portugais, musique, TikTok/YouTube PT. Output quotidien : se présenter à voix haute, écrire 5 phrases simples. Objectif : survivre, ~500 mots.",
  goals: [
    "Maîtriser l'alphabet et les sons du portugais européen",
    "Apprendre ~500 mots essentiels (salutations, famille, quotidien)",
    "Conjuguer les verbes réguliers au présent + SER, ESTAR, TER, IR",
    "Comprendre et produire des phrases simples",
    "Passer le téléphone et les apps en portugais dès le jour 1",
    "Shadowing : répéter les dialogues à voix haute pour ancrer la prononciation",
  ],
  resources: [
    { label: "Leçons A1", value: "20 leçons", url: "/lessons" },
    { label: "Grammaire A1", value: "15 points", url: "/grammar" },
    { label: "Vocabulaire A1", value: "128+ mots", url: "/vocabulary" },
    { label: "Écoute A1", value: "10 exercices", url: "/listening" },
    { label: "Lecture A1", value: "25 textes", url: "/reading" },
    { label: "Phonologie", value: "9 points + 10 paires min.", url: "/pronunciation" },
  ],
  template: [
    {
      day: "Lundi",
      activities: [
        { duration: 20, label: "Anki — Phrases simples", description: "Réviser les cartes dues + ajouter 10 mots nouveaux en phrases complètes (jamais de mots isolés)", url: "/review" },
        { duration: 20, label: "Leçon A1 + Grammaire", description: "Suivre la leçon du jour, noter le point de grammaire clé", url: "/lessons" },
        { duration: 15, label: "Écoute facile", description: "Exercice de compréhension orale A1 — dialogues très simples, écouter 2-3 fois", url: "/listening" },
        { duration: 5, label: "Output — Parler seul", description: "Se présenter à voix haute, dire sa journée en portugais même mal — 5 phrases minimum", url: "/pronunciation" },
      ],
    },
    {
      day: "Mardi",
      activities: [
        { duration: 20, label: "Anki — Révision SRS", description: "Réviser toutes les cartes dues du jour sans sauter", url: "/review" },
        { duration: 20, label: "Grammaire — Exercices", description: "Pratiquer le point de grammaire de lundi (présent, SER/ESTAR, articles)", url: "/grammar" },
        { duration: 15, label: "Prononciation + Shadowing", description: "Écouter un dialogue court, répéter EXACTEMENT ce qui est dit (intonation, rythme, liaison)", url: "/pronunciation" },
        { duration: 5, label: "Output — Écriture", description: "Écrire 5 phrases simples sur sa journée ou ses goûts", url: "/writing" },
      ],
    },
    {
      day: "Mercredi",
      activities: [
        { duration: 20, label: "Anki — Révision SRS", description: "Réviser les cartes dues + ajouter les mots inconnus de la semaine", url: "/review" },
        { duration: 20, label: "Leçon A1", description: "Continuer le curriculum — leçon suivante", url: "/lessons" },
        { duration: 15, label: "Écoute + Dictionnaire", description: "Exercice d'écoute, noter les mots inconnus, les chercher dans le dictionnaire et les ajouter au SRS", url: "/listening" },
        { duration: 5, label: "Output — Shadowing", description: "Répéter 3-4 phrases de l'exercice d'écoute à voix haute en imitant l'accent", url: "/pronunciation" },
      ],
    },
    {
      day: "Jeudi",
      activities: [
        { duration: 20, label: "Anki — Révision SRS", description: "Réviser les cartes dues", url: "/review" },
        { duration: 20, label: "Grammaire — Nouveau point", description: "Découvrir un nouveau point de grammaire A1, exemples en contexte", url: "/grammar" },
        { duration: 15, label: "Lecture courte", description: "Lire un texte court A1 — menu, carte postale, dialogue. Viser 70-80% de compréhension, ne pas tout traduire", url: "/reading" },
        { duration: 5, label: "Output — Parler seul", description: "Décrire une image ou raconter sa journée à voix haute en portugais", url: "/pronunciation" },
      ],
    },
    {
      day: "Vendredi",
      activities: [
        { duration: 20, label: "Anki — Révision SRS", description: "Réviser les cartes dues", url: "/review" },
        { duration: 20, label: "Écriture guidée", description: "Exercice d'écriture A1 avec correction IA — se présenter, décrire sa famille", url: "/writing" },
        { duration: 15, label: "Prononciation — Sons PT-PT", description: "Voyelles nasales, NH/LH, E muet [ɨ], R roulé — sons spécifiques au portugais européen", url: "/pronunciation" },
        { duration: 5, label: "Erreurs courantes", description: "Étudier 2-3 erreurs typiques des francophones débutants", url: "/common-mistakes" },
      ],
    },
    {
      day: "Samedi",
      activities: [
        { duration: 20, label: "Anki — Révision SRS", description: "Réviser les cartes dues", url: "/review" },
        { duration: 20, label: "Lecture — 2 textes", description: "Lire deux textes courts avec questions — viser la compréhension globale, pas la traduction mot à mot", url: "/reading" },
        { duration: 15, label: "Mini-story A1 — Lecture active", description: "Lire une mini-histoire A1, écouter le TTS accent Lisbonne, répondre aux Q&A IA, ajouter le vocabulaire clé au SRS en un clic", url: "/mini-stories" },
        { duration: 5, label: "Output — Journal rapide", description: "Écrire 5-6 phrases sur la semaine passée en portugais", url: "/writing" },
      ],
    },
    {
      day: "Dimanche",
      activities: [
        { duration: 20, label: "Anki — Révision SRS", description: "Réviser toutes les cartes dues accumulées — noter les émojis et mnémotechniques sur les nouvelles cartes", url: "/review" },
        { duration: 20, label: "Révision de la semaine", description: "Revoir les leçons et exercices ratés — consolider avant la semaine suivante", url: "/lessons" },
        { duration: 15, label: "Professeur IA", description: "Poser toutes les questions de la semaine — grammaire, prononciation, doutes", url: "/professeur" },
        { duration: 5, label: "Immersion — Musique PT", description: "Écouter 1-2 chansons portugaises en lisant les paroles — plaisir d'abord", url: "/media" },
      ],
    },
  ],
  weeks: [
    {
      week: 1,
      theme: "Premiers sons, premiers mots",
      content: [
        "Leçons A1-M1-L1 (Alphabet) et A1-M1-L2 (Prononciation)",
        "Grammaire : articles définis (o, a, os, as) et indéfinis (um, uma)",
        "Vocabulaire : 30 premiers mots — salutations, politesse, pronoms personnels",
        "Écoute : exercices 1-2 (dialogues très simples)",
        "Prononciation : voyelles orales et nasales, accent tonique",
        "✦ Anki avec émojis et mnémotechniques — ancrer les premiers mots par association visuelle",
        "✦ Immersion : passer le téléphone en portugais dès aujourd'hui",
        "✦ Output : se présenter à voix haute chaque matin (2 min)",
      ],
    },
    {
      week: 2,
      theme: "Bonjour, comment tu t'appelles ?",
      content: [
        "Leçons A1-M1-L3 (Salutations) et A1-M1-L4 (Se présenter)",
        "Grammaire : genre des noms, formation du pluriel",
        "Vocabulaire : 25 mots — nationalités, professions, nombres 1-20",
        "Écoute : exercices 3-4 (présentations) + shadowing sur les dialogues",
        "Prononciation : consonnes NH [ɲ], LH [ʎ]",
        "✦ Shadowing : répéter chaque dialogue 3 fois à voix haute",
        "✦ Output : se présenter + présenter un ami imaginaire chaque jour",
      ],
    },
    {
      week: 3,
      theme: "Ma famille, ma maison",
      content: [
        "Leçons A1-M1-L5, A1-M2-L1, A1-M2-L2",
        "Grammaire : SER vs ESTAR — distinction essentielle",
        "Vocabulaire : 25 mots — famille, pièces de la maison",
        "Écoute : exercices 5-6 (descriptions)",
        "Lecture : textes 7-10 (description d'une maison)",
        "✦ Output : décrire sa maison à voix haute tous les soirs",
        "✦ Immersion : écouter du fado ou musique PT pendant les trajets",
      ],
    },
    {
      week: 4,
      theme: "Consolidation A1 — Bilan et examen",
      content: [
        "Terminer les leçons A1 restantes",
        "Grammaire : révision complète des 15 points A1",
        "Vocabulaire : révision des 200+ mots — passer tous en SRS actif",
        "Écoute : tous les exercices A1 non faits",
        "✦ Output : monologue de 2 min sur sa journée type sans notes",
        "✦ Shadowing : reprendre les 3 meilleurs dialogues de la phase",
      ],
      checkpoint: "EXAMEN A1 — objectif ≥ 80%",
    },
  ],
  milestone: "Examen A1 validé",
  milestoneDetail: "200+ mots en SRS actif (avec émojis + mnémotechniques), 15 points de grammaire, 5 mini-stories A1 avec TTS. Capable de se présenter et gérer des situations simples. Prononciation de base ancrée par le shadowing quotidien.",
};

// ============================================================
// PHASE 2 — A2 : L'EXPANSION (Semaines 5-9 — Mois 2)
// ============================================================
const PHASE_2: PhaseInfo = {
  number: 2,
  title: "L'Expansion",
  level: "A2",
  colorFrom: "from-blue-500",
  colorTo: "to-blue-600",
  badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  weekRange: [5, 9],
  totalWeeks: 5,
  description:
    "1h cours actif : 15 min Anki, 15 min grammaire intermédiaire, 30 min contenu natif facile (YouTube PT, séries avec sous-titres PT). Immersion : séries Netflix en portugais, jeux vidéo PT. Shadowing 5-10 min/jour sur audio simple. ~1000-1500 mots.",
  goals: [
    "Enrichir le vocabulaire à 1000+ mots",
    "Maîtriser le passé composé (pretérito perfeito) et l'imparfait",
    "Comprendre des dialogues du quotidien à vitesse normale",
    "Suivre une série simple avec sous-titres en portugais",
    "Shadowing : imiter l'intonation de locuteurs natifs",
    "Écrire des emails, descriptions et courts récits",
  ],
  resources: [
    { label: "Leçons A2", value: "25 leçons", url: "/lessons" },
    { label: "Grammaire A2", value: "15 points", url: "/grammar" },
    { label: "Vocabulaire A2", value: "134+ mots + supplément", url: "/vocabulary" },
    { label: "Écoute A2", value: "10 exercices", url: "/listening" },
    { label: "Lecture A2", value: "45 textes", url: "/reading" },
    { label: "Écriture A2", value: "8 sujets", url: "/writing" },
  ],
  template: [
    {
      day: "Lundi",
      activities: [
        { duration: 15, label: "Anki — Phrases + Expressions", description: "Réviser les cartes dues + 10-15 nouveaux mots en contexte (phrases complètes, jamais de listes)", url: "/review" },
        { duration: 15, label: "Grammaire — Nouveau point", description: "Passé composé, pronoms, impératif — étudier avec exemples en contexte", url: "/grammar" },
        { duration: 20, label: "Contenu natif facile", description: "YouTube PT ou exercice d'écoute A2 avec sous-titres portugais — viser 70% de compréhension", url: "/listening" },
        { duration: 10, label: "Shadowing + Output", description: "Répéter 3-4 phrases du contenu à voix haute en imitant l'accent. Puis 2-3 phrases personnelles à l'oral", url: "/pronunciation" },
      ],
    },
    {
      day: "Mardi",
      activities: [
        { duration: 15, label: "Anki — Révision SRS", description: "Réviser les cartes dues sans sauter", url: "/review" },
        { duration: 15, label: "Grammaire — Exercices", description: "Exercices sur le point de lundi — fill_blank, transformation, production guidée", url: "/grammar" },
        { duration: 20, label: "Lecture A2", description: "Lire un texte ou article court — ne pas traduire chaque mot, comprendre le sens global", url: "/reading" },
        { duration: 10, label: "Dictionnaire + SRS", description: "Chercher les 3-5 mots bloquants du texte, les ajouter en phrases au SRS", url: "/dictionary" },
      ],
    },
    {
      day: "Mercredi",
      activities: [
        { duration: 15, label: "Anki — Révision SRS", description: "Réviser les cartes dues", url: "/review" },
        { duration: 15, label: "Mini-story A2 — Lecture active", description: "Lire une mini-histoire A2, écouter le TTS Lisbonne, Q&A IA pour comprendre en profondeur, ajouter les mots clés au SRS", url: "/mini-stories" },
        { duration: 20, label: "Écoute A2", description: "Exercice de compréhension orale — conversations, instructions, récits simples", url: "/listening" },
        { duration: 10, label: "Shadowing", description: "Reprendre l'audio de l'écoute, répéter phrase par phrase en imitant exactement le locuteur", url: "/pronunciation" },
      ],
    },
    {
      day: "Jeudi",
      activities: [
        { duration: 15, label: "Anki — Révision SRS", description: "Réviser les cartes dues", url: "/review" },
        { duration: 15, label: "Leçon A2", description: "Suivre le curriculum A2 — sujets plus riches (voyages, santé, travail)", url: "/lessons" },
        { duration: 20, label: "Contenu natif", description: "Séries PT avec sous-titres portugais (Netflix) ou YouTube — regarder avec plaisir, ne pas tout comprendre c'est normal", url: "/media" },
        { duration: 10, label: "Output — Parler seul", description: "Décrire ce qu'on vient de regarder ou lire à voix haute — même mal, même avec pauses", url: "/pronunciation" },
      ],
    },
    {
      day: "Vendredi",
      activities: [
        { duration: 15, label: "Anki — Révision SRS", description: "Réviser les cartes dues", url: "/review" },
        { duration: 15, label: "Écriture A2", description: "Rédiger un email ou un court récit avec correction IA — 60-80 mots minimum", url: "/writing" },
        { duration: 20, label: "Grammaire — Révision", description: "Consolider les points de la semaine — exercices variés", url: "/grammar" },
        { duration: 10, label: "Expressions idiomatiques", description: "Apprendre 2-3 expressions avec exemples audio et contexte d'usage", url: "/idioms" },
      ],
    },
    {
      day: "Samedi",
      activities: [
        { duration: 15, label: "Anki — Révision SRS", description: "Réviser les cartes dues", url: "/review" },
        { duration: 15, label: "Leçon A2 + Culture", description: "Leçon du curriculum + point culturel (gastronomie, traditions, histoire PT)", url: "/culture" },
        { duration: 20, label: "Lecture — Texte long", description: "Lire un email ou article court A2 en entier sans dictionnaire — noter seulement les mots clés bloquants", url: "/reading" },
        { duration: 10, label: "Erreurs courantes", description: "Faux-amis et erreurs typiques francophones — 2-3 points par semaine", url: "/common-mistakes" },
      ],
    },
    {
      day: "Dimanche",
      activities: [
        { duration: 15, label: "Anki — Révision SRS", description: "Toutes les cartes dues accumulées", url: "/review" },
        { duration: 20, label: "Révision de la semaine", description: "Revoir les leçons et exercices ratés — identifier les lacunes", url: "/lessons" },
        { duration: 15, label: "Professeur IA", description: "Questions de grammaire, vocabulaire, expressions — session libre", url: "/professeur" },
        { duration: 10, label: "Immersion — Libre", description: "Écouter un podcast PT, regarder une vidéo YouTube — plaisir et curiosité", url: "/media" },
      ],
    },
  ],
  weeks: [
    {
      week: 5,
      theme: "Raconter au passé",
      content: [
        "Leçons A2 module 1 — situations du passé",
        "Grammaire : pretérito perfeito des verbes réguliers + irréguliers clés (ir, ser, ter)",
        "Vocabulaire : 30 mots — voyages, transports (comboio, autocarro, bilhete)",
        "Écoute : exercices 1-3 A2 (récits au passé)",
        "✦ Mini-stories A2 — commencer les histoires au passé avec TTS + Q&A IA",
        "✦ Shadowing : dialogues avec récits au passé — répéter l'intonation",
        "✦ Output : raconter sa journée d'hier à voix haute chaque soir",
      ],
    },
    {
      week: 6,
      theme: "Voyager au Portugal",
      content: [
        "Leçons A2 module 2 — déplacements, directions",
        "Grammaire : impératif (diga, faça, venha), pronoms COD/COI",
        "Vocabulaire : 30 mots — hôtel, gare, aéroport, directions",
        "Écoute : exercices 4-5 (demander son chemin, à la gare)",
        "✦ Contenu natif : YouTube tourisme Portugal (sous-titres PT)",
        "✦ Output : écriture — raconter un voyage en 60 mots",
      ],
    },
    {
      week: 7,
      theme: "La santé, le travail, les loisirs",
      content: [
        "Leçons A2 modules 3-4 — services, monde professionnel",
        "Grammaire : conditionnel simple, pronoms réfléchis, comparatifs",
        "Vocabulaire : 40 mots — santé, bureau, sport, loisirs",
        "Écoute : exercices 6-9 (services, entretien, loisirs)",
        "✦ Shadowing : dialogues de service (médecin, banque)",
        "✦ Immersion : séries PT sur Netflix avec sous-titres en portugais",
      ],
    },
    {
      week: 8,
      theme: "Loisirs et culture portugaise",
      content: [
        "Leçons A2 module 5 — loisirs, culture, fado",
        "Grammaire : adverbes de fréquence, révision passé vs présent",
        "Vocabulaire : 30 mots — sport, musique, cinéma, fado",
        "Lecture : textes 25-42 (programme culturel, critique, offre d'emploi)",
        "✦ Expressions : dar o braço a torcer, meter a colher, ficar sem palavras",
        "✦ Musique : apprendre les paroles d'une chanson portugaise",
      ],
    },
    {
      week: 9,
      theme: "Consolidation A2 — Bilan et examen",
      content: [
        "Terminer les leçons A2 restantes",
        "Grammaire : révision complète des 15 points A2",
        "Vocabulaire : consolider 400+ mots, identifier les lacunes",
        "Écriture : email formel + récit au passé",
        "✦ Output : monologue de 3 min sur un sujet libre (sans notes)",
        "✦ Shadowing final : choisir 2 dialogues et les maîtriser parfaitement",
      ],
      checkpoint: "EXAMEN A2 — objectif ≥ 80%",
    },
  ],
  milestone: "Examen A2 validé",
  milestoneDetail: "400+ mots en SRS actif, temps du passé maîtrisés, capable de voyager et gérer des situations courantes. Intonation améliorée par le shadowing quotidien.",
};

// ============================================================
// PHASE 3 — B1 : L'AUTONOMIE (Semaines 10-14 — Mois 3)
// ============================================================
const PHASE_3: PhaseInfo = {
  number: 3,
  title: "L'Autonomie",
  level: "B1",
  colorFrom: "from-amber-500",
  colorTo: "to-amber-600",
  badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  weekRange: [10, 14],
  totalWeeks: 5,
  description:
    "1h cours actif : 15 min Anki, 15 min grammaire (subjonctif, imparfait), 30 min contenu natif (presse PT, podcasts, séries sous-titres PT). Shadowing 5-10 min sur audio natif. Output : chat écrit 10-15 min ou monologue. ~1500-2000 mots.",
  goals: [
    "Atteindre 600+ mots de vocabulaire actif",
    "Maîtriser l'imparfait et le subjonctif présent",
    "Comprendre des articles de presse portugaise avec aide",
    "Participer à une conversation simulée avec l'IA",
    "Penser en portugais pour les situations du quotidien",
    "Écrire des textes structurés (opinions, récits, emails formels)",
  ],
  resources: [
    { label: "Leçons B1", value: "30 leçons", url: "/lessons" },
    { label: "Grammaire B1", value: "15 points", url: "/grammar" },
    { label: "Écoute B1", value: "31 exercices", url: "/listening" },
    { label: "Presse PT", value: "articles illimités", url: "/authentic" },
    { label: "Conversations IA", value: "scénarios B1", url: "/speaking" },
    { label: "Écriture B1", value: "10 sujets", url: "/writing" },
  ],
  template: [
    {
      day: "Lundi",
      activities: [
        { duration: 15, label: "Anki — Phrases complexes", description: "Réviser les cartes dues + 10 mots nouveaux en phrases avec connecteurs logiques", url: "/review" },
        { duration: 15, label: "Grammaire — Point B1", description: "Imparfait, subjonctif présent, discours indirect — toujours avec exemples en contexte", url: "/grammar" },
        { duration: 20, label: "Contenu natif facile", description: "Presse PT (article court) ou YouTube PT — viser 60-70% de compréhension sans dictionnaire", url: "/authentic" },
        { duration: 10, label: "Shadowing", description: "Prendre un extrait audio du contenu et le répéter en imitant exactement le locuteur natif", url: "/pronunciation" },
      ],
    },
    {
      day: "Mardi",
      activities: [
        { duration: 15, label: "Anki — Révision SRS", description: "Volume croissant : 50-70 cartes/jour — ne pas sauter", url: "/review" },
        { duration: 15, label: "Grammaire — Exercices", description: "Pratiquer intensivement (subjonctif, imparfait) — production guidée puis libre", url: "/grammar" },
        { duration: 20, label: "Écoute B1", description: "Exercice de compréhension orale — reportage, interview, dialogue complexe", url: "/listening" },
        { duration: 10, label: "Output — Chat IA", description: "Écrire un court texte ou converser par écrit avec l'IA en portugais — 10-15 min", url: "/speaking" },
      ],
    },
    {
      day: "Mercredi",
      activities: [
        { duration: 15, label: "Anki — Révision SRS", description: "Réviser les cartes dues", url: "/review" },
        { duration: 15, label: "Presse PT", description: "Lire un article de presse avec TTS — noter les tournures inconnues, ne pas tout traduire", url: "/authentic" },
        { duration: 20, label: "Écriture B1", description: "Texte structuré (opinion, récit, email formel) avec correction IA — 80-100 mots", url: "/writing" },
        { duration: 10, label: "Dictionnaire + SRS", description: "Chercher les expressions marquantes de l'article et les ajouter au SRS", url: "/dictionary" },
      ],
    },
    {
      day: "Jeudi",
      activities: [
        { duration: 15, label: "Anki — Révision SRS", description: "Réviser les cartes dues", url: "/review" },
        { duration: 15, label: "Leçon B1", description: "Continuer le curriculum B1 — sujets complexes (société, opinion, actualité)", url: "/lessons" },
        { duration: 20, label: "Écoute intensive", description: "2 exercices d'écoute B1 d'affilée — comprendre l'essentiel sans tout saisir", url: "/listening" },
        { duration: 10, label: "Mini-story B1 — Immersion", description: "Lire une mini-histoire B1 (entretien, Sintra, fado), écouter le TTS, Q&A IA sur le contenu", url: "/mini-stories" },
      ],
    },
    {
      day: "Vendredi",
      activities: [
        { duration: 15, label: "Anki — Révision SRS", description: "Réviser les cartes dues", url: "/review" },
        { duration: 15, label: "Écriture — Texte long", description: "Essai d'opinion ou résumé d'article — 100 mots avec correction IA", url: "/writing" },
        { duration: 20, label: "Grammaire — Révision ciblée", description: "Revoir les points difficiles de la semaine, focus sur le subjonctif", url: "/grammar" },
        { duration: 10, label: "Expressions B1", description: "Expressions idiomatiques B1 avec exemples audio — ficar com a pulga atrás da orelha", url: "/idioms" },
      ],
    },
    {
      day: "Samedi",
      activities: [
        { duration: 15, label: "Anki — Révision SRS", description: "Réviser les cartes dues", url: "/review" },
        { duration: 15, label: "Presse PT — Q&A IA", description: "Lire un 2e article, utiliser le Q&A IA pour approfondir la compréhension", url: "/authentic" },
        { duration: 20, label: "Contenu natif libre", description: "Séries PT avec sous-titres PT, podcast, YouTube — PLAISIR avant tout, pas de contrainte", url: "/media" },
        { duration: 10, label: "Shadowing intensif", description: "Choisir 30 secondes d'audio natif et le répéter jusqu'à le maîtriser parfaitement", url: "/pronunciation" },
      ],
    },
    {
      day: "Dimanche",
      activities: [
        { duration: 15, label: "Anki — Révision SRS", description: "Toutes les cartes accumulées", url: "/review" },
        { duration: 20, label: "Révision de la semaine", description: "Revoir les leçons, exercices ratés — consolider les lacunes", url: "/lessons" },
        { duration: 15, label: "Professeur IA — Avancé", description: "Questions sur le subjonctif, expressions, nuances — session approfondie", url: "/professeur" },
        { duration: 10, label: "Culture PT", description: "Approfondir un thème culturel (fado, 25 avril, gastronomie) pour ancrer la motivation", url: "/culture" },
      ],
    },
  ],
  weeks: [
    {
      week: 10,
      theme: "L'imparfait — décrire le passé",
      content: [
        "Leçons B1 module 1 — souvenirs, habitudes passées",
        "Grammaire : pretérito imperfeito — formation, usage vs perfeito",
        "Vocabulaire : 30 mots — émotions, souvenirs, saisons",
        "Écoute : exercices B1 1-4 (récits au passé, descriptions)",
        "✦ Mini-stories B1 — entretien d'embauche, Sintra, Alfama (fado/saudade)",
        "✦ Shadowing : récits à l'imparfait — imiter le rythme narratif",
        "✦ Output : raconter un souvenir d'enfance à voix haute (2 min)",
      ],
    },
    {
      week: 11,
      theme: "Le subjonctif — exprimer le doute et le souhait",
      content: [
        "Leçons B1 modules 2-3 — opinions, hypothèses",
        "Grammaire : présent du subjonctif — déclencheurs (quero que, espero que, embora)",
        "Vocabulaire : 30 mots — opinion, argument, connecteurs (portanto, além disso)",
        "Écoute : exercices 5-8 (débat, discussion)",
        "Presse PT : premier article authentique avec aide TTS + dictionnaire",
        "✦ Output : donner son opinion sur un sujet en 60 mots",
      ],
    },
    {
      week: 12,
      theme: "La presse et l'information",
      content: [
        "Leçons B1 module 4 — médias, information",
        "Grammaire : discours indirect (ele disse que...), connecteurs logiques",
        "Vocabulaire : 30 mots — presse, politique, économie basique",
        "Écoute : exercices 9-14 (reportages simplifiés)",
        "Presse PT : 2 articles avec Q&A IA — noter les tournures idiomatiques",
        "✦ Output : résumer un article en 50 mots à l'écrit ET à l'oral",
      ],
    },
    {
      week: 13,
      theme: "Argumenter — Conversations IA",
      content: [
        "Leçons B1 modules 5-6 — argumentation, société",
        "Grammaire : marqueurs de discours (porém, contudo, pronto, então)",
        "Vocabulaire : 30 mots — argumentation, traditions, société",
        "Écoute : exercices 15-20 (débats, interviews)",
        "✦ Conversation IA : premier scénario B1 (entretien, discussion)",
        "✦ Shadowing : extraits de débats ou interviews portugaises",
      ],
    },
    {
      week: 14,
      theme: "Consolidation B1 — Bilan et examen",
      content: [
        "Terminer les leçons B1 restantes",
        "Grammaire : révision complète des 15 points B1 (focus subjonctif + imparfait)",
        "Écoute : exercices 21-31 (révision)",
        "Écriture : essai d'opinion structuré (introduction, arguments, conclusion)",
        "✦ Output final : monologue de 3 min sur un sujet de société (sans notes)",
        "✦ Conversation IA : scénario B1 complet avec évaluation",
      ],
      checkpoint: "EXAMEN B1 — objectif ≥ 80%",
    },
  ],
  milestone: "Examen B1 validé",
  milestoneDetail: "600+ mots en SRS actif, subjonctif et imparfait maîtrisés, capable de lire la presse et d'argumenter. Commence à penser en portugais dans les situations simples.",
};

// ============================================================
// PHASE 4 — B2 : LA MAÎTRISE (Semaines 15-22 — Mois 4-5)
// ============================================================
const PHASE_4: PhaseInfo = {
  number: 4,
  title: "La Maîtrise",
  level: "B2",
  colorFrom: "from-violet-500",
  colorTo: "to-violet-600",
  badgeClass: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  weekRange: [15, 22],
  totalWeeks: 8,
  description:
    "1h cours actif : 10 min Anki, 10 min grammaire ciblée (subjonctif futur, infinitif personnel), 40 min contenu natif difficile (podcasts, séries sans sous-titres si possible). Shadowing 10-15 min. Output : 20-30 min parler + écrire. Penser en portugais continuellement. ~3000-5000 mots.",
  goals: [
    "Atteindre 800+ mots de vocabulaire actif",
    "Maîtriser le subjonctif futur et l'infinitif personnel (spécificités PT-PT)",
    "Comprendre la presse et les débats sans aide",
    "Suivre des séries sans sous-titres (ou sous-titres PT seulement)",
    "Parler de sujets complexes avec fluidité",
    "Écrire des essais argumentés — 200-250 mots",
  ],
  resources: [
    { label: "Leçons B2", value: "35 leçons", url: "/lessons" },
    { label: "Grammaire B2", value: "14 points", url: "/grammar" },
    { label: "Écoute B2", value: "40 exercices", url: "/listening" },
    { label: "Lecture B2", value: "40 textes", url: "/reading" },
    { label: "Presse PT", value: "articles illimités", url: "/authentic" },
    { label: "Conversations IA", value: "scénarios B2", url: "/speaking" },
  ],
  template: [
    {
      day: "Lundi",
      activities: [
        { duration: 10, label: "Anki — Révision SRS", description: "Volume élevé : 80-120 cartes/jour — réviser rapidement sans s'attarder", url: "/review" },
        { duration: 10, label: "Grammaire ciblée", description: "Subjonctif futur, infinitif personnel, voix passive — points spécifiques au PT-PT", url: "/grammar" },
        { duration: 30, label: "Contenu natif difficile", description: "Podcast PT, débat, émission TV, série PT sans sous-titres — comprendre l'essentiel suffit", url: "/media" },
        { duration: 10, label: "Shadowing intensif", description: "Prendre 1 min d'audio natif et le répéter jusqu'à le maîtriser — accent de Lisbonne", url: "/pronunciation" },
      ],
    },
    {
      day: "Mardi",
      activities: [
        { duration: 10, label: "Anki — Révision SRS", description: "Réviser les cartes dues", url: "/review" },
        { duration: 10, label: "Presse PT", description: "Lire un article complet sans aide — résumer mentalement les idées clés", url: "/authentic" },
        { duration: 30, label: "Écoute B2", description: "Exercice d'écoute difficile — débat, émission, podcast sans ralentissement", url: "/listening" },
        { duration: 10, label: "Output — Parler seul", description: "Commenter à voix haute ce qu'on vient d'écouter — 5-8 phrases, avec nuance", url: "/pronunciation" },
      ],
    },
    {
      day: "Mercredi",
      activities: [
        { duration: 10, label: "Anki — Révision SRS", description: "Réviser les cartes dues", url: "/review" },
        { duration: 10, label: "Grammaire avancée", description: "Exercices sur les structures B2 — production libre avec subjonctif futur, infinitif personnel", url: "/grammar" },
        { duration: 30, label: "Écriture longue", description: "Essai argumenté ou critique — 150-200 mots avec correction IA, structure claire", url: "/writing" },
        { duration: 10, label: "Lecture B2", description: "Texte complexe — article de fond, extrait littéraire, chronique", url: "/reading" },
      ],
    },
    {
      day: "Jeudi",
      activities: [
        { duration: 10, label: "Anki — Révision SRS", description: "Réviser les cartes dues", url: "/review" },
        { duration: 10, label: "Leçon B2", description: "Curriculum B2 — structures avancées, registres, spécificités PT-PT", url: "/lessons" },
        { duration: 30, label: "Contenu natif — Immersion", description: "Séries PT, vidéos YouTube, podcast — SANS sous-titres si possible. Si incompréhensible, sous-titres PT uniquement", url: "/media" },
        { duration: 10, label: "Output — Journal", description: "Écrire 8-10 phrases sur la journée ou sur un sujet de société — sans aide", url: "/writing" },
      ],
    },
    {
      day: "Vendredi",
      activities: [
        { duration: 10, label: "Anki — Révision SRS", description: "Réviser les cartes dues", url: "/review" },
        { duration: 10, label: "Presse PT + Q&A IA", description: "Lire un article, répondre aux questions de compréhension IA", url: "/authentic" },
        { duration: 30, label: "Conversation IA", description: "Scénario B2 — débat, entretien, discussion complexe avec feedback IA en temps réel", url: "/speaking" },
        { duration: 10, label: "Expressions B2 avancées", description: "Expressions et registres soutenus — todavia, porquanto, não obstante", url: "/idioms" },
      ],
    },
    {
      day: "Samedi",
      activities: [
        { duration: 10, label: "Anki — Révision SRS", description: "Réviser les cartes dues", url: "/review" },
        { duration: 10, label: "Écoute intensive", description: "2-3 exercices B2 d'affilée — compréhension fine, inférence, nuance", url: "/listening" },
        { duration: 30, label: "Contenu natif libre", description: "Série complète sans sous-titres, film PT, podcast — immersion totale pendant 30 min", url: "/media" },
        { duration: 10, label: "Shadowing — Audio natif", description: "Choisir 1 min d'audio authentique difficile et le répéter jusqu'à la fluidité", url: "/pronunciation" },
      ],
    },
    {
      day: "Dimanche",
      activities: [
        { duration: 10, label: "Anki — Révision SRS", description: "Toutes les cartes accumulées", url: "/review" },
        { duration: 10, label: "Révision ciblée", description: "Revoir les 2-3 points les plus difficiles de la semaine", url: "/lessons" },
        { duration: 30, label: "Professeur IA — Session avancée", description: "Questions de grammaire avancée, nuances, registres, mésoclise — aller jusqu'au bout", url: "/professeur" },
        { duration: 10, label: "Output — Bilan oral", description: "Monologue de 5 min sur n'importe quel sujet sans notes — mesurer la progression", url: "/pronunciation" },
      ],
    },
  ],
  weeks: [
    {
      week: 15,
      theme: "Le subjonctif futur — spécificité portugaise",
      content: [
        "Leçons B2 module 1 — hypothèses et conditions",
        "Grammaire : subjonctif futur (quando eu for, se eu puder) — n'existe pas en français !",
        "Vocabulaire : 30 mots — politique, économie, société",
        "Écoute : exercices B2 1-5 (débats, reportages)",
        "✦ Shadowing : extraits de débats politiques portugais",
        "✦ Output : formuler 10 phrases avec o subjonctif futur à voix haute",
      ],
    },
    {
      week: 16,
      theme: "L'infinitif personnel — bijou du portugais",
      content: [
        "Leçons B2 module 2 — structure avancée unique",
        "Grammaire : infinitif personnel (para eu fazer, antes de eles saírem) — unique au portugais !",
        "Vocabulaire : 30 mots — sciences, technologie, environnement",
        "Écoute : exercices 6-10 (conférences)",
        "✦ Contenu natif : TED Talks ou conférences en portugais européen",
        "✦ Output : écrire 5 phrases avec l'infinitif personnel",
      ],
    },
    {
      week: 17,
      theme: "Voix passive et registres",
      content: [
        "Leçons B2 module 3 — style et registre formel",
        "Grammaire : voix passive (ser + participe), passif pronominal (vendem-se casas)",
        "Vocabulaire : 30 mots — registre soutenu, administration, juridique basique",
        "Écoute : exercices 11-16 (discours, présentations formelles)",
        "✦ Presse PT : articles de fond sans aide",
        "✦ Écriture : lettre formelle de réclamation — 150 mots",
      ],
    },
    {
      week: 18,
      theme: "Argumenter avec nuance",
      content: [
        "Leçons B2 module 4 — débat, persuasion",
        "Grammaire : subjonctif passé (se eu tivesse sabido), plus-que-parfait",
        "Vocabulaire : 30 mots — rhétorique, concession (todavia, porquanto)",
        "Écoute : exercices 17-22 (débats politiques, interviews longues)",
        "Presse PT : 3 articles avec analyse approfondie",
        "✦ Essai argumenté pour/contre — 200 mots",
      ],
    },
    {
      week: 19,
      theme: "Médias — compréhension sans filet",
      content: [
        "Leçons B2 module 5 — médias, communication",
        "Grammaire : mésoclise (dir-lhe-ei, fá-lo-ia) — registre littéraire/formel",
        "Vocabulaire : 30 mots — médias, réseaux, communication",
        "Écoute : exercices 23-30 (podcasts, émissions radio sans aide)",
        "✦ Séries PT : 1 épisode complet sans sous-titres",
        "✦ Conversation IA : débat sur l'environnement ou la société",
      ],
    },
    {
      week: 20,
      theme: "Registres et styles — fluidité orale",
      content: [
        "Leçons B2 modules 6-7 — registres variés",
        "Grammaire : révision des 14 points B2, focus spécificités PT-PT",
        "Vocabulaire : consolider les 800+ mots — réviser les lacunes",
        "Écoute : exercices 31-37 (accents régionaux, registres variés)",
        "✦ Shadowing intensif : 15 min/jour sur audio natif difficile",
        "✦ Output oral : 10 min de parole libre sans notes — filmer pour mesurer le progrès",
      ],
    },
    {
      week: 21,
      theme: "Révision intensive A1→B2",
      content: [
        "Grammaire : révision complète des 59 points (focus B1-B2)",
        "SRS : revoir toutes les cartes difficiles",
        "Écoute : exercices 38-40 + contenu natif libre",
        "Lecture : textes complexes variés sans aide",
        "✦ Conversation IA : scénario B2 long avec évaluation complète",
        "✦ Shadowing final : maîtriser 3 extraits audio de niveaux différents",
      ],
    },
    {
      week: 22,
      theme: "Bilan final — Examen B2",
      content: [
        "Terminer les leçons B2 restantes",
        "Écriture : essai final de 250 mots — sujet ouvert",
        "Conversation IA : simulation d'entretien ou débat — 20 min",
        "✦ Output final : monologue de 5 min chronométré, sans notes",
        "✦ Bilan immersion : séries regardées, articles lus, podcasts écoutés",
        "✦ Professeur IA : session de révision finale et feedback global",
      ],
      checkpoint: "EXAMEN B2 — objectif ≥ 75%",
    },
  ],
  milestone: "Examen B2 validé",
  milestoneDetail: "800+ mots en SRS actif, subjonctif futur et infinitif personnel maîtrisés, capable de comprendre la presse et les séries, d'argumenter avec fluidité. Pensée en portugais dans les situations du quotidien.",
};

// ============================================================
// EXPORT — Les 4 phases du plan
// ============================================================
export const PHASES: PhaseInfo[] = [PHASE_1, PHASE_2, PHASE_3, PHASE_4];

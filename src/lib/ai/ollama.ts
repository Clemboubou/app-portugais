// Cache mémoire global (survit aux requêtes, réinitialisé au redémarrage du serveur)
// Clé = hash(task + messages), TTL = 1 heure, max 200 entrées
interface CacheEntry {
  result: string;
  expiresAt: number;
}

const _cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 heure
const CACHE_MAX_SIZE = 200;

function cacheKey(task: string, messages: { role: string; content: string }[]): string {
  const raw = task + JSON.stringify(messages);
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (Math.imul(31, hash) + raw.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

function cacheGet(key: string): string | null {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    _cache.delete(key);
    return null;
  }
  return entry.result;
}

function cacheSet(key: string, result: string): void {
  // Éviction LRU simple : supprimer la plus ancienne entrée si plein
  if (_cache.size >= CACHE_MAX_SIZE) {
    const firstKey = _cache.keys().next().value;
    if (firstKey !== undefined) _cache.delete(firstKey);
  }
  _cache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
}

interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OllamaOptions {
  num_ctx?: number;
  temperature?: number;
  think?: boolean;
}

interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream: false;
  options?: OllamaOptions;
}

interface OllamaChatResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  eval_count?: number;
}

type OllamaTask = "grammar" | "conversation" | "general";

function getModelForTask(task: OllamaTask): string {
  switch (task) {
    case "grammar":
      return process.env.OLLAMA_MODEL_GRAMMAR ?? "llama3";
    case "conversation":
      return process.env.OLLAMA_MODEL_CONVERSATION ?? "command-r";
    case "general":
      return process.env.OLLAMA_MODEL_GENERAL ?? "mistral";
  }
}

function getBaseUrl(): string {
  return process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
}

function getNumCtx(): number {
  return parseInt(process.env.OLLAMA_NUM_CTX ?? "8192", 10);
}

export async function ollamaChat(
  task: OllamaTask,
  messages: OllamaMessage[],
  options?: OllamaOptions & { noCache?: boolean }
): Promise<string> {
  const model = getModelForTask(task);
  const baseUrl = getBaseUrl();

  // Vérifier le cache (sauf pour les conversations interactives)
  if (!options?.noCache) {
    const key = cacheKey(task + model, messages);
    const cached = cacheGet(key);
    if (cached) return cached;

    const body: OllamaChatRequest = {
      model,
      messages,
      stream: false,
      options: {
        num_ctx: options?.num_ctx ?? getNumCtx(),
        temperature: options?.temperature ?? 0.7,
      },
    };

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, think: options?.think ?? false }),
      signal: AbortSignal.timeout(180_000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new OllamaError(
        `Ollama returned ${response.status}: ${errorText}`,
        response.status
      );
    }

    const data = (await response.json()) as OllamaChatResponse;
    const content = data?.message?.content;
    if (!content) throw new OllamaError("Ollama returned an empty message");
    cacheSet(key, content);
    return content;
  }

  // Sans cache (conversations interactives)
  const body: OllamaChatRequest = {
    model,
    messages,
    stream: false,
    options: {
      num_ctx: options?.num_ctx ?? getNumCtx(),
      temperature: options?.temperature ?? 0.7,
    },
  };

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180_000),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new OllamaError(
      `Ollama returned ${response.status}: ${errorText}`,
      response.status
    );
  }

  const data = (await response.json()) as OllamaChatResponse;
  const content = data?.message?.content;
  if (!content) throw new OllamaError("Ollama returned an empty message");
  return content;
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(getBaseUrl(), {
      signal: AbortSignal.timeout(3_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export class OllamaError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "OllamaError";
  }
}

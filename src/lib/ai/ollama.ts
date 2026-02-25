interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OllamaOptions {
  num_ctx?: number;
  temperature?: number;
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
  options?: OllamaOptions
): Promise<string> {
  const model = getModelForTask(task);
  const baseUrl = getBaseUrl();

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
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new OllamaError(
      `Ollama returned ${response.status}: ${errorText}`,
      response.status
    );
  }

  const data = (await response.json()) as OllamaChatResponse;
  return data.message.content;
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

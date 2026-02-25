/**
 * Transcription Whisper 100% locale via @xenova/transformers (WebAssembly).
 * Charge le modèle Xenova/whisper-small une seule fois (lazy loading).
 * Toujours forcer language: "pt" pour le portugais européen.
 *
 * IMPORTANT: Ce module ne doit être utilisé QUE côté client.
 */

type ProgressCallback = (progress: { status: string; progress?: number }) => void;

export interface TranscriptionResult {
  text: string;
  confidence: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pipelineInstance: any = null;
let isLoadingModelFlag = false;
let loadPromise: Promise<void> | null = null;

const MODEL_ID = "Xenova/whisper-small";

/**
 * Charge le pipeline Whisper (lazy, une seule fois).
 */
async function loadPipeline(onProgress?: ProgressCallback): Promise<void> {
  if (pipelineInstance) return;

  if (loadPromise) {
    await loadPromise;
    return;
  }

  isLoadingModelFlag = true;

  loadPromise = (async () => {
    try {
      const { pipeline, env } = await import("@xenova/transformers");

      // Désactiver le backend local/node, utiliser uniquement WASM dans le navigateur
      env.allowLocalModels = false;
      env.allowRemoteModels = true;

      pipelineInstance = await pipeline(
        "automatic-speech-recognition",
        MODEL_ID,
        {
          progress_callback: onProgress
            ? (data: { status: string; progress?: number }) => {
                onProgress(data);
              }
            : undefined,
        }
      );
    } finally {
      isLoadingModelFlag = false;
    }
  })();

  await loadPromise;
}

/**
 * Convertit un Blob audio en Float32Array pour Whisper.
 */
async function blobToFloat32(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new AudioContext({ sampleRate: 16000 });
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const channelData = audioBuffer.getChannelData(0);
  await audioContext.close();
  return channelData;
}

/**
 * Transcrit un blob audio en texte portugais.
 */
export async function transcribe(
  audioBlob: Blob,
  onProgress?: ProgressCallback
): Promise<TranscriptionResult> {
  await loadPipeline(onProgress);

  if (!pipelineInstance) {
    throw new Error("Impossible de charger le modèle Whisper.");
  }

  const audioData = await blobToFloat32(audioBlob);

  const result = await pipelineInstance(audioData, {
    language: "portuguese",
    task: "transcribe",
    return_timestamps: false,
  });

  // @xenova/transformers retourne { text: string }
  const text: string = Array.isArray(result) ? result[0].text : result.text;

  return {
    text: text.trim(),
    confidence: 1.0,
  };
}

export function isModelLoading(): boolean {
  return isLoadingModelFlag;
}

export function isModelLoaded(): boolean {
  return pipelineInstance !== null;
}

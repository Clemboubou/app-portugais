/**
 * Text-to-Speech via Microsoft Edge TTS (pt-PT voices, gratuit).
 *
 * Stratégie :
 *   1. CLI Python `edge-tts` via child_process (si Python installé)
 *   2. WebSocket Microsoft Edge TTS (implémentation native Node.js)
 *
 * Si les deux échouent, l'API retourne { useWebSpeech: true }
 * et le client utilise window.speechSynthesis (Web Speech API).
 *
 * Les fichiers MP3 sont mis en cache dans /public/audio/{hash}.mp3.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TtsVoice = "female" | "male";

export interface TtsResult {
  audioUrl: string;
  cached: boolean;
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const VOICE_MAP: Record<TtsVoice, string> = {
  female: "pt-PT-RaquelNeural",
  male: "pt-PT-DuarteNeural",
};

const AUDIO_DIR = path.join(process.cwd(), "public", "audio");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildHash(text: string, voice: TtsVoice): string {
  return crypto
    .createHash("sha256")
    .update(`${voice}::${text}`)
    .digest("hex");
}

function ensureAudioDir(): void {
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }
}

// ---------------------------------------------------------------------------
// Stratégie 1 — CLI Python edge-tts
// ---------------------------------------------------------------------------

function generateWithPythonCli(
  text: string,
  voiceName: string,
  outputPath: string
): boolean {
  try {
    const safeText = text.replace(/"/g, '\\"');
    execSync(
      `edge-tts --voice "${voiceName}" --text "${safeText}" --write-media "${outputPath}"`,
      { timeout: 30_000, stdio: "pipe" }
    );
    return fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Stratégie 2 — WebSocket Microsoft Edge TTS (implémentation native)
// ---------------------------------------------------------------------------

async function generateWithWebSocket(
  text: string,
  voiceName: string,
  outputPath: string
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const tls = require("tls") as typeof import("tls");

      const requestId = crypto.randomUUID().replace(/-/g, "");
      const timestamp = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "")
        .replace(/ /, "T") + "Z";

      const wsKey = crypto.randomBytes(16).toString("base64");
      const host = "speech.platform.bing.com";
      const wsPath =
        "/consumer/speech/synthesize/readaloud/edge/v1" +
        "?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4";

      const httpUpgrade = [
        `GET ${wsPath} HTTP/1.1`,
        `Host: ${host}`,
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Key: ${wsKey}`,
        "Sec-WebSocket-Version: 13",
        "Origin: chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
        "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.77 Safari/537.36 Edg/91.0.864.41",
        "",
        "",
      ].join("\r\n");

      const socket = tls.connect(
        { host, port: 443, servername: host },
        () => {
          socket.write(httpUpgrade);
        }
      );

      socket.setTimeout(15_000);

      let upgraded = false;
      let rawBuffer = Buffer.alloc(0);
      const audioChunks: Buffer[] = [];
      let done = false;

      const finish = (success: boolean) => {
        if (done) return;
        done = true;
        socket.destroy();
        if (success && audioChunks.length > 0) {
          const mp3 = Buffer.concat(audioChunks);
          fs.writeFileSync(outputPath, mp3);
          resolve(mp3.length > 0);
        } else {
          resolve(false);
        }
      };

      socket.on("timeout", () => finish(false));
      socket.on("error", () => finish(false));

      const encodeWsFrame = (payload: string): Buffer => {
        const data = Buffer.from(payload, "utf-8");
        const len = data.length;
        let header: Buffer;
        if (len < 126) {
          header = Buffer.alloc(6);
          header[0] = 0x81;
          header[1] = 0x80 | len;
        } else {
          header = Buffer.alloc(8);
          header[0] = 0x81;
          header[1] = 0xfe;
          header.writeUInt16BE(len, 2);
        }
        const mask = crypto.randomBytes(4);
        const maskOffset = header.length - 4;
        mask.copy(header, maskOffset);
        const masked = Buffer.alloc(len);
        for (let i = 0; i < len; i++) {
          masked[i] = data[i] ^ mask[i % 4];
        }
        return Buffer.concat([header, masked]);
      };

      const parseWsFrames = (buf: Buffer): void => {
        let offset = 0;
        while (offset + 2 <= buf.length) {
          const firstByte = buf[offset];
          const secondByte = buf[offset + 1];
          const opcode = firstByte & 0x0f;
          const masked = (secondByte & 0x80) !== 0;
          let payloadLen = secondByte & 0x7f;
          let headerLen = 2;

          if (payloadLen === 126) {
            if (offset + 4 > buf.length) break;
            payloadLen = buf.readUInt16BE(offset + 2);
            headerLen = 4;
          } else if (payloadLen === 127) {
            if (offset + 10 > buf.length) break;
            payloadLen = Number(buf.readBigUInt64BE(offset + 2));
            headerLen = 10;
          }

          if (masked) headerLen += 4;
          if (offset + headerLen + payloadLen > buf.length) break;

          const payload = buf.slice(
            offset + headerLen,
            offset + headerLen + payloadLen
          );

          if (opcode === 0x02 || opcode === 0x00) {
            const marker = Buffer.from("Path:audio\r\n");
            const markerIdx = payload.indexOf(marker);
            if (markerIdx !== -1) {
              audioChunks.push(payload.slice(markerIdx + marker.length));
            } else {
              audioChunks.push(payload);
            }
          } else if (opcode === 0x01) {
            const frameText = payload.toString("utf-8");
            if (frameText.includes("Path:turn.end")) {
              finish(true);
              return;
            }
          } else if (opcode === 0x08) {
            finish(audioChunks.length > 0);
            return;
          }

          offset += headerLen + payloadLen;
        }

        rawBuffer = buf.slice(offset);
      };

      socket.on("data", (chunk: Buffer) => {
        if (!upgraded) {
          rawBuffer = Buffer.concat([rawBuffer, chunk]);
          const headerEnd = rawBuffer.indexOf("\r\n\r\n");
          if (headerEnd === -1) return;

          const headerStr = rawBuffer.slice(0, headerEnd).toString();
          if (!headerStr.includes("101")) {
            finish(false);
            return;
          }

          upgraded = true;
          const rest = rawBuffer.slice(headerEnd + 4);
          rawBuffer = Buffer.alloc(0);

          const configMsg = [
            `X-Timestamp:${timestamp}`,
            "Content-Type:application/json; charset=utf-8",
            `Path:speech.config`,
            "",
            JSON.stringify({
              context: {
                synthesis: {
                  audio: {
                    metadataoptions: {
                      sentenceBoundaryEnabled: false,
                      wordBoundaryEnabled: false,
                    },
                    outputFormat: "audio-24khz-48kbitrate-mono-mp3",
                  },
                },
              },
            }),
          ].join("\r\n");

          socket.write(encodeWsFrame(configMsg));

          const ssml = [
            `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='pt-PT'>`,
            `<voice name='${voiceName}'>`,
            text
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;"),
            `</voice>`,
            `</speak>`,
          ].join("");

          const ssmlMsg = [
            `X-RequestId:${requestId}`,
            `X-Timestamp:${timestamp}`,
            "Content-Type:application/ssml+xml",
            `Path:ssml`,
            "",
            ssml,
          ].join("\r\n");

          socket.write(encodeWsFrame(ssmlMsg));

          if (rest.length > 0) {
            rawBuffer = rest;
            parseWsFrames(rawBuffer);
          }
        } else {
          rawBuffer = Buffer.concat([rawBuffer, chunk]);
          parseWsFrames(rawBuffer);
        }
      });
    } catch {
      resolve(false);
    }
  });
}

// ---------------------------------------------------------------------------
// Fonction principale exportée
// ---------------------------------------------------------------------------

export async function generateTts(
  text: string,
  voice: TtsVoice = "female"
): Promise<TtsResult> {
  if (!text || text.trim().length === 0) {
    throw new Error("Le texte ne peut pas être vide.");
  }

  ensureAudioDir();

  const hash = buildHash(text.trim(), voice);
  const filename = `${hash}.mp3`;
  const filePath = path.join(AUDIO_DIR, filename);
  const audioUrl = `/audio/${filename}`;

  // Cache hit
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
    return { audioUrl, cached: true };
  }

  const voiceName = VOICE_MAP[voice];

  // Stratégie 1 : CLI Python edge-tts
  const cliSuccess = generateWithPythonCli(text.trim(), voiceName, filePath);
  if (cliSuccess) {
    return { audioUrl, cached: false };
  }

  // Stratégie 2 : WebSocket natif Node.js
  const wsSuccess = await generateWithWebSocket(text.trim(), voiceName, filePath);
  if (wsSuccess) {
    return { audioUrl, cached: false };
  }

  throw new Error("TTS_UNAVAILABLE");
}

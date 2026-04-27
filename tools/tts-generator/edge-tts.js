// Browser-compatible Edge TTS client, JS port of edge-tts.ts so the static
// tool can import it directly without a TypeScript build step.
//
// The underlying service is Microsoft's undocumented Edge read-aloud
// endpoint. It streams MP3 audio plus per-word timing metadata over a
// WebSocket, which we collect into a single MP3 blob and a list of word
// boundaries suitable for VTT/SRT subtitles.

const WSS_URL =
  "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1";
const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";

const generateConnectionId = () =>
  "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const getTimestamp = () => new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");

const escapeXml = text =>
  text.replace(/[<>&'"]/g, char => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return char;
    }
  });

const generateSecMsGec = async () => {
  const WIN_EPOCH = 11644473600;
  const S_TO_NS = 1e9;
  let ticks = Date.now() / 1000;
  ticks += WIN_EPOCH;
  ticks -= ticks % 300;
  ticks *= S_TO_NS / 100;

  const strToHash = `${ticks.toFixed(0)}${TRUSTED_CLIENT_TOKEN}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(strToHash);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
};

const parseMessage = message => {
  const parts = message.split("\r\n\r\n");
  const headerLines = parts[0].split("\r\n");
  const headers = {};
  for (const line of headerLines) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) headers[key] = value;
  }
  return { headers, body: parts[1] || "" };
};

// Synthesizes a single utterance via the Edge read-aloud WebSocket and
// resolves once the server signals end-of-turn. Returns `{ audio, subtitle }`
// where audio is an `audio/mpeg` Blob and subtitle is a list of word
// boundaries (offsets in 100-ns units).
export const synthesize = async ({
  text,
  voice,
  rate = "+0%",
  pitch = "+0Hz",
  volume = "+0%",
}) => {
  if (!text || !text.trim()) {
    throw new Error("Text is required for synthesis.");
  }
  if (!voice) {
    throw new Error("Voice is required for synthesis.");
  }

  const connectionId = generateConnectionId();
  const secMsGec = await generateSecMsGec();
  const url = `${WSS_URL}?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&ConnectionId=${connectionId}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=1-130.0.2849.68`;

  const ws = new WebSocket(url);
  ws.binaryType = "arraybuffer";

  await new Promise((resolve, reject) => {
    ws.onopen = () => resolve();
    ws.onerror = () => reject(new Error("Failed to open Edge TTS WebSocket."));
  });

  const configMsg = `X-Timestamp:${getTimestamp()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n${JSON.stringify(
    {
      context: {
        synthesis: {
          audio: {
            metadataoptions: {
              sentenceBoundaryEnabled: false,
              wordBoundaryEnabled: true,
            },
            outputFormat: "audio-24khz-48kbitrate-mono-mp3",
          },
        },
      },
    }
  )}`;

  const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='${voice}'><prosody pitch='${pitch}' rate='${rate}' volume='${volume}'>${escapeXml(text)}</prosody></voice></speak>`;
  const ssmlMsg = `X-RequestId:${generateConnectionId()}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${getTimestamp()}Z\r\nPath:ssml\r\n\r\n${ssml}`;

  ws.send(configMsg);
  ws.send(ssmlMsg);

  return new Promise((resolve, reject) => {
    const audioChunks = [];
    const wordBoundaries = [];
    let settled = false;

    const cleanup = () => {
      ws.onmessage = null;
      ws.onclose = null;
      ws.onerror = null;
    };

    ws.onmessage = event => {
      if (typeof event.data === "string") {
        const { headers, body } = parseMessage(event.data);
        if (headers.Path === "audio.metadata") {
          try {
            const metadata = JSON.parse(body);
            if (Array.isArray(metadata.Metadata)) {
              for (const item of metadata.Metadata) {
                if (item.Type === "WordBoundary" && item.Data) {
                  wordBoundaries.push({
                    offset: item.Data.Offset,
                    duration: item.Data.Duration,
                    text: item.Data.text?.Text ?? "",
                  });
                }
              }
            }
          } catch {
            // tolerate metadata parse errors; timing is best-effort
          }
        } else if (headers.Path === "turn.end") {
          ws.close();
        }
        return;
      }

      const arrayBuffer =
        event.data instanceof ArrayBuffer ? event.data : null;
      if (!arrayBuffer) return;
      if (arrayBuffer.byteLength < 2) return;
      const dataView = new DataView(arrayBuffer);
      const headerLength = dataView.getUint16(0);
      if (arrayBuffer.byteLength > headerLength + 2) {
        audioChunks.push(new Uint8Array(arrayBuffer, headerLength + 2));
      }
    };

    ws.onclose = () => {
      if (settled) return;
      settled = true;
      cleanup();
      if (audioChunks.length === 0) {
        reject(new Error("Edge TTS returned no audio. Try a different voice or retry."));
        return;
      }
      const audio = new Blob(audioChunks, { type: "audio/mpeg" });
      resolve({ audio, subtitle: wordBoundaries });
    };

    ws.onerror = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("Edge TTS WebSocket error."));
    };
  });
};

const padNumber = (num, length = 2) => String(num).padStart(length, "0");

const formatTimestamp = (timeIn100ns, format) => {
  const totalSeconds = Math.floor(timeIn100ns / 10000000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((timeIn100ns % 10000000) / 10000);
  const separator = format === "vtt" ? "." : ",";
  return `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}${separator}${padNumber(milliseconds, 3)}`;
};

export const createVTT = wordBoundaries => {
  let out = "WEBVTT\n\n";
  wordBoundaries.forEach((word, index) => {
    const startTime = formatTimestamp(word.offset, "vtt");
    const endTime = formatTimestamp(word.offset + word.duration, "vtt");
    out += `${index + 1}\n${startTime} --> ${endTime}\n${word.text}\n\n`;
  });
  return out;
};

export const createSRT = wordBoundaries => {
  let out = "";
  wordBoundaries.forEach((word, index) => {
    const startTime = formatTimestamp(word.offset, "srt");
    const endTime = formatTimestamp(word.offset + word.duration, "srt");
    out += `${index + 1}\n${startTime} --> ${endTime}\n${word.text}\n\n`;
  });
  return out;
};

// Resolves a short name like "en-US-AnaNeural" into the full Microsoft voice
// name required by the Edge SSML payload. Any string that already looks
// like a full name is returned unchanged.
export const voiceFullName = shortName => {
  if (!shortName) return shortName;
  if (shortName.startsWith("Microsoft Server Speech")) return shortName;
  const locale = shortName.split("-").slice(0, 2).join("-");
  return `Microsoft Server Speech Text to Speech Voice (${locale}, ${shortName.split("-").slice(2).join("-")})`;
};

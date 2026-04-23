import { EdgeTTS, listVoicesUniversal } from "edge-tts-universal";
import fs from "fs/promises";

const TEXT_EN = "Which number is this?";
const TEXT_VI = "Số này là số mấy?";
const VOICE_EN = "en-US-AnaNeural";
const VOICE_VI = "vi-VN-NamMinhNeural";

async function main() {
  const voices = await listVoicesUniversal();
  // const simple = voices
  //   .map(voice => ({
  //     name: voice.ShortName,
  //     gender: voice.Gender,
  //     locale: voice.Locale,
  //   }))
  //   .filter(voice => voice.locale === "vi-VN");
  // console.log("Vietnamese voices:", simple);

  // Simple one-shot synthesis
  const tts = new EdgeTTS(TEXT_EN, VOICE_EN, {
    rate: "-20%",
  });
  const result = await tts.synthesize();
  // Save audio file
  const audioBuffer = Buffer.from(await result.audio.arrayBuffer());
  await fs.writeFile(`output-${VOICE_EN}.mp3`, audioBuffer);

  const ttsVi = new EdgeTTS(TEXT_VI, VOICE_VI, {
    rate: "-20%",
  });
  const resultVi = await ttsVi.synthesize();
  // Save audio file
  const audioBufferVi = Buffer.from(await resultVi.audio.arrayBuffer());
  await fs.writeFile(`output-${VOICE_VI}.mp3`, audioBufferVi);
}

main().catch(console.error);

// Throwaway helper: print edge-tts voices for our target locales.
// Run once when picking voices, then discard if no longer needed.
import { listVoicesUniversal } from "edge-tts-universal";

const voices = await listVoicesUniversal();
const targetLocales = ["en-US", "vi-VN"];
for (const locale of targetLocales) {
  console.log(`\n[${locale}]`);
  for (const v of voices.filter(x => x.Locale === locale)) {
    console.log(`  ${v.ShortName} — ${v.Gender}`);
  }
}

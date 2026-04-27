// Quick-generate orchestration for the simplified TTS tool.
// Drives a single-voice, single-clip pipeline: pick a voice, type text,
// synthesise via Edge TTS, preview in an <audio> element, and let the user
// download the MP3 plus VTT/SRT subtitles produced from word boundaries.
//
// Advanced sprite/batch generation lives in index-advanced.html and is not
// loaded here - this keeps the default UI light and focused on one clip.
import { createSRT, createVTT, synthesize, voiceFullName } from "./edge-tts.js";
import { LANGUAGES, filterVoices, findVoice } from "./voices.js";

const STORAGE_KEY = "nth-kids-tts-quick-v1";

const DEFAULT_SAMPLE_TEXT =
  "Apple... Ball... Cat... Dog... Elephant... Fish... Grape... Horse... Ice cream... Jelly... Kite... Lion... Monkey... Nest... Orange... Panda... Queen... Rabbit... Sun... Tree... Umbrella... Vase... Whale... X-ray... Yarn... Zebra";

const $ = id => document.getElementById(id);

const state = {
  language: "English",
  gender: "Female",
  voice: null,
  speed: 1,
  autoplay: true,
  lastResult: null,
};

// ---- persistence -------------------------------------------------------

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const savePrefs = () => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        language: state.language,
        gender: state.gender,
        voice: state.voice?.shortName ?? null,
        speed: state.speed,
        autoplay: state.autoplay,
        text: $("text").value,
      })
    );
  } catch {
    // ignore quota errors
  }
};

// ---- voice rendering ---------------------------------------------------

const renderLanguages = () => {
  const sel = $("language");
  sel.innerHTML = "";
  for (const lang of LANGUAGES) {
    const opt = document.createElement("option");
    opt.value = lang;
    opt.textContent = lang;
    sel.appendChild(opt);
  }
  sel.value = state.language;
};

const renderVoices = () => {
  const list = $("voices");
  list.innerHTML = "";
  const voices = filterVoices(state.language, state.gender);

  if (voices.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No voices available for this filter.";
    empty.style.cursor = "default";
    list.appendChild(empty);
    state.voice = null;
    return;
  }

  if (!state.voice || !voices.some(v => v.shortName === state.voice.shortName)) {
    state.voice = voices[0];
  }

  for (const voice of voices) {
    const li = document.createElement("li");
    li.dataset.voice = voice.shortName;
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", voice.shortName === state.voice.shortName);
    if (voice.shortName === state.voice.shortName) li.classList.add("active");

    const name = document.createElement("span");
    name.className = "name";
    const genderIcon = document.createElement("span");
    genderIcon.className = `gender-icon ${voice.gender.toLowerCase()}`;
    genderIcon.textContent = voice.gender === "Female" ? "\u2640" : "\u2642";
    const label = document.createElement("span");
    label.textContent = voice.displayName;
    name.appendChild(genderIcon);
    name.appendChild(label);

    const preview = document.createElement("button");
    preview.type = "button";
    preview.className = "preview";
    preview.title = `Preview ${voice.displayName}`;
    preview.textContent = "\u25B6";
    preview.addEventListener("click", async event => {
      event.stopPropagation();
      await previewVoice(voice);
    });

    li.appendChild(name);
    li.appendChild(preview);
    li.addEventListener("click", () => {
      if (state.voice?.shortName === voice.shortName) return;
      state.voice = voice;
      renderVoices();
      savePrefs();
    });
    list.appendChild(li);
  }
};

// ---- segmented controls ------------------------------------------------

const wireSegmented = (selector, handler) => {
  const container = document.querySelector(selector);
  container.addEventListener("click", event => {
    const btn = event.target.closest(".seg");
    if (!btn) return;
    for (const sibling of container.querySelectorAll(".seg")) {
      sibling.classList.toggle("active", sibling === btn);
    }
    handler(btn);
  });
};

// ---- synthesis + preview ----------------------------------------------

const setStatus = (msg, level = "") => {
  const el = $("status");
  el.textContent = msg ?? "";
  el.className = `status${level ? ` ${level}` : ""}`;
};

const rateString = speed => {
  const delta = Math.round((speed - 1) * 100);
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta}%`;
};

const previewVoice = async voice => {
  try {
    setStatus(`Previewing ${voice.displayName}...`);
    const sample =
      voice.language === "Vietnamese"
        ? "Xin ch\u00e0o, c\u00f9ng h\u1ecdc vui nh\u00e9."
        : "Hello! Let's learn together.";
    const { audio } = await synthesize({
      text: sample,
      voice: voiceFullName(voice.shortName),
      rate: rateString(state.speed),
    });
    const url = URL.createObjectURL(audio);
    const audioEl = new Audio(url);
    audioEl.addEventListener("ended", () => URL.revokeObjectURL(url), {
      once: true,
    });
    await audioEl.play();
    setStatus("");
  } catch (err) {
    setStatus(`Preview failed: ${err.message}`, "error");
  }
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

const slugify = text => {
  const base = text
    .trim()
    .slice(0, 40)
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return base || "clip";
};

const setDownloadsEnabled = enabled => {
  $("download-mp3").disabled = !enabled;
  $("download-vtt").disabled = !enabled;
  $("download-srt").disabled = !enabled;
};

const showResult = ({ voice, text, audio, subtitle }) => {
  const url = URL.createObjectURL(audio);
  if (state.lastResult?.audioUrl) {
    URL.revokeObjectURL(state.lastResult.audioUrl);
  }
  state.lastResult = {
    voice,
    text,
    audioBlob: audio,
    audioUrl: url,
    subtitle,
    slug: slugify(text),
  };

  $("preview-empty").hidden = true;
  $("preview").hidden = false;
  $("preview-voice").textContent = voice.displayName;
  $("preview-text").textContent = text;
  const player = $("player");
  player.src = url;
  player.load();
  if (state.autoplay) {
    player.play().catch(() => {
      /* autoplay may be blocked; ignore */
    });
  }
  setDownloadsEnabled(true);
};

const onGenerate = async () => {
  const text = $("text").value.trim();
  if (!text) {
    setStatus("Enter some text to generate audio.", "error");
    return;
  }
  if (!state.voice) {
    setStatus("Pick a voice first.", "error");
    return;
  }

  const btn = $("generate");
  btn.disabled = true;
  setStatus("Generating audio...");
  try {
    const { audio, subtitle } = await synthesize({
      text,
      voice: voiceFullName(state.voice.shortName),
      rate: rateString(state.speed),
    });
    showResult({ voice: state.voice, text, audio, subtitle });
    setStatus(
      `Done. ${subtitle.length} word boundaries, ${Math.round(audio.size / 1024)} KB MP3.`,
      "ok"
    );
  } catch (err) {
    setStatus(`Generation failed: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
  }
};

// ---- init --------------------------------------------------------------

const init = () => {
  const prefs = loadPrefs();
  if (prefs) {
    if (LANGUAGES.includes(prefs.language)) state.language = prefs.language;
    if (prefs.gender === "Male" || prefs.gender === "Female") state.gender = prefs.gender;
    if (typeof prefs.speed === "number" && prefs.speed > 0) state.speed = prefs.speed;
    if (typeof prefs.autoplay === "boolean") state.autoplay = prefs.autoplay;
    if (prefs.voice) {
      const saved = findVoice(prefs.voice);
      if (saved) state.voice = saved;
    }
  }

  $("text").value = prefs?.text ?? DEFAULT_SAMPLE_TEXT;
  $("autoplay").checked = state.autoplay;

  for (const btn of document.querySelectorAll("[data-gender]")) {
    btn.classList.toggle("active", btn.dataset.gender === state.gender);
  }
  for (const btn of document.querySelectorAll("[data-speed]")) {
    btn.classList.toggle("active", Number(btn.dataset.speed) === state.speed);
  }

  renderLanguages();
  renderVoices();

  $("language").addEventListener("change", () => {
    state.language = $("language").value;
    state.voice = null;
    renderVoices();
    savePrefs();
  });

  wireSegmented(".panel.left .segmented", btn => {
    state.gender = btn.dataset.gender;
    state.voice = null;
    renderVoices();
    savePrefs();
  });

  wireSegmented(".panel.center .segmented", btn => {
    state.speed = Number(btn.dataset.speed);
    savePrefs();
  });

  $("autoplay").addEventListener("change", () => {
    state.autoplay = $("autoplay").checked;
    savePrefs();
  });

  $("text").addEventListener("input", () => savePrefs());

  $("generate").addEventListener("click", onGenerate);

  $("download-mp3").addEventListener("click", () => {
    const r = state.lastResult;
    if (!r) return;
    downloadBlob(r.audioBlob, `${r.slug}.mp3`);
  });

  $("download-vtt").addEventListener("click", () => {
    const r = state.lastResult;
    if (!r) return;
    const blob = new Blob([createVTT(r.subtitle)], { type: "text/vtt" });
    downloadBlob(blob, `${r.slug}.vtt`);
  });

  $("download-srt").addEventListener("click", () => {
    const r = state.lastResult;
    if (!r) return;
    const blob = new Blob([createSRT(r.subtitle)], {
      type: "application/x-subrip",
    });
    downloadBlob(blob, `${r.slug}.srt`);
  });
};

init();

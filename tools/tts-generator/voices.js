// Curated Edge TTS voice catalog for the simplified generator UI.
// Values match the `ShortName` field from Microsoft's voice listing and are
// passed through `voiceFullName()` in edge-tts.js when constructing SSML.
//
// Kept intentionally small: Vietnamese + English in both genders, plus a
// few multilingual voices that handle both locales well. Extend when new
// voices are needed for content work.

export const VOICES = [
  // Vietnamese
  {
    shortName: "vi-VN-HoaiMyNeural",
    language: "Vietnamese",
    locale: "vi-VN",
    gender: "Female",
    displayName: "Vietnamese - Hoai My",
  },
  {
    shortName: "vi-VN-NamMinhNeural",
    language: "Vietnamese",
    locale: "vi-VN",
    gender: "Male",
    displayName: "Vietnamese - Nam Minh",
  },

  // English - US female
  {
    shortName: "en-US-AnaNeural",
    language: "English",
    locale: "en-US",
    gender: "Female",
    displayName: "English - United States - Ana",
  },
  {
    shortName: "en-US-AriaNeural",
    language: "English",
    locale: "en-US",
    gender: "Female",
    displayName: "English - United States - Aria",
  },
  {
    shortName: "en-US-AvaMultilingualNeural",
    language: "English",
    locale: "en-US",
    gender: "Female",
    displayName: "English - United States - AvaMultilingual",
  },
  {
    shortName: "en-US-AvaNeural",
    language: "English",
    locale: "en-US",
    gender: "Female",
    displayName: "English - United States - Ava",
  },
  {
    shortName: "en-US-EmmaMultilingualNeural",
    language: "English",
    locale: "en-US",
    gender: "Female",
    displayName: "English - United States - EmmaMultilingual",
  },
  {
    shortName: "en-US-EmmaNeural",
    language: "English",
    locale: "en-US",
    gender: "Female",
    displayName: "English - United States - Emma",
  },
  {
    shortName: "en-US-JennyNeural",
    language: "English",
    locale: "en-US",
    gender: "Female",
    displayName: "English - United States - Jenny",
  },
  {
    shortName: "en-US-MichelleNeural",
    language: "English",
    locale: "en-US",
    gender: "Female",
    displayName: "English - United States - Michelle",
  },

  // English - US male
  {
    shortName: "en-US-AndrewMultilingualNeural",
    language: "English",
    locale: "en-US",
    gender: "Male",
    displayName: "English - United States - AndrewMultilingual",
  },
  {
    shortName: "en-US-AndrewNeural",
    language: "English",
    locale: "en-US",
    gender: "Male",
    displayName: "English - United States - Andrew",
  },
  {
    shortName: "en-US-BrianMultilingualNeural",
    language: "English",
    locale: "en-US",
    gender: "Male",
    displayName: "English - United States - BrianMultilingual",
  },
  {
    shortName: "en-US-BrianNeural",
    language: "English",
    locale: "en-US",
    gender: "Male",
    displayName: "English - United States - Brian",
  },
  {
    shortName: "en-US-ChristopherNeural",
    language: "English",
    locale: "en-US",
    gender: "Male",
    displayName: "English - United States - Christopher",
  },
  {
    shortName: "en-US-EricNeural",
    language: "English",
    locale: "en-US",
    gender: "Male",
    displayName: "English - United States - Eric",
  },
  {
    shortName: "en-US-GuyNeural",
    language: "English",
    locale: "en-US",
    gender: "Male",
    displayName: "English - United States - Guy",
  },
  {
    shortName: "en-US-RogerNeural",
    language: "English",
    locale: "en-US",
    gender: "Male",
    displayName: "English - United States - Roger",
  },
  {
    shortName: "en-US-SteffanNeural",
    language: "English",
    locale: "en-US",
    gender: "Male",
    displayName: "English - United States - Steffan",
  },

  // English - UK
  {
    shortName: "en-GB-SoniaNeural",
    language: "English",
    locale: "en-GB",
    gender: "Female",
    displayName: "English - United Kingdom - Sonia",
  },
  {
    shortName: "en-GB-RyanNeural",
    language: "English",
    locale: "en-GB",
    gender: "Male",
    displayName: "English - United Kingdom - Ryan",
  },

  // English - Australia
  {
    shortName: "en-AU-NatashaNeural",
    language: "English",
    locale: "en-AU",
    gender: "Female",
    displayName: "English - Australia - Natasha",
  },
  {
    shortName: "en-AU-WilliamNeural",
    language: "English",
    locale: "en-AU",
    gender: "Male",
    displayName: "English - Australia - William",
  },
];

export const LANGUAGES = Array.from(new Set(VOICES.map(v => v.language)));

export const filterVoices = (language, gender) =>
  VOICES.filter(
    v =>
      (!language || v.language === language) &&
      (!gender || v.gender === gender)
  );

export const findVoice = shortName =>
  VOICES.find(v => v.shortName === shortName) || null;

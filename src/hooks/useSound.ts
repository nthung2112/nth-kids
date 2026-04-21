import { useCallback, useRef } from "react";

import {
  COLOR_SPRITE_INDEX,
  LETTER_SPRITE_INDEX,
  NUMBER_SPRITE_INDEX,
  SHAPE_SPRITE_INDEX,
} from "@/data/audioSprites";
import type { ColorId } from "@/data/colors";
import type { ShapeId } from "@/data/shapes";
import { playSpriteSegment } from "@/lib/audio-sprite-player";

const MUTE_STORAGE_KEY = "soundMuted";

// Pentatonic C major scale: mọi note đều hoà với nhau, không có nốt chỏi
// → an toàn cho trẻ nhỏ, dùng làm bảng tra cho number/letter sounds
const PENTATONIC_SCALE = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.0, // G4
  440.0, // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
];

const FREQUENCY_FLOOR = 100;
const FREQUENCY_CEILING = 1200;

const isMuted = () => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MUTE_STORAGE_KEY) === "true";
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

interface PlayToneOptions {
  type?: OscillatorType;
  volume?: number;
  attack?: number;
  release?: number;
  lowpass?: number;
  detune?: number;
}

export const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const Ctor =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new Ctor();
    }
    return audioContextRef.current;
  }, []);

  // Phát một note đơn với envelope ADSR mượt + lowpass filter để loại
  // bỏ harmonic chói tai. Dùng làm building block cho mọi âm thanh khác.
  const playSoftTone = useCallback(
    (frequency: number, duration: number, options: PlayToneOptions = {}) => {
      if (isMuted()) return;

      const {
        type = "sine",
        volume = 0.16,
        attack = 0.025,
        release = 0.18,
        lowpass = 2200,
        detune = 0,
      } = options;

      try {
        const ctx = getAudioContext();
        if (ctx.state === "suspended") {
          void ctx.resume();
        }

        const now = ctx.currentTime;
        const safeFreq = clamp(frequency, FREQUENCY_FLOOR, FREQUENCY_CEILING);
        const safeDuration = Math.max(duration, attack + release);
        const sustainEnd = now + Math.max(safeDuration - release, attack);

        const oscillator = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(safeFreq, now);
        if (detune !== 0) {
          oscillator.detune.setValueAtTime(detune, now);
        }

        // Lowpass cắt harmonic >2.2kHz (mặc định) → hết chói
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(lowpass, now);
        filter.Q.setValueAtTime(0.707, now);

        // ADSR: bắt đầu từ ~0, ramp mượt lên volume, giữ rồi tắt mượt
        // exponentialRampToValueAtTime cần giá trị > 0 nên dùng 0.0001
        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(volume, now + attack);
        gainNode.gain.setValueAtTime(volume, sustainEnd);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + safeDuration);

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(now);
        oscillator.stop(now + safeDuration + 0.05);
      } catch (error) {
        console.warn("Audio not supported", error);
      }
    },
    [getAudioContext]
  );

  const playClickSound = useCallback(() => {
    // Click rất ngắn, êm tay - triangle 420Hz, lowpass thấp
    playSoftTone(420, 0.06, {
      type: "triangle",
      volume: 0.08,
      attack: 0.005,
      release: 0.04,
      lowpass: 1400,
    });
  }, [playSoftTone]);

  const playSuccessSound = useCallback(() => {
    // Arpeggio vui tươi C5-E5-G5
    playSoftTone(523.25, 0.22, { volume: 0.16 });
    setTimeout(() => playSoftTone(659.25, 0.22, { volume: 0.16 }), 110);
    setTimeout(() => playSoftTone(783.99, 0.32, { volume: 0.18 }), 220);
  }, [playSoftTone]);

  const playErrorSound = useCallback(() => {
    // Mềm, không "đe doạ" trẻ - F#4 ngắn hạn
    playSoftTone(369.99, 0.3, {
      type: "sine",
      volume: 0.13,
      lowpass: 1500,
      release: 0.22,
    });
  }, [playSoftTone]);

  const playNumberSound = useCallback(
    (number: number) => {
      const sprite = playSpriteSegment("numbers", NUMBER_SPRITE_INDEX[number]);
      if (sprite.scheduled) return;

      // Fallback synth: pentatonic mod 8 → mọi số đều cho ra note hài hoà
      const idx = ((number - 1) % PENTATONIC_SCALE.length + PENTATONIC_SCALE.length) % PENTATONIC_SCALE.length;
      playSoftTone(PENTATONIC_SCALE[idx], 0.45, {
        type: "sine",
        volume: 0.18,
        release: 0.28,
      });
    },
    [playSoftTone]
  );

  const playCountingSound = useCallback(
    (count: number) => {
      // Mỗi nhịp đếm dùng một bậc pentatonic kế tiếp, ngắn và mềm
      const safeCount = Math.min(count, 10);
      for (let i = 0; i < safeCount; i++) {
        setTimeout(() => {
          const idx = i % PENTATONIC_SCALE.length;
          playSoftTone(PENTATONIC_SCALE[idx], 0.18, {
            type: "triangle",
            volume: 0.12,
            attack: 0.015,
            release: 0.12,
            lowpass: 1800,
          });
        }, i * 260);
      }
    },
    [playSoftTone]
  );

  const playLetterSound = useCallback(
    (letter: string) => {
      const upper = letter.toUpperCase();
      const sprite = playSpriteSegment("alphabet", LETTER_SPRITE_INDEX[upper]);
      if (sprite.scheduled) return;

      // Fallback synth: A-Z vào pentatonic mod 8
      const letterIndex = Math.max(0, upper.charCodeAt(0) - 65);
      const idx = letterIndex % PENTATONIC_SCALE.length;
      playSoftTone(PENTATONIC_SCALE[idx], 0.5, {
        type: "sine",
        volume: 0.17,
        release: 0.3,
      });
    },
    [playSoftTone]
  );

  const playSequenceSound = useCallback(
    (sequence: string[]) => {
      // Real recordings have variable length; space them generously
      // so the previous letter finishes before the next starts.
      const SPRITE_SPACING_MS = 900;
      const FALLBACK_SPACING_MS = 460;
      sequence.forEach((letter, index) => {
        const upper = letter.toUpperCase();
        const hasSprite = LETTER_SPRITE_INDEX[upper] !== undefined;
        const spacing = hasSprite ? SPRITE_SPACING_MS : FALLBACK_SPACING_MS;
        setTimeout(() => playLetterSound(letter), index * spacing);
      });
    },
    [playLetterSound]
  );

  const playGameOverSound = useCallback(
    (isWin: boolean) => {
      if (isWin) {
        // Thắng: leo C5-E5-G5-C6 mượt
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, index) => {
          setTimeout(() => {
            playSoftTone(freq, 0.32, {
              type: "sine",
              volume: 0.18,
              release: 0.22,
            });
          }, index * 160);
        });
      } else {
        // Thua: "aww" giảm dần A4 → E4, không nhói
        playSoftTone(440.0, 0.32, {
          type: "sine",
          volume: 0.14,
          release: 0.22,
        });
        setTimeout(() => {
          playSoftTone(329.63, 0.5, {
            type: "sine",
            volume: 0.14,
            release: 0.35,
          });
        }, 220);
      }
    },
    [playSoftTone]
  );

  const playColorSound = useCallback(
    (colorId: string) => {
      const sprite = playSpriteSegment("colors", COLOR_SPRITE_INDEX[colorId as ColorId]);
      if (sprite.scheduled) return;

      // Fallback synth: each color = 1 pentatonic note
      const colorTones: Record<string, { freq: number; detune?: number }> = {
        red: { freq: 261.63 }, // C4
        yellow: { freq: 329.63 }, // E4
        green: { freq: 392.0 }, // G4
        blue: { freq: 523.25 }, // C5
        black: { freq: 196.0, detune: -8 }, // G3 - thấp ấm
        white: { freq: 587.33 }, // D5
        purple: { freq: 440.0, detune: -6 }, // A4
        orange: { freq: 349.23 }, // F4
        pink: { freq: 466.16 }, // Bb4
        brown: { freq: 220.0, detune: -10 }, // A3 - thấp ấm
      };

      const tone = colorTones[colorId];
      if (!tone) return;

      playSoftTone(tone.freq, 0.55, {
        type: "sine",
        volume: 0.18,
        release: 0.32,
        lowpass: 2000,
        detune: tone.detune,
      });
    },
    [playSoftTone]
  );

  const playShapeSound = useCallback(
    (shapeId: string) => {
      const sprite = playSpriteSegment("shapes", SHAPE_SPRITE_INDEX[shapeId as ShapeId]);
      if (sprite.scheduled) return;

      // Fallback synth: pentatonic note based on stable hash
      let h = 0;
      for (let i = 0; i < shapeId.length; i++) {
        h = (h * 31 + shapeId.charCodeAt(i)) | 0;
      }
      const idx = Math.abs(h) % PENTATONIC_SCALE.length;
      playSoftTone(PENTATONIC_SCALE[idx], 0.45, {
        type: "sine",
        volume: 0.16,
        release: 0.28,
      });
    },
    [playSoftTone]
  );

  return {
    playSuccessSound,
    playErrorSound,
    playClickSound,
    playNumberSound,
    playGameOverSound,
    playCountingSound,
    playLetterSound,
    playSequenceSound,
    playColorSound,
    playShapeSound,
  };
};

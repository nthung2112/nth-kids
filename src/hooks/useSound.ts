import { useCallback, useRef } from "react";

export const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.3) => {
      try {
        const audioContext = getAudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      } catch (error) {
        console.log("Audio not supported");
      }
    },
    [getAudioContext]
  );

  const playSuccessSound = useCallback(() => {
    // Âm thanh thành công - giai điệu vui vẻ
    playTone(523.25, 0.2); // C5
    setTimeout(() => playTone(659.25, 0.2), 100); // E5
    setTimeout(() => playTone(783.99, 0.3), 200); // G5
  }, [playTone]);

  const playErrorSound = useCallback(() => {
    // Âm thanh nhẹ nhàng khi sai - không làm trẻ sợ
    playTone(392, 0.3, "sine", 0.2); // G4 - âm thanh nhẹ nhàng
  }, [playTone]);

  const playClickSound = useCallback(() => {
    // Âm thanh click nhẹ
    playTone(800, 0.1, "square", 0.1);
  }, [playTone]);

  const playNumberSound = useCallback(
    (number: number) => {
      // Âm thanh cho mỗi số - tần số tăng dần
      const baseFreq = 261.63; // C4
      const frequency = baseFreq * Math.pow(1.122, number - 1); // Tăng theo bán cung
      playTone(frequency, 0.5, "triangle", 0.25);
    },
    [playTone]
  );

  const playGameOverSound = useCallback(
    (isWin: boolean) => {
      if (isWin) {
        // Giai điệu chiến thắng
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, index) => {
          setTimeout(() => playTone(freq, 0.3), index * 150);
        });
      } else {
        // Âm thanh động viên nhẹ nhàng
        playTone(440, 0.5, "sine", 0.2); // A4
      }
    },
    [playTone]
  );

  const playCountingSound = useCallback(
    (count: number) => {
      // Phát âm thanh đếm từng cái
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          playTone(523.25 + i * 50, 0.2, "triangle", 0.15);
        }, i * 300);
      }
    },
    [playTone]
  );

  const playLetterSound = useCallback(
    (letter: string) => {
      // Âm thanh cho mỗi chữ cái - tần số khác nhau
      const letterIndex = letter.charCodeAt(0) - 65; // A=0, B=1, ...
      const baseFreq = 220; // A3
      const frequency = baseFreq * Math.pow(1.059, letterIndex); // Tăng theo nửa cung
      playTone(frequency, 0.6, "sawtooth", 0.2);
    },
    [playTone]
  );

  const playSequenceSound = useCallback(
    (sequence: string[]) => {
      // Phát âm thanh cho chuỗi chữ cái
      sequence.forEach((letter, index) => {
        setTimeout(() => {
          const letterIndex = letter.charCodeAt(0) - 65;
          const baseFreq = 220; // A3
          const frequency = baseFreq * Math.pow(1.059, letterIndex);
          playTone(frequency, 0.4, "sawtooth", 0.2);
        }, index * 500); // Mỗi chữ cách nhau 0.5 giây
      });
    },
    [playTone]
  );

  const playColorSound = useCallback(
    (colorName: string) => {
      // Âm thanh cho mỗi màu - tần số và loại âm thanh khác nhau
      const colorFrequencies: {
        [key: string]: { freq: number; type: OscillatorType };
      } = {
        Đỏ: { freq: 261.63, type: "square" }, // C4 - âm vuông cho màu mạnh
        Vàng: { freq: 329.63, type: "triangle" }, // E4 - âm tam giác cho màu sáng
        "Xanh Lục": { freq: 392.0, type: "sine" }, // G4 - âm sin cho màu tự nhiên
        "Xanh Lam": { freq: 523.25, type: "sine" }, // C5 - âm cao cho màu mát
        Đen: { freq: 196.0, type: "square" }, // G3 - âm thấp cho màu tối
        Trắng: { freq: 783.99, type: "triangle" }, // G5 - âm cao sáng
        Tím: { freq: 440.0, type: "sawtooth" }, // A4 - âm răng cưa cho màu đặc biệt
      };

      const colorSound = colorFrequencies[colorName];
      if (colorSound) {
        playTone(colorSound.freq, 0.6, colorSound.type, 0.25);
      }
    },
    [playTone]
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
  };
};

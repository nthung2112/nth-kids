export interface AlphabetEntry {
  letter: string;
  emoji: string;
  color: string;
}

export const ALPHABET: AlphabetEntry[] = [
  { letter: "A", emoji: "🍎", color: "bg-red-100 border-red-300 hover:bg-red-200" },
  { letter: "B", emoji: "⚽", color: "bg-orange-100 border-orange-300 hover:bg-orange-200" },
  { letter: "C", emoji: "🐱", color: "bg-yellow-100 border-yellow-300 hover:bg-yellow-200" },
  { letter: "D", emoji: "🐶", color: "bg-green-100 border-green-300 hover:bg-green-200" },
  { letter: "E", emoji: "🐘", color: "bg-blue-100 border-blue-300 hover:bg-blue-200" },
  { letter: "F", emoji: "🐠", color: "bg-indigo-100 border-indigo-300 hover:bg-indigo-200" },
  { letter: "G", emoji: "🍇", color: "bg-purple-100 border-purple-300 hover:bg-purple-200" },
  { letter: "H", emoji: "🐴", color: "bg-pink-100 border-pink-300 hover:bg-pink-200" },
  { letter: "I", emoji: "🍦", color: "bg-red-100 border-red-300 hover:bg-red-200" },
  { letter: "J", emoji: "🍬", color: "bg-orange-100 border-orange-300 hover:bg-orange-200" },
  { letter: "K", emoji: "🪁", color: "bg-yellow-100 border-yellow-300 hover:bg-yellow-200" },
  { letter: "L", emoji: "🦁", color: "bg-green-100 border-green-300 hover:bg-green-200" },
  { letter: "M", emoji: "🐵", color: "bg-blue-100 border-blue-300 hover:bg-blue-200" },
  { letter: "N", emoji: "🪺", color: "bg-indigo-100 border-indigo-300 hover:bg-indigo-200" },
  { letter: "O", emoji: "🍊", color: "bg-purple-100 border-purple-300 hover:bg-purple-200" },
  { letter: "P", emoji: "🐼", color: "bg-pink-100 border-pink-300 hover:bg-pink-200" },
  { letter: "Q", emoji: "👸", color: "bg-red-100 border-red-300 hover:bg-red-200" },
  { letter: "R", emoji: "🐰", color: "bg-orange-100 border-orange-300 hover:bg-orange-200" },
  { letter: "S", emoji: "☀️", color: "bg-yellow-100 border-yellow-300 hover:bg-yellow-200" },
  { letter: "T", emoji: "🌳", color: "bg-green-100 border-green-300 hover:bg-green-200" },
  { letter: "U", emoji: "☂️", color: "bg-blue-100 border-blue-300 hover:bg-blue-200" },
  { letter: "V", emoji: "🏺", color: "bg-indigo-100 border-indigo-300 hover:bg-indigo-200" },
  { letter: "W", emoji: "🐋", color: "bg-purple-100 border-purple-300 hover:bg-purple-200" },
  { letter: "X", emoji: "🩻", color: "bg-pink-100 border-pink-300 hover:bg-pink-200" },
  { letter: "Y", emoji: "🧶", color: "bg-red-100 border-red-300 hover:bg-red-200" },
  { letter: "Z", emoji: "🦓", color: "bg-orange-100 border-orange-300 hover:bg-orange-200" },
];

export const ALPHABET_GAME_SUBSET: AlphabetEntry[] = ALPHABET.slice(0, 10);

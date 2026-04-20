export interface NumberData {
	number: number;
	vietnamese: string;
	emoji: string;
	items: string[];
	color: string;
}

const vietnameseNumbers: { [key: number]: string } = {
	1: "Một",
	2: "Hai",
	3: "Ba",
	4: "Bốn",
	5: "Năm",
	6: "Sáu",
	7: "Bảy",
	8: "Tám",
	9: "Chín",
	10: "Mười",
	11: "Mười một",
	12: "Mười hai",
	13: "Mười ba",
	14: "Mười bốn",
	15: "Mười lăm",
	16: "Mười sáu",
	17: "Mười bảy",
	18: "Mười tám",
	19: "Mười chín",
	20: "Hai mười",
	21: "Hai mười một",
	22: "Hai mười hai",
	23: "Hai mười ba",
	24: "Hai mười bốn",
	25: "Hai mười lăm",
	26: "Hai mười sáu",
	27: "Hai mười bảy",
	28: "Hai mười tám",
	29: "Hai mười chín",
	30: "Ba mười",
	40: "Bốn mười",
	50: "Năm mười",
	60: "Sáu mười",
	70: "Bảy mười",
	80: "Tám mười",
	90: "Chín mười",
	100: "Một trăm",
};

const numberEmojis = [
	"🍎",
	"🐱",
	"🌸",
	"🦋",
	"⭐",
	"🐠",
	"🎈",
	"🎁",
	"🌈",
	"🐝",
	"🍊",
	"🐶",
	"🌺",
	"🦄",
	"🌟",
	"🐙",
	"🎪",
	"🎂",
	"🌻",
	"🐢",
	"🍌",
	"🐰",
	"🌷",
	"🦜",
	"💫",
	"🐳",
	"🎨",
	"🧸",
	"🌹",
	"🐧",
	"🍇",
	"🐼",
	"🌼",
	"🦚",
	"✨",
	"🐬",
	"🎭",
	"🎪",
	"🌺",
	"🐨",
	"🍓",
	"🐯",
	"🌻",
	"🦩",
	"🌠",
	"🐋",
	"🎯",
	"🎊",
	"🌸",
	"🐘",
];

const colors = [
	"bg-red-100 border-red-300 hover:bg-red-200",
	"bg-orange-100 border-orange-300 hover:bg-orange-200",
	"bg-yellow-100 border-yellow-300 hover:bg-yellow-200",
	"bg-green-100 border-green-300 hover:bg-green-200",
	"bg-blue-100 border-blue-300 hover:bg-blue-200",
	"bg-indigo-100 border-indigo-300 hover:bg-indigo-200",
	"bg-purple-100 border-purple-300 hover:bg-purple-200",
	"bg-pink-100 border-pink-300 hover:bg-pink-200",
	"bg-teal-100 border-teal-300 hover:bg-teal-200",
	"bg-rose-100 border-rose-300 hover:bg-rose-200",
];

function getVietnameseName(num: number): string {
	if (vietnameseNumbers[num]) {
		return vietnameseNumbers[num];
	}

	// Tạo tên cho các số không có sẵn
	if (num <= 100) {
		const tens = Math.floor(num / 10);
		const ones = num % 10;

		if (tens === 0) return vietnameseNumbers[ones] || `Số ${num}`;
		if (ones === 0)
			return vietnameseNumbers[tens * 10] || `${vietnameseNumbers[tens]} mười`;
		if (ones === 1) return `${vietnameseNumbers[tens]} mười một`;
		if (ones === 5 && tens > 1) return `${vietnameseNumbers[tens]} mười lăm`;

		return `${vietnameseNumbers[tens]} mười ${vietnameseNumbers[ones]?.toLowerCase()}`;
	}

	return `Số ${num}`;
}

export function generateNumberData(maxNumber: number): NumberData[] {
	const numbers: NumberData[] = [];

	for (let i = 1; i <= maxNumber; i++) {
		const emoji = numberEmojis[(i - 1) % numberEmojis.length];
		const color = colors[(i - 1) % colors.length];

		// Tạo items array, nhưng giới hạn hiển thị để không quá tải
		const itemCount = Math.min(i, 10); // Tối đa hiển thị 10 items
		const items = Array(itemCount).fill(emoji);

		numbers.push({
			number: i,
			vietnamese: getVietnameseName(i),
			emoji,
			items,
			color,
		});
	}

	return numbers;
}

export function getNumberDisplayInfo(num: number) {
	// Thông tin hiển thị đặc biệt cho số lớn
	if (num <= 10) {
		return {
			showAllItems: true,
			gridCols: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
			cardSize: "p-6",
			numberSize: "text-6xl md:text-8xl",
			emojiSize: "text-4xl md:text-5xl",
		};
	} else if (num <= 30) {
		return {
			showAllItems: false,
			gridCols: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
			cardSize: "p-4",
			numberSize: "text-4xl md:text-6xl",
			emojiSize: "text-3xl md:text-4xl",
		};
	} else {
		return {
			showAllItems: false,
			gridCols: "grid-cols-4 md:grid-cols-6 lg:grid-cols-8",
			cardSize: "p-3",
			numberSize: "text-3xl md:text-5xl",
			emojiSize: "text-2xl md:text-3xl",
		};
	}
}

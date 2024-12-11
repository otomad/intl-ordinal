export interface OrdinalFormat {
	/** Does the specified locale has been supported in ordinal format? */
	readonly supports: boolean;

	/**
	 * Formats a number, bigint, or string to get its ordinal number form.
	 *
	 * If the specified locale isn't supported, return the string form of the value directly.
	 *
	 * @param value - The number or bigint to be formatted.
	 * @returns Ordinal number.
	 */
	format(value: number | bigint | string): string;
}

function f(formatHandler?: (abs: bigint | number, positive: boolean) => string): OrdinalFormat { // Get format function.
	if (!formatHandler)
		return Object.freeze({
			supports: false,
			format: value => String(value),
		} satisfies OrdinalFormat);
	else
		return Object.freeze({
			supports: true,
			format: value => {
				if (value == null || Number.isNaN(Number(value)))
					throw TypeError(`Invalid value: ${value}`);
				try {
					value = BigInt(value);
				} catch {
					value = Number(value);
				}
				const positive = value >= 0;
				const abs = positive ? value : -value;
				return formatHandler(abs, positive);
			},
		} satisfies OrdinalFormat);
}

const isIntPart = (abs: number | bigint, int: bigint) => abs === int || parseInt(String(abs)) === Number(int);

function n(strings: TemplateStringsArray, ...interpolations: (string | number | bigint)[]) {
	const stringBuilder: string[] = [];
	let i = 0;
	for (; i < interpolations.length; i++) {
		const string = strings[i], interpolation = interpolations[i];
		stringBuilder.push(string);
		stringBuilder.push(interpolation === Infinity || interpolation === -Infinity ? "n" : String(interpolation));
	}
	stringBuilder.push(strings[i]);
	return stringBuilder.join("");
}

/**
 * Get the ordinal number formatter.
 * @param locale - A locale string or a `Intl.Locale` object.
 * @returns An ordinal number formatter for the specified locale.
 */
export default function ordinal(locale: string | Intl.Locale, { gender = "male" }: {
	/** Gender information for some languages: male or female. Defaults to male. */
	gender?: "male" | "female";
} = {}): OrdinalFormat {
	if (typeof locale === "string") locale = new Intl.Locale(locale);
	locale = locale.maximize();
	const { language, script, region } = locale;
	const isFemale = gender === "female";
	// const pluralRules = new Intl.PluralRules(locale, { type: "ordinal" });
	// Intl.PluralRules doesn't support BigInt.
	switch (language) {
		/**
		 * ### English
		 * 1st, 2nd, 3rd, 4th, …, 11th, 12th, 13th, …, 21st, 22nd, 23rd, …
		 * last, 2nd to last, 3rd to last, …
		 * 0th, nth
		 */
		case "en":
			return f((abs, positive) => {
				const suffix = typeof abs === "number" ? "th" :
					abs % 10n === 1n && abs % 100n !== 11n ? "st" :
					abs % 10n === 2n && abs % 100n !== 12n ? "nd" :
					abs % 10n === 3n && abs % 100n !== 13n ? "rd" : "th";
				const result = n`${abs}${suffix}`;
				return positive ? result : abs === 1n ? "last" : `${result} to last`;
			});
		/**
		 * ### Chinese
		 * Simplified:
		 * 第1、第2、第3、⋯⋯
		 * 倒数第1、倒数第2、倒数第3、⋯⋯
		 * 第0、第n
		 *
		 * Traditional:
		 * 第1、第2、第3、⋯⋯
		 * 倒數第1、倒數第2、倒數第3、⋯⋯
		 * 第0、第n
		 */
		case "zh":
			return f((abs, positive) => {
				const result = n`第${abs}`;
				const prefix = script === "Hant" ? "倒數" : "倒数";
				return positive ? result : prefix + result;
			});
		/**
		 * ### Japanese
		 * 1番目、2番目、3番目、⋯⋯
		 * 最後、最後から2番目、最後から3番目、⋯⋯
		 * 0番目、n番目
		 */
		case "ja":
			return f((abs, positive) => {
				const result = n`${abs}番目`;
				return positive ? result : abs === 1n ? "最後" : `最後から${result}`;
			});
		/**
		 * ### Korean
		 * 1번째, 2번째, 3번째, …
		 * 마지막에서 1번째, 마지막에서 2번째, 마지막에서 3번째, …
		 * 0번째, n번째
		 */
		case "ko":
			return f((abs, positive) => {
				const result = n`${abs}번째`;
				return positive ? result : `마지막에서 ${result}`;
			});
		/**
		 * ### Vietnamese
		 * thứ 1, thứ 2, thứ 3, …
		 * thứ 1 đến cuối cùng, thứ 2 đến cuối cùng, thứ 3 đến cuối cùng, …
		 * thứ 0, thứ n
		 */
		case "vi":
			return f((abs, positive) => {
				// Unicode mistakenly marked the Vietnamese 1st as a special format.
				const result = n`thứ ${abs}`;
				return positive ? result : `${result} đến cuối cùng`;
			});
		/**
		 * ### Indonesian, Malay
		 * pertama, ke-2, ke-3, …
		 * terakhir, ke-2 terakhir, ke-3 terakhir, …
		 * ke-0, ke-n
		 */
		case "id":
		case "ms":
			return f((abs, positive) => {
				if (abs === 1n) return positive ? "pertama" : "terakhir";
				const result = n`ke-${abs}`;
				return positive ? result : `${result} terakhir`;
			});
		/**
		 * ### French
		 * 1er, 2ème, 3ème, …
		 * 1er avant dernier, 2ème avant dernier, 3ème avant dernier, …
		 * 0ème, nième
		 */
		case "fr":
			return f((abs, positive) => {
				const suffix = abs === 1n ? "er" : "ème";
				const result = `${abs === Infinity ? "ni" : abs}${suffix}`;
				return positive ? result : `${result} avant dernier`;
			});
		/**
		 * ### Spanish, Portuguese
		 * Male:
		 * 1.º, 2.º, 3.º, …
		 * 1.º al último, 2.º al último, 3.º al último, …
		 * 0.º, n.º
		 *
		 * Female:
		 * 1.ª, 2.ª, 3.ª, …
		 * 1.ª a la última, 2.ª a la última, 3.ª a la última, …
		 * 0.ª, n.ª
		 */
		case "es":
		case "pt":
			return f((abs, positive) => {
				const suffix = isFemale ? ".ª" : ".º";
				const result = n`${abs}${suffix}`;
				const last = isFemale ? "a la última" : "al último";
				return positive ? result : `${result} ${last}`;
			});
		/**
		 * ### Italian
		 * Male:
		 * il 1º, il 2º, il 3º, …, l’8º, il 9º, …, l’11º, il 12º, …, l’80º, l’81º, …, l’800º, …
		 * l’ultimo, il 2º dall’ultimo, il 3º dall’ultimo, …
		 * il 0º, l'n-esimo
		 *
		 * Female:
		 * la 1º, la 2º, la 3º, …, l’8º, la 9º, …, l’11º, la 12º, …, l’80º, l’81º, …, l’800º, …
		 * l’ultima, la 2º dall’ultima, la 3º dall’ultima, …
		 * la 0º, l’n-esima
		 */
		// Formula to calculate the highest digit of a number:
		// ⌊n⁄(10⌊log₁₀n⌋)⌋
		// floor(n / 10 / floor(log(n, 10)))
		case "it":
			return f((abs, positive) => {
				const suffixSuperscript = isFemale ? "ª" : "º";
				const suffix = isFemale ? "a" : "o";
				// Unicode only marked 8, 11, 80, 800 to use definite article "l’", but not for 8* (81, 888, 8000, ...).
				const the =
					isIntPart(abs, 11n) ||
					abs === Infinity ||
					abs.toString()[0] === "8" ||
					!positive && isIntPart(abs, 1n) ?
						"l’" :
						isFemale ? "la " : "il ";
				const result = abs === Infinity ? "n-esim" + suffix : abs + suffixSuperscript;
				const last = "dall’ultim" + suffix;
				return the + (positive ? result : abs === 1n ? "ultim" + suffix : `${result} ${last}`);
			});
		/**
		 * ### German
		 * 1., 2., 3., …
		 * 1. letzte, 2. letzte, 3. letzte, …
		 * 0., x-te
		 */
		case "de":
			return f((abs, positive) => {
				const result = abs === Infinity ? "x-te" : abs + ".";
				return positive ? result : `${result} letzte`;
			});
		/**
		 * ### Russian
		 * 1-й, 2-й, 3-й, …
		 * последний, 2-й до последнего, 3-й до последнего, …
		 * 0-й, н-й
		 */
		case "ru":
			return f((abs, positive) => {
				const result = `${abs === Infinity ? "н" : abs}-й`;
				return positive ? result : abs === 1n ? "последний" : `${result} до последнего`;
			});
		default:
			return f();
	}
}

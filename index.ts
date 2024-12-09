interface OrdinalFormat {
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

export default function ordinal(locale: string | Intl.Locale, { gender = "male" }: {
	gender?: "male" | "female";
} = {}): OrdinalFormat {
	if (typeof locale === "string") locale = new Intl.Locale(locale);
	locale = locale.maximize();
	const { language, script, region } = locale;
	// const pluralRules = new Intl.PluralRules(locale, { type: "ordinal" });
	// Intl.PluralRules doesn't support BigInt.
	switch (language) {
		case "en":
			return f((abs, positive) => {
				const suffix = typeof abs === "number" ? "th" :
					abs % 10n === 1n && abs % 100n !== 11n ? "st" :
					abs % 10n === 2n && abs % 100n !== 12n ? "nd" :
					abs % 10n === 3n && abs % 100n !== 13n ? "rd" : "th";
				const result = n`${abs}${suffix}`;
				return positive ? result : abs === 1n ? "last" : `${result} to last`;
			});
		case "zh":
			return f((abs, positive) => {
				const result = n`第${abs}`;
				const prefix = script === "Hant" ? "倒數" : "倒数";
				return positive ? result : prefix + result;
			});
		case "ja":
			return f((abs, positive) => {
				const result = n`${abs}番目`;
				return positive ? result : `最後から${result}`;
			});
		case "ko":
			return f((abs, positive) => {
				const result = n`${abs}번째`;
				return positive ? result : `${result}에서`;
			});
		case "vi":
			return f((abs, positive) => {
				// Unicode mistakenly marked the Vietnamese 1st as a special format.
				const result = n`thứ ${abs}`;
				return positive ? result : `${result} đến cuối cùng`;
			});
		case "id":
			return f((abs, positive) => {
				const result = n`ke-${abs}`;
				return positive ? result : `${result} terakhir`;
			});
		case "fr":
			return f((abs, positive) => {
				const suffix = abs === 1n ? "er" : "ème";
				const result = `${abs === Infinity ? "ni" : abs}${suffix}`;
				return positive ? result : `${result} avant dernier`;
			});
		case "es":
			return f((abs, positive) => {
				const suffix = gender === "female" ? ".ª" : ".º";
				const result = n`${abs}${suffix}`;
				return positive ? result : `${result} avant dernier`;
			});
		default:
			return f();
	}
}

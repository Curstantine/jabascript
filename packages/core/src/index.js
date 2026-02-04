/**
 * Returns this value if it satisfies the given {@link predicate} or null, if it doesn't.
 *
 * @template T
 * @param {T} source
 * @param {(value: T) => boolean} predicate
 *
 * @returns T | null
 * @see https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/take-if.html
 */
export function takeIf(source, predicate) {
	return predicate(source) ? source : null;
}

/**
 * Returns this value if it doesn't satisfy the given {@link predicate} or null, if it does.
 *
 * @param {T} source
 * @param {(value: T) => boolean} predicate
 *
 * @returns T | null
 * @see https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/take-unless.html
 */
export function takeUnless(source, predicate) {
	return takeIf(source, (x) => !predicate(x));
}

/**
 * Returns the transformed value returned by {@link map} if {@link source} conforms to {@link predicate}
 *
 * @template T, Z
 * @param {T} source
 * @param {(value: NonNullable<T>) => Z} map
 * @param {(value: T) => boolean} predicate
 *
 * @returns {Z | null}
 */
export function takeMapped(source, map, predicate = (x) => x !== null && x !== undefined) {
	if (!predicate(source)) return null;
	return map(source);
}

/**
 * Debounce a function caller in a {@link delay} window.
 *
 * @template T
 * @param {(arg0: T) => void} func
 * @param {number} delay - in ms
 *
 * @return {{ run: (arg0: T, customDelay?: number) => void, clear: () => void }}
 */
export function debounce(func, delay = 1000) {
	/** @type { number } */
	let timeoutId;

	return {
		run: (arg0, customDelay = delay) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => func.call(this, arg0), customDelay);
		},
		clear: () => clearTimeout(timeoutId),
	};
}

export async function wait(delay = 1000) {
	await new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Clamps a value between min and max.
 *
 * @example
 * clamp(24, [20, 25]); // 24
 * clamp(26, [20, 25]); // 25
 * clamp(19, [20, 25]); // 20
 *
 * @param {number} value source value
 * @param {[number, number]} minmax [min, max] numbers
 */
export function clamp(value, [min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER]) {
	return Math.max(min, Math.min(value, max));
}

/**
 * Creates initials from first and last values, with optional separator and fallback.
 *
 * @example
 * getInitials("John", "Doe"); // "JD"
 * getInitials("Alice", ""); // "Al"
 * getInitials("", "Smith"); // "Sm"
 * getInitials("", "", { none: "??" }); // "??"
 * getInitials("John", "Doe", { separator: "_" }); // "J_D"
 *
 * @param {string} first - First value
 * @param {string} last - Last value
 * @param {Object} options - Configuration options
 * @param {string} [options.none="N/A"] - Fallback when no values available
 * @param {string} [options.separator=""] - Separator between initials (e.g., "", " ", "_")
 *
 * @returns {string} Generated initials
 */
export function getInitials(first, last, { none, separator } = { none: "N/A", separator: "" }) {
	if (first && last) return `${first[0]}${separator}${last[0]}`.toUpperCase();

	if (first) {
		const initials = first.slice(0, 2);
		return initials;
	}

	if (last) {
		const initials = last.slice(0, 2);
		return initials;
	}

	return none;
}

/**
 * @typedef {string | number | null | undefined} Primitives
 */

/**
 * @typedef {[Record<T, string>, T]} Option
 * @template {string} T
 */

/**
 * Convenience wrapper around {@link URLSearchParams} to easily construct search query parameters.
 *
 * - `string | number`: directly passed to the parameter
 * - `null | undefined`: Skipped unless specified by {@link allowFalsy}
 * - `[Record<string, T>, T]`: Keyed into. The record will be used as a source, and the second value is used as the key.
 * - `(string | number | null | undefined)[]`: Appended into the params.
 *
 * @example
 * const params = createQueryParams({ limit: 10, search: "watermelon", offset: undefined, "tagIds[]": [123, 321], mode: [{ eager: "Eager", meager: "Meager" }, "eager"] })
 * params.toString(); // returns ?limit=10&search=watermelon&tagIds[]=123&tagIds[]=321&mode=Eager
 *
 * @example <caption>With `allowFalsy` flag enabled</caption>
 * const params = createQueryParams({ limit: 10, search: "watermelon", offset: undefined, "tagIds[]": [123, 321] }, true);
 * params.toString(); // returns ?limit=10&search=watermelon&offset=undefined&tagIds[]=123&tagIds[]=321
 *
 * @param {Record<string, Primitives | Option | Primitives[]} [params={}]
 * @param {boolean} [allowFalsy=false] Allows `null` and `undefined` to be serialized as params.
 *
 * @returns {URLSearchParams}
 */
export function createSearchParams(params = {}, allowFalsy = false) {
	const source = new URLSearchParams();

	const x = Object.entries(params);
	for (let i = 0; i < x.length; i++) {
		const [key, val] = x[i];

		if (!allowFalsy && (val === undefined || val === null)) continue;

		if (Array.isArray(val)) {
			if (val.length === 2) {
				const [obj, objKey] = val;
				if (!!obj && typeof obj === "object" && typeof objKey === "string") {
					source.set(key, obj[objKey]);
					continue;
				}
			}

			val.forEach((x) => source.append(key, x));
			continue;
		}

		source.set(key, val);
	}

	return source;
}

/**
 * Convenience wrapper around {@link createSearchParams} and {@link URL} to easily construct a url.
 *
 * NOTE: When you pass a URL class to {@link base}, it will be cloned, and the existing search params will be replaced.
 *
 * @example
 * const url = createURL("https://example.com", { limit: 10, search: "watermelon", offset: undefined, "tagIds[]": [123, 321], mode: [{ eager: "Eager", meager: "Meager" }, "eager"] })
 * url.toString() // returns https://example.com?limit=10&search=watermelon&tagIds[]=123&tagIds[]=321&mode=Eager
 *
 * @example <caption>With a URL</caption>
 * const API_SOURCE = new URL("https://example.com");
 * const url = createURL(API_SOURCE, { limit: 10, search: "watermelon", offset: undefined, "tagIds[]": [123, 321] })
 * url.toString() // returns https://example.com?limit=10&search=watermelon&tagIds[]=123&tagIds[]=321
 * API_SOURCE.toString() // returns https://example.com <- Source stays pure.
 *
 * @example <caption>With a URL and search params</caption>
 * const API_SOURCE = new URL("https://example.com?this_is_removed=true");
 * const url = createURL(API_SOURCE, { limit: 10, search: "watermelon", offset: undefined, "tagIds[]": [123, 321] })
 * url.toString() // returns https://example.com?limit=10&search=watermelon&tagIds[]=123&tagIds[]=321 <- Existing search params replaced
 * API_SOURCE.toString() // returns https://example.com?this_is_removed=true <- Source stays pure
 *
 * @example <caption>With `allowFalsy` flag enabled</caption>
 * const url = createURL("https://example.com", { limit: 10, search: "watermelon", offset: undefined, "tagIds[]": [123, 321] }, true);
 * url.toString(); // returns https://example.com?limit=10&search=watermelon&offset=undefined&tagIds[]=123&tagIds[]=321
 *
 * @param {string | URL} base
 * @param {Record<string, Primitives | Option | ArrayLike<Primitives>>} [params={}]
 * @param {boolean} [allowFalsy=false] Allows `null` and `undefined` to be serialized as params.
 *
 * @returns {URL}
 *
 * @see {@link createSearchParams}
 */
export function createURL(base, params = {}, allowFalsy = false) {
	const url = new URL(base);
	url.search = createSearchParams(params, allowFalsy).toString();

	return url;
}

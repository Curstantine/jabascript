/**
 * @typedef {string | number | null | undefined} Primitives
 */
/**
 * Convenience wrapper around {@link URLSearchParams} to easily construct search query parameters.
 *
 * @example
 * const params = createQueryParams({ limit: 10, search: "watermelon", offset: undefined, "tagIds[]": [123, 321] })
 * const searchString = params.toString(); // returns ?limit=10&search=watermelon&tagIds[]=123&tagIds[]=321
 *
 * @example <caption>With `allowFalsy` flag enabled</caption>
 * const params = createQueryParams({ limit: 10, search: "watermelon", offset: undefined, "tagIds[]": [123, 321] }, true);
 * const searchString = params.toString(); // returns ?limit=10&search=watermelon&offset=undefined&tagIds[]=123&tagIds[]=321
 *
 * @param {{ [key: string]: Primitives | ArrayLike<Primitives> }} [params={}]
 * @param {boolean} [allowFalsy=false] Allows `null` and `undefined` to be serialized as params.
 *
 * @returns {URLSearchParams}
 */
export function createSearchParams(params?: {
    [key: string]: Primitives | ArrayLike<Primitives>;
}, allowFalsy?: boolean): URLSearchParams;
export type Primitives = string | number | null | undefined;
//# sourceMappingURL=query.d.ts.map
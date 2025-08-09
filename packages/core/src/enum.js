/**
 * @template T
 * @typedef {[keyof T, T[keyof T]][]} ReadonlyRecordEntriesType
 */

/**
 * @template T
 * @typedef {(keyof T)[]} ReadonlyRecordKeysType
 */

/**
 * @template T
 * @typedef {T[keyof T][]} ReadonlyRecordValuesType
 */

/**
 * @template T
 * @typedef {Readonly<T> & {
 *   keys: () => ReadonlyRecordKeysType<T>,
 *   values: () => ReadonlyRecordValuesType<T>,
 *   entries: () => ReadonlyRecordEntriesType<T>
 * }} EnumLike
 */

/**
 * Creates a frozen enum-like object with keys, values, and entries methods.
 *
 * ### Note
 * To get the complete type support, cast the passing enumLike value as a const.
 * For jsdoc, this could be done by `/**@type {const}*⁣/`
 *
 * @example
 * // Typescript
 * const Color = createEnum({ Red: "RED", Blue: "BLUE" } as const);
 *
 * // Javascript (JSDoc)
 * const Color = createEnum(/**@type {const}*⁣/({
 * 	Red: "RED",
 * 	Blue: "BLUE"
 * }))
 *
 * @template {Record<string, string | number | symbol>} T
 * @param {T} enumLike
 * @returns {EnumLike<T>}
 */
export function createEnum(enumLike) {
	return Object.freeze({
		...enumLike,
		keys: () => Object.keys(enumLike),
		values: () => Object.values(enumLike),
		entries: () => Object.entries(enumLike),
	});
}

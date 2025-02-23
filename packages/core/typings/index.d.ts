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
export function takeIf<T>(source: T, predicate: (value: T) => boolean): T | null;
/**
 * Returns this value if it doesn't satisfy the given {@link predicate} or null, if it does.
 *
 * @param {T} source
 * @param {(value: T) => boolean} predicate
 *
 * @returns T | null
 * @see https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/take-unless.html
 */
export function takeUnless(source: T, predicate: (value: T) => boolean): any;
/**
 * Returns the transformed value returned by {@link map} if {@link source} conforms to {@link predicate}
 *
 * @template T, Z
 * @param {T} source
 * @param {(value: T) => Z} map
 * @param {(value: T) => boolean} predicate
 *
 * @returns {Z | null}
 */
export function takeMapped<T, Z>(source: T, map: (value: T) => Z, predicate?: (value: T) => boolean): Z | null;
/**
 * Debounce a function caller in a {@link delay} window.
 *
 * @template T
 * @param {(arg0: T) => void} func
 * @param {number} delay - in ms
 *
 * @return {{ run: (arg0: T, customDelay?: number) => void, clear: () => void }}
 */
export function debounce<T>(func: (arg0: T) => void, delay?: number): {
    run: (arg0: T, customDelay?: number) => void;
    clear: () => void;
};
export function wait(delay?: number): Promise<void>;
//# sourceMappingURL=index.d.ts.map
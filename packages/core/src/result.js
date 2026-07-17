/**
 * @constant {symbol} empty
 */
export const empty = Symbol("empty");

/**
 * Represents the outcome of an operation that can either succeed (`Ok`) or fail (`Err`).
 *
 * `Result` provides a type-safe way to handle errors functionally without relying on try-catch blocks or throwing exceptions.
 *
 * ## Falsy Values
 * Because the constructor uses the nullish coalescing operator (`?? empty`) to fallback,
 * passing `null` or `undefined` will cause them to coalesce to the `empty` symbol.
 * Other falsy values (such as `0`, `false`, `""`) are preserved.
 *
 * @example
 * // 1. Creating and unwrapping results
 * const success = Result.ok(42);
 * if (success.isOk) {
 *   console.log(success.unwrap()); // 42
 * }
 *
 * const failure = Result.err(new Error("Something went wrong"));
 * if (failure.isErr) {
 *   console.error(failure.unwrapErr()); // Error: Something went wrong
 * }
 *
 * @example
 * // 2. Safe execution using Result.run
 * const result = Result.run(
 *   () => JSON.parse('{"status": "ok"}'),
 *   (error) => new Error("Invalid JSON: " + error.message)
 * );
 *
 * @example
 * // 3. Transforming results
 * const doubled = Result.ok(10)
 *   .map(x => x * 2)
 *   .unwrap(); // 20
 *
 * @template T The type of the value in the Ok case.
 * @template E The type of the error in the Err case.
 */
export class Result {
	/** @type {T | typeof empty} */
	value;

	/** @type {E | typeof empty} */
	error;

	/**
	 * @param {T | typeof empty} value
	 * @param {E | typeof empty} error
	 */
	constructor(value, error) {
		this.error = error ?? empty;
		this.value = value ?? empty;
	}

	/**
	 * @returns {this is Result<T, typeof empty>}
	 */
	get isOk() {
		return this.value !== empty;
	}

	/**
	 * @returns {this is Result<typeof empty, E>}
	 */
	get isErr() {
		return this.error !== empty;
	}

	/**
	 * Unwraps a result, yielding the content of an `Ok`.
	 *
	 * @returns {T}
	 * @throws {E} When called on an `Err` value
	 */
	unwrap() {
		if (this.value === empty) throw this.error;
		return this.value;
	}

	/**
	 * Unwraps a result, yielding the content of an `Err`.
	 *
	 * @returns {E}
	 * @throws {Error} When called on an `Ok` value
	 */
	unwrapErr() {
		if (this.error === empty) {
			throw new Error("called `Result.unwrapErr()` on an `Ok` value");
		}

		return this.error;
	}

	/**
	 * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value, leaving an `Err` value untouched.
	 *
	 * @template U
	 * @param {(value: T) => U} fn
	 * @returns {Result<U, E>}
	 */
	map(fn) {
		if (this.value === empty) return /** @type {any} */ (this);
		return Result.ok(fn(this.value));
	}

	/**
	 * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value, leaving an `Ok` value untouched.
	 *
	 * @template F
	 * @param {(error: E) => F} fn
	 * @returns {Result<T, F>}
	 */
	mapErr(fn) {
		if (this.error === empty) return /** @type {any} */ (this);
		return Result.err(fn(this.error));
	}

	/**
	 * Calls `fn` if the result is `Ok`, otherwise returns the `Err` value of `this`.
	 *
	 * @template U, F
	 * @param {(value: T) => Result<U, F>} fn
	 * @returns {Result<U, E | F>}
	 */
	andThen(fn) {
		if (this.value === empty) return /** @type {any} */ (this);
		return fn(this.value);
	}

	/**
	 * Calls `fn` if the result is `Err`, otherwise returns the `Ok` value of `this`.
	 *
	 * @template U, F
	 * @param {(error: E) => Result<U, F>} fn
	 * @returns {Result<T | U, F>}
	 */
	orElse(fn) {
		if (this.error === empty) return /** @type {any} */ (this);
		return fn(this.error);
	}

	/**
	 * Returns the contained `Ok` value or a provided default.
	 *
	 * @template U
	 * @param {U} defaultValue
	 * @returns {T | U}
	 */
	unwrapOr(defaultValue) {
		if (this.value === empty) return defaultValue;
		return this.value;
	}

	/**
	 * Returns the contained `Ok` value or computes it from a closure.
	 *
	 * @template U
	 * @param {(error: E) => U} fn
	 * @returns {T | U}
	 */
	unwrapOrElse(fn) {
		if (this.value === empty) return fn(this.error);
		return this.value;
	}

	/**
	 * @template T
	 *
	 * @param {T} value
	 * @returns {Result<T, typeof empty>}
	 */
	static ok(value) {
		return new Result(value, empty);
	}

	/**
	 * @template E
	 *
	 * @param {E} error
	 * @returns {Result<typeof empty, E>}
	 */
	static err(error) {
		return new Result(empty, error);
	}

	/**
	 * @template T, E
	 *
	 * @param {() => T} fn
	 * @param {null | ((e: unknown) => E)} [err=null]
	 *
	 * @returns {Result<T, E>}
	 */
	static run(fn, err = null) {
		try {
			return Result.ok(fn());
		} catch (error) {
			return Result.err(err === null ? /** @type {any} */ (error) : err(error));
		}
	}

	/**
	 * @template T, E
	 *
	 * @param {() => Promise<T>} fn
	 * @param {null | ((e: unknown) => E)} [err=null]
	 * @returns {Promise<Result<T, E>>}
	 */
	static async runAsync(fn, err = null) {
		try {
			return Result.ok(await fn());
		} catch (error) {
			return Result.err(err === null ? /** @type {any} */ (error) : err(error));
		}
	}
}

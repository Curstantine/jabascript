/**
 * @constant {symbol} empty
 */
export const empty = Symbol("empty");

/**
 * @template T, E
 */
export default class Result {
	/** @type {T | typeof empty} */
	value;

	/** @type {E | typeof empty} */
	error;

	/**
	 * @param {T | typeof empty} value
	 * @param {E | typeof empty} error
	 */
	constructor(value, error) {
		this.error = error;
		this.value = value;
	}

	/**
	 * @returns {this is Result<T, typeof empty>}
	 */
	isOk() {
		return this.value !== empty;
	}

	/**
	 * @returns {this is Result<typeof empty, E>}
	 */
	isErr() {
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
	 * @returns {Result<T, E>} error
	 */
	static err(error) {
		return new Result(empty, error);
	}

	/**
	 * @template T, E
	 *
	 * @param {() => T} fn
	 * @param {(e: unknown) => E} err
	 *
	 * @returns {Result<T, E>}
	 */
	static run(fn, err) {
		try {
			return Result.ok(fn());
		} catch (error) {
			return Result.err(err(error));
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
			return Result.ok(await fn.call(null));
		} catch (error) {
			return Result.err(err === null ? error : err.call(null, error));
		}
	}
}

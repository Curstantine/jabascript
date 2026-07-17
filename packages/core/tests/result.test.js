import { describe, expect, it } from "vitest";

import { Result } from "../src/result.js";

describe("Result", () => {
	describe("ok", () => {
		it("should create an Ok result", () => {
			const res = Result.ok(42);
			expect(res.isOk).toBe(true);
			expect(res.isErr).toBe(false);
			expect(res.unwrap()).toBe(42);
			expect(() => res.unwrapErr()).toThrow("called `Result.unwrapErr()` on an `Ok` value");
		});
	});

	describe("err", () => {
		it("should create an Err result", () => {
			const res = Result.err("some error");
			expect(res.isOk).toBe(false);
			expect(res.isErr).toBe(true);
			expect(res.unwrapErr()).toBe("some error");
			expect(() => res.unwrap()).toThrow("some error");
		});
	});

	describe("run", () => {
		it("should run successfully and return Ok result", () => {
			const res = Result.run(() => 10 + 5);
			expect(res.isOk).toBe(true);
			expect(res.unwrap()).toBe(15);
		});

		it("should catch errors and return Err result", () => {
			const res = Result.run(() => {
				throw new Error("fail");
			});
			expect(res.isErr).toBe(true);
			expect(res.unwrapErr()).toBeInstanceOf(Error);
			expect(/** @type {Error} */ (res.unwrapErr()).message).toBe("fail");
		});

		it("should map the caught error if mapper is provided", () => {
			const res = Result.run(
				() => {
					throw new Error("fail");
				},
				(err) => (err instanceof Error ? err.message : "unknown"),
			);
			expect(res.isErr).toBe(true);
			expect(res.unwrapErr()).toBe("fail");
		});
	});

	describe("runAsync", () => {
		it("should run asynchronously successfully and return Ok result", async () => {
			const res = await Result.runAsync(async () => 10 + 5);
			expect(res.isOk).toBe(true);
			expect(res.unwrap()).toBe(15);
		});

		it("should catch async errors and return Err result", async () => {
			const res = await Result.runAsync(async () => {
				throw new Error("fail async");
			});
			expect(res.isErr).toBe(true);
			expect(res.unwrapErr()).toBeInstanceOf(Error);
			expect(/** @type {Error} */ (res.unwrapErr()).message).toBe("fail async");
		});

		it("should map async caught error if mapper is provided", async () => {
			const res = await Result.runAsync(
				async () => {
					throw new Error("fail async");
				},
				(err) => (err instanceof Error ? err.message : "unknown"),
			);
			expect(res.isErr).toBe(true);
			expect(res.unwrapErr()).toBe("fail async");
		});
	});

	describe("map", () => {
		it("should map Ok value", () => {
			const res = Result.ok(10).map((x) => x * 2);
			expect(res.unwrap()).toBe(20);
		});

		it("should not map Err value", () => {
			const res = Result.err("error").map((x) => x * 2);
			expect(res.unwrapErr()).toBe("error");
		});
	});

	describe("mapErr", () => {
		it("should map Err value", () => {
			const res = Result.err("error").mapErr((err) => `${err}!`);
			expect(res.unwrapErr()).toBe("error!");
		});

		it("should not map Ok value", () => {
			const res = Result.ok(10).mapErr((err) => `${err}!`);
			expect(res.unwrap()).toBe(10);
		});
	});

	describe("andThen", () => {
		it("should chain Ok result", () => {
			const res = Result.ok(10).andThen((x) => Result.ok(x + 5));
			expect(res.unwrap()).toBe(15);
		});

		it("should return the Err result if chaining returning Err", () => {
			const res = Result.ok(10).andThen((_) => Result.err("chain error"));
			expect(res.isErr).toBe(true);
			expect(res.unwrapErr()).toBe("chain error");
		});

		it("should not chain Err result", () => {
			const res = Result.err("original").andThen((x) => Result.ok(x + 5));
			expect(res.unwrapErr()).toBe("original");
		});
	});

	describe("orElse", () => {
		it("should chain Err result", () => {
			const res = Result.err("error").orElse((err) => Result.ok(`recovered from ${err}`));
			expect(res.unwrap()).toBe("recovered from error");
		});

		it("should not chain Ok result", () => {
			const res = Result.ok(10).orElse((_) => Result.ok(20));
			expect(res.unwrap()).toBe(10);
		});
	});

	describe("unwrapOr", () => {
		it("should return Ok value", () => {
			expect(Result.ok(10).unwrapOr(20)).toBe(10);
		});

		it("should return default value on Err", () => {
			expect(Result.err("error").unwrapOr(20)).toBe(20);
		});
	});

	describe("unwrapOrElse", () => {
		it("should return Ok value", () => {
			expect(Result.ok(10).unwrapOrElse(() => 20)).toBe(10);
		});

		it("should return computed value on Err", () => {
			expect(Result.err("error").unwrapOrElse((err) => `default ${err}`)).toBe(
				"default error",
			);
		});
	});
});

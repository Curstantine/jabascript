import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { clamp, debounce, takeIf, takeMapped, takeUnless, wait } from "../src/index.js";

describe("takeIf", () => {
	it("should return the value if the predicate is true", () => {
		const value = 5;
		const predicate = (x) => x > 0;
		assert.strictEqual(takeIf(value, predicate), value);
	});

	it("should return null if the predicate is false", () => {
		const value = -5;
		const predicate = (x) => x > 0;
		assert.strictEqual(takeIf(value, predicate), null);
	});
});

describe("takeUnless", () => {
	it("should return the value if the predicate is false", () => {
		const value = -5;
		const predicate = (x) => x > 0;
		assert.strictEqual(takeUnless(value, predicate), value);
	});

	it("should return null if the predicate is true", () => {
		const value = 5;
		const predicate = (x) => x > 0;
		assert.strictEqual(takeUnless(value, predicate), null);
	});
});

describe("takeMapped", () => {
	it("should return the mapped value if the predicate is true", () => {
		const value = 5;
		const map = (x) => x * 2;
		const predicate = (x) => x > 0;
		assert.strictEqual(takeMapped(value, map, predicate), 10);
	});

	it("should return null if the predicate is false", () => {
		const value = -5;
		const map = (x) => x * 2;
		const predicate = (x) => x > 0;
		assert.strictEqual(takeMapped(value, map, predicate), null);
	});

	it("should use the default predicate (not null/undefined) if none is provided", () => {
		const value = 5;
		const map = (x) => x * 2;
		assert.strictEqual(takeMapped(value, map), 10);
	});

	it("should return null with default predicate if value is null", () => {
		const value = null;
		const map = (x) => x * 2;
		assert.strictEqual(takeMapped(value, map), null);
	});

	it("should return null with default predicate if value is undefined", () => {
		const value = undefined;
		const map = (x) => x * 2;
		assert.strictEqual(takeMapped(value, map), null);
	});
});

describe("debounce", () => {
	it("should call the function after the delay", async () => {
		const fn = mock.fn();
		const debounced = debounce(fn, 50);
		debounced.run("test");
		assert.strictEqual(fn.mock.calls.length, 0);
		await wait(60);
		assert.strictEqual(fn.mock.calls.length, 1);
		assert.strictEqual(fn.mock.calls[0].arguments[0], "test");
	});

	it("should only call the function once after multiple rapid calls", async () => {
		const fn = mock.fn();
		const debounced = debounce(fn, 50);
		debounced.run("first");
		await wait(20);
		debounced.run("second");
		await wait(20);
		debounced.run("third");
		assert.strictEqual(fn.mock.calls.length, 0);
		await wait(60);
		assert.strictEqual(fn.mock.calls.length, 1);
		assert.strictEqual(fn.mock.calls[0].arguments[0], "third");
	});

	it("should clear the timeout when clear is called", async () => {
		const fn = mock.fn();
		const debounced = debounce(fn, 50);
		debounced.run("test");
		debounced.clear();
		await wait(60);
		assert.strictEqual(fn.mock.calls.length, 0);
	});

	it("should use custom delay if provided", async () => {
		const fn = mock.fn();
		const debounced = debounce(fn, 100); // Default delay 100ms
		debounced.run("test", 50); // Custom delay 50ms
		assert.strictEqual(fn.mock.calls.length, 0);
		await wait(60);
		assert.strictEqual(fn.mock.calls.length, 1);
		assert.strictEqual(fn.mock.calls[0].arguments[0], "test");
	});
});

describe("wait", () => {
	it("should resolve after the specified delay", async () => {
		const delay = 50;
		const start = Date.now();
		await wait(delay);
		const end = Date.now();
		assert(end - start >= delay, `Wait should take at least ${delay}ms`);
		assert(
			end - start < delay + 20,
			`Wait should not take significantly longer than ${delay}ms`,
		);
	});
});

describe("clamp", () => {
	it("should return the value if it is within the range", () => {
		assert.strictEqual(clamp(24, [20, 25]), 24);
	});

	it("should return the max value if the value is above the range", () => {
		assert.strictEqual(clamp(26, [20, 25]), 25);
	});

	it("should return the min value if the value is below the range", () => {
		assert.strictEqual(clamp(19, [20, 25]), 20);
	});

	it("should handle only min provided", () => {
		assert.strictEqual(clamp(15, [20]), 20);
		assert.strictEqual(clamp(25, [20]), 25);
	});

	it("should handle only max provided (using undefined for min)", () => {
		// Note: clamp(15, [undefined, 25]) doesn't work as expected due to destructuring defaults
		// We test the default min behavior implicitly
		assert.strictEqual(clamp(30, [undefined, 25]), 25);
		assert.strictEqual(clamp(15, [undefined, 25]), 15); // Uses default min
	});

	it("should use default min/max if range is not provided correctly", () => {
		assert.strictEqual(clamp(Number.MAX_SAFE_INTEGER + 100, []), Number.MAX_SAFE_INTEGER);
		assert.strictEqual(clamp(Number.MIN_SAFE_INTEGER - 100, []), Number.MIN_SAFE_INTEGER);
		assert.strictEqual(clamp(50, []), 50);
	});

	it("should handle edge cases for min/max", () => {
		assert.strictEqual(clamp(20, [20, 25]), 20);
		assert.strictEqual(clamp(25, [20, 25]), 25);
	});
});

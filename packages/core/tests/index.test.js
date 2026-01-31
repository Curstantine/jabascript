import { describe, expect, it, vi } from "vitest";

import { clamp, debounce, takeIf, takeMapped, takeUnless, wait } from "../src/index.js";

describe("takeIf", () => {
	it("should return the value if the predicate is true", () => {
		const value = 5;
		const predicate = (x) => x > 0;
		expect(takeIf(value, predicate)).toBe(value);
	});

	it("should return null if the predicate is false", () => {
		const value = -5;
		const predicate = (x) => x > 0;
		expect(takeIf(value, predicate)).toBeNull();
	});
});

describe("takeUnless", () => {
	it("should return the value if the predicate is false", () => {
		const value = -5;
		const predicate = (x) => x > 0;
		expect(takeUnless(value, predicate)).toBe(value);
	});

	it("should return null if the predicate is true", () => {
		const value = 5;
		const predicate = (x) => x > 0;
		expect(takeUnless(value, predicate)).toBeNull();
	});
});

describe("takeMapped", () => {
	it("should return the mapped value if the predicate is true", () => {
		const value = 5;
		const map = (x) => x * 2;
		const predicate = (x) => x > 0;
		expect(takeMapped(value, map, predicate)).toBe(10);
	});

	it("should return null if the predicate is false", () => {
		const value = -5;
		const map = (x) => x * 2;
		const predicate = (x) => x > 0;
		expect(takeMapped(value, map, predicate)).toBeNull();
	});

	it("should use the default predicate (not null/undefined) if none is provided", () => {
		const value = 5;
		const map = (x) => x * 2;
		expect(takeMapped(value, map)).toBe(10);
	});

	it("should return null with default predicate if value is null", () => {
		const value = null;
		const map = (x) => x * 2;
		expect(takeMapped(value, map)).toBeNull();
	});

	it("should return null with default predicate if value is undefined", () => {
		const value = undefined;
		const map = (x) => x * 2;
		expect(takeMapped(value, map)).toBeNull();
	});
});

describe("debounce", () => {
	it("should call the function after the delay", async () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 50);
		debounced.run("test");
		expect(fn).not.toHaveBeenCalled();
		await wait(60);
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith("test");
	});

	it("should only call the function once after multiple rapid calls", async () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 50);
		debounced.run("first");
		await wait(20);
		debounced.run("second");
		await wait(20);
		debounced.run("third");
		expect(fn).not.toHaveBeenCalled();
		await wait(60);
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith("third");
	});

	it("should clear the timeout when clear is called", async () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 50);
		debounced.run("test");
		debounced.clear();
		await wait(60);
		expect(fn).not.toHaveBeenCalled();
	});

	it("should use custom delay if provided", async () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 100); // Default delay 100ms
		debounced.run("test", 50); // Custom delay 50ms
		expect(fn).not.toHaveBeenCalled();
		await wait(60);
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith("test");
	});
});

describe("wait", () => {
	it("should resolve after the specified delay", async () => {
		const delay = 50;
		const start = Date.now();
		await wait(delay);
		const end = Date.now();
		expect(end - start).toBeGreaterThanOrEqual(delay);
		expect(end - start).toBeLessThan(delay + 20);
	});
});

describe("clamp", () => {
	it("should return the value if it is within the range", () => {
		expect(clamp(24, [20, 25])).toBe(24);
	});

	it("should return the max value if the value is above the range", () => {
		expect(clamp(26, [20, 25])).toBe(25);
	});

	it("should return the min value if the value is below the range", () => {
		expect(clamp(19, [20, 25])).toBe(20);
	});

	it("should handle only min provided", () => {
		expect(clamp(15, [20])).toBe(20);
		expect(clamp(25, [20])).toBe(25);
	});

	it("should handle only max provided (using undefined for min)", () => {
		// Note: clamp(15, [undefined, 25]) doesn't work as expected due to destructuring defaults
		// We test the default min behavior implicitly
		expect(clamp(30, [undefined, 25])).toBe(25);
		expect(clamp(15, [undefined, 25])).toBe(15); // Uses default min
	});

	it("should use default min/max if range is not provided correctly", () => {
		expect(clamp(Number.MAX_SAFE_INTEGER + 100, [])).toBe(Number.MAX_SAFE_INTEGER);
		expect(clamp(Number.MIN_SAFE_INTEGER - 100, [])).toBe(Number.MIN_SAFE_INTEGER);
		expect(clamp(50, [])).toBe(50);
	});

	it("should handle edge cases for min/max", () => {
		expect(clamp(20, [20, 25])).toBe(20);
		expect(clamp(25, [20, 25])).toBe(25);
	});
});

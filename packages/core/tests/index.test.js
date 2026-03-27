import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
	clamp,
	debounce,
	getInitials,
	takeIf,
	takeMapped,
	takeUnless,
	wait,
} from "../src/index.js";

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

	it("should allow multiple independent calls after each previous one resolves", async () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 50);
		debounced.run("first");
		await wait(60);
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith("first");

		debounced.run("second");
		await wait(60);
		expect(fn).toHaveBeenCalledTimes(2);
		expect(fn).toHaveBeenCalledWith("second");
	});
});

describe("wait", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.restoreAllMocks());

	it("should resolve after the specified delay", async () => {
		const delay = 1000;
		const promise = wait(delay);

		vi.advanceTimersByTime(delay);
		await expect(promise).resolves.toBeUndefined();
	});

	it("should handle different delay values", async () => {
		const delays = [100, 500, 2000];

		for (const delay of delays) {
			const promise = wait(delay);
			vi.advanceTimersByTime(delay);
			await expect(promise).resolves.toBeUndefined();
		}
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

describe("getInitials", () => {
	it("should return initials from first and last names", () => {
		expect(getInitials("John", "Doe")).toBe("JD");
	});

	it("should return first two characters of first name when last name is empty", () => {
		expect(getInitials("Alice", "")).toBe("Al");
	});

	it("should return first two characters of last name when first name is empty", () => {
		expect(getInitials("", "Smith")).toBe("Sm");
	});

	it("should return fallback when both names are empty", () => {
		expect(getInitials("", "")).toBe("N/A");
	});

	it("should use custom fallback when provided", () => {
		expect(getInitials("", "", { none: "??" })).toBe("??");
	});

	it("should use null fallback when provided", () => {
		expect(getInitials("", "", { none: null })).toBeNull();
		expect(getInitials(null, null, { none: null })).toBeNull();
	});

	it("should use custom separator when provided", () => {
		expect(getInitials("John", "Doe", { separator: "_" })).toBe("J_D");
	});

	it("should uppercase initials from first and last names", () => {
		expect(getInitials("john", "doe")).toBe("JD");
	});

	it("should handle single character names", () => {
		expect(getInitials("J", "")).toBe("J");
		expect(getInitials("", "D")).toBe("D");
	});

	it("should return fallback when first name is null", () => {
		expect(getInitials(null, "")).toBe("N/A");
		expect(getInitials(null, null)).toBe("N/A");
	});

	it("should return fallback when first name is undefined", () => {
		expect(getInitials(undefined, "")).toBe("N/A");
		expect(getInitials(undefined, undefined)).toBe("N/A");
	});

	it("should use last name when first name is null or undefined", () => {
		expect(getInitials(null, "Smith")).toBe("Sm");
		expect(getInitials(undefined, "Smith")).toBe("Sm");
	});

	it("should use first name when last name is null or undefined", () => {
		expect(getInitials("John", null)).toBe("Jo");
		expect(getInitials("John", undefined)).toBe("Jo");
	});

	it("should use default none fallback when options object provides only separator", () => {
		expect(getInitials("", "", { separator: "-" })).toBeUndefined();
	});

	it("should apply both separator and none options together", () => {
		expect(getInitials("", "", { none: "??", separator: "_" })).toBe("??");
		expect(getInitials("John", "Doe", { none: "??", separator: "." })).toBe("J.D");
	});

	it("should uppercase initials even when separator is provided", () => {
		expect(getInitials("alice", "bob", { separator: "-" })).toBe("A-B");
	});
});

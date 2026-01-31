import { describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";
import { page } from "vitest/browser";

import { useDelayedToggleState, useMediaQuery } from "../src/client.js";

describe("useDelayedToggleState", () => {
	it("should initialize with default value", async () => {
		const { result } = await renderHook(() => useDelayedToggleState(false));

		const [toggled, delayed] = result.current;
		expect(toggled).toBe(false);
		expect(delayed).toBe(false);
	});

	it("should initialize both states as true when defaultValue is true", async () => {
		const { result } = await renderHook(() => useDelayedToggleState(true));

		const [toggled, delayed] = result.current;
		expect(toggled).toBe(true);
		expect(delayed).toBe(true);
	});

	it("should update delayed state first, then toggled state when opening (toggled is false)", async () => {
		const { result, act } = await renderHook(() => useDelayedToggleState(false, 100));
		const [toggled, delayed, set] = result.current;

		// Initially both false
		expect(toggled).toBe(false);
		expect(delayed).toBe(false);

		await act(() => set(true));
		expect(toggled).toBe(false);
		expect(delayed).toBe(true);

		// Wait for toggled to update (after ~1ms)
		await expect.poll(() => toggled).toBe(true);
		expect(delayed).toBe(true);
	});

	it("should update toggled state first, then delayed state when closing (toggled is true)", async () => {
		const { result, act } = await renderHook(() => useDelayedToggleState(true, 100));
		const [toggled, delayed, set] = result.current;

		// Initially both true
		expect(toggled).toBe(true);
		expect(delayed).toBe(true);

		await act(() => set(false));
		expect(toggled).toBe(false);
		expect(delayed).toBe(true);

		// Wait for delayed to update (after 100ms)
		await expect.poll(() => delayed, { timeout: 200 }).toBe(false);
		expect(toggled).toBe(false);
	});

	it("should respect custom delay time", async () => {
		const { result } = await renderHook(() => useDelayedToggleState(true, 500));

		// Start closing
		result.current[2](false);

		// Toggled should update immediately
		expect(result.current[0]).toBe(false);
		expect(result.current[1]).toBe(true);

		// After 200ms, delayed should still be true
		await new Promise((resolve) => setTimeout(resolve, 200));
		expect(result.current[1]).toBe(true);

		// After 500ms, delayed should be false
		await expect.poll(() => result.current[1], { timeout: 700 }).toBe(false);
	});

	it("should handle function updater when opening", async () => {
		const { result } = await renderHook(() => useDelayedToggleState(false, 100));

		// Call setter with function
		result.current[2]((prev) => !prev);

		// Delayed updates immediately
		expect(result.current[1]).toBe(true);
		expect(result.current[0]).toBe(false);

		// Toggled updates after delay
		await expect.poll(() => result.current[0]).toBe(true);
	});

	it("should handle function updater when closing", async () => {
		const { result } = await renderHook(() => useDelayedToggleState(true, 100));

		// Call setter with function
		result.current[2]((prev) => !prev);

		// Toggled updates immediately
		expect(result.current[0]).toBe(false);
		expect(result.current[1]).toBe(true);

		// Delayed updates after delay
		await expect.poll(() => result.current[1], { timeout: 200 }).toBe(false);
	});

	it("should handle rapid toggling", async () => {
		const { result } = await renderHook(() => useDelayedToggleState(false, 100));

		// Open
		result.current[2](true);
		expect(result.current[1]).toBe(true);

		await expect.poll(() => result.current[0]).toBe(true);

		// Close
		result.current[2](false);
		expect(result.current[0]).toBe(false);
		expect(result.current[1]).toBe(true);

		await expect.poll(() => result.current[1], { timeout: 200 }).toBe(false);

		// Both should be false
		expect(result.current[0]).toBe(false);
		expect(result.current[1]).toBe(false);
	});

	it("should work for dialog/popup use case - opening animation", async () => {
		const { result } = await renderHook(() => useDelayedToggleState(false, 300));

		const [initialToggled, initialDelayed, setState] = result.current;

		// Initially closed
		expect(initialToggled).toBe(false);
		expect(initialDelayed).toBe(false);

		// User clicks to open dialog
		setState(true);

		// Content is inserted (delayed = true), but not visible yet (toggled = false)
		expect(result.current[1]).toBe(true); // Content in DOM
		expect(result.current[0]).toBe(false); // Not visible yet

		// After short delay, visibility animation starts
		await expect.poll(() => result.current[0]).toBe(true);
		expect(result.current[1]).toBe(true); // Still in DOM
	});

	it("should work for dialog/popup use case - closing animation", async () => {
		const { result } = await renderHook(() => useDelayedToggleState(true, 300));

		// Initially open
		expect(result.current[0]).toBe(true);
		expect(result.current[1]).toBe(true);

		// User clicks to close dialog
		result.current[2](false);

		// Visibility removed (toggled = false), but content still in DOM (delayed = true)
		expect(result.current[0]).toBe(false); // Hiding animation starts
		expect(result.current[1]).toBe(true); // Content still in DOM

		// After delay, content is removed from DOM
		await expect.poll(() => result.current[1], { timeout: 400 }).toBe(false);
		expect(result.current[0]).toBe(false); // Still not visible
	});
});

describe("useMediaQuery", () => {
	it("should match media query when viewport matches", async () => {
		// Set viewport to desktop size
		await page.viewport(1200, 800);

		const { result } = await renderHook(() => useMediaQuery("(min-width: 1024px)", false));

		expect(result.current).toBe(true);
	});

	it("should not match media query when viewport doesn't match", async () => {
		// Set viewport to mobile size
		await page.viewport(375, 667);

		const { result } = await renderHook(() => useMediaQuery("(min-width: 1024px)", false));

		expect(result.current).toBe(false);
	});

	it("should react to viewport changes", async () => {
		// Start with desktop size
		await page.viewport(1200, 800);

		const { result } = await renderHook(() => useMediaQuery("(max-width: 768px)", false));

		expect(result.current).toBe(false);

		// Resize to mobile
		await page.viewport(375, 667);
		expect(result.current).toBe(true);

		// Resize back to desktop
		await page.viewport(1200, 800);
		expect(result.current).toBe(false);
	});

	it("should use default value for non-matching query", async () => {
		// Set a viewport that won't match
		await page.viewport(500, 800);

		const { result } = await renderHook(() => useMediaQuery("(min-width: 9999px)", true));

		// Won't match 9999px, but we're testing the hook doesn't crash
		expect(result.current).toBe(false);
	});

	it("should handle complex media queries", async () => {
		const { result } = await renderHook(() =>
			useMediaQuery("(min-width: 768px) and (max-width: 1024px)", false),
		);

		// Below range
		await page.viewport(500, 800);
		expect(result.current).toBe(false);

		// Within range
		await page.viewport(900, 800);
		expect(result.current).toBe(true);

		// Above range
		await page.viewport(1200, 800);
		expect(result.current).toBe(false);
	});

	it("should handle orientation media queries", async () => {
		const { result } = await renderHook(() => useMediaQuery("(orientation: landscape)", false));

		// Landscape orientation (width > height)
		await page.viewport(1200, 800);
		expect(result.current).toBe(true);

		// Portrait orientation (height > width)
		await page.viewport(800, 1200);
		expect(result.current).toBe(false);
	});
});

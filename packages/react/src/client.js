/** @import {Dispatch, SetStateAction} from "react"; */
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

/**
 * Creates a boolean where one gets delayed than the other whenever the setter is called.
 *
 * This useful for dialogs/popups where the content is inserted to the DOM, and the visibility is animated.
 *
 * ## Setter logic:
 * 1. When the `toggled` is true: `delayed` is delayed and the `toggled` is updated in the next render.
 * 2. When the current `delayed` is true: `toggled` is delayed and the `delayed` is updated in the next render.
 *
 * @param {boolean} defaultValue The default value of the state.
 * @param {number} delay The delay in milliseconds.
 * @returns {[boolean, boolean, Dispatch<SetStateAction<boolean>>]} The render state, delayed state, and the setter.
 */
export function useDelayedToggleState(defaultValue, delay = 300) {
	const [toggled, setToggle] = useState(defaultValue);
	const [delayed, setDelayed] = useState(defaultValue);

	/** @type {Dispatch<SetStateAction<boolean>>} */
	const setState = useCallback(
		(value) => {
			const x = typeof value === "function" ? value.call(undefined, toggled) : value;
			if (toggled) {
				setToggle(x);
				setTimeout(() => setDelayed(x), delay);
			} else {
				setDelayed(x);
				setTimeout(() => setToggle(x), 1);
			}
		},
		[delay, toggled],
	);

	return [toggled, delayed, setState];
}

/**
 * Creates a match case for a passed media query.
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 768px)", false);
 * if (isMobile) return <span>mobile</span>;
 *
 * return <span>desktop</span>;
 *
 * @param {string} query The media query string.
 * @param {boolean} defaultValue The default value of the state. Used in server-side contexts.
 *
 * @returns {boolean}
 */
export function useMediaQuery(query, defaultValue) {
	const mediaQuery = useMemo(
		() => typeof window === "undefined" ? null : window.matchMedia(query),
		[query],
	);
	const getState = useCallback(() => mediaQuery?.matches ?? false, [mediaQuery]);
	const getServerState = useCallback(() => defaultValue, [defaultValue]);

	/** @type {Parameters<typeof useSyncExternalStore>[0]} */
	const subscribe = useCallback((callback) => {
		mediaQuery?.addEventListener("change", callback);
		return () => mediaQuery?.removeEventListener("change", callback);
	}, []);

	return useSyncExternalStore(subscribe, getState, getServerState);
}

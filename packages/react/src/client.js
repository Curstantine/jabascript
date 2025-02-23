/** @import {Dispatch, SetStateAction} from "react"; */
import { useCallback, useState } from "react";

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

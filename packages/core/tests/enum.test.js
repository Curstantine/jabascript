import { describe, expect, it } from "vitest";

import { createEnum } from "../src/enum.js";

describe("createEnum", () => {
	it("should create a frozen object with keys, values, and entries methods", () => {
		const Color = createEnum(
			/**@type {const}*/ ({
				RED: "red",
				GREEN: "green",
				BLUE: "blue",
			}),
		);

		expect(Object.isFrozen(Color)).toBe(true);
		expect(Color.keys()).toEqual(["RED", "GREEN", "BLUE"]);
		expect(Color.values()).toEqual(["red", "green", "blue"]);
		expect(Color.entries()).toEqual([
			["RED", "red"],
			["GREEN", "green"],
			["BLUE", "blue"],
		]);
	});

	it("should preserve number values", () => {
		const Status = createEnum(
			/**@type {const}*/ ({
				ACTIVE: 1,
				INACTIVE: 0,
			}),
		);

		expect(Status.keys()).toEqual(["ACTIVE", "INACTIVE"]);
		expect(Status.values()).toEqual([1, 0]);
		expect(Status.entries()).toEqual([
			["ACTIVE", 1],
			["INACTIVE", 0],
		]);
	});

	it("should not allow modification of the enum object", () => {
		const Direction = createEnum(
			/**@type {const}*/ ({
				UP: "up",
				DOWN: "down",
			}),
		);

		expect(() => {
			Direction.LEFT = "left";
		}).toThrow(TypeError);

		expect(Direction.LEFT).toBeUndefined();
	});

	it("should work with symbol values", () => {
		const symA = Symbol("A");
		const symB = Symbol("B");
		const MyEnum = createEnum({
			A: symA,
			B: symB,
		});

		expect(MyEnum.keys()).toEqual(["A", "B"]);
		expect(MyEnum.values()).toEqual([symA, symB]);
		expect(MyEnum.entries()).toEqual([
			["A", symA],
			["B", symB],
		]);
	});
});

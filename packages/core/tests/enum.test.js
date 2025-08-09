import assert from "node:assert/strict";
import { describe, it } from "node:test";
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

		assert.strictEqual(Object.isFrozen(Color), true);
		assert.deepStrictEqual(Color.keys(), ["RED", "GREEN", "BLUE"]);
		assert.deepStrictEqual(Color.values(), ["red", "green", "blue"]);
		assert.deepStrictEqual(Color.entries(), [
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

		assert.deepStrictEqual(Status.keys(), ["ACTIVE", "INACTIVE"]);
		assert.deepStrictEqual(Status.values(), [1, 0]);
		assert.deepStrictEqual(Status.entries(), [
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

		assert.throws(() => {
			Direction.LEFT = "left";
		}, TypeError);

		assert.strictEqual(Direction.LEFT, undefined);
	});

	it("should work with symbol values", () => {
		const symA = Symbol("A");
		const symB = Symbol("B");
		const MyEnum = createEnum({
			A: symA,
			B: symB,
		});

		assert.deepStrictEqual(MyEnum.keys(), ["A", "B"]);
		assert.deepStrictEqual(MyEnum.values(), [symA, symB]);
		assert.deepStrictEqual(MyEnum.entries(), [
			["A", symA],
			["B", symB],
		]);
	});
});

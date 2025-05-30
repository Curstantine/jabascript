import assert from "node:assert";
import { describe, it } from "node:test";

import { parseFormData } from "../src/index.js";

const data = new FormData();
data.set("attempt", 5);

data.set("user.name", "Curstantine");
data.set("user.password", "Riamu");

data.set("photos", "1");
data.append("photos", "2");
data.append("photos", "3");

data.set("items[0].name", "Item name #1");
data.set("items[0].price", 500);
data.set("items[0].addons", "Addon #1");
data.append("items[0].addons", "Addon #2");

data.set("items[1].name", "Item name #2");
data.set("items[1].price", 650);
data.set("items[1].addons", "Addon #1");
data.append("items[1].addons", "Addon #2");

data.set("gp[0]", "Bahrain");
data.set("gp[1]", "Spa");

const result = parseFormData(data);
console.dir(result, { depth: null });
describe("parseFormData", () => {
	it("should parse simple key-value pairs", () => {
		const data = new FormData();
		data.set("name", "test");
		data.set("age", "25");

		const result = parseFormData(data);

		assert.deepStrictEqual(result, {
			name: "test",
			age: "25",
		});
	});

	it("should parse nested objects with dot notation", () => {
		const data = new FormData();
		data.set("user.name", "John");
		data.set("user.email", "john@example.com");
		data.set("config.theme", "dark");

		const result = parseFormData(data);

		assert.deepStrictEqual(result, {
			user: {
				name: "John",
				email: "john@example.com",
			},
			config: {
				theme: "dark",
			},
		});
	});

	it("should create arrays from repeated keys", () => {
		const data = new FormData();
		data.set("tags", "javascript");
		data.append("tags", "nodejs");
		data.append("tags", "testing");

		const result = parseFormData(data);

		assert.deepStrictEqual(result, {
			tags: ["javascript", "nodejs", "testing"],
		});
	});

	it("should parse indexed arrays", () => {
		const data = new FormData();
		data.set("items[0]", "first");
		data.set("items[1]", "second");
		data.set("items[2]", "third");

		const result = parseFormData(data);

		assert.deepStrictEqual(result, {
			items: ["first", "second", "third"],
		});
	});

	it("should parse nested indexed arrays", () => {
		const data = new FormData();
		data.set("products[0].name", "Product A");
		data.set("products[0].price", "100");
		data.set("products[1].name", "Product B");
		data.set("products[1].price", "200");

		const result = parseFormData(data);

		assert.deepStrictEqual(result, {
			products: [
				{ name: "Product A", price: "100" },
				{ name: "Product B", price: "200" },
			],
		});
	});

	it("should handle mixed nested structures", () => {
		const data = new FormData();
		data.set("title", "Test Form");
		data.set("user.profile.name", "Alice");
		data.set("user.profile.age", "30");
		data.set("tags", "web");
		data.append("tags", "form");
		data.set("items[0].id", "1");
		data.set("items[0].values", "a");
		data.append("items[0].values", "b");

		const result = parseFormData(data);

		assert.deepStrictEqual(result, {
			title: "Test Form",
			user: {
				profile: {
					name: "Alice",
					age: "30",
				},
			},
			tags: ["web", "form"],
			items: [
				{
					id: "1",
					values: ["a", "b"],
				},
			],
		});
	});

	it("should handle sparse arrays", () => {
		const data = new FormData();
		data.set("sparse[0]", "first");
		data.set("sparse[5]", "sixth");

		const result = parseFormData(data);

		assert.strictEqual(result.sparse[0], "first");
		assert.strictEqual(result.sparse[5], "sixth");
		assert.strictEqual(result.sparse.length, 6);
	});

	it("should throw error for invalid array indices", () => {
		const data = new FormData();
		data.set("invalid[abc]", "value");

		assert.throws(() => parseFormData(data), /index must be a number/);
	});

	it("should handle empty FormData", () => {
		const data = new FormData();

		const result = parseFormData(data);

		assert.deepStrictEqual(result, {});
	});

	it("should handle deep nesting", () => {
		const data = new FormData();
		data.set("a.b.c.d.e", "deep");

		const result = parseFormData(data);

		assert.deepStrictEqual(result, {
			a: {
				b: {
					c: {
						d: {
							e: "deep",
						},
					},
				},
			},
		});
	});
});

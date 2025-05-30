import assert from "node:assert";
import { describe, it } from "node:test";

import { parseFormData } from "../src/index.js";

describe("parseFormData", () => {
	it("should parse simple key-value pairs", () => {
		const formData = new FormData();
		formData.set("name", "test");
		formData.set("value", "123");

		const result = parseFormData(formData);
		assert.deepStrictEqual(result, {
			name: "test",
			value: "123",
		});
	});

	it("should parse nested objects with dot notation", () => {
		const formData = new FormData();
		formData.set("user.name", "john");
		formData.set("user.email", "john@example.com");
		formData.set("config.theme", "dark");

		const result = parseFormData(formData);
		assert.deepStrictEqual(result, {
			user: {
				name: "john",
				email: "john@example.com",
			},
			config: {
				theme: "dark",
			},
		});
	});

	it("should handle multiple values for same key as array", () => {
		const formData = new FormData();
		formData.set("tags", "javascript");
		formData.append("tags", "nodejs");
		formData.append("tags", "web");

		const result = parseFormData(formData);
		assert.deepStrictEqual(result, {
			tags: ["javascript", "nodejs", "web"],
		});
	});

	it("should parse indexed arrays", () => {
		const formData = new FormData();
		formData.set("items[0]", "first");
		formData.set("items[1]", "second");
		formData.set("items[2]", "third");

		const result = parseFormData(formData);
		assert.deepStrictEqual(result, {
			items: ["first", "second", "third"],
		});
	});

	it("should parse indexed arrays with nested objects", () => {
		const formData = new FormData();
		formData.set("users[0].name", "alice");
		formData.set("users[0].age", "25");
		formData.set("users[1].name", "bob");
		formData.set("users[1].age", "30");

		const result = parseFormData(formData);
		assert.deepStrictEqual(result, {
			users: [
				{ name: "alice", age: "25" },
				{ name: "bob", age: "30" },
			],
		});
	});

	it("should handle custom separator", () => {
		const formData = new FormData();
		formData.set("user:profile:name", "test");
		formData.set("user:settings:theme", "light");

		const result = parseFormData(formData, ":");
		assert.deepStrictEqual(result, {
			user: {
				profile: {
					name: "test",
				},
				settings: {
					theme: "light",
				},
			},
		});
	});

	it("should throw error for invalid array index", () => {
		const formData = new FormData();
		formData.set("items[invalid]", "value");

		assert.throws(() => {
			parseFormData(formData);
		}, /index must be a positive integer/);
	});

	it("should throw error for negative array index", () => {
		const formData = new FormData();
		formData.set("items[-1]", "value");

		assert.throws(() => {
			parseFormData(formData);
		}, /index must be a positive integer/);
	});

	it("should handle mixed nested structures", () => {
		const formData = new FormData();
		formData.set("name", "@jabascript/form-data");
		formData.set("repository.url", "https://example.com");
		formData.set("keywords", "utilities");
		formData.append("keywords", "form-data");
		formData.set("dependencies[0].name", "@jabascript/core");
		formData.set("dependencies[1].name", "@jabascript/query");
		formData.set("devDependencies[0]", "typescript");
		formData.set("devDependencies[1]", "eslint");

		const result = parseFormData(formData);
		assert.deepStrictEqual(result, {
			name: "@jabascript/form-data",
			repository: {
				url: "https://example.com",
			},
			keywords: ["utilities", "form-data"],
			dependencies: [
				{ name: "@jabascript/core" },
				{ name: "@jabascript/query" },
			],
			devDependencies: ["typescript", "eslint"],
		});
	});

	it("should handle empty FormData", () => {
		const formData = new FormData();
		const result = parseFormData(formData);
		assert.deepStrictEqual(result, {});
	});

	it("should handle sparse arrays", () => {
		const formData = new FormData();
		formData.set("items[0]", "first");
		formData.set("items[2]", "third");

		const result = parseFormData(formData);
		assert.strictEqual(result.items[0], "first");
		assert.strictEqual(result.items[1], undefined);
		assert.strictEqual(result.items[2], "third");
	});
});

import assert from "node:assert";
import { describe, it } from "node:test";

import { createSearchParams, createURL, parseSearchParams } from "../src/index.js";

describe("createSearchParams", () => {
	it("should create basic search params", () => {
		const params = createSearchParams({ a: 1, b: "test" });
		assert.strictEqual(params.toString(), "a=1&b=test");
	});

	it("should skip null and undefined values by default", () => {
		const params = createSearchParams({ a: 1, b: null, c: undefined, d: "test" });
		assert.strictEqual(params.toString(), "a=1&d=test");
	});

	it("should include null and undefined values when allowFalsy is true", () => {
		const params = createSearchParams({ a: 1, b: null, c: undefined, d: "test" }, true);
		assert.strictEqual(params.toString(), "a=1&b=null&c=undefined&d=test");
	});

	it("should handle array values by appending", () => {
		const params = createSearchParams({ "ids[]": [1, 2, 3], b: "test" });
		assert.strictEqual(params.toString(), "ids%5B%5D=1&ids%5B%5D=2&ids%5B%5D=3&b=test");
	});

	it("should handle the Option tuple [Record<string, T>, T]", () => {
		const options = { eager: "EagerValue", lazy: "LazyValue" };
		const params = createSearchParams({ mode: [options, "eager"], other: "val" });
		assert.strictEqual(params.toString(), "mode=EagerValue&other=val");
	});

	it("should differentiate between Option tuple and regular arrays", () => {
		const regularArray = ["value1", "value2"];
		const params = createSearchParams({ key: regularArray });
		assert.strictEqual(params.toString(), "key=value1&key=value2");
	});

	it("should return an empty URLSearchParams for an empty object", () => {
		const params = createSearchParams({});
		assert.strictEqual(params.toString(), "");
	});

	it("should handle complex mixed types", () => {
		const options = { yes: "Yes", no: "No" };
		const params = createSearchParams({
			limit: 10,
			search: "term",
			offset: undefined,
			"tagIds[]": [123, null, 321],
			active: [options, "yes"],
			skip: null,
		});
		assert.strictEqual(
			params.toString(),
			"limit=10&search=term&tagIds%5B%5D=123&tagIds%5B%5D=null&tagIds%5B%5D=321&active=Yes",
		);
	});

	it("should handle complex mixed types with allowFalsy", () => {
		const options = { yes: "Yes", no: "No" };
		const params = createSearchParams({
			limit: 10,
			search: "term",
			offset: undefined,
			"tagIds[]": [123, null, 321],
			active: [options, "yes"],
			skip: null,
		}, true);
		assert.strictEqual(
			params.toString(),
			"limit=10&search=term&offset=undefined&tagIds%5B%5D=123&tagIds%5B%5D=null&tagIds%5B%5D=321&active=Yes&skip=null",
		);
	});
});

describe("createURL", () => {
	const baseStr = "https://example.com/path";
	const baseURL = new URL(baseStr);
	const baseURLWithSearch = new URL("https://example.com/path?existing=true&another=old");

	it("should create a URL with params from a string base", () => {
		const url = createURL(baseStr, { a: 1, b: "test" });
		assert.ok(url instanceof URL);
		assert.strictEqual(url.toString(), `${baseStr}?a=1&b=test`);
	});

	it("should create a URL with params from a URL object base", () => {
		const url = createURL(baseURL, { a: 1, b: "test" });
		assert.ok(url instanceof URL);
		assert.strictEqual(url.toString(), `${baseStr}?a=1&b=test`);
		assert.strictEqual(baseURL.search, "", "Original URL object should not be mutated");
	});

	it("should replace existing search params on a URL object base", () => {
		const url = createURL(baseURLWithSearch, { a: 1, b: "test" });
		assert.ok(url instanceof URL);
		assert.strictEqual(url.toString(), `${baseStr}?a=1&b=test`);
		assert.strictEqual(
			baseURLWithSearch.search,
			"?existing=true&another=old",
			"Original URL object should not be mutated",
		);
	});

	it("should handle skipping null/undefined params by default", () => {
		const url = createURL(baseStr, { a: 1, b: null, c: undefined, d: "test" });
		assert.strictEqual(url.toString(), `${baseStr}?a=1&d=test`);
	});

	it("should handle including null/undefined params when allowFalsy is true", () => {
		const url = createURL(baseStr, { a: 1, b: null, c: undefined, d: "test" }, true);
		assert.strictEqual(url.toString(), `${baseStr}?a=1&b=null&c=undefined&d=test`);
	});

	it("should handle array params", () => {
		const url = createURL(baseStr, { "ids[]": [1, 2, 3] });
		assert.strictEqual(url.toString(), `${baseStr}?ids%5B%5D=1&ids%5B%5D=2&ids%5B%5D=3`);
	});

	it("should handle Option tuple params", () => {
		const options = { eager: "EagerValue", lazy: "LazyValue" };
		const url = createURL(baseStr, { mode: [options, "lazy"] });
		assert.strictEqual(url.toString(), `${baseStr}?mode=LazyValue`);
	});

	it("should handle an empty params object", () => {
		const url = createURL(baseStr, {});
		assert.strictEqual(url.toString(), baseStr);
	});

	it("should handle a base URL string with existing search params (they get replaced)", () => {
		const url = createURL("https://example.com/path?old=true", { new: "val" });
		assert.strictEqual(url.toString(), "https://example.com/path?new=val");
	});

	it("should handle complex mixed types", () => {
		const options = { yes: "Yes", no: "No" };
		const url = createURL(baseStr, {
			limit: 10,
			search: "term",
			offset: undefined,
			"tagIds[]": [123, null, 321],
			active: [options, "yes"],
			skip: null,
		});
		assert.strictEqual(
			url.toString(),
			`${baseStr}?limit=10&search=term&tagIds%5B%5D=123&tagIds%5B%5D=null&tagIds%5B%5D=321&active=Yes`,
		);
	});

	it("should handle complex mixed types with allowFalsy", () => {
		const options = { yes: "Yes", no: "No" };
		const url = createURL(baseStr, {
			limit: 10,
			search: "term",
			offset: undefined,
			"tagIds[]": [123, null, 321],
			active: [options, "yes"],
			skip: null,
		}, true);
		assert.strictEqual(
			url.toString(),
			`${baseStr}?limit=10&search=term&offset=undefined&tagIds%5B%5D=123&tagIds%5B%5D=null&tagIds%5B%5D=321&active=Yes&skip=null`,
		);
	});
});

describe("parseSearchParams", () => {
	it("should parse basic search params into an object", () => {
		const searchParams = new URLSearchParams("a=1&b=test");
		const result = parseSearchParams(searchParams);
		assert.deepStrictEqual(result, { a: "1", b: "test" });
	});

	it("should skip 'null' and 'undefined' string values by default", () => {
		const searchParams = new URLSearchParams("a=1&b=null&c=undefined&d=test");
		const result = parseSearchParams(searchParams);
		assert.deepStrictEqual(result, { a: "1", d: "test" });
	});

	it("should include 'null' and 'undefined' string values when allowFalsy is true", () => {
		const searchParams = new URLSearchParams("a=1&b=null&c=undefined&d=test");
		const result = parseSearchParams(searchParams, true);
		assert.deepStrictEqual(result, { a: "1", b: null, c: undefined, d: "test" });
	});

	it("should parse array parameters with '[]' suffix into arrays", () => {
		const searchParams = new URLSearchParams("ids[]=1&ids[]=2&ids[]=3&b=test");
		const result = parseSearchParams(searchParams);
		assert.deepStrictEqual(result, { "ids[]": ["1", "2", "3"], b: "test" });
	});

	it("should handle single value for array-like key", () => {
		const searchParams = new URLSearchParams("ids[]=123");
		const result = parseSearchParams(searchParams);
		assert.deepStrictEqual(result, { "ids[]": ["123"] });
	});

	it("should return an empty object for empty URLSearchParams", () => {
		const searchParams = new URLSearchParams("");
		const result = parseSearchParams(searchParams);
		assert.deepStrictEqual(result, {});
	});

	it("should handle complex mixed types", () => {
		const searchParams = new URLSearchParams(
			"limit=10&search=term&tagIds[]=123&tagIds[]=null&tagIds[]=321&active=Yes",
		);
		const result = parseSearchParams(searchParams);
		assert.deepStrictEqual(result, {
			limit: "10",
			search: "term",
			"tagIds[]": ["123", null, "321"],
			active: "Yes",
		});
	});

	it("should handle complex mixed types with allowFalsy", () => {
		const searchParams = new URLSearchParams(
			"limit=10&search=term&offset=undefined&tagIds[]=123&tagIds[]=null&tagIds[]=321&active=Yes&skip=null",
		);
		const result = parseSearchParams(searchParams, true);
		assert.deepStrictEqual(result, {
			limit: "10",
			search: "term",
			offset: undefined,
			"tagIds[]": ["123", null, "321"],
			active: "Yes",
			skip: null,
		});
	});

	it("should handle keys without values", () => {
		const searchParams = new URLSearchParams("a=&b=test");
		const result = parseSearchParams(searchParams);
		assert.deepStrictEqual(result, { a: "", b: "test" });
	});

	it("should handle multiple instances of the same key as arrays", () => {
		const searchParams = new URLSearchParams("key=value1&key=value2");
		const result = parseSearchParams(searchParams);
		assert.deepStrictEqual(result, { key: ["value1", "value2"] });
	});
});

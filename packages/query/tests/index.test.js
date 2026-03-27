import { describe, expect, it } from "vitest";

import { createSearchParams, createURL, getLiteralValue, parseSearchParams } from "../src/index.js";

describe("createSearchParams", () => {
	it("should create basic search params", () => {
		const params = createSearchParams({ a: 1, b: "test" });
		expect(params.toString()).toBe("a=1&b=test");
	});

	it("should skip null and undefined values by default", () => {
		const params = createSearchParams({ a: 1, b: null, c: undefined, d: "test" });
		expect(params.toString()).toBe("a=1&d=test");
	});

	it("should include null and undefined values when allowFalsy is true", () => {
		const params = createSearchParams({ a: 1, b: null, c: undefined, d: "test" }, true);
		expect(params.toString()).toBe("a=1&b=null&c=undefined&d=test");
	});

	it("should handle array values by appending", () => {
		const params = createSearchParams({ "ids[]": [1, 2, 3], b: "test" });
		expect(params.toString()).toBe("ids%5B%5D=1&ids%5B%5D=2&ids%5B%5D=3&b=test");
	});

	it("should handle the Option tuple [Record<string, T>, T]", () => {
		const options = { eager: "EagerValue", lazy: "LazyValue" };
		const params = createSearchParams({ mode: [options, "eager"], other: "val" });
		expect(params.toString()).toBe("mode=EagerValue&other=val");
	});

	it("should differentiate between Option tuple and regular arrays", () => {
		const regularArray = ["value1", "value2"];
		const params = createSearchParams({ key: regularArray });
		expect(params.toString()).toBe("key=value1&key=value2");
	});

	it("should return an empty URLSearchParams for an empty object", () => {
		const params = createSearchParams({});
		expect(params.toString()).toBe("");
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
		expect(params.toString()).toBe(
			"limit=10&search=term&tagIds%5B%5D=123&tagIds%5B%5D=null&tagIds%5B%5D=321&active=Yes",
		);
	});

	it("should handle complex mixed types with allowFalsy", () => {
		const options = { yes: "Yes", no: "No" };
		const params = createSearchParams(
			{
				limit: 10,
				search: "term",
				offset: undefined,
				"tagIds[]": [123, null, 321],
				active: [options, "yes"],
				skip: null,
			},
			true,
		);
		expect(params.toString()).toBe(
			"limit=10&search=term&offset=undefined&tagIds%5B%5D=123&tagIds%5B%5D=null&tagIds%5B%5D=321&active=Yes&skip=null",
		);
	});

	it("should treat an empty array value as no params", () => {
		const params = createSearchParams({ a: [], b: "test" });
		expect(params.toString()).toBe("b=test");
	});

	it("should treat a two-element array whose first element is not an object as a regular array", () => {
		const params = createSearchParams({ key: ["a", "b"] });
		expect(params.toString()).toBe("key=a&key=b");
	});

	it("should treat a two-element array whose second element is not a string as a regular array", () => {
		const params = createSearchParams({ key: [{ val: "x" }, 42] });
		expect(params.toString()).toBe("key=%5Bobject+Object%5D&key=42");
	});

	it("should serialize as 'undefined' for an Option tuple key that does not exist in the record", () => {
		const options = { eager: "EagerValue" };
		const params = createSearchParams({ mode: [options, "missing"] });
		expect(params.get("mode")).toBe("undefined");
	});
});

describe("createURL", () => {
	const baseStr = "https://example.com/path";
	const baseURL = new URL(baseStr);
	const baseURLWithSearch = new URL("https://example.com/path?existing=true&another=old");

	it("should create a URL with params from a string base", () => {
		const url = createURL(baseStr, { a: 1, b: "test" });
		expect(url).toBeInstanceOf(URL);
		expect(url.toString()).toBe(`${baseStr}?a=1&b=test`);
	});

	it("should create a URL with params from a URL object base", () => {
		const url = createURL(baseURL, { a: 1, b: "test" });
		expect(url).toBeInstanceOf(URL);
		expect(url.toString()).toBe(`${baseStr}?a=1&b=test`);
		expect(baseURL.search).toBe(""); // Original URL object should not be mutated
	});

	it("should replace existing search params on a URL object base", () => {
		const url = createURL(baseURLWithSearch, { a: 1, b: "test" });
		expect(url).toBeInstanceOf(URL);
		expect(url.toString()).toBe(`${baseStr}?a=1&b=test`);
		expect(baseURLWithSearch.search).toBe("?existing=true&another=old"); // Original URL object should not be mutated
	});

	it("should handle skipping null/undefined params by default", () => {
		const url = createURL(baseStr, { a: 1, b: null, c: undefined, d: "test" });
		expect(url.toString()).toBe(`${baseStr}?a=1&d=test`);
	});

	it("should handle including null/undefined params when allowFalsy is true", () => {
		const url = createURL(baseStr, { a: 1, b: null, c: undefined, d: "test" }, true);
		expect(url.toString()).toBe(`${baseStr}?a=1&b=null&c=undefined&d=test`);
	});

	it("should handle array params", () => {
		const url = createURL(baseStr, { "ids[]": [1, 2, 3] });
		expect(url.toString()).toBe(`${baseStr}?ids%5B%5D=1&ids%5B%5D=2&ids%5B%5D=3`);
	});

	it("should handle Option tuple params", () => {
		const options = { eager: "EagerValue", lazy: "LazyValue" };
		const url = createURL(baseStr, { mode: [options, "lazy"] });
		expect(url.toString()).toBe(`${baseStr}?mode=LazyValue`);
	});

	it("should handle an empty params object", () => {
		const url = createURL(baseStr, {});
		expect(url.toString()).toBe(baseStr);
	});

	it("should handle a base URL string with existing search params (they get replaced)", () => {
		const url = createURL("https://example.com/path?old=true", { new: "val" });
		expect(url.toString()).toBe("https://example.com/path?new=val");
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
		expect(url.toString()).toBe(
			`${baseStr}?limit=10&search=term&tagIds%5B%5D=123&tagIds%5B%5D=null&tagIds%5B%5D=321&active=Yes`,
		);
	});

	it("should handle complex mixed types with allowFalsy", () => {
		const options = { yes: "Yes", no: "No" };
		const url = createURL(
			baseStr,
			{
				limit: 10,
				search: "term",
				offset: undefined,
				"tagIds[]": [123, null, 321],
				active: [options, "yes"],
				skip: null,
			},
			true,
		);
		expect(url.toString()).toBe(
			`${baseStr}?limit=10&search=term&offset=undefined&tagIds%5B%5D=123&tagIds%5B%5D=null&tagIds%5B%5D=321&active=Yes&skip=null`,
		);
	});
});

describe("parseSearchParams", () => {
	it("should parse basic search params into an object", () => {
		const searchParams = new URLSearchParams("a=1&b=test");
		const result = parseSearchParams(searchParams);
		expect(result).toEqual({ a: "1", b: "test" });
	});

	it("should skip 'null' and 'undefined' string values by default", () => {
		const searchParams = new URLSearchParams("a=1&b=null&c=undefined&d=test");
		const result = parseSearchParams(searchParams);
		expect(result).toEqual({ a: "1", d: "test" });
	});

	it("should include 'null' and 'undefined' string values when allowFalsy is true", () => {
		const searchParams = new URLSearchParams("a=1&b=null&c=undefined&d=test");
		const result = parseSearchParams(searchParams, true);
		expect(result).toEqual({ a: "1", b: null, c: undefined, d: "test" });
	});

	it("should parse array parameters with '[]' suffix into arrays", () => {
		const searchParams = new URLSearchParams("ids[]=1&ids[]=2&ids[]=3&b=test");
		const result = parseSearchParams(searchParams);
		expect(result).toEqual({ "ids[]": ["1", "2", "3"], b: "test" });
	});

	it("should handle single value for array-like key", () => {
		const searchParams = new URLSearchParams("ids[]=123");
		const result = parseSearchParams(searchParams);
		expect(result).toEqual({ "ids[]": ["123"] });
	});

	it("should return an empty object for empty URLSearchParams", () => {
		const searchParams = new URLSearchParams("");
		const result = parseSearchParams(searchParams);
		expect(result).toEqual({});
	});

	it("should handle complex mixed types", () => {
		const searchParams = new URLSearchParams(
			"limit=10&search=term&tagIds[]=123&tagIds[]=null&tagIds[]=321&active=Yes",
		);
		const result = parseSearchParams(searchParams);
		expect(result).toEqual({
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
		expect(result).toEqual({
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
		expect(result).toEqual({ a: "", b: "test" });
	});

	it("should handle multiple instances of the same key as arrays", () => {
		const searchParams = new URLSearchParams("key=value1&key=value2");
		const result = parseSearchParams(searchParams);
		expect(result).toEqual({ key: ["value1", "value2"] });
	});

	it("should skip null/undefined array entries by default", () => {
		const searchParams = new URLSearchParams("ids[]=1&ids[]=null&ids[]=2");
		const result = parseSearchParams(searchParams);
		expect(result).toEqual({ "ids[]": ["1", null, "2"] });
	});

	it("should accumulate more than two values for the same non-[] key into an array", () => {
		const searchParams = new URLSearchParams("tag=a&tag=b&tag=c");
		const result = parseSearchParams(searchParams);
		expect(result).toEqual({ tag: ["a", "b", "c"] });
	});
});

describe("getLiteralValue", () => {
	it("should convert the string 'null' to null", () => {
		expect(getLiteralValue("null")).toBeNull();
	});

	it("should convert the string 'undefined' to undefined", () => {
		expect(getLiteralValue("undefined")).toBeUndefined();
	});

	it("should return any other string unchanged", () => {
		expect(getLiteralValue("hello")).toBe("hello");
		expect(getLiteralValue("")).toBe("");
		expect(getLiteralValue("0")).toBe("0");
		expect(getLiteralValue("false")).toBe("false");
	});
});

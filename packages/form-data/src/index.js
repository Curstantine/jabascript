/**
 * Parses a {@link FormData} javascript object.
 *
 * - Properties are nested by a `.` (e.g. `key1.key12` -> `{ key1: { key12: "" } }`)
 * - Arrays are described by repeating keys or a `field[0]` to indicate their indexes.
 *
 * @example
 * const data = new FormData();
 * data.set("name", "@jabascript/form-data");
 * data.set("repository.url", "https://example.com");
 *
 * // Value arrays
 * data.set("keywords", "utilities");
 * data.append("keywords", "form-data");
 *
 * // Indexed nested arrays
 * data.set("dependencies[0].name", "@jabascript/core");
 * data.append("dependencies[1].name", "@jabascript/query");
 *
 * const result = parseFormData(data);
 * // Returns:
 * // {
 * //   name: "@jabascript/form-data",
 * //   repository: {
 * //     url: "https://example.com"
 * //   },
 * //   keywords: ["utilities", "form-data"],
 * //   dependencies: [
 * //     { name: "@jabascript/core" },
 * //     { name: "@jabascript/query" }
 * //   ]
 * // }
 *
 * @template {{}} T
 *
 * @param {FormData} data
 *
 * @returns {T}
 */
export function parseFormData(data) {
	const result = {};

	for (const [k, v] of data) {
		const accessors = k.split(".");

		let obj = result;
		for (let p = 0; p < accessors.length; p++) {
			const acc = accessors[p];

			if (acc.endsWith("]")) {
				const start = acc.indexOf("[");
				const idx = Number.parseInt(acc.substring(start + 1, acc.length - 1));
				const kn = acc.substring(0, start);

				if (Number.isNaN(idx)) {
					throw new Error(`index must be a number (at ${k})`);
				}

				obj[kn] ??= [];

				if (p < (accessors.length - 1)) obj = obj[kn][idx] ??= {};
				else obj[kn][idx] = v;

				continue;
			}

			if (p < (accessors.length - 1)) {
				obj = obj[acc] ??= {};
				continue;
			}

			if (acc in obj) {
				const old = obj[acc];
				if (Array.isArray(old)) old.push(v);
				else obj[acc] = [old, v];
				continue;
			}

			obj[acc] = v;
		}
	}

	return result;
}

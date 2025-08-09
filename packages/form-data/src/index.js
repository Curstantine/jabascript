/**
 * Parses a {@link FormData} into a javascript object.
 *
 * ## Caution: Array Handling
 * When multiple values are provided for the same key (via append), the result
 * is not guaranteed to be an array, especially in case of a single value.
 * Use explicit indexing (e.g. `field[0]`) if you need precise control over array structure.
 *
 * @example
 * const data = new FormData();
 * data.set("name", "@jabascript/form-data");
 * data.set("repository.url", "https://example.com");
 *
 * // Append arrays
 * data.set("keywords", "utilities");
 * data.append("keywords", "form-data");
 *
 * // Indexed arrays
 * data.set("dependencies[0].name", "@jabascript/core");
 * data.append("dependencies[1].name", "@jabascript/query");
 * data.set("devDependencies[0]", "typescript")
 * data.set("devDependencies[1]", "eslint")
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
 * //   ],
 * //   devDependencies: ["typescript", "eslint"]
 * // }
 *
 * @template {{ [key: string]: unknown }} T
 *
 * @param {FormData} data
 * @param {string} [separator="."] The separator used to key into nested values
 *
 * @throws {Error} when the key of an indexed array is malformed (not a positive integer)
 *
 * @returns {T}
 */
export function parseFormData(data, separator = ".") {
	/** @type {T} */
	const result = {};

	for (const [k, v] of data) {
		const accessors = k.split(separator);

		let obj = result;
		for (let p = 0; p < accessors.length; p++) {
			const acc = accessors[p];
			const isLast = p == (accessors.length - 1);

			if (acc.endsWith("]")) {
				const start = acc.indexOf("[");
				const idx = Number.parseInt(acc.substring(start + 1, acc.length - 1), 10);
				const kn = acc.substring(0, start);

				if (Number.isNaN(idx) || idx < 0) {
					throw new Error(`index must be a positive integer (at ${k})`);
				}

				obj[kn] ??= [];
				obj = isLast ? obj[kn][idx] = v : (obj[kn][idx] ??= {});

				continue;
			}

			if (!isLast) {
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

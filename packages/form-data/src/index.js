/**
 * Parses a {@link FormData} javascript object.
 * 
 * - Properties are nested by a `.` (e.g. `key1.key12` -> `{ key1: { key12: "" } }`)
 * - Arrays are described by `field[]` or a `field[0]` to indicate their indexes.
 * 
 * @example
 * const data = new FormData();
 * data.set("field", "value");
 * data.set("nested.field", "123");
 * data.("nested.field2[]")
 * 
 * @template {{}} T
 * 
 * @param {FormData} data
 * 
 * @returns {T}
 */
export function parseFormData(data) {

}
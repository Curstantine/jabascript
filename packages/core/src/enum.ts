type ReadonlyRecordEntriesType<T extends Record<PropertyKey, PropertyKey>> = readonly [
	keyof T,
	T[keyof T],
][];
type ReadonlyRecordKeysType<T extends Record<PropertyKey, PropertyKey>> = readonly (keyof T)[];
type ReadonlyRecordValuesType<T extends Record<PropertyKey, PropertyKey>> = readonly T[keyof T][];

type EnumLike<T extends Record<PropertyKey, PropertyKey>> = T & {
	keys: () => ReadonlyRecordKeysType<T>;
	values: () => ReadonlyRecordValuesType<T>;
	entries: () => ReadonlyRecordEntriesType<T>;
};

export function createEnum<T extends Record<PropertyKey, PropertyKey>>(
	enumLike: T,
): EnumLike<T> {
	return Object.freeze({
		...enumLike,
		keys: () => Object.keys(enumLike) as ReadonlyRecordKeysType<T>,
		values: () => Object.values(enumLike) as unknown as ReadonlyRecordValuesType<T>,
		entries: () => Object.entries(enumLike) as unknown as ReadonlyRecordEntriesType<T>,
	});
}

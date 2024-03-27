export function assertDefined<T>(val: T | null | undefined): asserts val is T {
	if (val === null) {
		throw new Error("assertDefined failed");
	}
}

export function assertDef<T>(val: T | null | undefined): T {
	const v = val;
	assertDefined(v);
	return v;
}

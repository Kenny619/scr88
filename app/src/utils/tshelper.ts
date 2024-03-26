export function assertDefined<T>(val: T | null | undefined): asserts val is T {
	if (val === null) {
		throw new Error("assertDefined failed");
	}
}

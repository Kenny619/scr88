export function exists<T>(v: T | null | undefined): v is NonNullable<T> {
	return typeof v !== 'undefined' && v !== null;
}

export function isElement(v: Element | null | undefined): v is Element {
	return v instanceof Element;
}

export function isDocument(v: Document | null | undefined): v is Document {
	return v instanceof Document;
}





export function assertExists<T>(
	v: T | null | undefined,
): asserts v is NonNullable<T> {
	if (!exists(v)) {
		throw new Error("null|undefined return value.  Exit program.");
	}
}

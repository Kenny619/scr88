export function exists<T>(v: T | null | undefined): v is NonNullable<T> {
	return typeof v !== "undefined" && v !== null;
}

export function isElement(v: Element | null | undefined): v is Element {
	return v instanceof Element;
}

// export function isElement(v: string | null | undefined) {
// 	if (typeof v === "string") {
// 		const template = document.createElement("template");
// 		template.innerHTML = v.trim();
// 		return template.content.firstChild instanceof HTMLElement;
// 	}
// 	return false;
// }

export function isDocument(v: Document | null | undefined): v is Document {
	return v instanceof Document;
}

export function assertExists<T>(v: T | null | undefined): asserts v is NonNullable<T> {
	if (!exists(v)) {
		throw new Error("null|undefined return value.  Exit program.");
	}
}

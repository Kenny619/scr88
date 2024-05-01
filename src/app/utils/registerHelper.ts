import https from "node:https";
import { JSDOM, ResourceLoader } from "jsdom";
import userAgent from "./userAgents.js";

type extractTypes = "link" | "text" | "node";

export function isURLalive(url: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		https
			.get(url, (res) => {
				(res.statusCode as number) < 400 ? resolve(true) : reject(false);
			})
			.on("error", () => {
				reject(false);
			});
	});
}

export async function getDOM(url: string): Promise<Document> {
	let dom: Document;

	const loader = new ResourceLoader({
		userAgent: userAgent(),
	});

	try {
		const jd = await JSDOM.fromURL(url, { resources: loader });
		dom = jd.window.document;
	} catch (err) {
		throw new Error(`JSDOM failed on ${url}\n ${err}`);
	}
	return dom;
}

export async function getSerializedDOM(url: string): Promise<string> {
	const loader = new ResourceLoader({
		userAgent: userAgent(),
	});

	try {
		const jd = await JSDOM.fromURL(url, { resources: loader });
		const dom = jd.serialize();
		return dom;
	} catch (err) {
		throw new Error(`JSDOM failed on ${url}\n ${err}`);
	}
}

export function extractAll(type: extractTypes, dom: Document | string, selector: string): string[] {
	//recreate JSDOM if dom was passed in a serialized string format
	let elems: NodeListOf<Element> | undefined;
	if (typeof dom === "string") {
		const rdom = new JSDOM(dom).window.document;
		elems = rdom.querySelectorAll(selector);
	} else {
		elems = dom.querySelectorAll(selector);
	}

	//return empty array if querySelectorALl fails
	if (!elems) {
		return [];
	}

	//Extract strings from the result of querySelectorAll in accordance with type.  filter out null values.
	let ary = [];
	switch (type) {
		case "link":
			ary = Array.from(elems)
				.map((el) => el.getAttribute("href"))
				.filter((v) => v !== null);
			break;
		case "text":
			ary = Array.from(elems)
				.map((el) => el.textContent)
				.filter((v) => v !== null);
			break;
		case "node":
			ary = Array.from(elems)
				.map((el) => el.outerHTML)
				.filter((v) => v !== null);

			/*	.filter((v) => v !== null)
				.reduce((acc, cur) => {
					return acc + cur.outerHTML;
				});
				**/
			break;
	}
	return ary.length === 0 ? [] : (ary as string[]);
}

export function extract(type: extractTypes, dom: string | Document, selector: string): string {
	let el: Element | null = null;
	if (typeof dom === "string") {
		const rdom = new JSDOM(dom).window.document;
		el = rdom.querySelector(selector);
	} else {
		el = dom.querySelector(selector);
	}

	if (!el) {
		return "";
	}

	switch (type) {
		case "link":
			return el.getAttribute("href") ?? "";
		case "text":
			return el.textContent ?? "";
		case "node":
			return el.outerHTML ?? "";
	}
}

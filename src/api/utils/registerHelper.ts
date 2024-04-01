import { JSDOM, ResourceLoader } from "jsdom";
import userAgent from "./userAgents.js";
import https from "node:https";

type singleTypes = "text" | "link" | "node";
type multiTypes = "texts" | "links" | "nodes";

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
		return jd.serialize();
	} catch (err) {
		throw new Error(`JSDOM failed on ${url}\n ${err}`);
	}
}

export function extractAll(type: multiTypes, dom: Document | string, selector: string): string[] | { error: unknown } {
	let elems: NodeListOf<Element>;
	try {
		const document = typeof dom === "string" ? new JSDOM(dom).window.document : dom;
		elems = document.querySelectorAll(selector);
	} catch (e) {
		return { error: e };
	}

	//return empty array if querySelectorALl fails
	if (!elems) {
		return [];
	}

	//Extracted string storage from the result of querySelectorAll.  Filter out null values.
	let ary: string[] = [];

	switch (type) {
		case "links":
			ary = Array.from(elems)
				.map((el) => el.getAttribute("href"))
				.filter(filterOutNull);
			break;
		case "texts":
			ary = Array.from(elems)
				.map((el) => el.textContent)
				.filter(filterOutNull);
			break;
		case "nodes":
			ary = Array.from(elems)
				.map((el) => el.outerHTML)
				.filter(filterOutNull);
			break;
	}
	return ary.length > 0 ? ary : [];
}

export function extract(type: singleTypes, dom: string | Document, selector: string): string | { error: unknown } {
	let el: Element | null = null;
	try {
		const document = typeof dom === "string" ? new JSDOM(dom).window.document : dom;
		el = document.querySelector(selector);
	} catch (e) {
		return { error: e };
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

//force strict type checking on filter in below switch
function filterOutNull<T>(value: T | null | undefined): value is T {
	if (value === null || value === undefined) return false;
	const t: T = value;
	return t ? true : true;
}

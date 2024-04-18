import { JSDOM, ResourceLoader } from "jsdom";
import userAgent from "./userAgents.js";
import v from "validator";
import https from "node:https";
import http from "node:http";

type singleTypes = "text" | "link" | "node";
type multiTypes = "texts" | "links" | "nodes" | "nodeElements";

type IsURLalive = (url: string) => Promise<boolean>;
const isURLalive: IsURLalive = (url: string) => {
	return new Promise((resolve, reject) => {
		if (!v.isURL(url)) reject(false);

		const urlObj = new URL(url);
		const protocol = urlObj.protocol === "https:" ? https : urlObj.protocol === "http:" ? http : null;

		if (protocol === null) {
			reject(false);
		} else {
			protocol
				.get(url, (res) => {
					(res.statusCode as number) < 400 ? resolve(true) : reject(false);
				})
				.on("error", () => {
					reject(false);
				});
		}
	});
};

type GetDOM = (url: string) => Promise<Document>;
const getDOM: GetDOM = async (url: string) => {
	if (!isURLalive(url)) throw new Error(`${url} `);

	const loader = new ResourceLoader({ userAgent: userAgent() });

	try {
		return (await JSDOM.fromURL(url, { resources: loader })).window.document;
	} catch (e) {
		throw new Error(`getDOM failed on ${url}\n ${e}`);
	}
};

type GetSerializedDOM = (url: string) => Promise<string>;
const getSerializedDOM: GetSerializedDOM = async (url: string) => {
	if (!isURLalive(url)) throw new Error(`${url} `);

	const loader = new ResourceLoader({ userAgent: userAgent() });

	try {
		return (await JSDOM.fromURL(url, { resources: loader })).serialize();
	} catch (err) {
		throw new Error(`getSerializedDOM failed on ${url}\n ${err}`);
	}
};
type ExtractAllReturn<T extends multiTypes> = T extends "nodeElements" ? Element[] : T extends Exclude<multiTypes, "nodeElements"> ? string[] : never; //T extends Exclude<multiTypes, "nodeElements"> ? string : T extends "nodeElement" ? Element : never;
type ExtractAll = <T extends multiTypes>(type: T, dom: Document | Element | string, selector: string) => ExtractAllReturn<T>;
const extractAll: ExtractAll = (type, dom, selector) => {
	let elems: NodeListOf<Element>;
	try {
		const document = typeof dom === "string" ? new JSDOM(dom).window.document : (dom as Document);
		elems = document.querySelectorAll(selector);
	} catch (e) {
		throw new Error(`extractAll failed.   type:${type}, selector:${selector}, e:${e}`);
	}

	let ary = [] as string[] | Element[];

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
		case "nodeElements":
			ary = Array.from(elems)
				.map((el) => el)
				.filter(filterOutNull);
			break;
	}
	return ary as ExtractAllReturn<typeof type>;
};

export function extract<T extends string | Element | Document>(type: singleTypes, dom: T, selector: string): T extends string ? string | { error: unknown } : string {
	let el: Element | null = null;
	try {
		const document = typeof dom === "string" ? new JSDOM(dom).window.document : (dom as Document | Element);
		el = document.querySelector(selector);
	} catch (e) {
		if (typeof dom === "string") {
			throw new Error(`${e}`);
		}
		throw e;
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

export { isURLalive, getDOM, extractAll, getSerializedDOM };

import type { singleTypes, multiTypes } from "../../../typings/api.js";
import { JSDOM, ResourceLoader } from "jsdom";
import userAgent from "./userAgents.js";
import v from "validator";
import https from "node:https";
import http from "node:http";

type IsURLalive = (url: string) => Promise<boolean>;
const isURLalive: IsURLalive = (url: string) => {
	return new Promise((resolve, reject) => {
		if (!v.isURL(url)) reject(false);

		const urlObj = new URL(url);
		const protocol = urlObj.protocol === "https:" ? https : urlObj.protocol === "http:" ? http : null;

		if (protocol === null) {
			reject(`Invalid protocol: ${protocol}`);
		} else {
			protocol
				.get(url, (res) => {
					(res.statusCode as number) < 400 ? resolve(true) : reject(false);
				})
				.on("error", (err) => {
					reject(err);
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

type ExtractAllReturn<T extends multiTypes> = T extends "nodeElements" ? Element[] : string[];
type ExtractAll = <T extends multiTypes>(type: T, dom: Document | Element | string, selector: string) => ExtractAllReturn<T>;
const extractAll: ExtractAll = (type, dom, selector) => {
	let elems: NodeListOf<Element>;
	try {
		const document = typeof dom === "string" ? new JSDOM(dom).window.document : (dom as Document);
		elems = document.querySelectorAll(selector);
	} catch (e) {
		throw new Error(`${e}`);
	}

	let ary: string[] | Element[] = [];

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
	if (ary.length === 0) throw new Error(`${Function.name} returned no value`);
	return ary as ExtractAllReturn<typeof type>;
};

//return Element type if type is set to "nodeElement".  For everything else return string.
type extractRet<T extends singleTypes> = T extends "nodeElement" ? Element : string;
type Extract = <T extends singleTypes>(type: T, dom: string | Element | Document, selector: string) => extractRet<T>;
const extract: Extract = (type, dom, selector) => {
	let el: Element | null = null;
	try {
		const document = typeof dom === "string" ? new JSDOM(dom).window.document : (dom as Document | Element);
		el = document.querySelector(selector);
	} catch (e) {
		throw new Error(`${e}`);
	}
	if (!el) {
		throw new Error(`${Function.name} failed to extract Element using ${selector}`);
	}
	switch (type) {
		case "link":
			return (el.getAttribute("href") as extractRet<typeof type>) ?? "";
		case "text":
			return (el.textContent as extractRet<typeof type>) ?? "";
		case "node":
			return (el.outerHTML as extractRet<typeof type>) ?? "";
		case "nodeElement":
			return el as extractRet<typeof type>;
		default:
			throw new Error(`unexpcted type argument ${type}`);
	}
};

//force strict type checking on filter in below switch
function filterOutNull<T>(value: T | null | undefined): value is T {
	if (value === null || value === undefined) return false;
	const t: T = value;
	return t ? true : true;
}

export { isURLalive, getDOM, extract, extractAll, getSerializedDOM };

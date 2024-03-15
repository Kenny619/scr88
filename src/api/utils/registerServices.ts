import { isURLalive, extract, extractAll } from "./registerHelper.js";
import val from "validator";

type valResult<T extends string | string[]> = { pass: true; result: T } | { pass: false; errMsg: string };

//validateName
export function name(name: string): valResult<string> {
	return {
		pass: true,
		result: name,
	};
}

export async function url(url: string): Promise<valResult<string>> {
	if (!val.isURL(url)) {
		return { pass: false, errMsg: "Invalid URL format" };
	}

	return (await isURLalive(url)) ? { pass: true, result: url } : { pass: false, errMsg: "URL is not alive" };
}

export async function nodes(selector: string, serializedDom: string): Promise<valResult<string[]>> {
	const extracted = extractAll("node", serializedDom, selector);
	return extracted ? { pass: true, result: extracted } : { pass: false, errMsg: "failed to acquire HTML nodes" };
}

export async function text(selector: string, serializedDom: string): Promise<valResult<string>> {
	const extracted = extract("text", serializedDom, selector);
	return extracted ? { pass: true, result: extracted } : { pass: false, errMsg: "failed to acquire text" };
}

export async function texts(selector: string, serializedDom: string): Promise<valResult<string[]>> {
	const extracted = extractAll("text", serializedDom, selector);
	return extracted ? { pass: true, result: extracted } : { pass: false, errMsg: "failed to acquire text" };
}

export async function link(selector: string, serializedDom: string): Promise<valResult<string>> {
	const extracted = extract("link", serializedDom, selector);
	return extracted ? { pass: true, result: extracted } : { pass: false, errMsg: "failed to acquire links" };
}

export async function links(selector: string, serializedDom: string): Promise<valResult<string[]>> {
	const extracted = extractAll("link", serializedDom, selector);
	return extracted ? { pass: true, result: extracted } : { pass: false, errMsg: "failed to acquire links" };
}

export function regex(regex: string, url: string): valResult<string> {
	const r = new RegExp(regex);
	const m = url.match(r);

	return m ? { pass: true, result: m[1] } : { pass: false, errMsg: "No match" };
}

export async function parameter(parameter: string, u: string): Promise<valResult<string>> {
	const urlObj = new URL(u);
	const params = urlObj.searchParams;
	if (params.has(parameter)) {
		const pageNum = params.get(parameter);
		params.set(parameter, String(Number(pageNum as string) + 1));
		const newUrl = `${urlObj.origin}?${params.toString()}`;
		return await url(newUrl);
	}

	return { pass: false, errMsg: "No matching URL parameter" };
}

export async function pageNumInUrl(regex: string, u: string): Promise<valResult<string>> {
	const re = new RegExp(regex);
	const m = u.match(re);
	if (m) {
		const NextpageNum = String(Number(m[1]) + 1);
		const newURL = u.replace(re, NextpageNum);
		return await url(newURL);
	}

	return { pass: false, errMsg: "No matching URL parameter" };
}

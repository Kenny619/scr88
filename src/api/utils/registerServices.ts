import { isURLalive, extract, extractAll } from "./registerHelper.js";
import val from "validator";
import mysql from "mysql2/promise";
type valResult<T extends string | string[]> = { pass: true; result: T } | { pass: false; errMsg: string };

//mysql connection
const env = {
	host: process.env.DB_HOST as string,
	port: Number(process.env.DB_PORT),
	user: process.env.DB_USER as string,
	password: process.env.DB_PASSWORD as string,
	database: "scr88",
	namedPlaceholders: true,
};
const connection = await mysql.createConnection(env);

//validateName
export async function name(name: string): Promise<valResult<string>> {
	try {
		const [result, field] = await connection.query("SELECT id FROM scrapers WHERE name = :name", { name: name });
		console.log("result:", result, "field:", field);
		return (result as []).length > 0 ? { pass: false, errMsg: "This name is already in use" } : { pass: true, result: "Valid name" };
	} catch (e) {
		return { pass: false, errMsg: e as string };
	}
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

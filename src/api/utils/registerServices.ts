import { isURLalive, extract, extractAll } from "./registerHelper.js";
import validator from "validator";
import mysql from "mysql2/promise";
// type valResult<T extends string | string[]> = { pass: true; result: T } | { pass: false; errMsg: string | unknown };

type singleTypes = "text" | "link" | "node";
type multiTypes = "texts" | "links" | "nodes";
type extractTypes = singleTypes | multiTypes;
type result<T extends string | string[]> = { pass: true; result: T } | { pass: false; errMsg: string } | { pass: false; errMsg: unknown };

//mysql
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
export async function name(name: string): Promise<result<string>> {
	try {
		const [result, field] = await connection.query("SELECT id FROM scrapers WHERE name = :name", { name: name });
		console.log("result:", result, "field:", field);
		return (result as []).length > 0 ? { pass: false, errMsg: "This name is already in use" } : { pass: true, result: "Valid name" };
	} catch (e) {
		return { pass: false, errMsg: e };
	}
}

export async function url(url: string): Promise<result<string>> {
	return !validator.isURL(url)
		? { pass: false, errMsg: "Invalid URL format" }
		: (await isURLalive(url))
		  ? { pass: true, result: url }
		  : { pass: false, errMsg: "URL is not alive" };
}

export function testSelector<T extends extractTypes>(type: T, serializedDom: string, selector: string): result<string | string[]> {
	const extracted = type === "text" || type === "link" || type === "node" ? extract(type, serializedDom, selector) : extractAll(type, serializedDom, selector);
	try {
		return !Array.isArray(extracted) && typeof extracted === "object"
			? { pass: false, errMsg: extracted.error }
			: extracted
			  ? { pass: true, result: extracted }
			  : { pass: false, errMsg: "Input selector could not find a match" };
	} catch (e) {
		return { pass: false, errMsg: e };
	}
}

export function regex(url: string, regex: string): result<string> {
	try {
		const r = new RegExp(regex);
		const m = url.match(r);
		console.log(r, m, regex, url);
		return m ? { pass: true, result: m[1] } : { pass: false, errMsg: "No match" };
	} catch (e) {
		return { pass: false, errMsg: e };
	}
}

export async function parameter(u: string, parameter: string): Promise<result<string>> {
	try {
		const urlObj = new URL(u);
		const params = urlObj.searchParams;
		if (params.has(parameter)) {
			const pageNum = params.get(parameter);
			params.set(parameter, String(Number(pageNum as string) + 1));
			const newUrl = `${urlObj.origin}?${params.toString()}`;
			return await url(newUrl);
		}
		return { pass: false, errMsg: "No matching URL parameter" };
	} catch (e) {
		return { pass: false, errMsg: e };
	}
}

export async function pageNumInUrl(pageUrl: string, regex: string): Promise<result<string>> {
	try {
		const re = new RegExp(regex);
		const m = pageUrl.match(re);
		if (m) {
			const NextpageNum = String(Number(m[1]) + 1);
			const newURL = pageUrl.replace(re, NextpageNum);
			return await url(newURL);
		}
		return { pass: false, errMsg: "No matching URL parameter" };
	} catch (e) {
		return { pass: false, errMsg: `${regex} is not a valid regular expression` };
	}
}

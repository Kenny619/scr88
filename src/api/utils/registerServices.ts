import type { result, extractTypes, multiTypes } from "../../../typings/api.js";
import { isURLalive, extract, extractAll } from "./registerHelper.js";
import validator from "validator";
import mysql from "mysql2/promise";
import Log from "src/log/logging.js";

//funciton types
type FnPromiseStr = (input: string) => Promise<result<string>>;
type FnURLPromiseStr = (pageUrl: string, input: string) => Promise<result<string>>;
//logging
Log.init("registerService", process.env.LOGFILEPATH as string);

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
const name: FnPromiseStr = async (input) => {
	try {
		const [result, field] = await connection.query(`SELECT id FROM scrapers WHERE name = '${input}'`);
		console.log("result:", result, "field:", field);
		return (result as []).length > 0 ? { pass: false, errMsg: "This name is already in use" } : { pass: true, result: "Valid name" };
	} catch (e) {
		return { pass: false, errMsg: e };
	}
};

const saveconfig = async (obj: { key: string; val: string }): Promise<result<string>> => {
	const insertQuery = `INSERT INTO scrapers (${obj.key}) values (${obj.val});`;

	try {
		const [result, _] = await connection.query(insertQuery);
		return { pass: true, result: `Configuration saved as id${(result as mysql.ResultSetHeader).insertId}.` };
	} catch (e) {
		return { pass: false, errMsg: `Failed to save configuration.  ERROR: ${e}` };
	} finally {
		connection.end();
	}
};

const url: FnPromiseStr = async (input) => {
	if (!validator.isURL(input)) {
		return { pass: false, errMsg: "Invalid URL format" };
	}

	try {
		await isURLalive(input);
		return { pass: true, result: input };
	} catch (e) {
		return { pass: false, errMsg: e };
	}
};

type ReturnObj<T extends string | string[] | Element | Element[]> = { pass: true; result: T } | { pass: false; errMsg: unknown };
type passedReturn<T extends extractTypes> = T extends "nodeElement"
	? Element
	: T extends "nodeElements"
	  ? Element[]
	  : T extends Exclude<multiTypes, "nodeElements">
		  ? string[]
		  : string;
type TestSelectorReturn<T extends extractTypes> = ReturnObj<passedReturn<T>>;
type TestSelector = <T extends extractTypes>(type: T, serializedDom: string, selector: string) => TestSelectorReturn<T>;
const testSelector: TestSelector = (type, serializedDom, selector) => {
	try {
		const extracted =
			type === "text" || type === "link" || type === "node" || type === "nodeElement" ? extract(type, serializedDom, selector) : extractAll(type, serializedDom, selector);
		return { pass: true, result: extracted as string | string[] | Element | Element[] } as TestSelectorReturn<typeof type>;
	} catch (e) {
		return { pass: false, errMsg: `${e}` };
	}
};

const regex = (pageUrl: string, input: string): result<string> => {
	try {
		const matchResult = pageUrl.match(new RegExp(input));
		return matchResult ? { pass: true, result: matchResult[1] } : { pass: false, errMsg: "No match" };
	} catch (e) {
		return { pass: false, errMsg: e };
	}
};

const parameter: FnURLPromiseStr = async (pageUrl, input) => {
	try {
		const urlObj = new URL(pageUrl);
		const params = urlObj.searchParams;
		if (params.has(input)) {
			const pageNum = params.get(input);
			params.set(input, String(Number(pageNum as string) + 1));
			const newUrl = `${urlObj.origin}?${params.toString()}`;
			return await url(newUrl);
		}
		return { pass: false, errMsg: "No matching URL parameter" };
	} catch (e) {
		return { pass: false, errMsg: e };
	}
};

const pageNumInUrl: FnURLPromiseStr = async (pageUrl, input) => {
	try {
		const re = new RegExp(input);
		const m = pageUrl.match(re);
		if (m) {
			const NextpageNum = String(Number(m[1]) + 1);
			const newURL = pageUrl.replace(re, NextpageNum);
			return await url(newURL);
		}
		return { pass: false, errMsg: "No matching URL parameter" };
	} catch (e) {
		return { pass: false, errMsg: `${input} is not a valid regular expression` };
	}
};

export { name, saveconfig, url, regex, parameter, pageNumInUrl, testSelector };

import { JSDOM, ResourceLoader } from "jsdom";
import { site } from "../../typings/index.js";
import userAgent from "./userAgents.js";

type extractTypes = "link" | "text" | "node";

type querySelectorAll = keyof Pick<
	site,
	//"indexLinkBlockSelector" | "articleBlockSelector" | "indexLinkSelector" | "indexTagSelector" | "articleTagSelector"
	"articleBlockSelector" | "articleTagSelector" | "indexLinkSelector"
>;
type excludeValidation = keyof Pick<
	site,
	| "name"
	| "rootUrl"
	| "entryUrl"
	//	| "logDir"
	| "language"
	| "saveDir"
	| "siteType"
	| "nextPageType"
	| "startingPageNumber"
	| "tagCollect"
	| "tagFiltering"
	| "tags"
>;
type querySelector = keyof Omit<site, querySelectorAll | excludeValidation>;
type singleResult = { pass: true; returned: string | Element } | { pass: false; error: string };
type multipleResult = { pass: true; returned: string[] | Element[] } | { pass: false; error: string };
type querySelectorResult = {
	[K in querySelector]: singleResult;
};
type querySelectorAllResult = {
	[K in querySelectorAll]: multipleResult;
};

type valResults = Partial<querySelectorResult & querySelectorAllResult>;

export default async function register(site: site): Promise<valResults> {
	const valResults: valResults = {};

	const entryUrlDOM = await getDOM(site.entryUrl);
	let articlePageDOM: null | Document = null;

	/****************************************** next URL */

	switch (site.nextPageType) {
		case "last":
			validateLastUrlSelector();
			validateLastPageNumberRegExp();
			break;

		case "parameter":
			validateNextPageParameter();
			break;

		case "next":
			validateNextPageLinkSelector();
			break;

		case "url":
			validateNextPageUrlRegExp();
			break;

		default:
			throw new Error(`Unknown nextPageType: ${site.nextPageType}`);
	}
	/****************************************** link index */

	if (site.siteType === "links") {
		validateIndexLinkSelector();
	}

	/****************************************** tags */
	//if(site.siteType === )

	/****************************************** articles */
	validateArticle("articleTitleSelector");
	validateArticle("articleBodySelector");
	if (site.tagCollect && site.tags) {
		validateArticle("articleTagSelector");
	}

	return valResults;

	function validateLastUrlSelector() {
		valResults.lastUrlSelector = extract("link", entryUrlDOM, "lastUrlSelector");
	}

	function validateLastPageNumberRegExp() {
		if (!Object.hasOwn(valResults, "lastUrlSelector")) {
			validateLastUrlSelector();
		}

		if (!valResults.lastUrlSelector?.pass) {
			valResults.lastPageNumberRegExp = {
				pass: false,
				error: "Failed to acquire lastUrlSelector",
			};
		} else {
			const regexp = new RegExp(site.lastPageNumberRegExp as string);

			const lastUrl = valResults.lastUrlSelector.returned as string;
			const matched = lastUrl.match(regexp);

			valResults.lastPageNumberRegExp = matched
				? {
						pass: true,
						returned: matched[1],
				  }
				: {
						pass: false,
						error: "RegExp returned null",
				  };
		}
	}

	function getNextPageParameterValue(): string | null {
		const urlObj = new URL(site.entryUrl);
		const params = new URLSearchParams(urlObj.search);

		return params.has(site.nextPageParameter as string) ? params.get(site.nextPageParameter as string) : null;
	}

	function validateNextPageParameter() {
		const paramVal = getNextPageParameterValue();

		valResults.nextPageParameter = paramVal
			? {
					pass: true,
					returned: paramVal,
			  }
			: {
					pass: false,
					error: `entry URL does not have parameter ${site.nextPageParameter}`,
			  };
	}

	function validateNextPageLinkSelector() {
		valResults.nextPageLinkSelector = extract("link", entryUrlDOM, "nextPageLinkSelector");
	}

	function validateNextPageUrlRegExp() {
		const urlRegExp = new RegExp(site.nextPageUrlRegExp as string);
		const matchResult = site.entryUrl.match(urlRegExp);

		valResults.nextPageUrlRegExp = matchResult
			? {
					pass: true,
					returned: matchResult[1],
			  }
			: {
					pass: false,
					error: `RegExp ${site.nextPageUrlRegExp} could not find a match in ${site.entryUrl}`,
			  };
	}

	function validateIndexLinkSelector() {
		const links = extractAll("link", entryUrlDOM, "indexLinkSelector");
		if (links.pass) {
			valResults.indexLinkSelector = checkForNull(links.returned);
		}
	}

	/*
	function validateIndexTagSelector() {
		if (!Object.hasOwn(valResults, "indexLinkBlockSelector")) {
			validateIndexLinkBlockSelector();
		}

		if (!valResults.indexLinkBlockSelector?.pass) {
			valResults.indexTagSelector = {
				pass: false,
				error: "Failed to acquire indexLinkBlockSelector",
			};
		} else {
			const elms = valResults.indexLinkBlockSelector?.returned as Element[];
			const tags = elms.map((el) => {
				const anchor = el.querySelectorAll(site.indexTagSelector as string);
				return !anchor
					? null
					: Array.from(anchor)
							.map((a) => a.textContent)
							.join(",");
			});

			return checkForNull(tags);
		}
	}
*/

	function validateArticleBlockSelector() {
		valResults.articleBlockSelector = extractAll("node", entryUrlDOM, "articleBlockSelector");
	}

	async function validateArticle<T extends "articleTitleSelector" | "articleBodySelector" | "articleTagSelector">(
		selectorName: T,
	) {
		if (site.siteType === "singleArticle") {
			if (selectorName === "articleTagSelector") {
				valResults[selectorName as "articleTagSelector"] = extractAll("text", entryUrlDOM, selectorName);
			} else {
				valResults[selectorName as Exclude<T, "articleTagSelector">] = extract("text", entryUrlDOM, selectorName);
			}
		}

		if (site.siteType === "multipleArticle") {
			if (!Object.hasOwn(valResults, "articleBlockSelector")) {
				validateArticleBlockSelector();
			}

			if (valResults.articleBlockSelector?.pass) {
				const elms = valResults.articleBlockSelector?.returned as Element[];
				if (selectorName === "articleTagSelector") {
					valResults[selectorName as "articleTagSelector"] = extractAll("text", elms[0], selectorName);
				} else {
					valResults[selectorName as Exclude<T, "articleTagSelector">] = extract("text", elms[0], selectorName);
				}
			}
		}
		if (site.siteType === "links") {
			if (!Object.hasOwn(valResults, "indexLinkSelector")) {
				validateIndexLinkSelector();
			}
			if (!valResults.indexLinkSelector?.pass) {
				valResults[selectorName] = {
					pass: false,
					error: "Failed to acquire indexLinkSelector",
				};
			} else {
				const links = valResults.indexLinkSelector.returned as string[];
				if (!articlePageDOM) {
					articlePageDOM = await getDOM(links[0]);
				}
				if (selectorName === "articleTagSelector") {
					valResults[selectorName as "articleTagSelector"] = extractAll(
						"text",
						articlePageDOM as Document,
						selectorName,
					);
				} else {
					valResults[selectorName as Exclude<T, "articleTagSelector">] = extract(
						"text",
						articlePageDOM as Document,
						selectorName,
					);
				}
			}
		}
	}

	async function getDOM(url: string): Promise<Document> {
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

	function extractAll(type: extractTypes, elem: Element | Document, selectorName: querySelectorAll): multipleResult {
		if (!Object.hasOwn(site, selectorName)) {
			return {
				pass: false,
				error: `Failed to get selector from ${site[selectorName]}`,
			};
		}

		const selector = site[selectorName];
		const elems = elem.querySelectorAll(selector as string);

		if (!elems) {
			return {
				pass: false,
				error: `querySelectorAll failed on ${selector}`,
			};
		}

		let returned: string[] | Element[] | Array<null | string> | Array<Element | null> = [];
		if (type === "link") {
			returned = Array.from(elems).map((el) => el.getAttribute("href"));
		}

		if (type === "text") {
			returned = Array.from(elems).map((el) => el.textContent);
		}

		if (type === "node") {
			returned = Array.from(elems);
		}

		return checkForNull(returned);
	}

	function extract(type: extractTypes, elem: Element | Document, selectorName: querySelector): singleResult {
		if (!Object.hasOwn(site, selectorName)) {
			return {
				pass: false,
				error: `Missing ${selectorName}`,
			};
		}

		const selector = site[selectorName] as string;

		const el = elem.querySelector(selector);

		if (!el) {
			return {
				pass: false,
				error: `querySelector failed on ${selector}`,
			};
		}

		let extracted: string | Element | null = null;
		if (type === "link") extracted = el.getAttribute("href");
		if (type === "text") extracted = el.textContent;
		if (type === "node") extracted = el;

		return checkForNull(extracted);
	}

	function checkForNull<
		T extends string | Element | Array<string> | Array<Element> | null | Array<string | null> | Array<Element | null>,
	>(
		val: T,
	):
		| { pass: true; returned: NonNullable<T extends string | Element ? string | Element : never> }
		| { pass: true; returned: NonNullable<T extends string[] | Element[] ? string[] | Element[] : never> }
		| { pass: false; error: string } {
		if (Array.isArray(val)) {
			for (const v of val) {
				if (v === null) {
					return { pass: false, error: `Returned value includes null.  ${val}` };
				}
			}
			return {
				pass: true,
				returned: val as Extract<T, string[] | Element[]>,
			};
		}

		return val !== null
			? { pass: true, returned: val as Extract<T, string | Element> }
			: { pass: false, error: `Returned value is null.  ${val}` };
	}
}

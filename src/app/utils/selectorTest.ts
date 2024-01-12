import { JSDOM, ResourceLoader } from "jsdom";
import { site } from "../../typings/index.js";
import userAgent from "./userAgents.js";

/*
Selectors to be tested
lastUrlSelector
└lastPageNumberRegExp

nextPageLinkSelector
nextPageUrlRegExp

indexLinkBlockSelector
  indexTagSelector
  indexLinkSelector
  
  articleBlockSelector
	  articleTagSelector
	  articleTitleSelector
	  articleBodySelector

articleBlockSelector
  articleTagSelector
  articleTitleSelector
  articleBodySelector
*/

type extractTypes = "link" | "text";

type resultSingle =
	| {
			pass: true;
			returned: string;
	  }
	| {
			pass: false;
			error: string;
	  };

type resultAll =
	| {
			pass: true;
			returned: Element;
	  }
	| {
			pass: false;
			error: string;
	  };

type testResult<T> = {
	[K in keyof T]: resultSingle | resultAll;
};

type selectors = Pick<
	site,
	| "lastUrlSelector"
	| "lastPageNumberRegExp"
	| "nextPageLinkSelector"
	| "nextPageUrlRegExp"
	| "nextPageParameter"
	| "indexTagSelector"
	| "indexLinkBlockSelector"
	| "indexLinkSelector"
	| "articleTagSelector"
	| "articleBlockSelector"
	| "articleTitleSelector"
	| "articleBodySelector"
>;

/*
interface Selectors {
lastUrlSelector: result;
	lastPageNumberRegExp: result;

	nextPageLinkSelector: result;
	nextPageUrlRegExp: result;

	indexTagSelector: result;
	indexLinkBlockSelector: result;
	indexLinkSelector: result;

	articleTagSelector: result;
	articleBlockSelector: result;

	articleTitleSelector: result;
	articleBodySelector: result;
}
*/

export default async function validateSelectors(site: site): Promise<testResult<selectors>> {
	const testResults = <testResult<selectors>>{};

	const indexDom = await getDom(site.entryUrl);

	if (site.nextPageType === "last") {
		testResults.lastUrlSelector = extract("link", indexDom, "lastUrlSelector");
		if (testResults.lastUrlSelector.pass && site.lastPageNumberRegExp) {
			const regexp = new RegExp(site.lastPageNumberRegExp);
			const matched = testResults.lastUrlSelector.returned.match(regexp);
			if (matched) {
				testResults.lastPageNumberRegExp = {
					pass: true,
					returned: matched[1],
				};
			} else {
				testResults.lastPageNumberRegExp = {
					pass: false,
					error: "RegExp returned null",
				};
			}
		} else {
			if (!site.lastPageNumberRegExp) {
				testResults.lastPageNumberRegExp = {
					pass: false,
					error: "Missing lastPageNumberRegExp",
				};
			}
		}
	}

	if (site.nextPageType === "next" || site.nextPageType === "pagenation") {
		testResults.nextPageLinkSelector = extract("link", indexDom, "nextPageLinkSelector");
	}

	function nextUrl(
		type: Omit<site["nextPageType"], "last" | "next" | "pagenation">,
		selectorName: keyof Pick<selectors, "nextPageUrlRegExp" | "nextPageParameter">,
	) {
		//actions for url and parameter could be quite different.  It'd be safe to write out parameter logic first.
	}
	if (site.nextPageType === "parameter") {
		//action
	}
	if (site.nextPageType === "url") {
		if (site.nextPageUrlRegExp) {
			const regexp = new RegExp(site.nextPageUrlRegExp);
			const matched = site.entryUrl.match(regexp);
			if (matched) {
				let cPageNumber = Number(matched[1]);
				cPageNumber++;
				const nextPageUrl = site.entryUrl.replace(regexp, cPageNumber.toString());
				const nextPageDOM = await getDom(nextPageUrl);
				if (nextPageDOM) {
					testResults.nextPageUrlRegExp = {
						pass: true,
						returned: nextPageUrl,
					};
				} else {
					testResults.nextPageUrlRegExp = {
						pass: false,
						error: `Invalid URL ${nextPageUrl}`,
					};
				}
			} else {
				testResults.nextPageUrlRegExp = {
					pass: false,
					error: `Invalid regexp ${regexp}.  No match over ${site.entryUrl}`,
				};
			}
		} else {
			testResults.nextPageUrlRegExp = {
				pass: false,
				error: "Missing nextPageUrlRegExp",
			};
		}

		testResults.nextPageUrlRegExp = {
			pass: false,
			error: "nextPageUrlRegExp is required when nextPageType is set to 'url'.",
		};
	}
	if (site.indexLinkBlockSelector) {
		testResults.indexLinkBlockSelector = extractAll(indexDom, "indexLinkBlockSelector");

		if (testResults.indexLinkBlockSelector.pass) {
			testResults.indexLinkSelector = extract("link", testResults.indexLinkBlockSelector.returned, "indexLinkSelector");
			if (site.tagFiltering) {
				testResults.indexTagSelector = extractAll(testResults.indexLinkBlockSelector.returned, "indexTagSelector");
			}
			if (testResults.indexLinkSelector.pass) {
				const articleDom: Document | Element = await getDom(testResults.indexLinkSelector.returned);
				testResults.articleTitleSelector = extract("text", articleDom, "articleTitleSelector");
				testResults.articleBodySelector = extract("text", articleDom, "articleBodySelector");
				if (site.tagCollect) {
					testResults.articleTagSelector = extractAll(articleDom, "articleTagSelector");
				}
			}
		}
	}
	return testResults;

	async function getDom(url: string): Promise<Document> {
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

	function extractAll(elem: Element | Document, selectorName: keyof selectors): resultAll {
		const selector = site[selectorName];
		if (!selector) {
			return {
				pass: false,
				error: `Failed to get selector from ${site[selectorName]}`,
			};
		}

		const elements = elem.querySelectorAll(selector);
		if (!elements) {
			return {
				pass: false,
				error: `querySelectorAll failed on ${selector}`,
			};
		}

		return {
			pass: true,
			returned: elements.item(0),
		};
	}

	function extract(type: extractTypes, elem: Element | Document, selectorName: keyof selectors): resultSingle {
		const selector = site[selectorName];
		if (!selector) {
			return {
				pass: false,
				error: `Failed to get selector from ${site[selectorName]}`,
			};
		}
		const el = elem.querySelector(selector);
		if (!el) {
			return {
				pass: false,
				error: `querySelector failed on ${selector}`,
			};
		}
		const extracted = type === "link" ? el.getAttribute("href") : el.textContent;
		if (!extracted) {
			return {
				pass: false,
				error: `Failed to get ${type} from Element acquired from ${selector}`,
			};
		}
		return {
			pass: true,
			returned: extracted,
		};
	}
}

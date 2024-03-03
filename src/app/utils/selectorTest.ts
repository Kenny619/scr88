import { JSDOM, ResourceLoader } from "jsdom";
import { site } from "../../typings/index.js";
import validateSiteInputs from "./srcWebsiteValidation.js";
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

type selectors = Partial<Pick<
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
>>;



export default async function validateSelectors(site: site): Promise<testResult<selectors>> {


	const valResult = validateSiteInputs(site);
	if (valResult.length > 0) throw new Error(valResult.join("\r\n"));


	const testResults = <testResult<selectors>>{};

	const indexDom = await getDom(site.entryUrl);



	if (site.nextPageType === "last") {

		testResults.lastUrlSelector = extract("link", indexDom, "lastUrlSelector");

		if (testResults.lastUrlSelector.pass) {
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
					error: `RegExp, '${site.lastPageNumberRegExp}' found no match against ${testResults.lastUrlSelector.returned}`
				};
			}
		}
	}

	if (site.nextPageType === "next" || site.nextPageType === "pagenation") {
		testResults.nextPageLinkSelector = extract("link", indexDom, "nextPageLinkSelector");
	}

	if (site.nextPageType === "parameter") {

		const url = new URL(site.entryUrl);
		if (url.searchParams.has(site.nextPageParameter)) {
			let cPageNum = Number(url.searchParams.get(site.nextPageParameter));
			cPageNum++;
			url.searchParams.set(site.nextPageParameter, String(cPageNum));
			const dom = await getDom(url.href);

			testResults.nextPageParameter = dom ? {
				pass: true,
				returned: url.href
			} : {
				pass: false,
				error: `Failed to acquire DOM from next URL ${url.href}.  Next page parameter was changed to ${cPageNum} from its original URL of ${site.entryUrl}`
			}

		} else {
			testResults.nextPageParameter = {
				pass: false,
				error: `Could not find nextPageParameter ${site.nextPageParameter} from the url ${site.entryUrl}`
			}
		}

	}


	if (site.nextPageType === "url") {
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
					error: `Invalid URL ${nextPageUrl}.  Unable to obtain DOM.`,
				};
			}
		} else {
			testResults.nextPageUrlRegExp = {
				pass: false,
				error: `Invalid regexp ${regexp}.  No match over ${site.entryUrl}`,
			};
		}
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

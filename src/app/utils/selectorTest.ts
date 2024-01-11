import { JSDOM, ResourceLoader } from "jsdom";
import { site } from "../../typings/index.js";
import userAgent from "./userAgents.js";

/*
Selectors to be tested
✅ lastUrlSelector
✅lastPageNumberRegExp

nextPageLinkSelector
nextPageUrlRegExp

✅indexTagSelector
✅indexLinkBlockSelector
✅indexLinkSelector

✅articleTagSelector
✅articleBlockSelector

✅articleTitleSelector
✅articleBodySelector

*/

type extractTypes = "link" | "text";


type result = {
	pass: true;
	returned: string;
} | {
	pass: false;
	error: string;
};

type testResult<T> = {
	[K in keyof T]: result;
};

type selectors = Pick<site, 'lastUrlSelector' | 'lastPageNumberRegExp' | 'nextPageLinkSelector' |
	'nextPageUrlRegExp' | 'indexTagSelector' | 'indexLinkBlockSelector' | 'indexLinkSelector' | 'articleTagSelector' |
	'articleBlockSelector' | 'articleTitleSelector' | 'articleBodySelector'>;

const tr = <testResult<selectors>>{};
tr.articleBlockSelector = {
	pass: false
}

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

export default async function validateSelectors(site: site): Promise<object> {

	const testResults = <testResult<selectors>>{};

	const indexDom = await getDom(site.entryUrl);

	if (site.nextPageType === "last" && site.lastUrlSelector) {
		testResults.lastUrlSelector = extract("link", indexDom, "lastUrlSelector");

		if (testResults.lastUrlSelector.pass && site.lastPageNumberRegExp) {
			const regexp = new RegExp(site.lastPageNumberRegExp);
			const matched = (testResults.lastUrlSelector.returned).match(regexp);
			if (matched) {
				testResults.lastPageNumberRegExp = {
					pass: true,
					returned: matched[1],
				};
			} else {

				testResults.lastPageNumberRegExp = {
					pass: false,
					error: "RegExp returned null"
				}
			}
		}

		if (site.indexLinkBlockSelector) {
			testResults.indexLinkBlockSelector = extract("text", indexDom, "indexLinkBlockSelector", "all");

			if (testResults.indexLinkBlockSelector.pass) {
				const linkElem = getElement(indexDom, "indexLinkBlockSelector");
				if (linkElem) testResults.indexLinkSelector = extract("link", linkElem, "indexLinkSelector");

				if (site.indexTagSelector) {
					if (linkElem) testResults.indexTagSelector = extract("link", linkElem, "indexTagSelector", "all");

				}
			}
		}

		//article test
		const articleUrl = site.siteType === "links" ? testResults.indexLinkSelector.returned : site.entryUrl;
		let articleDom: Document | Element = await getDom(articleUrl);

		if (site.articleBlockSelector) {
			selectorAll(articleDom, "articleBlockSelector");
			if (testResults.articleBlockSelector.returned instanceof Element) {
				articleDom = testResults.articleBlockSelector.returned;
			} else {
				throw testResults;
			}
		}

		extract("text", articleDom, "articleTitleSelector");
		extract("text", articleDom, "articleBodySelector");

		if (site.articleTagSelector) {
			selectorAll(articleDom, "articleTagSelector");
			if (testResults.articleTagSelector.pass && testResults.articleBlockSelector.returned instanceof Element) {
				const text = testResults.articleBlockSelector.returned.textContent;
				if (text) {
					testResults.articleBlockSelector.returned = text;
					testResults.articleBlockSelector.pass = true;
				} else {

					testResults.articleBlockSelector.returned = "Failed to get textContent from querySelectorAll result.";
					testResults.articleBlockSelector.pass = true;
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
				throw new Error(`JSDOM failed on ${site.entryUrl}\n ${err}`);
			}
			return dom;

		}

		function getElement(
			elem: Element | Document, selectorName: keyof selectors
		): Element | false {
			const selector = getSelector(site, selectorName);
			const el = elem.querySelectorAll(selector);
			return el ? el.item(0) : false;
		}



		function extract(type: extractTypes, elem: Element | Document, selectorName: keyof selectors, mode = 'single'): result {

			const resultFailed: result = {
				pass: false,
				error: ""
			};
			const selector = getSelector(site, selectorName);
			let el: Element;
			if (mode === 'all') {
				const ele = elem.querySelectorAll(selector);
				if (ele.length === 0) {
					resultFailed.error = `querySelectorAll failed on ${selector}`;
					return resultFailed;
				}
				el = ele.item(0);
			} else {
				const ele = elem.querySelector(selector);
				if (!ele) {
					resultFailed.error = `querySelector failed on ${selector}`;
					return resultFailed;
				}
				el = ele;
			}
			const extracted = type === "link" ? el.getAttribute("href") : el.textContent;

			if (!extracted) {
				return {
					pass: false,
					error: `Failed to get ${type} from Element acquired from ${selector}`
				}
			}
			return {
				pass: true,
				returned: extracted,
			};

		}

		function selectorAll(elem: Document | Element, selectorName: string): void {

			const selector = getSelector(site, selectorName);
			const nList = elem.querySelectorAll(selector);
			const res = <result>{};

			res.returned = nList.length > 0 ? nList.item(0) : `${selector} failed to extract valid nodeLists.`;
			res.pass = typeof res.returned !== 'string' ? true : false;
			testResults[selectorName as keyof typeof testResults] = res;
		}

		function getSelector(site: site, selectorName: keyof site): string {

			const selector = site[selectorName];

			if (selector && typeof selector === 'string') {
				return selector;
			}

			const res = <result>{};
			res.pass = false;
			res.error = `selectorName ${selectorName} not found in site\n site=${site}`;
			testResults[selectorName] = res;

		}
		/**
			function outputResult(site: site, testResult: Selectors) {

			}
		*/
	}

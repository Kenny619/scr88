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
	pass: boolean;
	returned: string | Element | NodeList;
};
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


export default async function validateSelectors(site: site): Promise<object> {

	const testResults = <Selectors>{};

	const indexDom = await getDom(site.entryUrl);

	if (site.nextPageType === "last" && site.lastUrlSelector) {
		extract("link", indexDom, "lastUrlSelector");

		if (testResults.lastUrlSelector.pass && site.lastPageNumberRegExp) {
			const res = <result>{};
			const regexp = new RegExp(site.lastPageNumberRegExp);
			const matched = (testResults.lastUrlSelector.returned as string).match(regexp);
			res.pass = matched && Number(matched[1]) ? true : false;
			res.returned = matched && Number(matched[1]) ? matched[1] : "RegExp returned null";
			testResults.lastPageNumberRegExp = res;
		}
	}

	if (site.indexLinkBlockSelector) {
		selectorAll(indexDom, "indexLinkBlockSelector");

		if (testResults.indexLinkBlockSelector.pass) {
			const linkElem = (testResults.indexLinkBlockSelector.returned as NodeList).item(0);

			extract("link", linkElem as Element, "indexLinkSelector");

			if (site.indexTagSelector) {
				selectorAll(linkElem as Element, "indexTagSelector");
				if (testResults.indexTagSelector.pass) {
					const indexTagElem = (testResults.indexTagSelector.returned as NodeList).item(0);
					if (indexTagElem && typeof indexTagElem.textContent === "string")
						testResults.indexTagSelector.returned = indexTagElem.textContent;
				}
			}
		} else {
			throw testResults;
		}
	}

	//article test
	const articleUrl = site.siteType === "links" ? testResults.indexLinkSelector.returned : site.entryUrl;
	let articleDom: (Document | Element) = await getDom(articleUrl as string);

	if (site.articleBlockSelector) {
		selectorAll(articleDom, "articleBlockSelector");
		if (!testResults.articleBlockSelector.pass) throw testResults;
		articleDom = (testResults.articleBlockSelector.returned as NodeList)[0] as Element;
	}

	extract("text", articleDom, "articleTitleSelector");
	extract("text", articleDom, "articleBodySelector");

	if (site.articleTagSelector) {
		selectorAll(articleDom, "articleTagSelector");
		if (testResults.articleTagSelector.pass) {
			const articleTagElem = (testResults.articleTagSelector.returned as NodeList).item(0);
			if (articleTagElem && typeof articleTagElem.textContent === "string")
				testResults.articleTagSelector.returned = articleTagElem.textContent;
		}
	}

	return testResults;


	async function getDom(url: string) {
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

	function extract(type: extractTypes, elem: Element | Document, selectorName: string): void {


		const selector = getSelector(site, selectorName);
		const res = <result>{};

		const el = elem.querySelector(selector);
		if (el) {
			const extracted = type === "link" ? el.getAttribute("href") : el.textContent;
			res.returned = extracted ? extracted : `${selector} failed to extract ${type}.`;
			res.pass = res.returned === extracted ? true : false;
		} else {
			res.pass = false;
			res.returned = `querySelector failed on selector ${selector}`;
		}

	}

	function selectorAll(elem: Document | Element, selectorName: string): void {

		const selector = getSelector(site, selectorName);
		const nList = elem.querySelectorAll(selector as string);
		const res = <result>{};

		res.pass = nList.length > 0 ? true : false;
		res.returned = nList.length > 0 ? nList : `${selector} failed to extract valid nodeLists.`;
		testResults[selectorName as keyof typeof testResults] = res;
	}

	function getSelector(site: site, selectorName: string): string {

		const selector = site[selectorName as keyof typeof site] as string;

		if (selector && typeof selector === 'string') {
			return selector;
		}

		throw new Error(`selectorName ${selectorName} not found in site\n site=${site}`);

	}

	function outputResult(site: site, testResult: Selectors) {

	}

}

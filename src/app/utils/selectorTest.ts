import { site } from "../../typings/index.js";
import * as vldt from "./validator.js";
import { JSDOM, ResourceLoader } from "jsdom";
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

articleTagSelector
articleBlockSelector

articleTitleSelector
articleBodySelector

*/
export default function validateSelectors(site: site): string[] {
	//Stores error message
	const errorMsgs: string[] = [];
	let testResults: site;

	const loader = new ResourceLoader({
		userAgent: userAgent(),
	});

	JSDOM.fromURL(site.entryUrl, { resources: loader })
		.then((jd) => {
			const dom = jd.window.document;
		})
		.catch((err) => {
			errorMsgs.push(`Failed JSDOM on ${site.entryUrl}. ${err}`);
		});

	return errorMsgs;

	function __index(dom: Document | Element): boolean {
		const indexBlocks = dom.querySelectorAll(site.indexLinkBlockSelector as string);
		if (!indexBlocks) {
			errorMsgs.push(`indexLinkBlockSelector: ${site.indexLinkBlockSelector as string} did not return valid NodeList.`);
			return false;
		}

		testResults.indexLinkBlockSelector = `${indexBlocks.length} links`;

		for (const block of indexBlocks) {
			const linkElem = block.querySelector(site.indexLinkSelector as string);
			if (!linkElem) {
				errorMsgs.push(`indexLinkSelector: ${site.indexLinkSelector as string} did not return valid Element.`);
				return false;
			}
			const link = linkElem.getAttribute("href");
			if (!link) {
				errorMsgs.push(`indexLinkSelector: ${site.indexLinkSelector as string} did not return valid url.`);
				return false;
			}
			testResults.indexLinkSelector = link;
		}

		if (site.indexTagSelector) {
			const tagElems = dom.querySelectorAll(site.indexTagSelector);

			if (tagElems.length === 0) {
				errorMsgs.push(`indexTagSelector: ${site.indexTagSelector as string} did not return valid url.`);
				return false;
			}

			for (const el of tagElems) {
				if (!el.textContent) {
					errorMsgs.push(`indexTagSelector: ${site.indexTagSelector as string} did not return valid tag.`);
					return false;
				}

				testResults.indexTagSelector = el.textContent;
			}
		}

		return true;
	}

	function __lastUrlSelector(dom: Document | Element): boolean {
		const lastElem = dom.querySelector(site.lastUrlSelector as string);
		if (!lastElem) {
			errorMsgs.push(`lastUrlSelector: ${site.lastUrlSelector as string} did not return valid Element.`);
			return false;
		}
		const url = lastElem.getAttribute("href");
		if (!url) {
			errorMsgs.push(`lastUrlSelector: ${site.lastUrlSelector as string} failed to get url from ${lastElem}.`);
			return false;
		}

		testResults.lastUrlSelector = url;

		const lpnRegExp = new RegExp(site.lastPageNumberRegExp as string);
		const lpNumber = url.match(lpnRegExp);
		if (!lpNumber) {
			errorMsgs.push(`lastPageNumberRegExp: ${site.lastPageNumberRegExp as string} did not match page number.`);
			return false;
		}

		if (typeof lpNumber[1] !== "string" && Number(lpNumber[1]) > 0) {
			errorMsgs.push(`lastPageNumberRegExp: ${site.lastPageNumberRegExp as string} did not return valid page number.`);
			return false;
		}

		testResults.lastPageNumberRegExp = lpNumber[1];

		return true;
	}

	function _article(url: string): boolean {
		const loader = new ResourceLoader({
			userAgent: userAgent(),
		});

		JSDOM.fromURL(url, { resources: loader })
			.then((jd) => {
				const dom = jd.window.document;

				if (site.articleBlockSelector) {
					//articleBlockSelector test
					const articleBlockElem = dom.querySelectorAll(site.articleBlockSelector);
					if (articleBlockElem.length === 0) {
						errorMsgs.push(
							`articleBlockSelector: ${site.articleBlockSelector as string} failed to get article blocks from ${url}.`,
						);
						return false;
					}
					testResults.articleBlockSelector = String(articleBlockElem[0]);
				}

				//articleTitleSelector test
				const articleTitleElem = dom.querySelector(site.articleTitleSelector);
				if (!articleTitleElem) {
					errorMsgs.push(
						`articleTitleSelector: ${site.articleTitleSelector as string} failed to get title element from ${url}.`,
					);
					return false;
				}

				const title = articleTitleElem.childNodes[0].nodeValue;
				if (!title) {
					errorMsgs.push(
						`articleTitleSelector: ${site.articleTitleSelector as string} failed to get title string from ${url}.`,
					);
					return false;
				}

				testResults.articleTitleSelector;

				//articleBodySelector test
				const articleBodyElem = dom.querySelector(site.articleBodySelector);
				if (!articleBodyElem) {
					errorMsgs.push(
						`articleBodySelector: ${site.articleBodySelector as string} failed to get body element from ${url}.`,
					);
					return false;
				}

				const body = articleBodyElem.textContent;
				if (!body) {
					errorMsgs.push(
						`articleBodySelector: ${site.articleBodySelector as string} failed to get body string from ${url}.`,
					);
					return false;
				}

				testResults.articleBodySelector = body;

				//articleTagSelector testa
			})
			.catch((err) => {
				errorMsgs.push(`Failed JSDOM on an article URL ${url}. ${err}`);
			});
	}
}

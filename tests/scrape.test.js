import { describe, expect, test, vi } from "vitest";
import Scraper from "../dist/app/utils/scrape.js";

const enigma = {
	name: "enigma",
	rootUrl: "https://enigma2.ahoseek.com/",
	entryUrl: "https://enigma2.ahoseek.com/",
	language: "JP",
	saveDir: "./exports",
	logDir: "./logs",
	siteType: "links",
	nextPageType: "last",
	nextPageLinkSelector: "ul.pagination > li.last > a",

	tagFiltering: false,
	tagCollect: true,
	articleTagSelector: "span.category > a",

	indexLinkBlockSelector: "div.entry-card-content",
	indexLinkSelector: "p.entry-read > a.entry-read-link",

	articleTitleSelector: "h1.entry-title",
	articleBodySelector: "div#the-content",

	lastUrlSelector: "ul.pagination > li.last > a",
	lastPageNumberRegExp: "/page/(\\d+)/$",
};

describe("Scrape class", () => {
	const scr = new Scraper(enigma);

	test("constructor creates valid site object", async () => {
		expect(scr.site).toBeTruthy();
	});
});
/**
test("Mock siteURLs value to be the first 2 URLs", async () => {
	scr.currentUrlDOM = await scr.getDOM(scr.site.entryUrl);
	const getFirstTwoUrls = vi.fn(() => {
		scr.getPageURLs();
		scr.siteURLs.splice(2);
	});

	getFirstTwoUrls();

	expect(getFirstTwoUrls).toHaveBeenCalled();
	//expect(scr.getPageURLs()).toHaveBeenCalled();
	expect(scr.siteURLs.length).toBe(2);
	console.log(scr.siteURLs);
});

test("getLinksFromIndex returns array of URLs", async () => {
	expect(scr.getLinksFromIndex().length).toBeGreaterThan(0);
	expect(Array.isArray(scr.siteURLs)).toBeTruthy();
});

test("scrapeArticleIndex", async () => {
	const urls = scr.getLinksFromIndex();
	if (urls) {
		const scrapers = urls.map((link) => scr.scrapeArticleIndex(link));
		Promise.allSettled(scrapers).then((result) => {
			console.log(result);
			console.log(scr.acquiredArticles, scr.failedURLs, scr.warnings);
			expect(scr.acquiredArticles.length).toBeGreaterThan(0);
		});
	}
});

// test("scrape", async () => {
// 	await scr.scrape();
// 	expect(scr.scrape).toBeTruthy();
// }, 30000);
})
// test("getPageURLs", () => {
// 	expect(scr.getPa)
// });
*/

import { describe, expect, test, vi } from "vitest";
import Scraper from "../dist/app/utils/scrape.js";
import { enigma } from "../dist/app/config/sourceConfig.js";

test("Instanciate the class", () => {
	const scr = new Scraper(enigma);
	expect(scr).toBeInstanceOf(Scraper);
});

test("Validate source info^", async () => {
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

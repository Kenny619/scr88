import { describe, expect, test, vi } from "vitest";
import { enigma } from "../dist/app/config/sourceConfig.js";
import Scraper from "../dist/app/utils/scrape.js";

const scr = new Scraper(enigma);

test("Instanciate the class", () => {
	expect(scr).toBeInstanceOf(Scraper);
});

test("Acquired scraping target URLs", () => {
	expect(scr.siteURLs.length).toBeGreaterThan(0);
});

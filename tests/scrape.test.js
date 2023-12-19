import { expect, test } from "vitest";
import Scraper from "../dist/app/utils/scrape.js";

const enigma = {
	name: "enigma",
	rootUrl: "https://enigma2.ahoseek.com/",
	entryUrl: "https://enigma2.ahoseek.com/",
	language: "JP",
	saveDir: "./exports",
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

const scr = new Scraper(enigma);
const t = await scr.debug();
console.log(t);

test("constructor", async () => {
	expect(scr.debug()).toBeTruthy();
});

test("getLinksFromIndex", async () => {
	expect(scr.getLinksFromIndex().length).toBeGreaterThan(0);
	console.log(scr.getLinksFromIndex());
});

// test("getPageURLs", () => {
// 	expect(scr.getPa)
// });

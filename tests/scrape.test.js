import { test } from "vitest";
import Scraper from "../dist/app/utils/scrape.js";
const enigma = {
	name: "enigma",
	rootUrl: "https://enigma2.ahoseek.com/",
	entryUrl: "https://enigma2.ahoseek.com/",
	language: "JP",
	saveDir: "../../exports",
	siteType: "links",
	nextPageType: "next",
	nextPageLinkSelector: "ul.pagenation > li.next > a",

	tagFiltering: false,
	tagCollect: true,
	articleTagSelector: "span.category > a",

	indexLinkBlockSelector: "div.entry-card-content",
	indexLinkSelector: "p.entry-read > a.entry-read-link",

	articleTitleSelector: "h1.entry-title",
	articleBodySelector: "div#the-content",
};

const scr = new Scraper(enigma);

test("scrape", async () => {
	expect(await scr.scrape().returnArticles().toBeDefined());
});

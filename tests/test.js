import fs from "fs";
import path from "path";
import { JSDOM, ResourceLoader } from "jsdom";
import validateSiteInputs from "../dist/app/utils/srcWebsiteValidation.js";
import { assertExists, exists, isElement } from "../dist/app/utils/typeGuards.js";
import userAgent from "../dist/app/utils/userAgents.js";
import * as vldt from "../dist/app/utils/validator.js";
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

const scr = new Scraper(enigma);
scr.currentUrlDOM = await scr.getDOM(scr.currentURL.href);
scr.getPageURLs();
scr.siteURLs.splice(3, scr.siteURLs.length - 3);
let nextUrl;
// const exArt = scr.getExportedArticles();
// console.log(exArt);

// for (const exArticles of scr.exportedArticles) {
// 	console.log(exArticles.url);
// }
// process.exit();
do {
	await scr.scrapeArticleLinks();
	nextUrl = scr.getNextUrl();
	console.log(`nextUrl: ${nextUrl}\narticles: ${scr.acquiredArticles}`);
	// for (const article of scr.acquiredArticles) {
	// 	console.log(article.url);
	// }
	if (nextUrl) {
		try {
			await scr.gotoNextUrl(nextUrl);
		} catch (err) {
			scr.warnings.push(`Failed to transition to ${nextUrl}`);
			scr.failedURLs.push(nextUrl);
			nextUrl = undefined;
		}
	}
} while (nextUrl);
console.log("#of articles: ", scr.acquiredArticles.length);
scr.exportArticles();
scr.close();

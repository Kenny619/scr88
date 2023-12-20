import { expect, test } from "vitest";
import validateSiteInputs from "../dist/app/utils/srcWebsiteValidation";
const enigma = {
	name: "enigma",
	rootUrl: "https://enigma2.ahoseek.com/",
	entryUrl: "https://enigma2.ahoseek.com/",
	language: "JP",
	saveDir: "./exports",
	logDir: "./logs",
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

test("validateSiteInputs", async () => {
	const errorMsg = validateSiteInputs(enigma);
	console.log(errorMsg);
	expect(errorMsg).toBeDefined();
	expect(errorMsg.length).toBe(0);
});

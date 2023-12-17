import { expect, test } from "vitest";
import * as vldt from "../dist/app/utils/validator.js";

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

test("areKeysValuesValid", async () => {
	expect(vldt.areKeysValuesValid(enigma, "indexlinkBlockSelector", "indexLinkSelector")).toBeDefined();
	expect(vldt.iskeyValueValid(enigma, "indexLinkBlockSelector")).toBeTruthy();
	expect(vldt.areKeysValuesValid(enigma, ["indexLinkBlockSelector", "indexLinkSelector"])).toBeTruthy();
});

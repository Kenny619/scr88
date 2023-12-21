import fs from "fs";
import path from "path";
import { JSDOM, ResourceLoader } from "jsdom";
import Scraper from "../dist/app/utils/scrape.js";
import validateSiteInputs from "../dist/app/utils/srcWebsiteValidation.js";
import { assertExists, exists, isElement } from "../dist/app/utils/typeGuards.js";
import userAgent from "../dist/app/utils/userAgents.js";
import * as vldt from "../dist/app/utils/validator.js";

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

scr.getSiteURLs();

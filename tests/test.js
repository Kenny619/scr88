import fs from "fs";
import path from "path";
import { JSDOM, ResourceLoader } from "jsdom";
import Scraper from "../dist/app/utils/scrape.js";
import validateSiteInputs from "../dist/app/utils/srcWebsiteValidation.js";
import { assertExists, exists, isElement } from "../dist/app/utils/typeGuards.js";
import userAgent from "../dist/app/utils/userAgents.js";
import * as vldt from "../dist/app/utils/validator.js";

const source = {
	name: "moedb",
	rootUrl: "https://www.moedb.net/",
	entryUrl: "https://www.moedb.net/keywords/%E8%BF%91%E8%A6%AA%E7%9B%B8%E5%A7%A6?page=279",
	language: "JP",
	saveDir: "./exports",
	logDir: "./logs",
	siteType: "links",
	nextPageType: "last",
	nextPageLinkSelector: "ul.paginali.page-item:nth-child(7) > a:nth-child(1)tion > li.last > a",

	tagFiltering: true,
	tagCollect: true,
	tags: ["妹", "姉", "兄", "弟", "姉妹", "兄妹", "姉弟"],
	indexTagSelector: "ul.list-inline > li.list-inline-item > a",
	articleTagSelector: "div.article-text > ul.list-inline > li.list-inline-item > a",

	indexLinkBlockSelector: "div.article-summary",
	indexLinkSelector: "div.article-summary__more > a",

	articleTitleSelector: "h1.card-header",
	articleBodySelector: "div#the-content.article-text > p:nth-child(3)",

	lastUrlSelector: "li.page-item:nth-child(8) > a:nth-child(1)",
	lastPageNumberRegExp: "=(\\d+)$",
};

const scr = new Scraper(source);

scr.getSiteURLs();

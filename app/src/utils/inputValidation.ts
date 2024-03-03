import { site } from "../../typings/index.js";
import * as vldt from "./validator.js";

type validatorProps = {
	register: boolean;
	tests: {
		condition: boolean;
		errorMsg: string;
	}[];
};

type validator = {
	[K in keyof site]: validatorProps;
};

export default function inputValidation(site: site, mode: "register" | "scraper" = "scraper") {
	const validator: validator = {
		name: {
			register: false,
			tests: [
				{
					condition: vldt.iskeyValueValid(site, "name"),
					errorMsg: "Site name is required.",
				},
			],
		},

		rootUrl: {
			register: true,
			tests: [
				{
					condition: vldt.iskeyValueValid(site, "rootUrl"),
					errorMsg: "Root URL is required.",
				},
				{
					condition: vldt.isURL(site.rootUrl),
					errorMsg: "Root URL is not in a valid form of URL",
				},
			],
		},

		entryUrl: {
			register: true,
			tests: [
				{
					condition: vldt.iskeyValueValid(site, "entryUrl"),
					errorMsg: "Entry URL is required.",
				},
				{
					condition: vldt.isURL(site.entryUrl),
					errorMsg: "Entry URL is not in a valid form of URL",
				},
			],
		},

		saveDir: {
			register: false,
			tests: [
				{
					condition: vldt.iskeyValueValid(site, "saveDir"),
					errorMsg: "Export directory is required.",
				},
				{
					condition: vldt.isWritable(site.saveDir),
					errorMsg: "Export directory doesn't exist or does not have a write permission.",
				},
			],
		},

		/*
		logDir: {
			register: false,
			tests: [
				{
					condition: vldt.iskeyValueValid(site, "logDir"),
					errorMsg: "Log directory is required.",
				},
				{
					condition: vldt.isWritable(site.logDir),
					errorMsg: "Log directory doesn't exist or does not have a write permission.",
				},
			],
		},
*/
		language: {
			register: false,
			tests: [
				{
					condition: vldt.iskeyValueValid(site, "language"),
					errorMsg: "Language is required.",
				},
				{
					condition: site.language === "EN" || site.language === "JP",
					errorMsg: "Language must be either 'EN' or 'JP'.",
				},
			],
		},

		siteType: {
			register: true,
			tests: [
				{
					condition: vldt.iskeyValueValid(site, "siteType"),
					errorMsg: "Site type is required.",
				},
				{
					condition:
						site.siteType === "singleArticle" || site.siteType === "links" || site.siteType === "multipleArticle",
					errorMsg: "Site type must be either 'singleArticle', 'links', or 'multipleArticle'.",
				},
			],
		},

		nextPageType: {
			register: true,
			tests: [
				{
					condition: vldt.iskeyValueValid(site, "nextPageType"),
					errorMsg: "Next page type is required.",
				},
				{
					condition:
						site.nextPageType === "last" ||
						site.nextPageType === "next" ||
						site.nextPageType === "pagenation" ||
						site.nextPageType === "parameter" ||
						site.nextPageType === "url",
					errorMsg: "Next page type must be either 'last', 'next', 'pagenation', 'parameter', or 'url'.",
				},
			],
		},

		lastUrlSelector: {
			register: true,
			tests: [
				{
					condition: site.nextPageType === "last" && vldt.iskeyValueValid(site, "lastUrlSelector"),
					errorMsg: "Last URL selector is required when nextPageType is set to 'last'.",
				},
			],
		},

		lastPageNumberRegExp: {
			register: true,
			tests: [
				{
					condition: site.nextPageType === "last" && vldt.iskeyValueValid(site, "lastPageNumberRegExp"),
					errorMsg: "Last page number RegExp is required when nextPageType is set to 'last'.",
				},
			],
		},

		nextPageParameter: {
			register: true,
			tests: [
				{
					condition: site.nextPageType === "parameter" && vldt.iskeyValueValid(site, "nextPageParameter"),
					errorMsg: "Next page parameter is required when nextPageType is set to 'parameter'.",
				},
			],
		},

		nextPageLinkSelector: {
			register: true,
			tests: [
				{
					condition: site.siteType === "links" && vldt.iskeyValueValid(site, "nextPageLinkSelector"),
					errorMsg: "Next page link selector is required when siteType is set to 'links'.",
				},
			],
		},

		nextPageUrlRegExp: {
			register: true,
			tests: [
				{
					condition: site.nextPageType === "url" && vldt.iskeyValueValid(site, "nextPageUrlRegExp"),
					errorMsg: "Next page URL RegExp is required when nextPageType is set to 'url'.",
				},
			],
		},

		startingPageNumber: {
			register: true,
			tests: [
				{
					condition:
						(site.nextPageType === "pagenation" || site.nextPageType === "parameter") &&
						vldt.iskeyValueValid(site, "startingPageNumber"),
					errorMsg: "Starting page number is required when nextPageType is set to 'pagenation'.",
				},
				{
					condition: typeof Number(site.startingPageNumber) === "number",
					errorMsg: "Starting page number must be a number.",
				},
			],
		},

		tagFiltering: {
			register: true,
			tests: [
				{
					condition: typeof site.tagFiltering === "boolean",
					errorMsg: "TagFiltering value must be a boolean.",
				},
			],
		},

		tagCollect: {
			register: true,
			tests: [
				{
					condition: typeof site.tagCollect === "boolean",
					errorMsg: "tagCollect value must be a boolean. ",
				},
			],
		},

		tags: {
			register: true,
			tests: [
				{
					condition: site.tagFiltering || site.tagCollect,
					errorMsg: "tags are requrired when tagFiltering or tagCollect is set to true.",
				},
			],
		},
		/*
		indexLinkBlockSelector: {
			register: true,
			tests: [
				{
					condition: site.siteType === "links" && vldt.iskeyValueValid(site, "indexLinkBlockSelector"),
					errorMsg: "indexLinkBlockSelector is required when siteType is set to 'links'.",
				},
			],
		},
*/
		indexLinkSelector: {
			register: true,
			tests: [
				{
					condition: site.siteType === "links" && vldt.iskeyValueValid(site, "indexLinkSelector"),
					errorMsg: "indexLinkSelector is required when siteType is set to 'links'.",
				},
			],
		},
		/*
		indexTagSelector: {
			register: true,
			tests: [
				{
					condition: site.siteType === "links" && vldt.iskeyValueValid(site, "indexTagSelector"),
					errorMsg: "indexTagSelector is required when siteType is set to 'links'.",
				},
			],
		},
*/
		articleBlockSelector: {
			register: true,
			tests: [
				{
					condition: site.siteType === "multipleArticle" && vldt.iskeyValueValid(site, "articleBlockSelector"),
					errorMsg: "articleBlockSelector is required when siteType is set to 'multipleArticle'.",
				},
			],
		},

		articleTitleSelector: {
			register: true,
			tests: [
				{
					condition: vldt.iskeyValueValid(site, "articleTitleSelector"),
					errorMsg: "articleTitleBlockSelector is required.",
				},
			],
		},

		articleBodySelector: {
			register: true,
			tests: [
				{
					condition: vldt.iskeyValueValid(site, "articleBodySelector"),
					errorMsg: "articleBodySelector is required.",
				},
			],
		},

		articleTagSelector: {
			register: true,
			tests: [
				{
					condition:
						site.tagCollect ||
						(site.siteType !== "links" && site.tagFiltering && vldt.iskeyValueValid(site, "articleTagSelector")),
					errorMsg: "articleTagSelector is required.",
				},
			],
		},
	};

	//Error message storage
	const errorMsgs: { [key: string]: string[] } = {};

	//tests
	for (const [key, val] of Object.entries(validator)) {
		if (mode === "scraper" || (mode === "register" && val.register === true)) {
			const errors = [];

			for (const testVal of Object.values(val.tests)) {
				if (!testVal.condition) {
					errors.push(testVal.errorMsg);
				}
			}

			errorMsgs[key] = errors;
		}
	}

	return errorMsgs;
}

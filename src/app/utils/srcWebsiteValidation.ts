import fs from "fs";
import path from "path";
import { site } from "../../typings/index.js";
import * as vldt from "./validator.js";

/**
 * Validates the input site object against the site interface.
 * @param {site} site - The site object to be validated.
 * @returns {string[]} - An array of error messages for invalid inputs.
 */
export default function validateSiteInputs(site: site): string[] {
	//Stores error message
	const errorMsgs = [];

	//Required properties.
	const requiredProps = [
		"name",
		"rootUrl",
		"entryUrl",
		"saveDir",
		"logDir",
		"siteType",
		"language",
		"nextPageType",
		"tagFiltering",
		"tagCollect",
		"articleTitleSelector",
		"articleBodySelector",
	];

	for (const prop of requiredProps) {
		if (!Object.hasOwn(site, prop)) errorMsgs.push(`Missing required property ${prop}`);
	}

	//URL format check
	if (!vldt.isURL(site.rootUrl)) errorMsgs.push(`${site.rootUrl} is not a valid URL.`);
	if (!vldt.isURL(site.entryUrl)) errorMsgs.push(`${site.entryUrl} is not a valid URL.`);

	//Static string value check
	if (!["EN", "JP"].includes(site.language)) errorMsgs.push("Language needs to be either 'JP' or 'EN'.");

	if (!["links", "multipleArticles", "singleArticle"].includes(site.siteType)) {
		errorMsgs.push(`siteType value must be either "links", "multipleArticle", or "singleArticle".`);
	}

	if (!["parameter", "pagenation", "next", "url", "last"].includes(site.nextPageType)) {
		errorMsgs.push(`nextPageType value must be either "parameter","pagenation","next","url", or "last".`);
	}

	//type check
	if (typeof site.tagFiltering !== "boolean") errorMsgs.push("tagFiltering must be type boolean.");
	if (typeof site.tagCollect !== "boolean") errorMsgs.push("tagCollect must be type boolean.");

	//tag filtering optional parameter check
	if (site.tagFiltering) {
		if (!vldt.iskeyValueValid(site, "tags") || site.tags?.length === 0) {
			errorMsgs.push("Filtering tags missing.");
		}

		if (site.siteType === "links" && !vldt.iskeyValueValid(site, "indexTagSelector")) {
			errorMsgs.push("indexTagSelector missing.");
		}

		if (site.siteType !== "links" && !vldt.iskeyValueValid(site, "articleTagSelector")) {
			errorMsgs.push("articleTagSelector missing.");
		}
	}

	//NextPageType optional parameter check
	if (site.nextPageType === "parameter" && !vldt.iskeyValueValid(site, "nextPageParameter")) {
		errorMsgs.push("nextPageParameter is required when nextPageType is set to 'parameter'.");
	}

	if (
		(site.nextPageType === "pagenation" || site.nextPageType === "next") &&
		!vldt.iskeyValueValid(site, "nextPageLinkSelector")
	) {
		errorMsgs.push("nextPageLinkSelector  is required when nextPageType is set to 'pagenation'.");
	}

	if (site.nextPageType === "pagenation" && site.startingPageNumber === undefined) {
		errorMsgs.push("startingPageNumber  is required when nextPageType is set to 'pagenation'.");
	}

	if (site.nextPageType === "url" && !vldt.iskeyValueValid(site, "nextPageUrlRegExp")) {
		errorMsgs.push("nextPageUrlRegExp  is required when nextPageType is set to 'url'.");
	}

	if (site.nextPageType === "last" && !vldt.iskeyValueValid(site, "lastUrlSelector")) {
		errorMsgs.push("lastUrlSelector  is required when nextPageType is set to 'last'.");
	}

	if (site.nextPageType === "last" && !vldt.iskeyValueValid(site, "lastPageNumberRegExp")) {
		errorMsgs.push("lastPageNumberRegExp  is required when nextPageType is set to 'last'.");
	}

	if (site.siteType === "links" && !vldt.areKeysValuesValid(site, ["indexLinkBlockSelector", "indexLinkSelector"])) {
		errorMsgs.push(`indexlinkBlockSelector" and "indexlinkSelector" are required when siteType is set to 'links. `);
	}

	/** siteType opetional parameter check */

	//articleTitleSelector
	if (!vldt.iskeyValueValid(site, "articleTitleSelector")) {
		errorMsgs.push("Invalid articleTitleSelector.");
	}

	if (!vldt.iskeyValueValid(site, "articleBodySelector")) {
		errorMsgs.push("Invalid articleBodySelector.");
	}

	if (site.siteType === "multipleArticle" && !vldt.iskeyValueValid(site, "articleBlockSelector")) {
		errorMsgs.push("Invalid articleBlockSelector.");
	}

	//helper - If output directory didn't include language, add it.
	if (!/(EN|JP)$/.test(site.saveDir)) {
		site.saveDir = path.join(site.saveDir, site.language);
	} //helper - If saveDir didn't exit, create it.

	for (const dir of [site.saveDir, site.logDir]) {
		try {
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
			}
		} catch (err) {
			errorMsgs.push(`${dir} doesn't exit. Failed to create a directory. ${err}`);
		}
	}

	//output dir write permission check
	if (!vldt.isWritable(site.saveDir))
		errorMsgs.push(`Export directory: ${site.saveDir} doesn't exist or does not have a write permission.`);

	//helper - If startingPageNumber is missing, then set 1
	if (!Object.hasOwn(site, "startingPageNumber")) site.startingPageNumber = 1;

	return errorMsgs;
}

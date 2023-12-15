import path from "path";
import { site } from "../../typings/index.js";
import * as vldt from "./validator.js";

export default function validateSrcWebsite(site: site): boolean {
	/** validations */
	if ([site.name, site.rootUrl, site.entryUrl, site.saveDir, site.siteType, site.nextPageType, site.tagFiltering, site.tagCollect].some((prop) => !prop)) {
		console.error(`Missing or invalid key parameters ${site}} `);
		return false;
	}
	if (!["JP", "EN"].includes(site.language)) {
		console.error(`Language needs to be either 'JP' or 'EN'.`);
		return false;
	}
	if (!/(EN|JP)$/.test(site.saveDir)) {
		site.saveDir = path.join(site.saveDir, site.language);
	}
	if (!vldt.isWritable(site.saveDir)) {
		console.error(`Export directory: ${site.saveDir} doesn't exist or does not have a write permission.`);
		return false;
	}
	if (!vldt.isURL(site.rootUrl)) {
		console.error(`${site.rootUrl} is not a valid URL.`);
		return false;
	}
	if (!vldt.isURL(site.entryUrl)) {
		console.error(`${site.entryUrl} is not a valid URL.`);
		return false;
	}
	if (!["links", "multipleArticles", "singleArticle"].includes(site.siteType)) {
		console.error(`siteType value must be either "links", "multipleArticle", or "singleArticle".`);
		return false;
	}
	if (!["parameter", "pagenation", "next"].includes(site.nextPageType)) {
		console.error(`nextPageType value must be either "parameter","pagenation", or"next".`);
		return false;
	}
	if (site.tagFiltering) {
		if (!vldt.iskeyValueValid(site, "tags") || site.tags?.length === 0) {
			console.error("Filtering tags missing.");
			return false;
		}
		if (site.siteType === "links" && !vldt.iskeyValueValid(site, "indexTagSelector")) {
			console.error("indexTagSelector missing.");
			return false;
		}
		if (site.siteType !== "links" && !vldt.iskeyValueValid(site, "articleTagSelector")) {
			console.error("articleTagSelector missing.");
			return false;
		}
	}
	if (site.nextPageType === "parameter" && !vldt.iskeyValueValid(site, "nextPageParameter")) {
		console.error("nextPageParameter missing.");
		return false;
	}
	if (site.nextPageType !== "parameter" && !vldt.iskeyValueValid(site, "nextPageLinkSelector")) {
		console.error("nextPageLinkSelector missing.");
		return false;
	}

	if (site.siteType === "links" && !vldt.areKeysValuesValid(site, ["indexlinkBlockSelector", "indexlinkSelector"])) {
		console.error(`indexlinkBlockSelector" and "indexlinkSelector" are required when siteType is set to 'links. `);
		return false;
	}

	if (!vldt.areKeysValuesValid(site, ["articleTitleSelector", "articleBodySelector"])) {
		console.error("Missing article selector.");
		return false;
	}

	if (site.siteType === "multipleArticle" && !vldt.iskeyValueValid(site, "articleBlockSelector")) {
		console.error("articleBlockSelector missing.");
		return false;
	}
	return true; // if all validations pass, return true. Otherwise, return false. 👍🏻👍🏻👍🏻👍🏻👍🏻👍�
}

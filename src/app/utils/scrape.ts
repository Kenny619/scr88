"use strict";
import { JSDOM } from "jsdom";
import fs, { readFileSync, readdirSync } from "fs";
import path from "path";

//types
import { articles, site } from '@/index';

//local utilities
import * as vldt from './validator';
import { validateSrcWebsite } from './srcWebsiteValidation';


class Scr88 {
	site: site;
	exportedIds: string[];
	currentUrl: string;
	constructor(srcWebsite: site) {
		this.site = {
			name: srcWebsite.name,
			rootUrl: srcWebsite.rootUrl,
			entryUrl: srcWebsite.entryUrl,
			language: srcWebsite.language,
			saveDir: srcWebsite.saveDir,
			siteType: srcWebsite.siteType,
			tagFiltering: srcWebsite.tagFiltering,
			articleTitleSelector: srcWebsite.articleTitleSelector,
			articleBodySelector: srcWebsite.articleBodySelector,
			nextPageType: srcWebsite.nextPageType,
		};

		/** optional parameters */
		//when tagFiltering is true
		if (this.site.tagFiltering) {
			if (vldt.iskeyValueValid(srcWebsite, "tags")) this.site.tags = srcWebsite.tags!;
		}
		//Selectors for "links" type sites.
		if (this.site.siteType === 'links') {
			if (vldt.iskeyValueValid(srcWebsite, "indexlinkBlockSelector")) this.site.indexlinkBlockSelector = srcWebsite.indexlinkBlockSelector!;
			if (vldt.iskeyValueValid(srcWebsite, "indexlinkSelector")) this.site.indexlinkBlockSelector = srcWebsite.indexlinkSelector!;
			if (vldt.iskeyValueValid(srcWebsite, "indexTagSelector")) this.site.indexTagSelector = srcWebsite.indexTagSelector!;
		}
		//URL parameter if next page type was "parameter"
		if (vldt.iskeyValueValid(srcWebsite, "nextPageParameter")) this.site.nextPageParameter = srcWebsite.nextPageParameter!;
		//Selectors for next page if the type was "next"
		if (vldt.iskeyValueValid(srcWebsite, "nextPageLinkSelector")) this.site.nextPageLinkSelector = srcWebsite.nextPageLinkSelector!;

		/** validation */
		validateSrcWebsite(this.site);

		/** List of previously acquired contents ids */
		this.exportedIds = this.getIds() || [];

		/** currentURL */
		this.currentUrl = this.site.entryUrl;

	}

	getIds(): string[] {
		const srcDir = path.join(this.site.saveDir);
		if (!fs.existsSync(srcDir)) throw new Error(`Directory ${srcDir} does not exist.`);

		try {
			return readdirSync(srcDir, { withFileTypes: true, encoding: "utf-8" })
				.filter(dirent => dirent.isFile() && dirent.name.endsWith(".txt"))
				.map(dirent => {
					const file = readFileSync(path.join(srcDir, dirent.name), { encoding: "utf-8" });
					const fileJson = JSON.parse(file);
					return fileJson.name === site.name ? fileJson.id : false;
				})
				.filter(r => !!r);
		} catch (err) {
			throw new Error(`Failed to read files from ${srcDir}. ${err}`);
		}
	}

	async scrapePage() {
		const jd = await JSDOM.fromURL(this.currentUrl);
		const dom = jd.window.document;
		const scrapedArticles = await Promise.all(
			Array.from(dom.querySelectorAll(this.site.indexlinkBlockSelector!))
				.filter(el => this.checkArticleTag(el, this.site.indexTagSelector!))
				.map(async el => {
					return await this.getArticle(el);
				})
		);

		if (scrapedArticles.length === 0) {
			throw new Error("No contents.");
		}

		this.exportContent(scrapedArticles);
		return;
	}

	async getArticle(linkBlock: Element) {
		const pUrl = linkBlock.querySelector(this.site.indexlinkSelector).getAttribute("href");
		const url = /^https/.test(pUrl) ? link : new URL(site.rootUrl + pUrl);
		const jd = await JSDOM.fromURL(url);
		const id = url.pathname.split("/").pop();
		const dom = jd.window.document;
		const title = dom.querySelector(this.site.articleTitleSelector).childNodes[0].nodeValue.trim();
		const body = dom.querySelector(this.site.articleBodySelector).textContent;
		const tags = this.getTags(dom, this.site.articleTagSelector);

		return {
			name: site.name,
			id,
			url: url.href,
			title,
			body,
			tags: tags,
		};
	}

	getTags(doc: Element, selector: string) {
		return Array.from(doc.querySelectorAll(selector)).map(li => li.textContent);
	}

	checkArticleTag(doc: Element, selector: string) {
		const tags = this.getTags(doc, selector);
		if (kdie)
			for (let tag of tags) {
				if (site.tags.includes(tag)) {
					return true;
				}
			}
		return false;
	}

	getNextUrl() {

		switch (this.site.nextPageType) {
			case "parameter":
				return this.incrementUrlParameter();
			case "next":
				const pUrl = el.querySelector(this.site.nextPageLinkSelector).getAttribute("href");
				return /^https/.test(pUrl) ? pUrl : new URL(site.rootUrl + pUrl);
			case "pagenation":
		}
	}

	incrementUrlParameter(): string {
		const url = new URL(this.currentUrl);
		const params = url.searchParams;
		if (Object.keys(params).length === 0 || !params.has(this.site.nextPageParameter!)) {
			params.set(this.site.nextPageParameter!, "2");
		} else {
			Array.from(params).forEach(([key, val]) => {
				key === this.site.nextPageParameter ? params.set(key, String(Number(val) + 1)) : params.set(key, val);
			});
		}
		const updatedQueryString = params.toString();
		return `${url.origin}${url.pathname}?${updatedQueryString}${url.hash}`;
	}

	exportContent(contents: articles[]): void {
		for (let content of contents) {
			const exportPath = path.join(this.site.saveDir, content.name + "__" + content.id + ".txt");
			try {
				fs.writeFileSync(exportPath, JSON.stringify(content));
			} catch (err) {
				console.log(err);
			}
		}
	}


}









import fs, { readFileSync, readdirSync } from "fs";
import path from "path";
import { JSDOM, ResourceLoader } from "jsdom";

//types
import { articles, exportedArticles, site } from "type/index";

import { validateSrcWebsite } from "./srcWebsiteValidation";
//local utilities
import * as vldt from "./validator";

//UserAgent list path
const UApath = "./files/ua.txt";

export class Scr88 {
	site: site;
	exportedArticles: exportedArticles[];
	acquiredArticles!: articles[];
	currentUrl: URL;
	nextUrl!: string | undefined;
	currentPageNumber: number;
	linkQueue: string[];
	foundNewArticles: boolean;
	constructor(srcWebsite: site) {
		this.site = {
			name: srcWebsite.name,
			rootUrl: srcWebsite.rootUrl,
			entryUrl: srcWebsite.entryUrl,
			language: srcWebsite.language,
			saveDir: srcWebsite.saveDir,
			siteType: srcWebsite.siteType,
			tagFiltering: srcWebsite.tagFiltering,
			tagCollect: srcWebsite.tagCollect,
			articleTitleSelector: srcWebsite.articleTitleSelector,
			articleBodySelector: srcWebsite.articleBodySelector,
			nextPageType: srcWebsite.nextPageType,
		};

		this.currentPageNumber = 1;

		/** optional parameters */
		//when tagFiltering is true
		if (this.site.tagFiltering && srcWebsite.tags) {
			if (Object.hasOwn(srcWebsite, "tags")) this.site.tags = srcWebsite.tags;

			if (this.site.tagFiltering === "index" && srcWebsite.indexTagSelector) {
				this.site.indexTagSelector = srcWebsite.indexTagSelector;
			}

			if (this.site.tagFiltering === "article" && srcWebsite.articleTagSelector) {
				this.site.indexTagSelector = srcWebsite.articleTagSelector;
			}
		}

		//Selectors for "links" type sites.
		if (this.site.siteType === "links" && srcWebsite.indexLinkSelector && srcWebsite.indexLinkBlockSelector) {
			this.site.indexLinkBlockSelector = srcWebsite.indexLinkBlockSelector;
			this.site.indexLinkSelector = srcWebsite.indexLinkSelector;
		}

		//Set next page URL parameter if next page type was "parameter"
		if (this.site.nextPageType === "parameter" && srcWebsite.nextPageParameter) {
			this.site.nextPageParameter = srcWebsite.nextPageParameter;
		}

		if (this.site.nextPageType === "pagenation" && srcWebsite.startingPageNumber) {
			this.currentPageNumber = srcWebsite.startingPageNumber;
		}

		//Set next page link selector if next page type was "pagenation" or "next"
		if ((this.site.nextPageType === "next" || this.site.nextPageType === "pagenation") && srcWebsite.nextPageLinkSelector) {
			this.site.nextPageLinkSelector = srcWebsite.nextPageLinkSelector;
		}

		/** validation */
		validateSrcWebsite(this.site);

		/** List of previously acquired contents ids */
		this.exportedArticles = this.getExportedArticles() || [];

		/** currentURL */
		this.currentUrl = new URL(this.site.entryUrl);

		/** Extraction source links */
		this.linkQueue = [];

		/** New article tracker.  Sets to false when there are no new article */
		this.foundNewArticles = true;
	}

	async scrape(): Promise<void> {
		/**
		 * update linkQueue based on the siteType.
		 * Iterate through linkQueue and extract article
		 * Store the extracted article to acquiredArticless array
		 * Change export and return to accept array of articles and handle multiple articles in the array,
		 * Make acquiredArticless and linkQueue empty when returned or exported.  Return false when there's nothing to return or export.
		 * Create new method to check the existance of next URL
		 *
		 */

		//scrape index;
		switch (this.site.siteType) {
			case "links":
				await this.scrapeIndex();
				break;

			case "singleArticle":
				await this.scrapeSingle();
				break;

			case "multipleArticle":
				await this.scrapeMultiples();
				break;
		}
		//Scrape single page

		//Scrape multiple articles
	}

	//Scrape index
	async scrapeIndex(): Promise<void> {
		do {
			const articleLinks = await this.getLinksFromIndex();
			this.linkQueue.push(...articleLinks);
			if (await this.isNextPage()) {
				this.gotoNextPage();
			} else {
				break;
			}
		} while (this.foundNewArticles);

		if (this.linkQueue.length > 0) {
			for (const link of this.linkQueue) {
				this.scrapeArticle(link);
			}
		}
	}

	async scrapeSingle(): Promise<void> {
		do {
			this.scrapeArticle(this.currentUrl.href);

			if (await this.isNextPage()) {
				this.gotoNextPage();
			} else {
				break;
			}
		} while (this.foundNewArticles);
	}

	async scrapeMultiples(): Promise<void> {
		do {
			this.scrapeMultipleArticles(this.currentUrl.href);

			if (await this.isNextPage()) {
				this.gotoNextPage();
			} else {
				break;
			}
		} while (this.foundNewArticles);
	}

	getExportedArticles(): exportedArticles[] {
		const srcDir = path.join(this.site.saveDir);
		if (!fs.existsSync(srcDir)) {
			console.warn(`Directory ${this.site.saveDir} does not exist.  Skipping exported article check.`);
			return [];
		}
		//  throw new Error(`Directory ${srcDir} does not exist.`);

		try {
			return readdirSync(srcDir, { withFileTypes: true, encoding: "utf-8" })
				.filter((dirent) => dirent.isFile() && dirent.name.endsWith(".txt"))
				.map((dirent) => {
					const file = readFileSync(path.join(srcDir, dirent.name), {
						encoding: "utf-8",
					});
					return JSON.parse(file);
				})
				.filter((obj) => obj.name === this.site.name)
				.map((article) => {
					return { name: article.name, id: article.id, url: article.url };
				});
		} catch (err) {
			throw new Error(`Failed to read files from ${srcDir}. ${err}`);
		}
	}

	getTags(doc: Element | Document, selector: string): string[] | false {
		const elements = doc.querySelectorAll(selector);
		if (elements.length === 0) return false;
		const tags = [];
		for (const el of elements) {
			if (el.textContent) tags.push(el.textContent);
		}
		return tags;
	}

	checkArticleTag(doc: Element, selector: string): boolean {
		const tags = this.getTags(doc, selector);
		if (!tags || !this.site.tags) return false;
		return vldt.isCommonValue<string[]>(this.site.tags, tags);
	}

	async getDom(url: string): Promise<Document> {
		if (!url || !vldt.isURL(url)) {
			throw new Error(`${url} is not a valid URL.`);
		}
		let dom;

		/** Configure UserAgent */
		const userAgents = readFileSync(UApath, { encoding: "utf-8" }).split("\r\n");
		const r = Math.floor(Math.random() * userAgents.length);

		const loader = new ResourceLoader({
			userAgent: userAgents[r],
		});

		try {
			const jd = await JSDOM.fromURL(url, { resources: loader });
			dom = jd.window.document;
		} catch (err) {
			throw new Error(`Failed to access url ${url}.\n ${err}`);
		}

		return dom;
	}

	extractLink(el: Element): string {
		const pUrl = el.getAttribute("href");

		if (!pUrl) {
			throw new Error(`getAttrivute('href') failed on link from link element ${el}.`);
		}

		return /^https/.test(pUrl) ? pUrl : this.site.rootUrl + pUrl;
	}

	async getLinksFromIndex(): Promise<string[]> {
		if (!this.site.indexLinkBlockSelector) {
			throw new Error(`Invalid indexLinkBlockSelector ${this.site.indexLinkBlockSelector}`);
		}

		if (!this.site.indexLinkSelector) {
			throw new Error(`Invalid indexLinkSelector ${this.site.indexLinkSelector}`);
		}

		const dom = await this.getDom(this.currentUrl.href);

		const indexBlocks = dom.querySelectorAll(this.site.indexLinkBlockSelector);
		if (indexBlocks.length === 0) {
			throw new Error(`Could not capture index blocks on ${this.currentUrl.href} using ${this.site.indexLinkBlockSelector}`);
		}

		const links = [];
		let exportedCnt = 0;
		for (const block of indexBlocks) {
			/** extract URL from index link block */
			const linkElem = block.querySelector(this.site.indexLinkSelector);
			if (!linkElem) continue;
			const link = linkElem.getAttribute("href");
			if (!link) continue;
			const url = /^https/.test(link) ? link : this.site.rootUrl + link;

			/** Exit if the url already exist in exportedArticles. */
			if (this.exportedArticles.find((obj) => obj.url === url)) {
				exportedCnt++;
				continue;
			}

			/**Tag filtering */
			if (this.site.tagFiltering === "index") {
				if (!this.site.indexTagSelector) {
					throw new Error(`Invalid indexTagSelector ${this.site.indexTagSelector}`);
				}

				const tags = this.getTags(block, this.site.indexTagSelector);
				if (!vldt.isCommonValue(tags, this.site.tags)) continue;
			}
			links.push(url);
		}

		/** Exit if all links found on index pages are already being exported */
		if (indexBlocks.length === exportedCnt) {
			this.foundNewArticles = false;
		}

		return links;
	}

	returnArticles(): articles[] {
		return this.acquiredArticles;
	}

	async scrapeArticle(url: string): Promise<void> {
		if (!url || vldt.isURL(url)) {
			throw new Error(`${url} is not a valid URL.`);
		}

		const urlObj = new URL(url);
		const dom = await this.getDom(url);

		const _title = dom.querySelector(this.site.articleTitleSelector);
		const title = _title ? (_title.childNodes[0].nodeValue ? _title.childNodes[0].nodeValue.trim() : "") : "";
		const body = dom.querySelector(this.site.articleBodySelector)?.textContent ?? "";
		const id = urlObj.pathname.split("/").pop() || urlObj.href;

		const newArticle: articles = {
			name: this.site.name,
			id,
			url: urlObj.href,
			title,
			body,
		};

		if (this.site.tagCollect && this.site.articleTagSelector) {
			const _tags = this.getTags(dom, this.site.articleTagSelector);
			if (_tags) newArticle.tags = _tags;
		}

		this.acquiredArticles.push(newArticle);
	}

	async scrapeMultipleArticles(url: string): Promise<void> {
		if (!url || vldt.isURL(url)) {
			throw new Error(`${url} is not a valid URL.`);
		}

		if (!this.site.articleBlockSelector) {
			throw new Error(`Invalid articleBlockSelector ${this.site.articleBlockSelector}`);
		}

		const urlObj = new URL(url);
		const dom = await this.getDom(url);

		const articles = dom.querySelectorAll(this.site.articleBlockSelector);

		if (articles.length === 0) return;

		for (const article of articles) {
			const _title = article.querySelector(this.site.articleTitleSelector);
			const title = _title ? (_title.childNodes[0].nodeValue ? _title.childNodes[0].nodeValue.trim() : "") : "";
			const body = article.querySelector(this.site.articleBodySelector)?.textContent ?? "";
			const id = urlObj.pathname.split("/").pop() || urlObj.href;

			const newArticle: articles = {
				name: this.site.name,
				id,
				url: urlObj.href,
				title,
				body,
			};

			if (this.site.tagCollect && this.site.articleTagSelector) {
				const _tags = this.getTags(article, this.site.articleTagSelector);
				if (_tags) newArticle.tags = _tags;
			}

			this.acquiredArticles.push(newArticle);
		}
	}

	async isNextPage(): Promise<boolean> {
		if (this.currentUrl.href === this.nextUrl) this.getNextUrl();

		if (!this.nextUrl) return false;
		try {
			await this.getDom(this.nextUrl);
			return true;
		} catch (err) {
			return false;
		}
	}

	gotoNextPage(): void {
		this.isNextPage()
			.then(() => {
				if (this.nextUrl) {
					this.currentUrl = new URL(this.nextUrl);
				}
			})
			.catch(() => {
				console.warn(`gotoNextPage() failed.  currentUrl=${this.currentUrl}; attempted nextUrl=${this.nextUrl}`);
			});
	}

	async getNextUrl() {
		let nextUrl;
		const dom = await this.getDom(this.currentUrl.href);

		if (this.site.nextPageType === "next" && this.site.nextPageLinkSelector) {
			const linkElem = dom.querySelector(this.site.nextPageLinkSelector);
			if (!linkElem) {
				throw new Error(`Failed to get next link from ${this.currentUrl} using ${this.site.nextPageLinkSelector}`);
			}

			nextUrl = this.extractLink(linkElem);
		}

		if (this.site.nextPageType === "pagenation" && this.site.nextPageLinkSelector) {
			const linkElems = dom.querySelectorAll(this.site.nextPageLinkSelector);
			if (!linkElems) {
				throw new Error(`Failed to get links from ${this.currentUrl} using ${this.site.nextPageLinkSelector}`);
			}

			for (const el of linkElems) {
				if (Number(el.textContent) === this.currentPageNumber + 1) {
					nextUrl = this.extractLink(el);
					break;
				}
			}
		}

		if (this.site.nextPageType === "parameter" && this.site.nextPageParameter) {
			nextUrl = this.incrementUrlParameter();
		}

		this.nextUrl = nextUrl;
	}

	incrementUrlParameter(): string {
		if (!this.site.nextPageParameter) {
			throw new Error(`Invalid nextPageParameter ${this.site.nextPageParameter}`);
		}
		const params = this.currentUrl.searchParams;
		if (Object.keys(params).length === 0 || !params.has(this.site.nextPageParameter)) {
			params.set(this.site.nextPageParameter, "2");
		} else {
			for (const [key, val] of Array.from(params)) {
				key === this.site.nextPageParameter ? params.set(key, String(Number(val) + 1)) : params.set(key, val);
			}
		}
		const updatedQueryString = params.toString();
		return `${this.currentUrl.origin}${this.currentUrl.pathname}?${updatedQueryString}${this.currentUrl.hash}`;
	}

	exportArticles(): void {
		if (this.acquiredArticles.length === 0) return;

		for (const article of this.acquiredArticles) {
			const exportPath = path.join(this.site.saveDir, `${article.name}__${article.id}.txt`);

			fs.writeFile(exportPath, JSON.stringify(article), (err) => {
				console.error(`Failed to export ${article}.  ERROR: ${err}`);
			});
		}
	}

	exportContent(contents: articles[]): void {
		for (const content of contents) {
			const exportPath = path.join(this.site.saveDir, `${content.name}__${content.id}.txt`);
			try {
				fs.writeFileSync(exportPath, JSON.stringify(content));
			} catch (err) {
				console.log(err);
			}
		}
	}
}

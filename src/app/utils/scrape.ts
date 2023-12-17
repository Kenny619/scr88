import fs from "fs";
import path from "path";
import { JSDOM, ResourceLoader } from "jsdom";

//types
import { articles, exportedArticles, site } from "../../typings/index.js";
import _error from "./errorHandler.js";
import { assertExists } from "./exist.js";
//local utilities
import validateSiteInputs from "./srcWebsiteValidation.js";
import userAgent from "./userAgents.js";
import * as vldt from "./validator.js";

export default class Scraper {
	site: site;
	exportedArticles: exportedArticles[];
	acquiredArticles!: articles[];
	currentURL: URL;
	nextUrl!: string | undefined;
	currentPageNumber: number;
	currentURLdom!: Document;
	linkQueue: string[];
	foundNewArticles: boolean;
	constructor(srcWebsite: site) {

		/** validation */
		const valResult = validateSiteInputs(srcWebsite);

		if (valResult.length > 0) {
			throw new Error(valResult.join("\r\n"));
		}

		// source website parameters
		this.site = srcWebsite;

		// List of previously acquired contents ids
		this.exportedArticles = this.getExportedArticles() || [];

		// currentURL
		this.currentURL = new URL(this.site.entryUrl);

		// Extracted source links
		this.linkQueue = [];

		//New article tracker.  Sets to false when there are no new article
		this.foundNewArticles = true;

		//starting page number.  1 unless startingPageNumber is passed.
		this.currentPageNumber = this.site.startingPageNumber || 1;
	}

	debug(): object {
		return this;
	}

	async scrape(): Promise<void> {

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

	}

	async getPageURLs(): Promise<string[]> {

		assertExists<string>(this.site.lastUrlSelector);
		assertExists<string>(this.site.lastPageNumberRegExp);

		const lastElem = this.currentURLdom.querySelector(this.site.lastUrlSelector);
		assertExists<Element>(lastElem);

		const lastUrl = lastElem.getAttribute("href");
		assertExists<string>(lastUrl);

		const lpnRegExp = new RegExp(this.site.lastPageNumberRegExp);

		const lpnResult = lastUrl.match(lpnRegExp);
		if (!lpnResult) throw new Error(`RegExp failed ${this.site.lastPageNumberRegExp}`);
		const lastPageNumber = Number(lpnResult[1]);

		const nextPage = this.currentPageNumber !== 1 ? this.currentPageNumber : 2;
		const urls = [];
		for (let i = nextPage; i <= lastPageNumber; i++) {
			urls.push(lastUrl.replace(lpnRegExp, `/page/${i}/`));
		}

		return urls;
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
			this.scrapeArticle(this.currentURL.href);

			if (await this.isNextPage()) {
				this.gotoNextPage();
			} else {
				break;
			}
		} while (this.foundNewArticles);
	}

	async scrapeMultiples(): Promise<void> {
		do {
			this.scrapeMultipleArticles(this.currentURL.href);

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
			return fs
				.readdirSync(srcDir, { withFileTypes: true, encoding: "utf-8" })
				.filter((dirent) => dirent.isFile() && dirent.name.endsWith(".txt"))
				.map((dirent) => {
					const file = fs.readFileSync(path.join(srcDir, dirent.name), {
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
		const loader = new ResourceLoader({
			userAgent: await userAgent(),
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
		const href = el.getAttribute("href");

		if (!href) {
			throw new Error(`getAttrivute('href') failed on link from link element ${el}.`);
		}

		return /^https/.test(href) ? href : this.site.rootUrl + href;
	}

	async getLinksFromIndex(): Promise<string[]> {

		assertExists<string>(this.site.indexLinkBlockSelector);
		assertExists<string>(this.site.indexLinkSelector);


		const dom = await this.getDom(this.currentURL.href);

		const indexBlocks = dom.querySelectorAll(this.site.indexLinkBlockSelector);
		if (indexBlocks.length === 0) {
			throw new Error(`Could not capture index blocks on ${this.currentURL.href} using ${this.site.indexLinkBlockSelector}`);
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
			if (this.site.tagFiltering && this.site.indexTagSelector) {
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
		if (this.currentURL.href === this.nextUrl) await this.getNextUrl();
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
					this.currentURL = new URL(this.nextUrl);
				}
			})
			.catch(() => {
				console.warn(`gotoNextPage() failed.  currentURL=${this.currentURL}; attempted nextUrl=${this.nextUrl}`);
			});
	}

	async getNextUrl() {
		let nextUrl;
		const dom = await this.getDom(this.currentURL.href);

		if (this.site.nextPageType === "next" && this.site.nextPageLinkSelector) {
			const linkElem = dom.querySelector(this.site.nextPageLinkSelector);
			if (!linkElem) {
				throw new Error(`Failed to get next link from ${this.currentURL} using ${this.site.nextPageLinkSelector}`);
			}

			nextUrl = this.extractLink(linkElem);
		}

		if (this.site.nextPageType === "pagenation" && this.site.nextPageLinkSelector) {
			const linkElems = dom.querySelectorAll(this.site.nextPageLinkSelector);
			if (!linkElems) {
				throw new Error(`Failed to get links from ${this.currentURL} using ${this.site.nextPageLinkSelector}`);
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
		const params = this.currentURL.searchParams;
		if (Object.keys(params).length === 0 || !params.has(this.site.nextPageParameter)) {
			params.set(this.site.nextPageParameter, "2");
		} else {
			for (const [key, val] of Array.from(params)) {
				key === this.site.nextPageParameter ? params.set(key, String(Number(val) + 1)) : params.set(key, val);
			}
		}
		const updatedQueryString = params.toString();
		return `${this.currentURL.origin}${this.currentURL.pathname}?${updatedQueryString}${this.currentURL.hash}`;
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

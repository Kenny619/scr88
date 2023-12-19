import fs from "fs";
import path from "path";
import { JSDOM, ResourceLoader } from "jsdom";

//types
import { articles, exportedArticles, site } from "../../typings/index.js";
import _error from "./errorHandler.js";
//local utilities
import validateSiteInputs from "./srcWebsiteValidation.js";
import { assertExists, exists, isElement } from "./typeGuards.js";
import userAgent from "./userAgents.js";
import * as vldt from "./validator.js";

export default class Scraper {
	//source website parameters
	protected site: site;
	//Existing articles in site.saveDir
	protected exportedArticles: exportedArticles[];
	//List of newly acquired contents ids
	protected acquiredArticles!: articles[];
	//current page URL object
	protected currentURL: URL;
	//DOM of currentURL
	protected currentUrlDOM!: Document;
	//Current PageNumber - for nextPageType = pagenation
	protected currentPageNumber: number;
	//if nextUrlType = last | pages to be scraped
	protected siteURLs: string[];
	//warning messages
	protected warnings: string[];
	//Failed URLs
	protected failedURLs: string[];

	constructor(srcWebsite: site) {
		// srcWebsite validation
		const valResult = validateSiteInputs(srcWebsite);

		if (valResult.length > 0) {
			throw new Error(valResult.join("\r\n"));
		}

		// source website parameters
		this.site = srcWebsite;

		// List of previously acquired contents ids
		this.exportedArticles = this.getExportedArticles() ?? [];

		// currentURL
		this.currentURL = new URL(this.site.entryUrl);

		//current page number for nextPageType = pagenation
		assertExists<number>(this.site.startingPageNumber);
		this.currentPageNumber = this.site.startingPageNumber;

		// list of URLs to be scraped.  Only used when nextUrlType = last
		this.siteURLs = [];

		//warnings
		this.warnings = [];

		//failed URLs
		this.failedURLs = [];
	}

	async debug(): Promise<object> {
		/** get current dom */
		this.currentUrlDOM = await this.getDOM(this.currentURL.href);

		/** get siteURLs */
		if (this.site.nextPageType === "last") {
			this.getPageURLs();
		}
		return this;
	}

	async scrape(): Promise<void> {
		/** get current dom */
		this.currentUrlDOM = await this.getDOM(this.currentURL.href);

		/** get siteURLs */
		if (this.site.nextPageType === "last") {
			this.getPageURLs();
		}

		let nextUrl: string | undefined;

		do {

			switch (this.site.siteType) {

				case "links": {
					const articleLinks = this.getLinksFromIndex();
					if (articleLinks) {
						const scrapers = articleLinks.map(link => this.scrapeArticleIndex(link));
						Promise.all(scrapers);
					}
					break;
				}

				case "multipleArticle": {
					this.scrapeArticleMultiple();
					break;
				}

				case "singleArticle": {
					this.scrapeArticleSingle();
					break;
				}
			}

			nextUrl = this.getNextUrl();
			if (nextUrl) {
				try {
					await this.gotoNextUrl(nextUrl);
				} catch (err) {
					this.warnings.push(`Failed to transition to ${nextUrl}`);
					this.failedURLs.push(nextUrl);
					nextUrl = undefined;
				}
			}

		} while (nextUrl);

		this.close();
	}

	getPageURLs(): void {
		assertExists<string>(this.site.lastUrlSelector);
		assertExists<number>(this.site.startingPageNumber);
		assertExists<string>(this.site.lastPageNumberRegExp);

		const lastElem = this.currentUrlDOM.querySelector(this.site.lastUrlSelector);
		assertExists<Element>(lastElem);

		const lastUrl = lastElem.getAttribute("href");
		assertExists<string>(lastUrl);

		const lpnRegExp = new RegExp(this.site.lastPageNumberRegExp);

		const lpnResult = lastUrl.match(lpnRegExp);
		if (!lpnResult) throw new Error(`RegExp failed ${this.site.lastPageNumberRegExp}`);
		const lastPageNumber = Number(lpnResult[1]);

		const nextPage = this.site.startingPageNumber !== 1 ? this.site.startingPageNumber : 2;
		assertExists<number>(nextPage);

		for (let i = nextPage; i <= lastPageNumber; i++) {
			this.siteURLs.push(lastUrl.replace(lpnRegExp, `/page/${i}/`));
		}
	}

	getExportedArticles(): exportedArticles[] {
		try {
			return fs
				.readdirSync(this.site.saveDir, { withFileTypes: true, encoding: "utf-8" })
				.filter((dirent) => dirent.isFile() && dirent.name.endsWith(".txt"))
				.map((dirent) => {
					const file = fs.readFileSync(path.join(this.site.saveDir, dirent.name), {
						encoding: "utf-8",
					});
					return JSON.parse(file);
				})
				.filter((obj) => obj.name === this.site.name)
				.map((article) => {
					return { name: article.name, id: article.id, url: article.url };
				});
		} catch (err) {
			throw new Error(`Failed to read files from ${this.site.saveDir}. ERROR: ${err}`);
		}
	}

	getTags(doc: Element | Document, selector: string): string[] {
		const elements = doc.querySelectorAll(selector);

		if (elements.length === 0) return [];

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

	/**
	 *
	 * @param url <string> - URL
	 * @returns dom <Document> - Returns the DOM of the passed url
	 */

	async getDOM(url: string): Promise<Document> {
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
			this.warnings.push(`Failed to access url ${url}.\n ${err}`);
			this.failedURLs.push(url);
			throw new Error("getDOM failed.");
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

	getLinksFromIndex(): string[] {
		assertExists<string>(this.site.indexLinkBlockSelector);
		assertExists<string>(this.site.indexLinkSelector);

		const indexBlocks = this.currentUrlDOM.querySelectorAll(this.site.indexLinkBlockSelector);
		assertExists<NodeListOf<Element>>(indexBlocks);

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
			if (this.site.tagFiltering) {
				assertExists<string>(this.site.indexTagSelector);
				const tags = this.getTags(block, this.site.indexTagSelector);
				if (!vldt.isCommonValue(tags, this.site.tags)) continue;
			}

			links.push(url);
		}

		/** Exit if all links found on index pages are already being exported */
		if (indexBlocks.length === exportedCnt) {
			this.close();
		}

		return links;
	}

	returnArticles(): articles[] {
		return this.acquiredArticles;
	}

	extractArticle(dom: Document | Element, url: string = this.currentURL.href): Promise<articles> {

		return new Promise((resolve, reject) => {

			const msg = `Failed to extract article from ${url}`;

			const titleElem = dom.querySelector(this.site.articleTitleSelector);
			if (!isElement(titleElem)) reject(msg);

			const title = (titleElem as Element).childNodes[0].nodeValue;
			if (!exists<string>(title)) reject(msg);

			const bodyElem = dom.querySelector(this.site.articleBodySelector);
			if (!isElement(bodyElem)) reject(msg);

			const body = (bodyElem as Element).textContent;
			if (!exists<string>(body)) reject(msg);


			const urlObj = new URL(url);
			const id = urlObj.pathname.split("/").pop() || urlObj.href;

			const newArticle: articles = {
				name: this.site.name,
				id,
				url: urlObj.href,
				title: title as string,
				body: body as string
			};

			if (this.site.tagCollect && this.site.articleTagSelector) {
				const _tags = this.getTags(dom, this.site.articleTagSelector);
				if (_tags) newArticle.tags = _tags;
			}

			resolve(newArticle);

		});

	}

	async scrapeArticleIndex(url: string): Promise<void> {

		const dom = await this.getDOM(url);

		this.extractArticle(dom, url)
			.then(article => this.acquiredArticles.push(article))
			.catch(err => {
				this.warnings.push(err);
				this.failedURLs.push(url);
			});

	}

	scrapeArticleSingle(): void {
		this.extractArticle(this.currentUrlDOM, this.currentURL.href)
			.then(article => this.acquiredArticles.push(article))
			.catch(err => {
				this.warnings.push(err);
				this.failedURLs.push(this.currentURL.href);
			});
	}

	scrapeArticleMultiple(): void {

		assertExists<string>(this.site.articleBlockSelector);

		const articlesElem = this.currentUrlDOM.querySelectorAll(this.site.articleBlockSelector);
		if (articlesElem.length === 0) {
			this.warnings.push(`Failed to extract article from ${this.currentURL.href}`);
			return;
		}

		for (const el of articlesElem) {
			this.extractArticle(el, this.currentURL.href)
				.then(article => this.acquiredArticles.push(article))
				.catch(err => {
					this.warnings.push(err);
					this.failedURLs.push(this.currentURL.href);
				});
		}
	}

	async gotoNextUrl(nextUrl: string): Promise<void> {
		if (!nextUrl) {
			throw new Error(`Invalid next URL ${nextUrl}`);
		}

		this.currentURL = new URL(nextUrl);

		try {
			this.currentUrlDOM = await this.getDOM(this.currentURL.href);
		} catch (err) {
			throw new Error(`gotoNextUrl failed.  Failed to acquire DOM from ${this.currentURL.href}`);
		}

		this.currentPageNumber++;
	}

	getNextUrl(): string | undefined {
		switch (this.site.nextPageType) {
			//last
			case "last":
				return this.siteURLs.length > 0 ? this.siteURLs.pop() : "";

			//next
			case "next": {
				assertExists<string>(this.site.nextPageLinkSelector);

				const linkElem = this.currentUrlDOM.querySelector(this.site.nextPageLinkSelector);
				if (!isElement(linkElem)) return "";

				const nextPageUrl = this.extractLink(linkElem);
				return exists<string>(nextPageUrl) ? nextPageUrl : "";

			}

			//pagenation
			case "pagenation": {
				assertExists<string>(this.site.nextPageLinkSelector);

				const linkElems = this.currentUrlDOM.querySelectorAll(this.site.nextPageLinkSelector);
				if (!exists<NodeListOf<Element>>(linkElems)) return "";

				for (const el of linkElems) {
					if (Number(el.textContent) === this.currentPageNumber + 1) {
						return this.extractLink(el);
					}
				}

				return "";
			}

			//parameter
			case "parameter": {
				return this.incrementUrlParameter();
			}

			default:
				return "";
		}
	}

	incrementUrlParameter(): string {

		assertExists<string>(this.site.nextPageParameter);

		const params = this.currentURL.searchParams;
		if (Object.keys(params).length === 0 || !params.has(this.site.nextPageParameter)) {
			params.set(this.site.nextPageParameter, "2");
		} else {
			for (const [key, val] of Array.from(params)) {
				key === this.site.nextPageParameter
					? params.set(key, String(Number(val) + 1))
					: params.set(key, val);
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
				this.warnings.push(`Failed to export ${article}.  ERROR: ${err}`);
			});
		}
	}

	exportFailedUrls(): void {
		if (this.failedURLs.length === 0) return;
		const exportPath = path.join(this.site.saveDir, `${this.site.name}__failedURLs__${Date.now()}.txt`);

		try {
			fs.writeFileSync(exportPath, this.failedURLs.join("\n"));
		} catch (err) {
			console.error(`Failed to export failed URLs.  ERROR: ${err}`);
		}
	}

	close(): void {
		this.exportArticles();
		this.exportFailedUrls();
		console.warn(this.warnings.join("\n"));
		console.log("Existing Program.");
		process.exit();
	}
}

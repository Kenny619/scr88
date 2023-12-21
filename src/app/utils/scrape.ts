import fs from "fs";
import path from "path";
import { JSDOM, ResourceLoader } from "jsdom";

//types
import { articles, exportedArticles, site } from "../../typings/index.js";
import _error from "./errorHandler.js";
//local utilities
import validateSiteInputs from "./srcWebsiteValidation.js";
import { assertExists, exists, } from "./typeGuards.js";
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
	//pageURLs for link type site
	protected pageURLs: string[];
	//Error messages
	protected errors: string[];
	//Exported article count
	protected exportedCnt: number;

	constructor(srcWebsite: site) {
		// srcWebsite validation
		const valResult = validateSiteInputs(srcWebsite);

		if (valResult.length > 0) {
			throw new Error(valResult.join("\r\n"));
		}

		// source website parameters
		this.site = srcWebsite;

		// List of previously acquired contents ids
		this.exportedArticles = this.getExportedArticles();

		// currentURL
		this.currentURL = new URL(this.site.entryUrl);

		//current page number for nextPageType = pagenation
		assertExists<number>(this.site.startingPageNumber);
		this.currentPageNumber = this.site.startingPageNumber;

		// list of URLs to be scraped.  Only used when nextUrlType = last
		this.siteURLs = [this.site.entryUrl];

		// List of URLs to be scraped.  Acquired from index page.
		this.pageURLs = [];

		//Error messages
		this.errors = [];

		//Acquired articles
		this.acquiredArticles = [];

		//Exported count
		this.exportedCnt = 0;
	}



	getSiteURLs(): void {
		/** Configure UserAgent */
		const loader = new ResourceLoader({
			userAgent: userAgent(),
		});

		JSDOM.fromURL(this.site.entryUrl, { resources: loader })
			.then((jd) => {
				const dom = jd.window.document;

				const lastURL = this.getLastURL(dom);
				assertExists<string>(lastURL);

				assertExists<string>(this.site.lastPageNumberRegExp);
				assertExists<number>(this.site.startingPageNumber);

				const lpnRegExp = new RegExp(this.site.lastPageNumberRegExp);
				const lpnResult = lastURL.match(lpnRegExp);

				assertExists<object>(lpnResult);
				const lastPageNumber = Number(lpnResult[1]);

				const nextPage = this.site.startingPageNumber !== 1 ? this.site.startingPageNumber : 2;
				assertExists<number>(nextPage);

				for (let i = nextPage; i <= lastPageNumber; i++) {
					this.siteURLs.push(lastURL.replace(String(lastPageNumber), String(i)));
				}

				this.getPageURLfromIndex();
			})
			.catch((err) => {
				this.logError(this.site.entryUrl, this.getSiteURLs.name, "JSDOM failed.", err);
			});
	}


	getLastURL(dom: Document | Element): string | null {

		assertExists<string>(this.site.lastUrlSelector);

		const lastElem = dom.querySelector(this.site.lastUrlSelector);
		assertExists<Element>(lastElem);

		return lastElem.getAttribute("href");
	}

	getPageURLfromIndex(): void {

		if (this.siteURLs.length === 0) return;
		const indexURL = this.siteURLs.shift();


		if (!indexURL) {
			this.logError(indexURL as string, this.getPageURLfromIndex.name, "Invalid URL", "");
			return;
		}

		/** Configure UserAgent */
		const loader = new ResourceLoader({
			userAgent: userAgent(),
		});

		JSDOM.fromURL(indexURL, { resources: loader })
			.then((jd) => {
				const dom = jd.window.document;

				assertExists<string>(this.site.indexLinkBlockSelector);
				assertExists<string>(this.site.indexLinkSelector);

				const indexBlocks = dom.querySelectorAll(this.site.indexLinkBlockSelector);
				assertExists<NodeListOf<Element>>(indexBlocks);

				let exportedCnt = 0;
				for (const block of indexBlocks) {
					/** extract URL from index link block */
					const linkElem = block.querySelector(this.site.indexLinkSelector);
					if (!linkElem) continue;
					const link = linkElem.getAttribute("href");
					if (!link) continue;
					const pageURL = /^https/.test(link) ? link : this.site.rootUrl + link;

					/** Exit if the url already exist in exportedArticles. */
					if (this.exportedArticles.length > 0 && this.exportedArticles.find((obj) => obj.url === pageURL)) {
						console.log(`${link} already exists.`);
						exportedCnt++;
						continue;
					}

					/**Tag filtering */
					if (this.site.tagFiltering) {
						assertExists<string>(this.site.indexTagSelector);
						if (!this.isTagIncluded(indexURL, block, this.site.indexTagSelector)) continue;
					}

					this.pageURLs.push(pageURL);
					this.scrapeArticle();

				}


				if (indexBlocks.length === exportedCnt) {
					/** Exit if all links found on index pages are already being exported */
					this.siteURLs = [];
					this.pageURLs.length > 0 ? this.scrapeArticle() : this.close();
					return;
				}

				if (this.siteURLs.length > 0) this.getPageURLfromIndex();

			})
			.catch((err) => this.logError(indexURL, this.getPageURLfromIndex.name, "JSDOM error", err));
	}

	isTagIncluded(url: string, el: Element, selector: string): boolean {

		if (!(el instanceof Element) || typeof selector !== 'string') {
			this.logError(url, this.isTagIncluded.name, `Invalid args. el:${el}, selector:${selector}`, "");
			return false;
		}

		const tagsOnPage = this.getTags(el, selector);
		if (!tagsOnPage) {
			this.logError(url, this.isTagIncluded.name, `getTags returned ${tagsOnPage}`, "");
			return false;
		}

		return vldt.isCommonValue(tagsOnPage, this.site.tags) ? true : false;
	}


	scrapeArticle(): void {

		if (!this.pageURLs && !this.siteURLs) {
			this.close();
		}

		const url = this.pageURLs.shift();
		if (!url) {
			this.logError(url as string, this.scrapeArticle.name, "Invalid URL", "");
			return;
		}

		/** Configure UserAgent */
		const loader = new ResourceLoader({
			userAgent: userAgent(),
		});

		//delete
		console.log(`start scraping on ${url}`);

		JSDOM.fromURL(url, { resources: loader })
			.then((jd) => {
				const dom = jd.window.document;
				this.extractArticle(dom, url)
					.then((article) => {
						this.acquiredArticles.push(article);
						this.exportArticles();
					})
					.catch((err) => this.logError(url, this.scrapeArticle.name, "extractArticle failed", err));
			})
			.catch((err) => this.logError(url, this.scrapeArticle.name, "JSDOM failed", err));
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
			throw new Error(`Failed to read files from ${this.site.saveDir}.ERROR: ${err}`);
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


	extractLink(el: Element): string {
		const href = el.getAttribute("href");

		if (!href) {
			throw new Error(`getAttrivute('href') failed on link from link element ${el}.`);
		}

		return /^https/.test(href) ? href : this.site.rootUrl + href;
	}



	returnArticles(): articles[] {
		return this.acquiredArticles;
	}

	extractArticle(dom: Document | Element, url: string = this.currentURL.href): Promise<articles> {
		return new Promise((resolve, reject) => {
			const msg = `Failed to extract article from ${url}`;

			assertExists<string>(this.site.articleTitleSelector);
			assertExists<string>(this.site.articleBodySelector);
			assertExists<string>(this.site.articleTagSelector);

			const titleElem = dom.querySelector(this.site.articleTitleSelector);
			if (!titleElem) reject(msg);

			const title = (titleElem as Element).childNodes[0].nodeValue;
			if (!exists<string>(title)) reject(msg);

			const bodyElem = dom.querySelector(this.site.articleBodySelector);
			if (!bodyElem) reject(msg);

			const body = (bodyElem as Element).textContent;
			if (!exists<string>(body)) reject(msg);

			const urlObj = new URL(url);
			const id = urlObj.pathname.replace(/\/$/, "").split("/").pop() ?? "";

			const newArticle: articles = {
				name: this.site.name,
				id,
				url: url as string,
				title: title as string,
				body: body as string,
			};

			if (this.site.tagCollect && this.site.articleTagSelector) {
				const _tags = this.getTags(dom, this.site.articleTagSelector);
				if (_tags) newArticle.tags = _tags;
			}

			resolve(newArticle);
		});
	}

	incrementUrlParameter(): string {
		assertExists<string>(this.site.nextPageParameter);

		const params = this.currentURL.searchParams;
		if (Object.keys(params).length === 0 || !params.has(this.site.nextPageParameter)) {
			params.set(this.site.nextPageParameter, "2");
		} else {
			for (const [key, val] of Array.from(params)) {
				key === this.site.nextPageParameter ? params.set(key, String(Number(val) + 1)) : params.set(key, val);
			}
		}
		const updatedQueryString = params.toString();
		return `${this.currentURL.origin}${this.currentURL.pathname} ? ${updatedQueryString}${this.currentURL.hash}`;
	}

	exportArticles(): void {
		if (this.acquiredArticles.length === 0) return;

		const article = this.acquiredArticles.shift();
		assertExists<articles>(article);
		const exportPath = path.join(this.site.saveDir, `${article.name}__${article.id}.txt`);

		fs.writeFile(exportPath, JSON.stringify(article), (err) => {
			if (err) this.logError(article.url, this.exportArticles.name, `Failed to export ${article}`, err.message);

			//increment exported count
			this.exportedCnt++;

			//Continue exoprting while acquiredArticles exist
			if (this.acquiredArticles.length > 0) this.exportArticles();

			//Close the program if articles and urls become empty
			if (this.acquiredArticles.length > 0 && this.pageURLs.length === 0 && this.siteURLs.length === 0) this.close();
		});
	}

	appendErrorLog(): void {
		if (this.errors.length === 0) return;

		const failedURLs = this.errors.join("\n");
		const exportPath = path.join(this.site.logDir, "errors.log");

		fs.appendFile(exportPath, `${failedURLs} \n`, (err) => {
			if (err) {
				console.log("Failed to append errors to the log file.");
				console.log(this.errors);
			}
		});

	}

	logError(url: string, method: string, msg: string, err: string): void {
		const datetime = `${this.getDate()}:${this.getTime()}`;
		this.errors.push(`${datetime}\t${url}\n${method}\n${msg}\n${err}`);
	}

	getDate(): string {
		return new Date().toLocaleDateString("ja-JP", {
			year: "numeric", month: "2-digit",
			day: "2-digit"
		}).replaceAll('/', "");
	}

	getTime(): string {
		return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	}

	close(): void {
		console.log(`Completed scraping site: ${this.site.name}.  Success:${this.exportedCnt} Errors:${this.errors.length}`);
		if (this.errors.length > 0) this.appendErrorLog();
		return;
	}
}

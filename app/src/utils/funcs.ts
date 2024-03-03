import { JSDOM, ResourceLoader } from "jsdom";
import { site } from "../../typings/index";
import userAgent from "./userAgents";
import https from "https";
import fs from "fs";

type extractTypes = "link" | "text" | "node";
type article = {
	siteName: string;
	URL: string;
	ID: number;
	title: string;
	body: string;
	tags?: string[];
};

export function isURLalive(url: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		https
			.get(url, (res) => {
				(res.statusCode as number) < 400 ? resolve(true) : reject(false);
			})
			.on("error", (e) => {
				reject(false);
			});
	});
}

export async function getDOM(url: string): Promise<Document> {
	let dom: Document;

	const loader = new ResourceLoader({
		userAgent: userAgent(),
	});

	try {
		const jd = await JSDOM.fromURL(url, { resources: loader });
		dom = jd.window.document;
	} catch (err) {
		throw new Error(`JSDOM failed on ${url}\n ${err}`);
	}
	return dom;
}

export function extractAll(type: "link" | "text", elem: Element | Document, selector: string): string[] | null;
export function extractAll(type: "node", elem: Element | Document, selector: string): Element[] | null;
export function extractAll(
	type: extractTypes,
	elem: Element | Document,
	selector: string,
): string[] | null | Element[] {
	const elems = elem.querySelectorAll(selector);

	if (!elems) {
		return null;
	}

	let ary = [];
	switch (type) {
		case "link":
			ary = Array.from(elems)
				.map((el) => el.getAttribute("href"))
				.filter((v) => v !== null);
			break;
		case "text":
			ary = Array.from(elems)
				.map((el) => el.textContent)
				.filter((v) => v !== null);
			break;
		case "node":
			ary = Array.from(elems).filter((v) => v !== null);
			break;
	}
	return ary.length === 0 ? null : (ary as string[] | Element[]);
}

export function extract(type: "link" | "text", elem: Element | Document, selector: string): string | null;
export function extract(type: "node", elem: Element | Document, selector: string): Element | null;
export function extract(type: extractTypes, elem: Element | Document, selector: string): string | Element | null {
	const el = elem.querySelector(selector);

	if (!el) {
		return null;
	}

	switch (type) {
		case "link":
			return el.getAttribute("href");
		case "text":
			return el.textContent;
		case "node":
			return el;
	}
}

export class Scraper {
	urlQueue: string[];
	articleQueue: (Element | Document)[];
	indexPageQueue: string[];
	site: site;
	articles: article[];
	errors: {
		date: Date;
		siteName: string;
		URL: string;
		error: string;
	}[];
	current: Partial<{
		ID: number;
		URL: string;
		DOM: Document | Element;
		pageNumber: string;
	}>;
	lastArticle: Partial<{
		URL: string;
		id: number;
		title: string;
	}>;

	constructor(site: site) {
		this.site = site;
		this.urlQueue = [];
		this.articleQueue = [];
		this.indexPageQueue = [];
		this.articles = [];
		this.errors = [];
		this.current = {
			ID: undefined,
			URL: undefined,
			DOM: undefined,
			pageNumber: undefined,
		};
		this.lastArticle = {};
	} /*
	scrape article
	 if articleQueue is empty, pop urlQueue and get DOM
	 if urlQueue is empty, generate nextURL and push it to urlQueue

    updating URL
     getNextURL() acquires next URL.  this.current.URL will be updated when there is next URL.
     Otherwise null is returned and the program should exit then.

	 Stop conditions
	 - nextURL fails
	 - article URL matches the last scraped URL

	*/

	/****************************************** stop conditions */

	getLastScrapedArticle() {
		//get articles as a chunk
		const articleRepo = `${this.site.saveDir}\\${this.site.language}`;
		const lastArticle = fs
			.readdirSync(articleRepo, { withFileTypes: true })
			.filter((Dirent) => Dirent.isFile() === true)
			.map((Dirent) => {
				const file = fs.readFileSync(`${articleRepo}\\${Dirent.name}`, "utf-8");
				return JSON.parse(file);
			})
			.filter((articles) => articles.siteName === this.site.name)
			.find((article) => Math.max(article.id));

		if (lastArticle) {
			this.lastArticle = {
				URL: lastArticle.URL,
				id: lastArticle.id,
				title: lastArticle.title,
			};

			this.current.ID = lastArticle.id;
		}
	}

	checkTagMatch(): boolean {
		const articleTags = extractAll("text", this.current.DOM as Document, this.site.articleTagSelector as string);
		if (articleTags) {
			const tagMatch = articleTags.some((tag) => (this.site.tags as string[]).includes(tag));
			return tagMatch ? true : false;
		}
		return false;
	}

	async updateArticleQueue(url: string) {
		if (this.articleQueue.length === 0) {
			this.current.DOM = await getDOM(url);
			const articles = extractAll("node", this.current.DOM as Document, this.site.articleBlockSelector as string);
			if (articles) {
				const articlesNonNull = articles.filter((article) => article !== null);
				if (articlesNonNull.length === 0) {
					throw new Error(`Failed to acquire article using articleBlockSelector ${this.site.articleBlockSelector}`);
				}
				this.articleQueue.push(...(articlesNonNull as Element[]));
			}
		}
	}

	scrapeArticle() {
		do {
			//if siteType = Multiple Article.  Pop articleQueue and update this.current.DOM
			if (this.site.siteType === "multipleArticle" && this.articleQueue.length > 0) {
				this.current.DOM = this.articleQueue.pop() as Element;
			}
			//TagFiltering.  Exit if the article does not have matching tag
			if (this.site.tagFiltering && !this.checkTagMatch()) {
				return;
			}

			this.getID();
			const title = extract("text", this.current.DOM as Document, this.site.articleTitleSelector as string);
			const body = extract("text", this.current.DOM as Document, this.site.articleBodySelector as string);

			//exit if acquired article matches the lastArticle
			if (this.lastArticle.title === title && this.lastArticle.URL === this.current.URL) {
				this.closeProgram();
			}

			const articleObj: article = {
				siteName: this.site.name,
				URL: this.current.URL as string,
				ID: this.current.ID as number,
				title: title as string,
				body: body as string,
			};

			if (this.site.tagCollect) {
				const tags = extractAll("text", this.current.DOM as Document, this.site.articleTagSelector as string);
				articleObj.tags = tags as string[];
			}

			this.articles.push(articleObj);
		} while (this.articleQueue.length > 0);
	}

	getID() {
		if (this.current.ID) {
			this.current.ID++;
		}

		if (!this.current.ID && this.lastArticle.id) {
			this.current.ID = this.lastArticle.id + 1;
		}

		if (!this.current.ID && !this.lastArticle) {
			this.current.ID = 1;
		}
	}

	async updateDOM() {
		//get articleBlock Elements from this.current.URL and put them to articleQueue.
		if (this.site.siteType === "multipleArticle") {
			const articleIndexDOM = await getDOM(this.current.URL as string);
			const articleBlocks = extractAll("node", articleIndexDOM as Document, this.site.articleBlockSelector as string);
			if (articleBlocks) {
				this.articleQueue = articleBlocks.reverse();
			} else {
				this.closeProgram();
			}
		}

		if (this.site.siteType === "singleArticle" || this.site.siteType === "links") {
			this.current.DOM = await getDOM(this.current.URL as string);
		}
	}

	async gotoNextURL() {
		if (this.site.nextPageType === "last") {
			//When all index page and links have been iterated.  Return null and exit the program
			if (this.indexPageQueue.length === 0 && this.urlQueue.length === 0 && this.current.URL !== undefined) {
				this.closeProgram();
			}

			//Initialize indexPageQueue if there is none
			if (this.indexPageQueue.length === 0 && this.urlQueue.length === 0 && this.current.URL === undefined) {
				const entryPageDOM = await getDOM(this.site.entryUrl);
				const lastURL = extract("link", entryPageDOM, this.site.lastUrlSelector as string);
				if (!lastURL) {
					throw new Error(`Failed to acquire URL using lastURLselector ${this.site.lastUrlSelector}`);
				}

				this.indexPageQueue = getURLsFromLastURL(lastURL, this.site.lastPageNumberRegExp as string).reverse();
				if (this.indexPageQueue.length === 0) {
					throw new Error(`Failed to acquire URLs from lastURL ${lastURL}`);
				}
			}

			//Develop urlQueue by retrieving urls from an indexPage in indexPageQueue
			if (this.indexPageQueue.length > 0 && this.urlQueue.length === 0) {
				const indexDOM = await getDOM(this.indexPageQueue.pop() as string);
				const urls = extractAll("link", indexDOM, this.site.indexLinkSelector as string);
				if (urls) {
					this.urlQueue = urls.reverse();
				} else {
					//If failed to retrieve urls from an indexpage, move to the next indexPage by calling gotoNextURL() again
					this.gotoNextURL();
				}
			}

			//pop urlQueue and update currentURL then return it
			if (this.urlQueue.length > 0) {
				this.current.URL = this.urlQueue.pop();
			}
		}

		if (this.site.nextPageType === "next") {
			if (this.current.URL === undefined) {
				this.current.URL = this.site.entryUrl;
			} else {
				const nextURL = extract("link", this.current.DOM as Document, this.site.nextPageLinkSelector as string);

				if (nextURL) {
					this.current.URL = nextURL;
				} else {
					this.closeProgram();
				}
			}
		}

		if (this.site.nextPageType === "parameter") {
			if (this.current.URL === undefined) {
				this.current.URL = this.site.entryUrl;
			} else {
				const urlObj = new URL(this.current.URL as string);
				const paramas = new URLSearchParams(urlObj.search);
				const pageNum = Number(paramas.get(this.site.nextPageParameter as string));
				paramas.set(this.site.nextPageParameter as string, String(pageNum + 1));
				const newURL = `${urlObj.origin}?${paramas.toString()}`;
				if (await isURLalive(newURL)) {
					this.current.URL = newURL;
					this.current.pageNumber = String(pageNum + 1);
				} else {
					this.closeProgram();
				}
			}
		}
	}

	isArticleScraped(url: string, title: string): boolean {
		return url === this.lastArticle.URL && title === this.lastArticle.title ? true : false;
	}

	closeProgram() {}
}

function getURLsFromLastURL(lastURL: string, lastPageNumberRegExp: string) {
	const lastPageNumberRE = new RegExp(lastPageNumberRegExp);
	const lastPageNumber = lastURL.match(lastPageNumberRE);
	if (!lastPageNumber) {
		throw new Error(`Failed to acquire lastPageNumber using lastPageNumberRegExp ${lastPageNumberRegExp}`);
	}

	const lastPageNumberInt = parseInt(lastPageNumber[1]);
	const urls = [];
	for (let i = 1; i <= lastPageNumberInt; i++) {
		urls.push(lastURL.replace(RegExp.$1, i.toString()));
	}
	return urls;
}

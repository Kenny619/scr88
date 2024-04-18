import type { ScrapersConfig, Scraped } from "../../typings/index.js";
import { getDOM, extract, extractAll } from "../api/utils/registerHelper.js";

export class Scraper {
	indexURLQueue: string[];
	articleURLQueue: string[];
	articleDOMQueue: Document[];
	articleElementQueue: Element[];
	scraperConfig: ScrapersConfig;
	lastestArticle: { url: string | null; title: string | null };
	current: { indexURL: string | null; indexDOM: Document | null; articleURL: string | null; articleDOM: Document | null; articleElement: Element | null };
	scraped: Scraped[];

	noMoreURL: boolean;
	constructor(scraperConfig: ScrapersConfig) {
		this.indexURLQueue = [];
		this.articleURLQueue = [];
		this.articleDOMQueue = [];
		this.articleElementQueue = [];
		this.scraperConfig = scraperConfig;
		this.lastestArticle = { url: null, title: null };
		this.current = { indexURL: null, indexDOM: null, articleURL: null, articleDOM: null, articleElement: null };
		this.noMoreURL = false;
		this.scraped = [];
	}

	scrapeArticle(target: Document | Element) {
		const scraped: Scraped = { scraperId: null, articleURL: null, language: null, title: null, body: null, tags: null };
		if (this.scraperConfig.tagFiltering || this.scraperConfig.tagCollect) {
			const articleTags = extractAll("texts", target, this.scraperConfig.articleTagSelector as string);

			//tagFilter:  Exit function if scraperConfig.tags shares same tag as the article.
			if (this.scraperConfig.tagFiltering) {
				const filterTags = this.scraperConfig.tags.split(",");
				const tagSetSize = new Set(articleTags.concat(filterTags)).size;
				if (tagSetSize !== filterTags.length + articleTags.length) {
					return;
				}
			}

			if (this.scraperConfig.tagCollect) {
				scraped.tags = articleTags;
			}
		}

		scraped.title = extract("text", target, this.scraperConfig.articleTitleSelector);
		scraped.body = extract("text", target, this.scraperConfig.articleBodySelector);
		scraped.scraperId = this.scraperConfig.scraperId;
		scraped.articleURL = this.current.articleURL;
		scraped.language = this.scraperConfig.language;
		this.scraped.push(scraped);
	}

	async next() {
		if (this.articleElementHasData()) {
			this.current.articleElement = this.articleElementQueue.shift() as Element;
			this.scrapeArticle(this.current.articleElement);
			await this.next();
			return;
		}

		if (this.articleDOMQueueHasData()) {
			this.current.articleDOM = this.articleDOMQueue.shift() as Document;

			if (this.scraperConfig.siteType === "multiple") {
				const articleElements = extractAll("nodeElements", this.current.articleDOM, this.scraperConfig.articleBodySelector);
				this.articleElementQueue.push(...articleElements);
			} else {
				this.scrapeArticle(this.current.articleDOM);
			}

			await this.next();
			return;
		}

		if (this.articleURLQueueHasData()) {
			this.current.articleURL = this.articleURLQueue.shift() as string;
			try {
				this.current.articleDOM = await getDOM(this.current.articleURL);
			} catch (e) {
				throw new Error(`getDOM failed in next() ${e}`);
			}
			await this.next();
			return;
		}

		if (this.indexURLQueueHasData()) {
			this.current.indexURL = this.indexURLQueue.shift() as string;
			try {
				this.current.indexDOM = await getDOM(this.current.indexURL);
			} catch (e) {
				throw new Error(`getDOM failed in extractURLfromIndex.  this.current.indexURL=${this.current.indexURL}`);
			}
			const urls = extractAll("links", this.current.indexDOM, this.scraperConfig.links as string);
			this.articleURLQueue.push(...urls);
			await this.next();
			return;
		}

		try {
			this.buildUrlQueue();
			await this.next();
			return;
		} catch (e) {
			//call close program method.
		}
	}

	indexURLQueueHasData() {
		return this.indexURLQueue.length > 0;
	}

	articleURLQueueHasData() {
		return this.articleURLQueue.length > 0;
	}

	articleElementHasData() {
		return this.articleElementQueue.length > 0;
	}

	articleDOMQueueHasData() {
		return this.articleDOMQueue.length > 0;
	}

	async buildUrlQueue() {
		switch (this.scraperConfig.nextPageType) {
			case "last":
				try {
					await this.buildUrlQueueLast();
				} catch (e) {}
				break;
			case "next":
				try {
					await this.buildUrlQueueNext();
				} catch (e) {}
				break;
			case "parameter":
				try {
					await this.buildUrlQueueParameter();
				} catch (e) {}
				break;
			case "url":
				try {
					await this.buildUrlQueueUrl();
				} catch (e) {}
				break;
		}
		return;
	}

	async buildUrlQueueLast() {
		if (this.noMoreURL) throw new Error("done");

		try {
			this.current.indexDOM = await getDOM(this.scraperConfig.entryUrl);
		} catch (e) {}

		const lastURL = extract("link", this.current.indexDOM as Document, this.scraperConfig.last as string);
		const regex = new RegExp(this.scraperConfig.lastPageNumberRegExp as string);
		const lastPageNumArr = lastURL.match(regex);
		if (Array.isArray(lastPageNumArr)) {
			const lastPageNumStr = lastPageNumArr[1];
			const lastPageNumInt = Number(lastPageNumStr);
			for (let i = 2; i <= lastPageNumInt; i++) {
				this.articleURLQueue.push(lastURL.replace(lastPageNumStr, String(i)));
			}
			this.noMoreURL = true;
			return;
		}

		throw new Error(`buildUrlQueueLast failed.  match returned no result.  ${regex} on ${lastURL}`);
	}

	async buildUrlQueueNext() {
		if (!this.current.articleURL) this.current.articleURL = this.scraperConfig.entryUrl;

		if (!this.current.indexDOM) {
			try {
				this.current.indexDOM = await getDOM(this.current.articleURL);
			} catch (e) {}
		}

		const newURL = extract("link", this.current.indexDOM as Document, this.scraperConfig.next as string);

		if (newURL) {
			this.articleURLQueue.push(newURL);
			return;
		}
		this.noMoreURL = true;
		throw new Error("Failed buildUrlQueueNext.  extract returned no url.");
	}

	async buildUrlQueueParameter() {
		assert(this.scraperConfig.parameter);

		if (!this.current.articleURL) this.current.articleURL = this.scraperConfig.entryUrl;
		const urlObj = new URL(this.current.articleURL);

		try {
			const params = new URLSearchParams(urlObj.search);
			const pageNum = Number(params.get(this.scraperConfig.parameter));
			params.set(this.scraperConfig.parameter, String(pageNum + 1));
			const newURL = `${urlObj.origin}?${params.toString()}`;
			this.articleURLQueue.push(newURL);
			return;
		} catch (e) {
			this.noMoreURL = true;
			throw new Error(`${Function.name} failed.  urlObj:${urlObj}`);
		}
	}

	async buildUrlQueueUrl() {
		if (!this.current.articleURL) this.current.articleURL = this.scraperConfig.entryUrl;

		const regex = new RegExp(this.scraperConfig.url as string);
		const matched = this.current.articleURL.match(regex);
		if (matched) {
			const CurPageNumStr = matched[1];
			const NextpageNumStr = String(Number(matched[1]) + 1);
			const newURL = this.current.articleURL.replace(CurPageNumStr, NextpageNumStr);
			this.articleURLQueue.push(newURL);
			return;
		}

		this.noMoreURL = true;
		throw new Error(`${Function.name} failed.  regex:${regex} url: ${this.current.articleURL}`);
	}

	async buildArticleElementQueue() {
		const articleElems = extractAll("nodeElements", this.current.articleDOM as Document, this.scraperConfig.articleBodySelector);
		if (articleElems) {
			this.articleElementQueue.push(...articleElems);
			return;
		}

		this.noMoreURL = true;
		throw new Error(`${Function.name} failed.`);
	}
}

function assert<T>(val: T): asserts val is NonNullable<T> {
	if (val === null) throw new Error(`assert function failed.  ${val} is null.`);
}

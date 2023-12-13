import { JSDOM } from "jsdom";
import fs, { readFileSync, readdirSync } from "fs";
import path from "path";

//types
import { articles, site, exportedArticles } from '@/index';

//local utilities
import * as vldt from './validator';
import { validateSrcWebsite } from './srcWebsiteValidation';

export class Scr88 {
	site: site;
	exportedArticles: exportedArticles[];
	currentUrl: URL;
	currentPageNumber: number;
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

			if (this.site.tagFiltering === 'index' && srcWebsite.indexTagSelector) {
				this.site.indexTagSelector = srcWebsite.indexTagSelector;
			}

			if (this.site.tagFiltering === 'article' && srcWebsite.articleTagSelector) {
				this.site.indexTagSelector = srcWebsite.articleTagSelector;
			}
		}

		//Selectors for "links" type sites.
		if (this.site.siteType === 'links' && srcWebsite.indexLinkSelector && srcWebsite.indexLinkBlockSelector) {
			this.site.indexLinkBlockSelector = srcWebsite.indexLinkBlockSelector;
			this.site.indexLinkSelector = srcWebsite.indexLinkSelector;
		}

		//Set next page URL parameter if next page type was "parameter"
		if (this.site.nextPageType === 'parameter' && srcWebsite.nextPageParameter) {
			this.site.nextPageParameter = srcWebsite.nextPageParameter;
		}

		if (this.site.nextPageType === 'pagenation' && srcWebsite.startingPageNumber) {
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

	}

	getExportedArticles(): exportedArticles[] {
		const srcDir = path.join(this.site.saveDir);
		if (!fs.existsSync(srcDir)) throw new Error(`Directory ${srcDir} does not exist.`);

		try {
			return readdirSync(srcDir, { withFileTypes: true, encoding: "utf-8" })
				.filter(dirent => dirent.isFile() && dirent.name.endsWith(".txt"))
				.map(dirent => {
					const file = readFileSync(path.join(srcDir, dirent.name), { encoding: "utf-8" });
					return JSON.parse(file);
				})
				.filter(obj => obj.name === this.site.name)
				.map(article => {
					return { name: article.name, id: article.id, url: article.url };
				})
		} catch (err) {
			throw new Error(`Failed to read files from ${srcDir}. ${err}`);
		}
	}

	getTags(doc: (Element | Document), selector: string): (string | null)[] {
		const elements = doc.querySelectorAll(selector);
		return elements.length === 0 ? [] : Array.from(elements).map(el => el.textContent);
	}

	checkArticleTag(doc: Element, selector: string) {
		const tags = this.getTags(doc, selector);
		if (this.site.tags) {
			for (const tag of tags) {
				if (tag && this.site.tags.includes(tag)) {
					return true;
				}
			}
		}

		return false;
	}

	async getDom(): Promise<Document> {

		let dom;
		try {
			const jd = await JSDOM.fromURL(this.currentUrl.href);
			dom = jd.window.document;
		} catch (err) {
			throw new Error(`Failed to access url ${this.currentUrl.href}.\n ${err}`);
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

		const dom = await this.getDom();

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
			const link = linkElem.getAttribute('href');
			if (!link) continue;
			const url = /^https/.test(link) ? link : this.site.rootUrl + link;

			/** Exit if the url already exist in exportedArticles. */
			if (this.exportedArticles.find(obj => obj.url === url)) {
				exportedCnt++;
				continue;
			}

			/**Tag filtering */
			if (this.site.tagFiltering === 'index') {

				if (!this.site.indexTagSelector) {
					throw new Error(`Invalid indexTagSelector ${this.site.indexTagSelector}`)
				}

				const tags = this.getTags(block, this.site.indexTagSelector);
				if (!vldt.isCommonValue(tags, this.site.tags)) continue;
			}
			links.push(url);
		}

		/** Exit if all links found on index pages are already being exported */
		if (indexBlocks.length === exportedCnt) {
			throw new Error(`No new article found on ${this.currentUrl.href}`);
		}

		return links;
	}

	async getArticle() {

		const dom = await this.getDom();

		const _title = dom.querySelector(this.site.articleTitleSelector);
		const title = _title ? _title.childNodes[0].nodeValue ? _title.childNodes[0].nodeValue.trim() : "" : "";
		const body = dom.querySelector(this.site.articleBodySelector)?.textContent ?? "";
		const id = this.currentUrl.pathname.split("/").pop() || this.currentUrl.href;

		const article: articles = {
			name: this.site.name,
			id,
			url: this.currentUrl.href,
			title,
			body,
		};

		if (this.site.tagCollect && this.site.articleTagSelector) {
			article.tags = this.getTags(dom, this.site.articleTagSelector);
		}

		return article;
	}

	async gotoNextPage() {

		let nextUrl;
		const dom = await this.getDom();

		if (this.site.nextPageType === 'next' && this.site.nextPageLinkSelector) {

			const linkElem = dom.querySelector(this.site.nextPageLinkSelector);
			if (!linkElem) {
				throw new Error(`Failed to get next link from ${this.currentUrl} using ${this.site.nextPageLinkSelector}`);
			}

			nextUrl = this.extractLink(linkElem);

		}

		if (this.site.nextPageType === 'pagenation' && this.site.nextPageLinkSelector) {

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

		if (this.site.nextPageType === 'parameter' && this.site.nextPageParameter) {
			nextUrl = this.incrementUrlParameter();
		}

		if (!nextUrl) {
			throw new Error(`Failed to acquire next page URL ${this.site}`);
		}

		this.currentUrl = new URL(nextUrl);

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









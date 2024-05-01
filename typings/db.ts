/* 
types for db objects
*/
export type mysqlEnv = {
	host: string;
	port: number;
	user: string;
	password: string;
	database: string;
	namedPlaceholders: boolean;
};
export type Scrapers = {
	id: number;
	name: string;
	rootUrl: string;
	entryUrl: string;
	language: "JP" | "EN";
	siteType: "links" | "single" | "multiple";
	nextPageType: "last" | "parameter" | "url" | "next" | "pagenation";
	last: string | null;
	lastPageNumberRegExp: string | null;
	parameter: string | null;
	next: string | null;
	url: string | null;
	tagFiltering: boolean;
	tagCollect: boolean;
	tags: string | null;
	links: string | null;
	multiple: string | null;
	articleTitleSelector: string;
	articleBodySelector: string;
	articleTagSelector: string | null;
	frequency: "daily" | "weekly" | "monthly";
	lastRun: string | null;
	nextRunScheduled: string | null;
	createdAt: string;
	lastUpdatedAt: string;
};

export type Articles = {
	id: number;
	scraperId: number;
	articleURL: string;
	titleJP: string;
	titleEN: string;
	bodyJP: string;
	bodyEN: string;
	tagsJP: string;
	tagsEN: string;
	publishable: boolean;
	publishedURL: string;
	publishedAt: string;
	scrapedAt: string;
	lastUpdatedAt: string;
};

export type Tags = {
	id: number;
	language: "JP" | "EN";
	tagName: string;
	createdAt: string;
	lastUpdatedAt: string;
};

export type ArticleTags = {
	articleId: number;
	tagsId: number;
};

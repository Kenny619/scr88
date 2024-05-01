type links = {
	siteType: "links";
	links: string;
	multiple: null;
};

type single = {
	siteType: "single";
	links: null;
	multiple: null;
};

type multiple = {
	siteType: "multiple";
	links: null;
	multiple: string;
};
type last = {
	nextPageType: "last";
	last: string;
	lastPageNumberRegExp: string;
	parameter: null;
	next: null;
	url: null;
};

type parameter = {
	nextPageType: "parameter";
	last: null;
	lastPageNumberRegExp: null;
	parameter: string;
	next: null;
	url: null;
};

type next = {
	nextPageType: "next";
	last: null;
	lastPageNumberRegExp: null;
	parameter: null;
	next: string;
	url: null;
};

type url = {
	nextPageType: "url";
	last: null;
	lastPageNumberRegExp: null;
	parameter: null;
	next: null;
	url: string;
};

type tagFilterOn = {
	tagFiltering: true;
	tags: string;
};

type tagFilterOff = {
	tagFiltering: false;
	tags: null;
};

type tagCollectOn = {
	tagCollect: true;
	articleTagSelector: string;
};

type tagCollectOff = {
	tagCollect: false;
	articleTagSelector: null;
};

type base = {
	scraperId: number;
	name: string;
	rootUrl: string;
	entryUrl: string;
	language: "JP" | "EN";
	articleTitleSelector: string;
	articleBodySelector: string;
	frequency: "daily" | "weekly" | "monthly";
};

type siteType = links | single | multiple;
type nextPageType = last | parameter | next | url;
type tagFilter = tagFilterOn | tagFilterOff;
type tagCollect = tagCollectOn | tagCollectOff;

export type ScrapersConfig = base & siteType & nextPageType & tagFilter & tagCollect;
export type Scraped = {
	scraperId: number | null;
	articleURL: string | null;
	language: "JP" | "EN" | null;
	title: string | null;
	body: string | null;
	tags: string[] | null;
};

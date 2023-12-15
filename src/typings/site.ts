export interface site {
	name: string;
	rootUrl: string;
	entryUrl: string;
	language: "JP" | "EN";
	saveDir: string;
	siteType: "links" | "multipleArticle" | "singleArticle";

	nextPageType: "parameter" | "pagenation" | "next";
	nextPageParameter?: string;
	nextPageLinkSelector?: string;
	startingPageNumber?: number;

	tagFiltering: "index" | "article" | boolean;
	tags?: string[];
	tagCollect: boolean;
	indexTagSelector?: string;
	articleTagSelector?: string;

	indexLinkBlockSelector?: string;
	indexLinkSelector?: string;

	articleBlockSelector?: string;
	articleTitleSelector: string;
	articleBodySelector: string;
}
// export interface basesite {
// 	name: string,
// 	rootUrl: string,
// 	entryUrl: string,
// 	language: "JP" | "EN",
// 	saveDir: string,
// 	siteType: "links" | "multipleArticle" | "singleArticle",
// 	nextPageType: "parameter" | "pagenation" | "next",

// 	tagFiltering: boolean,
// 	tagCollect: boolean,

// 	articleTitleSelector: string,
// 	articleBodySelector: string,

// };

// export interface filterTag extends basesite {
// 	tags: string[],
// }

// export interface collectTag extends basesite {
// 	articleTagSelector: string,
// }

// export interface links extends basesite {
// 	indexlinkBlockSelector: string
// 	indexlinkSelector: string,
// 	indexTagSelector: string,
// }

// export interface parameter extends basesite {
// 	nextPageParameter: string,
// }

// export interface linkSelector extends basesite {
// 	nextPageLinkSelector: string,
// }

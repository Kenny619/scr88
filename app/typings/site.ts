export interface site {
	/** required ------------------------------------- */

	//name of the project
	name: string;

	//FQDN of the source site
	rootUrl: string;

	//Initial URL to start scraping
	entryUrl: string;

	//Language of the source site.  Output file
	language: "JP" | "EN";

	//Source site type.
	siteType: "links" | "multipleArticle" | "singleArticle";

	//How to transition to the next page
	//parameter = creates next page URL by manipulating the page number parameter in the URL
	//url = creates next page URL by manipulating the page number in the URL
	//pagenation = finds the next page link from the pagenation link
	//next = finds the next page link from the next link
	//last = extract the last page number URL from pagenation and creates the list of all page URLs of the site
	nextPageType: "parameter" | "pagenation" | "next" | "url" | "last";

	//If nextPageType = "last" | CSS selector for getting the last page url
	lastUrlSelector?: string;

	//If nextPageType = "last" | RegExp for getting the last page number
	lastPageNumberRegExp?: string;

	//If true, scrape articles that has matching tags to tags parameter
	tagFiltering: boolean;

	//Collect tags from the article
	tagCollect: boolean;

	//CSS selector for the title of the article
	articleTitleSelector: string;

	//CSS selector for the body of the article
	articleBodySelector: string;

	/** optional: Next Page parameters ------------- */

	//if nextPageType === "parameter"
	nextPageParameter?: string;

	//if nextPageType === "next|pagenation" | CSS selector for next page link
	nextPageLinkSelector?: string;

	//if nextPageType === "url" | RegExp for picking the page number from URL
	nextPageUrlRegExp?: string;

	/** optional: Tags ----------------------------- */

	//if tagFiltering is true.  Tags used to filter the articles
	tags: string[];

	//if tagFiltering is true OR tagCollection is true | CSS selector for the tags
	articleTagSelector?: string;

	/** optional: siteType parameters ----------------------------- */

	//CSS selector for capturing link to the article page
	indexLinkSelector?: string;

	//CSS selector for capturing article block on multi-article page
	articleBlockSelector?: string;
}

export type siteKeys = keyof site;

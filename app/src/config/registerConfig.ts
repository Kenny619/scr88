export const registerConfig =
	[
		{
			siteKey: "name",
			label: "Scraper config name",
			inputMethod: "text",
			value: null,
			badgeStatus: "Pending Input",
			errorMsg: null,
			preValidation: null,
			apiEndPoint: "/name"
		},
		{
			siteKey: "rootUrl",
			label: "Target site FQDN",
			inputMethod: "text",
			value: null,
			badgeStatus: "Pending Input",
			errorMsg: null,
			preValidation: null,
			apiEndPoint: "/url"
		},
		{
			siteKey: "entryUrl",
			label: "Target site entry point URL",
			inputMethod: "text",
			value: null,
			badgeStatus: "Pending Input",
			errorMsg: null,
			preValidation: null,
			apiEndPoint: "/url"
		},
		{
			siteKey: "language",
			label: "Target site language JP or EN",
			inputMethod: "select",
			value: ["JP", "EN"],
			badgeStatus: null,
			errorMsg: null,
			preValidation: null,
			apiEndPoint: null
		},
		{
			siteKey: "siteType",
			label: "Target site page structure",
			inputMethod: "select",
			value: ["links", "single", "multiple"],
			badgeStatus: null,
			errorMsg: null,
			preValidation: null,
			apiEndPoint: null
		},
		{
			siteKey: "nextPageType",
			label: "Next page URL source",
			inputMethod: "select",
			value: ["last", "parameter", "url", "next", "pagenation"],
			badgeStatus: null,
			errorMsg: null,
			preValidation: null,
			apiEndPoint: null
		},
		{
			siteKey: "lastUrlSelector",
			label: "CSS link selector of last URL",
			inputMethod: "text",
			value: null,
			badgeStatus: "Pending Input",
			errorMsg: null,
			preValidation: null,
			apiEndPoint: "/lasturl"
		},
		{
			siteKey: "lastPageNumberRegExp",
			label: "Last URL pageNumber RegExp",
			inputMethod: "text",
			value: null,
			badgeStatus: "Pending Input",
			errorMsg: null,
			preValidation: null,
			apiEndPoint: "/lasturlregex"
		},
		{
			siteKey: "nextPageParameter",
			label: "URL parameter name for page number",
			inputMethod: "text",
			value: null,
			badgeStatus: "Pending Input",
			errorMsg: null,
			preValidation: null,
			apiEndPoint: "/parameter"
		},
		{
			siteKey: "nextPageLinkSelector",
			label: "CSS selector for acquiring the next page URL",
			inputMethod: "text",
			value: null,
			badgeStatus: "Pending Input",
			errorMsg: null,
			preValidation: null,
			apiEndPoint: "/link"
		},
		{
			siteKey: "nextPageUrlRegExp",
			label: "Regex for acquiring the page number within the URL",
			inputMethod: "text",
			value: null,
			badgeStatus: "Pending Input",
			errorMsg: null,
			preValidation: null,
			apiEndPoint: "/nexturlregex"
		},
		{
			siteKey: "startingPageNumber",
			label: "Set starting page number.",
			inputMethod: "text",
			value: null,
			badgeStatus: "Pending Input",
			errorMsg: null,
			preValidation: "entryUrl, number",
			apiEndPoint: null
		},
		{
			siteKey: "tagFiltering",
			label: "Enable to scrape articles that match the tags",
			inputMethod: "toggle",
			value: false,
			badgeStatus: null,
			errorMsg: null,
			preValidation: null,
			apiEndPoint: null
		},
		{
			siteKey: "tagCollect",
			label: "Enable to scrape article tags",
			inputMethod: "toggle",
			value: false,
			badgeStatus: null,
			errorMsg: null,
			preValidation: null,
			apiEndPoint: null
		},
		{
			siteKey: "tags",
			label: "Provide tags for tag filtering.",
			inputMethod: "text",
			value: null,
			badgeStatus: "Pending Input",
			errorMsg: null,
			preValidation: null,
			apiEndPoint: null
		},
		{
			siteKey: "indexLinkSelector",
			label: "CSS link selector for links on the index page.",
			inputMethod: "text",
			value: null,
			badgeStatus: "Pending Input",
			errorMsg: null,
			preValidation: null,
			apiEndPoint: "/indexlinks"
		},
		{
			siteKey: "articleBlockSelector",
			label: "CSS selector for article blocks",
			inputMethod: "text",
			value: null,
			badgeStatus: "Pending Input",
			errorMsg: null,
			preValidation: null,
			apiEndPoint: "/nodes"
		},
		{
			siteKey: "articleTitleSelector",
			label: "CSS selector for article title",
			inputMethod: "text",
			value: null,
			badgeStatus: "Pending Input",
			errorMsg: null,
			preValidation: null,
			apiEndPoint: "/text"
		},
		{
			siteKey: "articleBodySelector",
			label: "CSS selector for article body",
			inputMethod: "text",
			value: null,
			badgeStatus: "Pending Input",
			errorMsg: null,
			preValidation: null,
			apiEndPoint: "/text"
		},
		{
			siteKey: "articleTagSelector",
			label: "CSS selector for article tags",
			inputMethod: "text",
			value: null,
			badgeStatus: "Pending Input",
			errorMsg: null,
			preValidation: null,
			apiEndPoint: "/text"
		}
	]


export const registerObj =
{

	name: {
		label: "Scraper config name",
		input: {
			method: "text",
			defaultValue: null,
			choices: null
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: "/name",
		extracted: null,
	},

	rootUrl: {
		label: "Target site FQDN",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: "/url",
		extracted: null,
	},

	entryUrl: {
		label: "Target site entry point URL",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: "/url",
		extracted: null,
	},

	language: {
		label: "Target site language JP or EN",
		input: { method: "select", defaultValue: null, choices: ["JP", "EN"] },
		value: null,
		badgeStatus: null,
		errorMsg: null,
		preValidation: null,
		apiEndPoint: null,
		extracted: null,
	},

	siteType: {
		label: "Target site page structure",
		input: {
			method: "select",
			defaultValue: null,
			choices: ["links", "single", "multiple"],
		},
		value: null,
		badgeStatus: null,
		errorMsg: null,
		preValidation: null,
		apiEndPoint: null
		, extracted: null
	},
	nextPageType: {
		label: "Next page URL source",
		input: {
			method: "select",
			defaultValue: null,
			choices: ["last", "parameter", "url", "next", "pagenation"],
		},
		value: null,
		badgeStatus: null,
		errorMsg: null,
		preValidation: null,
		apiEndPoint: null
		, extracted: null
	},

	lastUrlSelector: {
		label: "CSS link selector of last URL",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: "/lasturl"
		, extracted: null
	},

	lastPageNumberRegExp: {
		label: "Last URL pageNumber RegExp",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: "/lasturlregex"
		, extracted: null
	},

	nextPageParameter: {
		label: "URL parameter name for page number",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: "/parameter"
		, extracted: null
	},

	nextPageLinkSelector: {
		label: "CSS selector for acquiring the next page URL",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: "/link"
		, extracted: null
	},

	nextPageUrlRegExp: {
		label: "Regex for acquiring the page number within the URL",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: "/nexturlregex"
		, extracted: null
	},
	startingPageNumber: {
		label: "Set starting page number.",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: "entryUrl, number",
		apiEndPoint: null
		, extracted: null
	},
	tagFiltering: {
		label: "Enable to scrape articles that match the tags",
		input: {
			method: "toggle",
			defaultValue: false,
			choices: [true, false],
		},
		value: false,
		badgeStatus: null,
		errorMsg: null,
		preValidation: null,
		apiEndPoint: null
		, extracted: null
	},
	tagCollect: {
		label: "Enable to scrape article tags",
		input: {
			method: "toggle",
			defaultValue: false,
			choices: [true, false],
		},
		value: false,
		badgeStatus: null,
		errorMsg: null,
		preValidation: null,
		apiEndPoint: null
		, extracted: null
	},
	tags: {
		label: "Provide tags for tag filtering.",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: null
		, extracted: null
	},
	indexLinkSelector: {
		label: "CSS link selector for links on the index page.",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: "/indexlinks"
		, extracted: null
	},
	articleBlockSelector: {
		label: "CSS selector for article blocks",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: "/nodes"
		, extracted: null
	},
	articleTitleSelector: {
		label: "CSS selector for article title",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: "/text"
		, extracted: null
	},
	articleBodySelector: {
		label: "CSS selector for article body",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: "/text"
		, extracted: null
	},
	articleTagSelector: {
		label: "CSS selector for article tags",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: "/text"
		, extracted: null
	}
}

const inputs = [
	{ siteKey: "name", label: "Site name", inputMethod: "text", value: "", badgeStatus: "Pending Input", errorMsg: "" },

	{
		siteKey: "rootUrl",
		label: "Target site FQDN",
		inputMethod: "text",
		value: "",
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "entryUrl",
		label: "Entry point URL",
		inputMethod: "text",
		value: "",
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "saveDir",
		label: "output Dir",
		inputMethod: "text",
		value: "",
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "language",
		label: "languages",
		inputMethod: ["JP", "EN"],
		value: "",
	},
	{
		siteKey: "siteType",
		label: "site type",
		inputMethod: ["link", "singleArticle", "multipleArticle"],
		value: "",
	},
	{
		siteKey: "nextPageType",
		label: "next page type",
		inputMethod: ["last", "next", "parameter", "url"],
		value: "",
	},
	{
		siteKey: "lastUrlSelector",
		label: "CSS link selector of last URL",
		inputMethod: "text",
		value: "",
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "lastPageNumberRegExp",
		label: "last URL pageNumber RegExp",
		inputMethod: "text",
		value: "",
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "nextPageParameter",
		label: "pageNumber URL parameter",
		inputMethod: "text",
		value: "",
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "nextPageLinkSelector",
		label: "CSS link selector of next URL",
		inputMethod: "text",
		value: "",
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "nextPageUrlRegExp",
		label: "in-URL pageNumber RegExp",
		inputMethod: "text",
		value: "",
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "startingPageNumber",
		label: "Starting page number (if not 1)",
		inputMethod: "text",
		value: "",
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "tagFiltering",
		label: "Check to enable tag filtering",
		inputMethod: "checkbox",
		value: false,
	},
	{
		siteKey: "tagCollect",
		label: "Check to Acquire tagss",
		inputMethod: "checkbox",
		value: false,
	},
	{
		siteKey: "tags",
		label: "Input comma separated tags for filtering use",
		inputMethod: "text",
		value: "",
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "indexLinkSelector",
		label: "CSS link selector on index page",
		inputMethod: "text",
		value: "",
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "articleBlockSelector",
		label: "Article block selector",
		inputMethod: "text",
		value: "",
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "articleTitleSelector",
		label: "article title selector",
		inputMethod: "text",
		value: "",
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "articleBodySelector",
		label: "article body selector",
		inputMethod: "text",
		value: "",
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "articleTagSelector",
		label: "article tags selector",
		inputMethod: "text",
		value: "",
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
];
const inputsRef = inputs.reduce((acc, curr) => {
	const a = acc;
	return { ...a, [curr.siteKey]: curr.value };
}, {});

function updater(inputs, siteKey, values) {
	return inputs.map((input) => {
		if (input.siteKey === siteKey) {
			let newObj = { ...input };
			for (const o of values) {
				newObj = { ...newObj, ...o };
			}
			return newObj;
		}
		return input;
	});
}
const newInputs = updater(inputs, "articleTagSelector", [
	{ value: "new name!" },
	{ badgeStatus: "pass" },
	{ errorMsg: "none" },
]);
console.log(newInputs);

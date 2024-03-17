const registerObj = {
	name: {
		label: "Scraper config name",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
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
		input: { method: "select", defaultValue: null, choices: null },
		value: ["JP", "EN"],
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
		badgeStatus: null,
		errorMsg: null,
		preValidation: null,
		apiEndPoint: null,
		extracted: null,
	},
	nextPageType: {
		label: "Next page URL source",
		input: {
			method: "select",
			defaultValue: null,
			choices: ["last", "parameter", "url", "next", "pagenation"],
		},
		badgeStatus: null,
		errorMsg: null,
		preValidation: null,
		apiEndPoint: null,
		extracted: null,
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
		apiEndPoint: "/lasturl",
		extracted: null,
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
		apiEndPoint: "/lasturlregex",
		extracted: null,
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
		apiEndPoint: "/parameter",
		extracted: null,
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
		apiEndPoint: "/link",
		extracted: null,
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
		apiEndPoint: "/nexturlregex",
		extracted: null,
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
		apiEndPoint: null,
		extracted: null,
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
		apiEndPoint: null,
		extracted: null,
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
		apiEndPoint: null,
		extracted: null,
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
		apiEndPoint: null,
		extracted: null,
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
		apiEndPoint: "/indexlinks",
		extracted: null,
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
		apiEndPoint: "/nodes",
		extracted: null,
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
		apiEndPoint: "/text",
		extracted: null,
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
		apiEndPoint: "/text",
		extracted: null,
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
		apiEndPoint: "/text",
		extracted: null,
	},
};

const values = [{ value: "NEW" }, { badgeStatus: "Pass" }, { errorMsg: "ERROR!" }];
const siteKey = "rootUrl";

const newRegisterObj = Object.keys(registerObj).map((key) => {
	let newObj = { ...registerObj[key] };
	if (key === siteKey) {
		for (const inputValues of values) {
			newObj = { ...newObj, ...inputValues };
		}
	}
	return newObj;
});

console.log(newRegisterObj);

/*
import { JSDOM, ResourceLoader } from "jsdom";
import userAgent from "../dist/app/utils/userAgents.js";

const re = "12\\";
try {
	const regex = new RegExp(re);
	//console.log(regex);
} catch (e) {
	console.log(e);
}

console.log("this is the end of code.");

const loader = new ResourceLoader({
	userAgent: userAgent(),
});
async function serialize() {
	try {
		const url = "https://enigma2.ahoseek.com/";

		const jd = await JSDOM.fromURL(url, { resources: loader });
		const sdom = jd.serialize();
		const rdom = new JSDOM(sdom);
		const extracted = rdom.window.document.querySelectorAll("a.entry-read-link");
		if (extracted) {
			const links = Array.from(extracted).map((el) => el.outerHTML);

			const rlinks = links.map((st) => {
				const eldom = new JSDOM(st);
				return eldom.window.document.querySelector("a.entry-read-link").getAttribute("href");
			});
			console.log(rlinks);
		}
	} catch (e) {
		throw new Error(e);
	}
}
*/

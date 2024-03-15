import type { site } from "../../typings/index";
import v from "validator";
type Obj = { siteKey: Partial<keyof site>; [key: string]: string | string[] | boolean | undefined };
type Inputs = Obj[];
type inputsRef = { [Property in keyof Partial<site>]: string };
type inputValues = {
	value?: string | boolean;
	errorMsg?: string;
	badgeStatus?: string;
}[];
type inputKeys = Exclude<
	Partial<keyof site>,
	| "language"
	| "nextPageType"
	| "siteType"
	| "tagCollect"
	| "tagFiltering"
	| "tags"
	| "indexTagSelector"
	| "indexLinkBlockSelector"
>;
type valRef = {
	[key in inputKeys]: {
		pre: Array<() => string>;
		ep?: string;
	};
};

export default function validateInput(
	inputs: Inputs,
	key: inputKeys,
	value: string,
	updater: (siteKey: keyof site, values: inputValues) => void,
) {
	//Escape - if value is not provided, exit the function
	if (!value) {
		updater(key, [{ badgeStatus: "Pending Input" }, { errorMsg: "" }]);
		return;
	}
	//Create new object inputsRef from taking siteKey as a key and value as its value from inputs
	const inputsRef: inputsRef = inputs.reduce((acc, curr) => {
		const a = acc;
		return { ...a, [curr.siteKey]: curr.value };
	}, {});

	/*
name
rootUrl - format: url　-> /url
entryUrl - format: url -> /url
saveDir - language -> /dir
lastUrlSelector - format: url, siteType, entryUrl -> /link
lastPageNumberRegExp -siteType, entryUrl, lastUrl ::escape -> /lasturlregex
nextPageParameter - siteType, entryUrl -> /nextpageparameter
nextPageLinkSelector - siteType, entryUrl -> /nextpagelink
nextPageUrlRegExp - siteType, entryUrl ::escape  -> /nexturlregex
startingPageNumber -> format:number
tags
indexLinkSelector - entryUrl -> /link
articleBlockSelector - entryUrl -> /nodes
articleTitleSelector - entryUrl -> /text
articleBodySelector - entryUrl -> /text
articleTagSelector - entryUrl, tags -> /texts

*/
	validation(key, value);

	function validation(key: inputKeys, value: string) {
		const conds = {
			url: () => {
				return v.isURL(value) ? "" : "Input needs to be in a valid URL format.";
			},
			number: () => {
				return typeof Number(value) === "number" ? "" : "Input needs to be a number.";
			},
			language: () => {
				return inputsRef.language ? "" : "language needs to be selected.";
			},
			siteType: () => {
				return inputsRef.siteType ? "" : "siteType needs to be selected.";
			},
			entryUrl: () => {
				return inputsRef.entryUrl ? "" : "Requires entryUrl input.";
			},
			tags: () => {
				return inputsRef.tags ? "" : "Requires tags input.";
			},
			lastUrl: () => {
				return inputsRef.lastUrlSelector ? "" : "Requires lastUrlSelector input.";
			},
		};

		const valRef: valRef = {
			name: { pre: [], ep: "/name" },
			rootUrl: { pre: [conds.url], ep: "/url" },
			entryUrl: { pre: [conds.url], ep: "/url" },
			saveDir: { pre: [], ep: "/dir" },
			lastUrlSelector: { pre: [conds.entryUrl], ep: "/lasturl" },
			lastPageNumberRegExp: { pre: [conds.entryUrl, conds.lastUrl], ep: "/lasturlregex" },
			nextPageParameter: { pre: [conds.entryUrl], ep: "/parameter" },
			nextPageLinkSelector: { pre: [conds.entryUrl], ep: "/link" },
			nextPageUrlRegExp: { pre: [conds.entryUrl], ep: "/nexturlregex" },
			startingPageNumber: { pre: [conds.number] },
			indexLinkSelector: { pre: [conds.entryUrl], ep: "/indexlinks" },
			articleBlockSelector: { pre: [conds.entryUrl], ep: "/nodes" },
			articleTitleSelector: { pre: [conds.entryUrl], ep: "/text" },
			articleBodySelector: { pre: [conds.entryUrl], ep: "/text" },
			articleTagSelector: { pre: [conds.entryUrl], ep: "/texts" },
		};

		if (!Object.hasOwn(valRef, key)) {
			//no validation.  update the Badge with 'pass'
			updater(key, [{ value: value, badgeStatus: "Pass" }]);
			return;
		}

		const preErr = valRef[key].pre
			.map((fn) => fn())
			.filter((v) => v.length > 0)
			.join("<br/>\r\n");

		console.log("preErr=", preErr);

		if (preErr) {
			updater(key, [{ errorMsg: preErr }, { badgeStatus: "Fail" }]);
			return;
		}

		//escape backslash in regex
		const postVal =
			key === "lastPageNumberRegExp" || key === "nextPageUrlRegExp" ? value.replace(/\\/g, "\\\\") : value;

		if (Object.hasOwn(valRef[key], "ep") && typeof valRef[key].ep === "string") {
			const endpoint = valRef[key].ep as string;
			console.log(endpoint, postVal, key);
			apiRequest(endpoint, key, postVal);
		}
	}

	function apiRequest(endpoint: string, key: inputKeys, value: string) {
		const postData = {
			key: key,
			input: value,
		};

		console.log(`${process.env.REACT_APP_REGISTER_API_ADDR}${endpoint}`);
		fetch(`${process.env.REACT_APP_REGISTER_API_ADDR}${endpoint}`, {
			method: "POST",
			mode: "cors",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(postData),
		})
			.then(async (response) => {
				const res = await response.json();
				res.pass
					? updater(key, [{ value: value }, { badgeStatus: "Pass" }])
					: updater(key, [{ errorMsg: res.errMsg }, { badgeStatus: "Fail" }]);
			})
			.catch((e) => {
				console.log(e);
				updater(key, [{ errorMsg: e, badgeStatus: "Fail" }]);
			});
	}
}
/**
 * replace escape \ to \\ before making an API request.
 */

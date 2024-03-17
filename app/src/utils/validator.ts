import type { site, registerObj, inputValues, textInputKeys } from "../../typings/index";
import v from "validator";
type valKeys = Exclude<textInputKeys, "tags">;
type valRef = {
	[key in valKeys]: {
		pre: Array<() => string>;
		ep?: string;
	};
};

export default function validateInput(
	inputs: registerObj,
	key: textInputKeys,
	value: string,
	updater: (siteKey: keyof site, values: inputValues) => void,
) {
	//Escape - if value is not provided, exit the function
	if (!value) {
		updater(key, [{ badgeStatus: "Pending Input" }, { errorMsg: "" }]);
		return;
	}
	//Create new object inputsRef from taking siteKey as a key and value as its value from inputs
	/*
	const inputsRef: inputsRef = inputs.reduce((acc, curr) => {
		const a = acc;
		return { ...a, [curr.siteKey]: curr.value };
	}, {});
*/
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

	function validation(key: textInputKeys, value: string) {
		const conds = {
			url: () => {
				return v.isURL(value) ? "" : "Input needs to be in a valid URL format.";
			},
			number: () => {
				return typeof Number(value) === "number" ? "" : "Input needs to be a number.";
			},
			language: () => {
				return inputs.language.value ? "" : "language needs to be selected.";
			},
			siteType: () => {
				return inputs.siteType.value ? "" : "siteType needs to be selected.";
			},
			entryUrl: () => {
				return inputs.entryUrl.value ? "" : "Requires entryUrl input.";
			},
			tags: () => {
				return inputs.tags.value ? "" : "Requires tags input.";
			},
			lastUrl: () => {
				return inputs.lastUrlSelector.value ? "" : "Requires lastUrlSelector input.";
			},
		};

		const valRef: valRef = {
			name: { pre: [], ep: "/name" },
			rootUrl: { pre: [conds.url], ep: "/url" },
			entryUrl: { pre: [conds.url], ep: "/url" },
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
			articleTagSelector: { pre: [conds.entryUrl, conds.tags], ep: "/texts" },
		};

		if (!Object.hasOwn(valRef, key)) {
			//no validation.  update the Badge with 'pass' For tags, name -> until dblookup process is set.
			updater(key, [{ value: value, badgeStatus: "Pass" }]);
			return;
		}

		const preErr = valRef[key as valKeys].pre
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

		if (Object.hasOwn(valRef[key as valKeys], "ep") && typeof valRef[key as valKeys].ep === "string") {
			const endpoint = valRef[key as valKeys].ep as string;
			console.log(endpoint, postVal, key);
			apiRequest(endpoint, key, postVal);
		}
	}

	function apiRequest(endpoint: string, key: textInputKeys, value: string) {
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

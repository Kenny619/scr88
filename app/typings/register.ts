import type { siteKeys } from "./site";
type registerKeys = "label" | "value" | "badgeStatus" | "errorMsg" | "preValidation" | "apiEndPoint" | "extracted";
type registetInput = {
	input: {
		method: string;
		defaultValue: null | boolean;
		choices: null | string[] | boolean[];
	};
};
export type registerValue = {
	[key in registerKeys]: string | string[] | boolean | null;
} & registetInput;

export type registerObj = {
	[key in siteKeys]: registerValue;
};
/*
export type inputValues = {
	[key: string]: string | boolean;
}[];
*/

export type inputValues = {
	value?: string | boolean | null;
	errorMsg?: string;
	badgeStatus?: string;
}[];

export type textInputKeys = Extract<
	siteKeys,
	| "name"
	| "rootUrl"
	| "entryUrl"
	| "lastUrlSelector"
	| "lastPageNumberRegExp"
	| "nextPageParameter"
	| "nextPageLinkSelector"
	| "nextPageUrlRegExp"
	| "startingPageNumber"
	| "tags"
	| "indexLinkSelector"
	| "articleBlockSelector"
	| "articleTitleSelector"
	| "articleBodySelector"
	| "articleTagSelector"
>;

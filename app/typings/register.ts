export type toggleKey = "tagCollect" | "tagFiltering";
export type selectKey = "language" | "siteType" | "nextPageType";
export type textKey =
	| "name"
	| "rootUrl"
	| "entryUrl"
	| "last"
	| "next"
	| "parameter"
	| "url"
	| "links"
	| "multiple"
	| "tags"
	| "lastPageNumberRegExp"
	| "articleTagSelector"
	| "articleTitleSelector"
	| "articleBodySelector";
export type siteKeys = toggleKey | selectKey | textKey;

export type ValueTypes = "value" | "badgeStatus" | "errorMsg";

export type textObj = {
	label: string;
	input: {
		method: "text";
		defaultValue: null | string;
	};
	value: string | null;
	badgeStatus: string | null;
	errorMsg: string | null;
	preValidation: string[] | null;
	apiEndPoint: string | null;
	extracted: string | null;
	child?: {
		[key: string]: SubObject;
	};
};

export type text = {
	input: {
		method: "text";
	};
};
export type textInput = {
	defaultValue: null | string;
};
export type textProps = {
	label: string;
	value: string | null;
	badgeStatus: string | null;
	errorMsg: string | null;
	preValidation: string[] | null;
	apiEndPoint: string | null;
	extracted: string | null;
	child?: {
		[key: string]: SubObject;
	};
};
export type toggle = {
	input: {
		method: "toggle";
	};
};

export type toggleInput = {
	defaultValue: null | boolean;
	choices?: boolean[];
};

export type toggleProps = {
	label: string;
	value: boolean | null;
	child?: {
		[key: string]: SubObject;
	};
};

export type selectInput = {
	defaultValue: null | string;
	choices?: string[];
};

export type selectProps = {
	label: string;
	value: string | null;
	child?: {
		[key: string]: SubObject;
	};
};
export type inputTypes = "text" | "toggle" | "select";
export type Input<T extends inputTypes> = T extends "text" ? textInput : T extends "toggle" ? toggleInput : T extends "select" ? selectInput : never;
export type Property<T extends inputTypes> = T extends "text" ? textProps : T extends "toggle" ? toggleProps : T extends "select" ? selectProps : never;

export type select = {
	label: string;
	input: {
		method: "select";
		defaultValue: null | string;
		choices?: string[];
	};
	value: string | null;
	child?: {
		[key: string]: SubObject;
	};
};

export interface SubObject {
	label: string;
	input: {
		method: string;
		defaultValue: null | string | boolean;
		choices?: string[] | boolean[];
	};
	value: string | boolean | null;
	badgeStatus?: string | null;
	errorMsg?: string | null;
	preValidation?: string[] | null;
	apiEndPoint?: string | null;
	extracted?: string | null;
	child?: {
		[key: string]: SubObject;
	};
}

export interface RegisterObj {
	[key: string]: SubObject;
}

export type updateValues = {
	value?: string | boolean;
	badgeStatus?: string;
	errorMsg?: string;
}[];

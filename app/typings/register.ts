
export type toggleKey = "tagCollect" | "tagFiltering";
export type selectKey = "language" | "siteType" | "nextPageType";
export type textKey = "name" | "rootUrl" | "entryUrl" | "last" | "next" | "parameter" | "url" | "links" | "multiple" | "tags" | "lastPageNumberRegExp" | "articleTagSelector" | "articleTitleSelector" | "articleBodySelector";
export type siteKeys = toggleKey | selectKey | textKey;

export type ValueTypes = "value" | "badgeStatus" | "errorMsg";
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
};

export type updateValues = {
	value?: string | boolean;
	badgeStatus?: string;
	errorMsg?: string;
}[];

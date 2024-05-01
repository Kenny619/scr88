import type { rObj } from "../src/config/registerConfig";

export type registerObj = typeof rObj;
export type topLevelKeys = keyof registerObj;
export type registerProps = {
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
	extracted?: string | null | string[];
	child?: {
		[key: string]: registerProps;
	};
};
export type registerObjFlex = { [key: string]: registerProps };
export type registerSubObj = { string: registerProps };

export type badgeValues = "Checking..." | "Pending Input" | "Pass" | "Fail";
export type inputValues = "text" | "select" | "toggle";

// type textKV = { value: string | null };
// type toggleKV = { value: boolean | null };
// type selectKV = { value: string | null };
type valueKV = { value: string | boolean | null };
//type valueKV<I extends inputValues> = I extends "text" ? textKV : I extends "toggle" ? toggleKV : I extends "select" ? selectKV : never;
type badgeStatusKV = { badgeStatus: badgeValues };
type errorMsgKV = { errorMsg: string | null };
type extractKV = { extracted: string | null };
export type registerUpdateArg = Array<valueKV | badgeStatusKV | errorMsgKV | extractKV>;

/*
const getRegisterKeys = (obj: rObjFlex, mode: "parent" | "child", cond: "text" | "select" | "toggle", output: string[] = []): string[] => {
	if (mode === "parent") {
		return Object.entries(obj)
			.filter(([k, v]) => v.input.method === cond)
			.map(([k, v]) => k);
	}

	if (mode === "child") {
		for (const key in obj) {
			if (Object.hasOwn(obj[key], "child")) {
				const childNode = obj[key].child as rObjFlex;
				const childKeys = Object.keys(childNode);
				obj[key].input.method === cond && output.push(...childKeys);
				getRegisterKeys(childNode, mode, cond, output);
			}
		}
		return output;
	}
	return output;
};
const toggleKeys: string[] = getRegisterKeys(registerObj, "parent", "toggle");
const selectKeys = getRegisterKeys(registerObj, "parent", "select");
const textKeys = getRegisterKeys(registerObj, "parent", "text");
const toggleChildKeys = getRegisterKeys(registerObj, "child", "toggle");
const selectChildKeys = getRegisterKeys(registerObj, "child", "select");
const textChildKeys = getRegisterKeys(registerObj, "child", "text");
*/

// export type toggleKey = "tagFiltering" | "tagCollect";
// type selectKey = "language" | "siteType" | "nextPageType" | "frequency";
// export type textKey = "name" | "rootUrl" | "entryUrl" | "articleTitleSelector" | "articleBodySelector";
// export type textChildKey = "lastPageNumberRegExp";
// export type selectChildKey = "last" | "next" | "parameter" | "url" | "links" | "multiple";
// export type toggleChildKey = "tags" | "articleTagSelector";
// export type siteKeys = toggleKey | selectKey | textKey | textChildKey | selectChildKey | toggleChildKey;
// export type childKeys = textChildKey | selectChildKey | toggleChildKey;

/*
export type textProps = {
	label: string;
	value: string | null;
	input: { method: "text"; defaultValue: string | null };
	badgeStatus: string | null;
	errorMsg: string | null;
	preValidation: string[] | null;
	apiEndPoint: string | null;
	extracted: string | null;
	child?: Record<textChildKey, textProps>;
};

export type toggleProps = {
	label: string;
	value: boolean | null;
	input: { method: "toggle"; defaultValue: null | boolean; choices: boolean[] };
	child?: Partial<Record<toggleChildKey, textProps>>;
};

export type selectProps = {
	label: string;
	value: string | null;
	input: { method: "select"; defaultValue: null | string; choices: string[] };
	child?: Partial<Record<selectChildKey, textProps>>;
};
export type textObj = {
	[key in textKey]: textProps;
};
export type selectObj = {
	[key in selectKey]: selectProps;
};
export type toggleObj = {
	[key in toggleKey]: toggleProps;
};

export type props<K> = K extends textKey ? textProps : K extends selectKey ? selectProps : K extends toggleKey ? toggleProps : never;
export type parentObj = Partial<textObj> | Partial<selectObj> | Partial<toggleObj>; //Partial<Record<textKey, textProps>> | Partial<Record<selectKey, selectProps>> | Partial<Record<toggleKey, toggleProps>>;
export type childObj = {
	[K in childKeys]?: textProps;
};

*/

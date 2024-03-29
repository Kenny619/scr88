import type { RegisterObj, updateValues, SubObject } from "../../typings/index";
import { assertDef } from "../utils/tshelper";
export function registerFlat(obj: RegisterObj, output: RegisterObj = {}) {
	for (const [k, v] of Object.entries(obj)) {
		output[k] = v;

		if (!Object.hasOwn(v, "child")) {
			continue;
		}

		if (v.input.method === "select" && (v.value === "single" || v.value === "pagenation" || v.value === "daily" || v.value === "weekly" || v.value === "monthly")) {
			continue;
		}

		if (v.input.method === "select" && v.value !== null) {
			const child = extractChild(v, "select");
			child && registerFlat(child, output);
		}

		if ((v.input.method === "toggle" && v.value === true) || (v.input.method === "text" && v.value !== null)) {
			const child = extractChild(v);
			child && registerFlat(child, output);
		}
	}
	return output;
}

export function registerUpdate(obj: RegisterObj, siteKey: string, keyValArr: updateValues): RegisterObj {
	for (const key in obj) {
		if (key === siteKey) {
			for (const kv of keyValArr) {
				obj[key] = { ...obj[key], ...kv };
			}
		}

		const child = extractChild(obj[key], "select");
		child && registerUpdate(child, siteKey, keyValArr);
	}

	return { ...obj };
}

export function isRegisterable(registerObj: RegisterObj): boolean {
	for (const val of Object.values(registerObj)) {
		//exit conditions
		if ((val.input.method === "text" && val.badgeStatus !== "Pass") || (val.input.method === "select" && val.value === null)) {
			return false;
		}

		if (!Object.hasOwn(val, "child")) {
			continue;
		}

		const child = extractChild(val);
		child && isRegisterable(child);
	}

	return true;
}

type propNames = Exclude<keyof SubObject, "input" | "child">;
type registerFind = (obj: SubObject, propName: propNames) => string | boolean | null | string[];
export function registerFn(obj: RegisterObj, siteKey: string, arg: propNames, fn: registerFind): string | boolean | null | string[] {
	for (const [k, v] of Object.entries(obj)) {
		if (k === siteKey) {
			return fn(v, arg);
		}

		const child = extractChild(v);
		child && registerFn(child, siteKey, arg, fn);
	}
	return null;
}

export const registerGetValue: registerFind = (obj, propName) => {
	if (objectHasOwn(obj, propName)) {
		const val = obj[propName];
	}
	function assertProp<T>(obj: object, k: T): Record<T, unknown>;
	return null;
};

export const registerHasProp: registerFind = (obj, propName) => {
	return Object.hasOwn(obj, propName) ? true : false;
};
// export function registerHasProp(obj: SubObject, propName: string) {
// 	return Object.hasOwn(obj, propName) ? true : false;
// }

// export function registerGetValue(obj: SubObject, propName: string) {
// 	return Object.hasOwn(obj, propName) ? obj[propName as keyof SubObject] : null;
// }

function extractChild(obj: SubObject, mode = ""): null | RegisterObj {
	if (!Object.hasOwn(obj, "child")) {
		return null;
	}

	//single and pagenation do not have child property for additional input. return null and skip recurrsion.
	if (obj.input.method === "select" && (obj.value === "single" || obj.value === "pagenation" || obj.value === "daily" || obj.value === "weekly" || obj.value === "monthly")) {
		console.log("selected single or pagenation!");
		return null;
	}

	const child = assertDef(obj.child);
	if (obj.input.method === "select" && mode && obj.value !== null) {
		//only when input method is select and the mode="select" return su
		//Object whose key is the selected value e.g. obj.value
		const selected = obj.value as string;
		const o: { [key: string]: SubObject } = {};
		o[selected] = child[selected];
		return o;
	}

	//otherwise return the subobject under child property
	return child;
}

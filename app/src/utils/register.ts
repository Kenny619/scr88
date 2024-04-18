import type { badgeValues, registerObjFlex, registerProps, registerSubObj, registerUpdateArg } from "../../typings/index";

export function registerFlat(obj: registerObjFlex, output: registerObjFlex = {}) {
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

export function registerUpdate(obj: registerObjFlex, siteKey: string, keyValArr: registerUpdateArg) {
	for (const key in obj) {
		if (siteKey === key) {
			for (const kv of keyValArr) {
				obj[key] = { ...obj[key], ...kv };
			}
			return { ...obj };
		}

		if ("child" in obj[key]) {
			const child = extractChild(obj[key], "select");
			if (child) {
				const updatedObj = registerUpdate(child, siteKey, keyValArr);
				if (updatedObj !== undefined) {
					obj[key].child = { ...updatedObj };
				}
			}
		}
	}
	console.log(obj);
	return { ...obj };
}

//skip the value check and child check if input method was toggle or select and value was null
export function isRegisterable(registerObj: registerObjFlex): boolean {
	for (const [key, val] of Object.entries(registerObj)) {
		//exit conditions
		if (val.input.method === "text" && val.badgeStatus !== "Pass") {
			console.log(`returning due to ${key} having ${JSON.stringify(val)} `);
			return false;
		}
		if (val.input.method === "select" && val.value === null) {
			console.log(`returning due to ${key} having ${val} `);
			return false;
		}
		if (val.input.method === "toggle" && val.value === false) {
			continue;
		}
		if (!Object.hasOwn(val, "child")) {
			continue;
		}

		const child = extractChild(val, "select");
		if (child) {
			const returned = isRegisterable(child);
			if (returned === false) {
				return false;
			}
		}
	}

	return true;
}

type propNames = Exclude<keyof registerProps, "input" | "child">;
type returnVal<T extends propNames> = T extends "value"
	? string | boolean
	: T extends "badgeStatus"
	  ? badgeValues
	  : T extends "errorMsg"
		  ? string
		  : T extends "preValidation"
			  ? null | string[]
			  : T extends "apiEndPoint"
				  ? string
				  : never;

type getVal = <T extends propNames, U extends T>(obj: registerObjFlex, siteKey: string, propNames: T) => undefined | returnVal<U>;

export const getRegisterValue: getVal = (obj, siteKey, propName) => {
	for (const key in obj) {
		if (key === siteKey) {
			const val = obj[key];
			if (Object.hasOwn(val, propName)) {
				return val[propName] as returnVal<typeof propName>;
			}
		}
		const child = extractChild(obj[key]);
		if (child) {
			const ret = getRegisterValue(child, siteKey, propName);
			if (ret !== undefined) {
				return ret;
			}
		}
	}
};

function extractChild(obj: registerProps, mode = ""): null | registerObjFlex {
	if (!("child" in obj)) {
		return null;
	}

	if (obj.input.method === "select" && !Object.keys(obj.child as registerSubObj).find((v) => v === obj.value)) {
		return null;
	}

	if (obj.input.method === "select" && mode && obj.value !== null) {
		const v = (obj.child as registerObjFlex)[obj.value as keyof typeof obj.child];
		const child: registerObjFlex = {};
		child[obj.value as keyof typeof child] = v;
		return child;
	}
	//otherwise return the subobject under child property
	return obj.child as registerObjFlex;
}

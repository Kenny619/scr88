import type { RegisterObj, SubObject, updateValues } from "../../typings/index";
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
		if (siteKey === key) {
			for (const kv of keyValArr) {
				obj[key] = { ...obj[key], ...kv };
			}
			return { ...obj };
		}

		const child = extractChild(obj[key], "select");
		if (child) {
			const updatedObj = registerUpdate(child, siteKey, keyValArr);
			if (updatedObj !== undefined) {
				obj[key].child = updatedObj;
			}
		}
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
		if (child) {
			const returned = isRegisterable(child);
			if (returned === false) {
				return false;
			}
		}
	}

	return true;
}

type propNames = Exclude<keyof SubObject, "input" | "child">;
type registerFindreturn = string | string[] | boolean | null;

export function registerGetValue(obj: RegisterObj, siteKey: string, propName: propNames): registerFindreturn | undefined {
	for (const key in obj) {
		if (key === siteKey) {
			const val = obj[key];
			if (Object.prototype.hasOwnProperty.call(val, propName)) {
				return val[propName];
			}
		}
		const child = extractChild(obj[key]);
		if (child) {
			const ret = registerGetValue(child, siteKey, propName);
			if (ret !== undefined) {
				return ret;
			}
		}
	}
}
// export function registerGetValue(obj: RegisterObj, siteKey: string, propName: propNames): registerFindreturn {
// 	for (const key in obj) {
// 		if (key === siteKey) {
// 			const val = obj[key];
// 			if (Object.prototype.hasOwnProperty.call(val, propName)) {
// 				const ret = val[propName] as registerFindreturn;
// 				console.log(`${siteKey}[${propName}]: exists!, returning ${val[propName]}`);
// 				return ret;
// 			}
// 		}
// 		const child = extractChild(obj[key], "selected");
// 		console.log(`${key}: calling child ${JSON.stringify(child)}`);
// 		if (child) {
// 			const returned = registerGetValue(child, siteKey, propName);
// 			if (returned !== undefined) {
// 				return returned;
// 			}
// 		}
// 	}
// 	return null;
// }

// export const registerGetValue: registerFind = (obj, propName) => {
// 	if (Object.prototype.hasOwnProperty.call(obj, propName)) {
// 		return obj[propName] as registerFindreturn;
// 	}
// 	return null;
// };

// export const registerHasProp: registerFind = (obj, propName) => {
// 	return Object.prototype.hasOwnProperty.call(obj, propName) ? true : false;
// };
// export function registerHasProp(obj: SubObject, propName: string) {
// 	return Object.hasOwn(obj, propName) ? true : false;
// }

// export function registerGetValue(obj: SubObject, propName: string) {
// 	return Object.hasOwn(obj, propName) ? obj[propName as keyof SubObject] : null;
// }

function extractChild(obj: SubObject, mode = ""): null | RegisterObj {
	if (!Object.prototype.hasOwnProperty.call(obj, "child")) {
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

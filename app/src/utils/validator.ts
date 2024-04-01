import type { RegisterObj, updateValues } from "../../typings/index";
import v from "validator";
import { assertDefined } from "./tshelper";
import { registerGetValue } from "./register";
export default function validateInput(
	registerObj: RegisterObj, //reference to the current status of the object
	siteKey: string,
	value: string,
	updater: (siteKey: string, values: updateValues) => void,
) {
	//Escape - if value is not provided, exit the function
	if (!value) {
		updater(siteKey, [{ badgeStatus: "Pending Input" }, { errorMsg: "" }]);
		return;
	}

	//Change the badge status to Checking until the test result comes back
	updater(siteKey, [{ badgeStatus: "Checking..." }, { errorMsg: "" }]);

	console.log(`passing siteKey:${siteKey}  value:${value}`);
	const preValidationErr = preValidation(registerObj, siteKey, value);

	if (preValidationErr) {
		updater(siteKey, [{ errorMsg: preValidationErr }, { badgeStatus: "Fail" }]);
		return;
	}

	const ep = registerGetValue(registerObj, siteKey, "apiEndPoint");
	console.log("obj:", registerObj, "siteKey:", siteKey, "ep:", ep);
	if (ep) {
		assertDefined(ep);
		apiRequest(ep as string, siteKey, value, updater);
	}
}

function apiRequest(endpoint: string, key: string, value: string, updater: (siteKey: string, values: updateValues) => void) {
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
			res.pass ? updater(key, [{ value: value }, { badgeStatus: "Pass" }, { errorMsg: "" }]) : updater(key, [{ errorMsg: res.errMsg }, { badgeStatus: "Fail" }]);
		})
		.catch((e) => {
			console.log(e);
			updater(key, [{ errorMsg: e, badgeStatus: "Fail" }]);
		});
}

function preValidation(registerObj: RegisterObj, siteKey: string, value: string): string | null {
	const conds: { [key: string]: () => string } = {
		url: () => {
			return v.isURL(value) ? "" : "Input needs to be in a valid URL format.";
		},
		number: () => {
			return typeof Number(value) === "number" ? "" : "Input needs to be a number.";
		},
		language: () => {
			return registerObj.language.value ? "" : "language needs to be selected.";
		},
		siteType: () => {
			return registerObj.siteType.value ? "" : "siteType needs to be selected.";
		},
		entryUrl: () => {
			return registerObj.entryUrl.value ? "" : "Requires entryUrl input.";
		},
		lastUrl: () => {
			const lastUrlSelector = registerGetValue(registerObj, "last", "value");
			return lastUrlSelector ? "" : "Requires lastUrlSelector input.";
		},
	};

	const preValArr = registerGetValue(registerObj, siteKey, "preValidation");
	console.log(`preValidation for ${siteKey} is `, preValArr);

	if (Array.isArray(preValArr) && preValArr.length > 0) {
		const err = preValArr
			.map((key) => conds[key]())
			.filter((v) => v.length > 0)
			.join("<br/>\r\n");

		console.log("preErr=", err);
		return err;
	}
	return null;
}

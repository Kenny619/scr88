import type { registerObjFlex, registerUpdateArg } from "../../typings/index";
import v from "validator";
import { getRegisterValue } from "./register";
import fetchPost from "./fetch";

type ValidateInput = (registerObj: registerObjFlex, siteKey: string, value: string, updater: (siteKey: string, values: registerUpdateArg) => void) => void;
const validateInput: ValidateInput = (registerObj, siteKey, value, updater) => {
	//Escape - if value is not provided, exit the function
	if (!value) {
		updater(siteKey, [{ badgeStatus: "Pending Input" }, { errorMsg: "" }]);
		return;
	}

	//Change the badge status to Checking until the test result comes back
	updater(siteKey, [{ badgeStatus: "Checking..." }, { errorMsg: "" }]);

	const preValidationErr = preValidation(registerObj, siteKey, value);

	if (preValidationErr) {
		updater(siteKey, [{ errorMsg: preValidationErr }, { badgeStatus: "Fail" }]);
		return;
	}

	const ep = getRegisterValue(registerObj, siteKey, "apiEndPoint");
	if (ep) {
		const postData = { key: siteKey, input: value };

		fetchPost(`${process.env.REACT_APP_REGISTER_API_ADDR}${ep}`, postData)
			.then((res) => {
				if (!res.pass) {
					const errorMsgStringify = typeof res.errMsg === "string" ? res.errMsg : JSON.stringify(res.errMsg);
					updater(siteKey, [{ badgeStatus: "Fail" }, { errorMsg: errorMsgStringify }]);
				} else {
					updater(siteKey, [{ badgeStatus: "Pass" }, { value: value }, { extracted: res.result }]);
				}
			})
			.catch((e) => {
				updater(siteKey, [{ badgeStatus: "Fail", errorMsg: e }]);
			});
	}
};

function preValidation(registerObj: registerObjFlex, siteKey: string, value: string): string | null {
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
			const lastUrlSelector = getRegisterValue(registerObj, "last", "value");
			return lastUrlSelector ? "" : "Requires lastUrlSelector input.";
		},
	};

	const preValArr = getRegisterValue(registerObj, siteKey, "preValidation");

	if (preValArr) {
		const err = preValArr
			.map((key) => conds[key]())
			.filter((v) => v.length > 0)
			.join("<br/>\r\n");

		console.log("preErr=", err);
		return err;
	}
	return null;
}

export default validateInput;

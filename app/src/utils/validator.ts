import type { RegisterObj, updateValues } from "../../typings/index";
import v from "validator";
import { assertDefined } from "./tshelper";
type valRef = {
	[key: string]: {
		pre: Array<() => string>;
		ep?: string;
	};
};

export default function validateInput(
	inputs: RegisterObj, //reference to the current status of the object
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

	const preValidationErr = preValidation(inputs, siteKey, value);

	if (preValidationErr) {
		updater(siteKey, [{ errorMsg: preValidationErr }, { badgeStatus: "Fail" }]);
		return;
	}

	//escape backslash in regex
	const postVal =
		siteKey === "lastPageNumberRegExp" || siteKey === "nextPageUrlRegExp" ? value.replace(/\\/g, "\\\\") : value;

	const ep = inputs[siteKey].apiEndPoint;
	assertDefined(ep);
	apiRequest(ep, siteKey, postVal, updater);
}

function apiRequest(
	endpoint: string,
	key: string,
	value: string,
	updater: (siteKey: string, values: updateValues) => void,
) {
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
				? updater(key, [{ value: value }, { badgeStatus: "Pass" }, { errorMsg: "" }])
				: updater(key, [{ errorMsg: res.errMsg }, { badgeStatus: "Fail" }]);
		})
		.catch((e) => {
			console.log(e);
			updater(key, [{ errorMsg: e, badgeStatus: "Fail" }]);
		});
}

function preValidation(inputs: RegisterObj, siteKey: string, value: string): string {
	const conds: { [key: string]: () => string } = {
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

	const preValArr = inputs[siteKey].preValidation;
	assertDefined(preValArr);
	const err = preValArr
		.map((key) => conds[key]())
		.filter((v) => v.length > 0)
		.join("<br/>\r\n");

	console.log("preErr=", err);

	return err;
}

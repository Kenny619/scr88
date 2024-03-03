import { site } from "../../typings/index";
import { getDOM, extract, extractAll, isURLalive } from "./funcs";

type Obj = { siteKey: Partial<keyof site>; [key: string]: string | string[] | boolean };
type Inputs = Obj[];
type extractTypes = "link" | "text" | "node";

type inputValues = {
	value?: string | boolean;
	errorMsg?: string;
	badgeStatus?: string;
}[];
export default function validateInput(
	inputs: Inputs,
	key: string,
	value: string,
	updater: (siteKey: keyof site, values: inputValues) => void,
) {
	//Escape - if value is not provided, exit the function
	if (!value) return;

	//Create new object inputsRef from taking siteKey as a key and value as its value from inputs
	const inputsRef = inputs.reduce((acc, curr) => {
		return { [curr.siteKey]: curr[value] };
	}, {});

	if (key === "name") {
		//insert duplicate name check logic here

		updater(key, [{ value: value, badgeStatus: "pass" }]);
	}

	if (key === "rootUrl") {
		//validate value to be a URL
		//check if the URL is alive
		/*	isURLalive(value)
			.then((res) => {
				updater(key, [{ value: value, badgeStatus: "pass" }]);
			})
			.catch((err) => {
				updater(key, [{ value: value, badgeStatus: "Fail", errorMsg: err }]);
			});
            */
	}
}

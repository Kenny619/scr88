import { Badge, Flex, RadioGroup, Switch, Table, Text, TextField } from "@radix-ui/themes";
import type React from "react";
import { createContext, useContext, useState } from "react";
//import * as Switch from "@radix-ui/react-switch";
import type { site } from "../../typings/index";
import { registerObj as _registerObj, registerConfig, registerObj } from "../config/registerConfig";
import validateInput from "../utils/validator";
type siteKeys = keyof typeof _registerObj;
type registerKeys = "label" | "value" | "badgeStatus" | "errorMsg" | "preValidation" | "apiEndPoint" | "extracted";
type registetInput = {
	input: {
		method: string;
		defaultValue: null | boolean;
		choices: null | string[] | boolean[];
	};
};
type registerV = {
	[key in registerKeys]: string | string[] | boolean | null;
} & registetInput;

type inputValues = {
	[key: string]: string | boolean;
}[];

type textInputKeys = Extract<
	siteKeys,
	| "name"
	| "rootUrl"
	| "entryUrl"
	| "lastUrlSelector"
	| "lastPageNumberRegExp"
	| "nextPageParameter"
	| "nextPageLinkSelector"
	| "nextPageUrlRegExp"
	| "startingPageNumber"
	| "tags"
	| "indexLinkSelector"
	| "articleBlockSelector"
	| "articleTitleSelector"
	| "articleBodySelector"
	| "articleTagSelector"
>;

//input field values
/*
const inputs: Inputs = [
	{
		siteKey: "name",
		label: "Site name",
		inputMethod: "text",
		value: undefined,
		badgeStatus: "Pending Input",
		errorMsg: "",
	},

	{
		siteKey: "rootUrl",
		label: "Target site FQDN",
		inputMethod: "text",
		value: undefined,
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "entryUrl",
		label: "Entry point URL",
		inputMethod: "text",
		value: undefined,
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "language",
		label: "languages",
		inputMethod: ["JP", "EN"],
		value: undefined,
	},
	{
		siteKey: "saveDir",
		label: "output Dir",
		inputMethod: "text",
		value: undefined,
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "siteType",
		label: "site type",
		inputMethod: ["link", "singleArticle", "multipleArticle"],
		value: undefined,
	},
	{
		siteKey: "nextPageType",
		label: "next page type",
		inputMethod: ["last", "next", "parameter", "url"],
		value: undefined,
	},
	{
		siteKey: "lastUrlSelector",
		label: "CSS link selector of last URL",
		inputMethod: "text",
		value: undefined,
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "lastPageNumberRegExp",
		label: "last URL pageNumber RegExp",
		inputMethod: "text",
		value: undefined,
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "nextPageParameter",
		label: "pageNumber URL parameter",
		inputMethod: "text",
		value: undefined,
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "nextPageLinkSelector",
		label: "CSS link selector of next URL",
		inputMethod: "text",
		value: undefined,
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "nextPageUrlRegExp",
		label: "in-URL pageNumber RegExp",
		inputMethod: "text",
		value: undefined,
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "startingPageNumber",
		label: "Starting page number (if not 1)",
		inputMethod: "text",
		value: undefined,
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "tagFiltering",
		label: "Check to enable tag filtering",
		inputMethod: "checkbox",
		value: false,
	},
	{
		siteKey: "tagCollect",
		label: "Check to Acquire tagss",
		inputMethod: "checkbox",
		value: false,
	},
	{
		siteKey: "tags",
		label: "Input comma separated tags for filtering use",
		inputMethod: "text",
		value: undefined,
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "indexLinkSelector",
		label: "CSS link selector on index page",
		inputMethod: "text",
		value: undefined,
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "articleBlockSelector",
		label: "Article block selector",
		inputMethod: "text",
		value: undefined,
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "articleTitleSelector",
		label: "article title selector",
		inputMethod: "text",
		value: undefined,
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "articleBodySelector",
		label: "article body selector",
		inputMethod: "text",
		value: undefined,
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
	{
		siteKey: "articleTagSelector",
		label: "article tags selector",
		inputMethod: "text",
		value: undefined,
		badgeStatus: "Pending Input",
		errorMsg: "",
	},
];
*/

const InputContext = createContext(_registerObj);
const UpdaterContext = createContext((siteKey: siteKeys, values: inputValues): void => {});

export default function InputTable() {
	const [registerObj, setRegisterObj] = useState(_registerObj);

	function updateRegisterObj(siteKey: siteKeys, values: inputValues): void {
		let newRegisterObj = _registerObj;

		for (const key of Object.keys(registerObj)) {
			if (key === siteKey) {
				let newRegisterVal = newRegisterObj[key];
				for (const obj of values) {
					newRegisterVal = { ...newRegisterVal, ...obj };
				}
				newRegisterObj = { ...newRegisterObj, ...newRegisterVal };
			}
			setRegisterObj(newRegisterObj);
		}
		/*
const newRegisterObj = Object.keys(registerObj).map((key) => {

	let newObj = registerObj[key as siteKeys];
	if (key === siteKey) {
		for(const obj of values){
			newObj = {...newObj, ...obj};
		}
		return newObj;
	}

	return newObj;
});
		setRegisterObj(newRegisterObj);
		*/
	}

	return (
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell>Input</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell>Message</Table.ColumnHeaderCell>
				</Table.Row>
			</Table.Header>

			<Table.Body className="inputFields">
				<InputContext.Provider value={registerObj}>
					<UpdaterContext.Provider value={updateRegisterObj}>
						{Object.entries(registerObj).map(([key, value]) => {
							return <Input siteKey={key as siteKeys} inputStatus={value} />;
						})}
					</UpdaterContext.Provider>
				</InputContext.Provider>
			</Table.Body>
		</Table.Root>
	);
}

function Input({ siteKey, inputStatus }: { siteKey: siteKeys; inputStatus: registerV }): JSX.Element {
	const updateInputs = useContext(UpdaterContext);
	const inputsRef = useContext(InputContext);

	/** Skip rendering conditions:  exit if the field is not required by selected siteType and nextPageType */
	const skipRenderConditions = [
		(siteKey === "lastUrlSelector" || siteKey === "lastPageNumberRegExp") && inputsRef.nextPageType.value !== "last",
		siteKey === "nextPageParameter" && inputsRef.nextPageType.value !== "parameter",
		siteKey === "nextPageLinkSelector" && inputsRef.nextPageType.value !== "next",
		siteKey === "nextPageUrlRegExp" && inputsRef.nextPageType.value !== "url",
		siteKey === "startingPageNumber" &&
			inputsRef.nextPageType.value !== "parameter" &&
			inputsRef.nextPageType.value !== "url",
		siteKey === "tags" && inputsRef.tagCollect.value === false && inputsRef.tagFiltering.value === false,
		siteKey === "indexLinkSelector" && inputsRef.siteType.value !== "link",
		siteKey === "articleBlockSelector" && inputsRef.siteType.value !== "multipleArticle",
		siteKey === "articleTagSelector" && inputsRef.tagCollect.value === false,
	];

	if (skipRenderConditions.some((v) => v)) {
		return <></>;
	}

	const inputField = {
		text: TextInputs,
	};

	//rendering table row
	return (
		<Table.Row key={siteKey as Partial<keyof site>}>
			<Table.Cell>
				<Text as="div" size={"3"}>
					<label>{siteKey}</label>
				</Text>
				<Text as="div" size={"1"}>
					{inputStatus.label}
				</Text>
			</Table.Cell>
			<Table.Cell>{inputField}</Table.Cell>
			<Table.Cell>
				<StatusBadge siteKey={siteKey} />
			</Table.Cell>
			<Table.Cell>
				<ErrorMsg siteKey={siteKey} />
			</Table.Cell>
		</Table.Row>
	);
}

function TextInputs(siteKey: textInputKeys): JSX.Element {
	const updateInputs = useContext(UpdaterContext);
	const inputsRef = useContext(InputContext);
	return (
		<TextField.Root>
			<TextField.Input name={siteKey} onBlur={(e) => validateInput(inputsRef, siteKey, e.target.value, updateInputs)} />
		</TextField.Root>
	);
}
function ToggleInputs(siteKey: siteKeys, tagFilteringValue: boolean, tagCollectValue: boolean): JSX.Element {
	const updateInputs = useContext(UpdaterContext);

	const checkedState = siteKey === "tagFiltering" ? tagFilteringValue : tagCollectValue;
	return (
		<Flex gap="2" p="2">
			<Switch
				className="CheckboxRoot"
				checked={checkedState}
				id={siteKey}
				onCheckedChange={() => updateInputs(siteKey, [{ value: !checkedState }])}
				size={"2"}
				radius="none"
			/>
		</Flex>
	);
}
function SelectInput(siteKey: siteKeys, choices: string[]): JSX.Element {
	const updateInputs = useContext(UpdaterContext);
	//radio button
	return (
		<RadioGroup.Root>
			<Flex gap="2" direction="column">
				{choices.map((v) => {
					return (
						<Text as="label" size="2">
							<Flex gap="2">
								<RadioGroup.Item value={v} onClick={() => updateInputs(siteKey, [{ value: v }])} /> {v}
							</Flex>
						</Text>
					);
				})}
			</Flex>
		</RadioGroup.Root>
	);
}

function ErrorMsg({ siteKey }: { siteKey: Partial<keyof site> }): JSX.Element {
	const inputRef = useContext(InputContext);
	const siteKeyRef = inputRef[siteKey as siteKeys];
	/** create statusBadge */
	let errorMsg: JSX.Element = <></>;
	if (siteKeyRef && Object.hasOwn(siteKeyRef, "errorMsg")) {
		errorMsg = (
			<Text as="div" size={"1"} color="tomato">
				{siteKeyRef.errorMsg}
			</Text>
		);
	}
	return errorMsg;
}

function StatusBadge({ siteKey }: { siteKey: Partial<keyof site> }): JSX.Element {
	const inputRef = useContext(InputContext);
	const siteKeyRef = inputRef[siteKey as siteKeys];
	/** create statusBadge */
	let statusBadge: JSX.Element = <></>;
	if (siteKeyRef && Object.hasOwn(siteKeyRef, "badgeStatus")) {
		let color: "gray" | "green" | "tomato" = "gray";
		switch (siteKeyRef.badgeStatus) {
			case "Pending Input":
				color = "gray";
				break;
			case "Pass":
				color = "green";
				break;
			case "Fail":
				color = "tomato";
				break;
		}
		statusBadge = (
			<Badge color={color} size={"2"}>
				{siteKeyRef.badgeStatus}
			</Badge>
		);
	}
	return statusBadge;
}

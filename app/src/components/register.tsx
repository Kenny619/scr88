import React, { useState, createContext, useContext } from "react";
import { Flex, Text, RadioGroup, Table, TextField, Badge, Switch } from "@radix-ui/themes";
//import * as Switch from "@radix-ui/react-switch";
import { CheckIcon } from "@radix-ui/react-icons";
import type { site } from "../../typings/index";
import validateInput from "../utils/validator";
type Obj = { siteKey: Partial<keyof site>; [key: string]: string | string[] | boolean | undefined };
type Inputs = Obj[];

type inputKeys = Exclude<
	Partial<keyof site>,
	| "language"
	| "nextPageType"
	| "siteType"
	| "tagCollect"
	| "tagFiltering"
	| "tags"
	| "indexTagSelector"
	| "indexLinkBlockSelector"
>;
type inputValues = {
	value?: string | boolean;
	errorMsg?: string;
	badgeStatus?: string;
}[];
//input field values

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

const InputContext = createContext(inputs);
const UpdaterContext = createContext((siteKey: keyof site, values: inputValues): void => {});

export default function InputTable() {
	const [inputsObj, setInputsObj] = useState(inputs);

	function updateInputsObj(siteKey: keyof site, values: inputValues): void {
		const newInputsObj = inputsObj.map((obj) => {
			if (obj.siteKey === siteKey) {
				let newObj = { ...obj };
				for (const o of values) {
					newObj = { ...newObj, ...o };
				}
				return newObj;
			}
			return obj;
		});
		setInputsObj(newInputsObj);
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
				<InputContext.Provider value={inputsObj}>
					<UpdaterContext.Provider value={updateInputsObj}>
						{inputs.map((obj) => {
							return <Input props={obj} />;
						})}
					</UpdaterContext.Provider>
				</InputContext.Provider>
			</Table.Body>
		</Table.Root>
	);
}

function Input({
	props,
}: { props: { siteKey: Partial<keyof site>; [key: string]: string | string[] | boolean | undefined } }): JSX.Element {
	const updateInputs = useContext(UpdaterContext);
	const inputsRef = useContext(InputContext);
	const nextPageType = inputsRef.find((v) => v.siteKey === "nextPageType")?.value as string;
	const siteType = inputsRef.find((v) => v.siteKey === "siteType")?.value as string;
	const tagCollect = inputsRef.find((v) => v.siteKey === "tagCollect")?.value as boolean;
	const tagFiltering = inputsRef.find((v) => v.siteKey === "tagFiltering")?.value as boolean;

	/** Skip rendering conditions:  exit if the field is not required by selected siteType and nextPageType */
	const skipRenderConditions = [
		(props.siteKey === "lastUrlSelector" || props.siteKey === "lastPageNumberRegExp") && nextPageType !== "last",
		props.siteKey === "nextPageParameter" && nextPageType !== "parameter",
		props.siteKey === "nextPageLinkSelector" && nextPageType !== "next",
		props.siteKey === "nextPageUrlRegExp" && nextPageType !== "url",
		props.siteKey === "startingPageNumber" && nextPageType !== "parameter" && nextPageType !== "url",
		props.siteKey === "tags" && tagCollect === false && tagFiltering === false,
		props.siteKey === "indexLinkSelector" && siteType !== "link",
		props.siteKey === "articleBlockSelector" && siteType !== "multipleArticle",
		props.siteKey === "articleTagSelector" && tagCollect === false,
	];

	if (skipRenderConditions.some((v) => v)) {
		return <></>;
	}

	/** generate input field */
	let inputField: JSX.Element = <></>;

	//checkbox
	if (props.inputMethod === "checkbox") {
		const checkedState = props.siteKey === "tagFiltering" ? tagFiltering : tagCollect;
		inputField = (
			<Flex gap="2" p="2">
				<Switch
					className="CheckboxRoot"
					checked={checkedState}
					id={props.siteKey}
					onCheckedChange={() => updateInputs(props.siteKey, [{ value: !checkedState }])}
					size={"2"}
					radius="none"
				/>
			</Flex>
		);
	}

	//radio button
	if (Array.isArray(props.inputMethod)) {
		const radioGroup = (props.inputMethod as string[]).map((v) => {
			return (
				<Text as="label" size="2">
					<Flex gap="2">
						<RadioGroup.Item value={v} onClick={() => updateInputs(props.siteKey, [{ value: v }])} /> {v}
					</Flex>
				</Text>
			);
		});

		inputField = (
			<RadioGroup.Root>
				<Flex gap="2" direction="column">
					{radioGroup}
				</Flex>
			</RadioGroup.Root>
		);
	}

	//text field
	if (props.inputMethod === "text") {
		inputField = (
			<TextField.Root>
				<TextField.Input
					name={props.siteKey}
					onBlur={(e) => validateInput(inputsRef, props.siteKey as inputKeys, e.target.value, updateInputs)}
				/>
			</TextField.Root>
		);
	}

	//rendering table row
	return (
		<Table.Row key={props.siteKey as Partial<keyof site>}>
			<Table.Cell>
				<Text as="div" size={"3"}>
					<label>{props.siteKey}</label>
				</Text>
				<Text as="div" size={"1"}>
					{props.label}
				</Text>
			</Table.Cell>
			<Table.Cell>{inputField}</Table.Cell>
			<Table.Cell>
				<StatusBadge siteKey={props.siteKey} />
			</Table.Cell>
			<Table.Cell>
				<ErrorMsg siteKey={props.siteKey} />
			</Table.Cell>
		</Table.Row>
	);
}
function ErrorMsg({ siteKey }: { siteKey: Partial<keyof site> }) {
	const inputRef = useContext(InputContext);
	const siteKeyRef = inputRef.find((v) => v.siteKey === siteKey);
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
function StatusBadge({ siteKey }: { siteKey: Partial<keyof site> }) {
	const inputRef = useContext(InputContext);
	const siteKeyRef = inputRef.find((v) => v.siteKey === siteKey);
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

import { Badge, Flex, RadioGroup, Switch, Table, Text, TextField } from "@radix-ui/themes";
import { createContext, useContext, useState } from "react";
import type { inputValues, registerObj, registerValue, site, siteKeys, textInputKeys } from "../../typings/index";
import { rObj as _registerObj } from "../config/registerConfig";
import validateInput from "../utils/validator";

const InputContext = createContext(_registerObj);
const UpdaterContext = createContext((siteKey: siteKeys, values: inputValues): void => {});

export default function InputTable() {
	const [registerObj, setRegisterObj] = useState(_registerObj);

	function updateRegisterObj(siteKey: siteKeys, values: inputValues): void {
		const newRegisterObj: registerObj = { ...registerObj };

		for (const key of Object.keys(newRegisterObj)) {
			if (key === siteKey) {
				let newRegisterVal = newRegisterObj[key];
				for (const obj of values) {
					newRegisterVal = { ...newRegisterVal, ...obj };
				}
				newRegisterObj[key] = { ...newRegisterVal };
			}
		}
		setRegisterObj(newRegisterObj);
	}

	//If below conditions were met, then move to save page

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
							return <TableRow key={key} siteKey={key as siteKeys} renderingParams={value} />;
						})}
					</UpdaterContext.Provider>
				</InputContext.Provider>
			</Table.Body>
		</Table.Root>
	);
}

function TableRow({ siteKey, renderingParams }: { siteKey: siteKeys; renderingParams: registerValue }): JSX.Element {
	const inputsRef = useContext(InputContext);

	/** Skip rendering conditions:  exit if the field is not required by selected siteType and nextPageType */
	const skipRenderConditions = [
		(siteKey === "lastUrlSelector" || siteKey === "lastPageNumberRegExp") && inputsRef.nextPageType.value !== "last",
		siteKey === "nextPageParameter" && inputsRef.nextPageType.value !== "parameter",
		siteKey === "nextPageLinkSelector" && inputsRef.nextPageType.value !== "next",
		siteKey === "nextPageUrlRegExp" && inputsRef.nextPageType.value !== "url",
		siteKey === "tags" && inputsRef.tagCollect.value === false && inputsRef.tagFiltering.value === false,
		siteKey === "indexLinkSelector" && inputsRef.siteType.value !== "links",
		siteKey === "articleBlockSelector" && inputsRef.siteType.value !== "multipleArticle",
		siteKey === "articleTagSelector" && inputsRef.tagCollect.value === false,
	];

	if (skipRenderConditions.some((v) => v)) {
		return <></>;
	}
	//rendering table row
	return (
		<Table.Row key={siteKey}>
			<Table.Cell>
				<Text as="div" size={"3"}>
					<label htmlFor={siteKey}>{siteKey}</label>
				</Text>
				<Text as="div" size={"1"}>
					{renderingParams.label}
				</Text>
			</Table.Cell>
			<Table.Cell>
				{renderingParams.input.method === "text" && <TextInputs siteKey={siteKey as textInputKeys} />}
				{renderingParams.input.method === "toggle" && <ToggleInputs siteKey={siteKey} />}
				{renderingParams.input.method === "select" && <SelectInput siteKey={siteKey} />}
			</Table.Cell>
			<Table.Cell>
				<StatusBadge siteKey={siteKey} />
			</Table.Cell>
			<Table.Cell>
				<ErrorMsg siteKey={siteKey} />
			</Table.Cell>
		</Table.Row>
	);
}

function TextInputs({ siteKey }: { siteKey: textInputKeys }): JSX.Element {
	const updateInputs = useContext(UpdaterContext);
	const inputsRef = useContext(InputContext);
	return (
		<Flex gap={"2"} p={"2"}>
			<TextField.Root>
				<TextField.Input
					id={siteKey}
					name={siteKey}
					onBlur={(e) => validateInput(inputsRef, siteKey, e.target.value, updateInputs)}
					autoComplete={siteKey}
				/>
			</TextField.Root>
		</Flex>
	);
}

function ToggleInputs({ siteKey }: { siteKey: siteKeys }): JSX.Element {
	const updateInputs = useContext(UpdaterContext);
	const inputRef = useContext(InputContext);

	const checkStatus = inputRef[siteKey].value;

	return (
		<Flex gap="2" p="2">
			<Switch
				className="CheckboxRoot"
				checked={checkStatus as boolean}
				id={siteKey}
				onCheckedChange={() => updateInputs(siteKey, [{ value: !checkStatus }])}
				size={"2"}
				radius="none"
			/>
		</Flex>
	);
}
function SelectInput({ siteKey }: { siteKey: siteKeys }): JSX.Element {
	const updateInputs = useContext(UpdaterContext);
	const inputsRef = useContext(InputContext);
	const choices = inputsRef[siteKey].input.choices as string[];
	//radio button
	return (
		<RadioGroup.Root>
			<Flex gap="2" direction="column">
				{choices.map((v) => {
					return (
						<Text as="label" size="2" key={v}>
							<Flex gap="2">
								<RadioGroup.Item id={siteKey} key={v} value={v} onClick={() => updateInputs(siteKey, [{ value: v }])} />
								{v}
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
	/** create statusBadge */
	let statusBadge: JSX.Element = <></>;
	if (inputRef[siteKey].badgeStatus !== null) {
		let color: "gray" | "green" | "tomato" = "gray";
		switch (inputRef[siteKey].badgeStatus) {
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
				{inputRef[siteKey].badgeStatus}
			</Badge>
		);
	}
	return statusBadge;
}

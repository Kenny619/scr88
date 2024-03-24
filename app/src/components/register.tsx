import { Badge, Flex, RadioGroup, Switch, Table, Text, TextField } from "@radix-ui/themes";
import { createContext, useContext, useState } from "react";
import type { RegisterObj, siteKeys, updateValues, SubObject } from "../../typings/index";
import { rObj as _registerObj } from "../config/registerConfig";
import validateInput from "../utils/validator";
import { ok } from "assert";

const InputContext = createContext(_registerObj);
const UpdaterContext = createContext((siteKey: string, values: updateValues): void => {});

export default function InputTable() {
	const [registerObj, setRegisterObj] = useState(_registerObj);

	function updateRegisterObj(siteKey: string, keyValArr: updateValues): void {
		const obj = updateObj(siteKey, keyValArr, registerObj);
		setRegisterObj(obj);
	}

	//Create a flat OoO that only contains rendering objects
	const renderObj: { [key: string]: SubObject } = objToRender(registerObj);

	return (
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell>Input</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
				</Table.Row>
			</Table.Header>

			<Table.Body className="inputFields">
				<InputContext.Provider value={registerObj}>
					<UpdaterContext.Provider value={updateRegisterObj}>
						{Object.entries(renderObj).map(([key, params]) => {
							return <TableRow siteKey={key} params={params} />;
						})}
					</UpdaterContext.Provider>
				</InputContext.Provider>
			</Table.Body>
		</Table.Root>
	);
}

function TableRow({ siteKey, params }: { siteKey: string; params: SubObject }): JSX.Element {
	const inputRef = useContext(InputContext);

	return (
		<Table.Row key={siteKey}>
			<Table.Cell>
				<Text as="div" size={"3"}>
					<label htmlFor={siteKey}>{siteKey}</label>
				</Text>
				<Text as="div" size={"1"}>
					{params.label}
				</Text>
			</Table.Cell>
			<Table.Cell>
				{params.input.method === "text" && <TextInputs siteKey={siteKey} />}
				{params.input.method === "toggle" && <ToggleInputs siteKey={siteKey} />}
				{params.input.method === "select" && <SelectInput siteKey={siteKey} />}
				<Flex>
					<ErrorMsg siteKey={siteKey} />
				</Flex>
			</Table.Cell>
			<Table.Cell>
				<StatusBadge siteKey={siteKey} />
			</Table.Cell>
		</Table.Row>
	);
}

function TextInputs({ siteKey }: { siteKey: string }): JSX.Element {
	const updateInputs = useContext(UpdaterContext);
	const inputsRef = useContext(InputContext);
	return (
		<Flex gap={"2"} p={"2"}>
			<TextField.Root>
				<TextField.Input id={siteKey} name={siteKey} onBlur={(e) => validateInput(inputsRef, siteKey, e.target.value, updateInputs)} autoComplete={siteKey} />
			</TextField.Root>
		</Flex>
	);
}

function ToggleInputs({ siteKey }: { siteKey: string }): JSX.Element {
	const updateInputs = useContext(UpdaterContext);
	const inputRef = useContext(InputContext);

	const checkStatus = inputRef[siteKey].value;

	return (
		<Flex gap="2" p="2">
			<Switch className="CheckboxRoot" checked={checkStatus as boolean} id={siteKey} onCheckedChange={() => updateInputs(siteKey, [{ value: !checkStatus }])} size={"2"} radius="none" />
		</Flex>
	);
}
function SelectInput({ siteKey }: { siteKey: string }): JSX.Element {
	const updateInputs = useContext(UpdaterContext);
	const inputRef = useContext(InputContext);
	const choices = inputRef[siteKey].input.choices as string[];
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

function ErrorMsg({ siteKey }: { siteKey: string }): JSX.Element {
	const inputRef = useContext(InputContext);
	const siteKeyRef = inputRef[siteKey];
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

function StatusBadge({ siteKey }: { siteKey: string }): JSX.Element {
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

function objToRender(obj: RegisterObj) {
	const output: { [key: string]: SubObject } = {};
	for (const [oKey, oVal] of Object.entries(obj)) {
		output[oKey] = oVal;
		let params = oVal;
		while (Object.hasOwn(params, "child")) {
			if (params.input.method === "select" && params.value !== null) {
				const siteKey = params.value as string;
				output[siteKey] = params.child![siteKey];
				params = output[siteKey];
			}

			if ((params.input.method === "toggle" && params.value === true) || params.input.method === "text") {
				const siteKey = Object.keys(params.child!)[0];
				output[siteKey] = params.child![siteKey];
				params = output[siteKey];
			}
		}
	}
	return output;
}

function updateObj(siteKey: string, keyValArr: updateValues, obj: RegisterObj): RegisterObj {
	for (const key in obj) {
		if (key === siteKey) {
			for (const uObj of keyValArr) {
				obj[key] = { ...obj[key], ...uObj };
			}
		}

		if (Object.hasOwn(obj[key], "child")) {
			updateObj(siteKey, keyValArr, obj[key].child!);
		}
	}

	return obj;
}

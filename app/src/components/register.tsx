import { Badge, Flex, RadioGroup, Switch, Table, Text, TextField } from "@radix-ui/themes";
import { createContext, useContext, useState } from "react";
import type { RegisterObj, updateValues, SubObject } from "../../typings/index";
import { rObj as _registerObj } from "../config/registerConfig";
import validateInput from "../utils/validator";
import { assertDef } from "../utils/tshelper";

const InputContext = createContext(_registerObj);
const UpdaterContext = createContext((siteKey: string, values: updateValues): void => {});

export default function InputTable() {
	const [registerObj, setRegisterObj] = useState(_registerObj);

	//useState fn wrapper
	function updateRegisterObj(siteKey: string, keyValArr: updateValues): void {
		const obj = updateObj(siteKey, keyValArr, { ...registerObj });
		console.count("updateRegisterObj");
		setRegisterObj(obj);
	}

	//Create a flat OoO that only contains rendering objects
	const renderObj: { [key: string]: SubObject } = flatRenderingObj(registerObj);
	console.table(renderObj);
	//	isRegisterable(registerObj) && console.log("Ready to save the registration.");
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

	if (!Object.hasOwn(inputRef, "errorMsg") || inputRef[siteKey].errorMsg === null) {
		return <></>;
	}

	/** create statusBadge */
	return (
		<Text as="div" size={"1"} color="tomato">
			{inputRef[siteKey].errorMsg}
		</Text>
	);
}

function StatusBadge({ siteKey }: { siteKey: string }): JSX.Element {
	const inputRef = useContext(InputContext);

	if (!Object.hasOwn(inputRef[siteKey], "badgeStatus")) {
		return <></>;
	}

	/** create statusBadge */
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

	return (
		<Badge color={color} size={"2"}>
			{inputRef[siteKey].badgeStatus}
		</Badge>
	);
}

function flatRenderingObj(obj: RegisterObj, output: RegisterObj = {}) {
	for (const [k, v] of Object.entries(obj)) {
		output[k] = v;

		if (Object.hasOwn(v, "child")) {
			const child = assertDef(v.child);
			//case select
			if (v.input.method === "select" && v.value !== null && typeof v.value === "string") {
				const o: { [key: string]: SubObject } = {};
				o[v.value] = child[v.value];
				flatRenderingObj(o, output);
			}

			//case toggle and text
			if ((v.input.method === "toggle" && v.value === true) || (v.input.method === "text" && v.value !== null)) {
				flatRenderingObj(child, output);
			}
		}
	}
	return output;
}

function updateObj(siteKey: string, keyValArr: updateValues, obj: RegisterObj): RegisterObj {
	for (const key in obj) {
		if (key === siteKey) {
			for (const kv of keyValArr) {
				obj[key] = { ...obj[key], ...kv };
			}
		}

		if (Object.hasOwn(obj[key], "child")) {
			//check for child property.  Recur update its child
			const child = assertDef(obj[key].child);
			updateObj(siteKey, keyValArr, child);
		}
	}
	return obj;
}

function isRegisterable(registerObj: RegisterObj): boolean {
	for (const val of Object.values(registerObj)) {
		//exit conditions
		if ((val.input.method === "text" && val.badgeStatus !== "Pass") || (val.input.method === "select" && val.value === null)) {
			return false;
		}

		if (Object.hasOwn(val, "child")) {
			//child check conditions
			if (val.input.method === "select" && val.value !== null) {
				const childObj = assertDef(val.child);
				for (const key in childObj) {
					if (key === val.value) {
						isRegisterable({ key: childObj[key] });
					}
				}
			}

			if ((val.input.method === "toggle" && val.value === true) || (val.input.method === "text" && val.badgeStatus === "Pass")) {
				const child = assertDef(val.child);
				isRegisterable(child);
			}
		}
	}

	return true;
}

function registerHasProp(registerObj: RegisterObj, siteKey: string, propName: string) {
	for (const [k, v] of Object.entries(registerObj)) {
		if (k === siteKey) {
			return Object.hasOwn(registerObj[k], propName) ? true : false;
		}

		if (Object.hasOwn(registerObj[k], "child")) {
			const child = assertDef(registerObj[k].child);
		}
	}
}

function isRegisterPropValue(registerObj: RegisterObj, siteKey: string, propName: string, value: null | string | boolean | string[] | boolean[]) {}

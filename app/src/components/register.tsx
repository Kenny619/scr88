import { Badge, Flex, RadioGroup, Switch, Table, Text, TextField } from "@radix-ui/themes";
import { createContext, useContext, useState } from "react";
import type { updateValues, SubObject } from "../../typings/index";
import { rObj as _registerObj } from "../config/registerConfig";
import validateInput from "../utils/validator";
import { registerFlat, registerUpdate, isRegisterable } from "../utils/register";

const InputContext = createContext(_registerObj);
const UpdaterContext = createContext((siteKey: string, values: updateValues): void => {});

export default function InputTable() {
	const [registerObj, setRegisterObj] = useState(_registerObj);

	//useState fn wrapper
	function updateRegisterObj(siteKey: string, keyValArr: updateValues): void {
		const obj = registerUpdate(registerObj, siteKey, keyValArr);
		console.count("updateRegisterObj");
		setRegisterObj(obj);
	}

	//Create a flat OoO that only contains rendering objects
	const renderObj: { [key: string]: SubObject } = registerFlat(registerObj);
	console.table(renderObj);
	console.log("isRegisterable: ", isRegisterable(registerObj));
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
				{params.input.method === "toggle" && <ToggleInputs siteKey={siteKey} params={params} />}
				{params.input.method === "select" && <SelectInput siteKey={siteKey} params={params} />}
				{Object.hasOwn(params, "errorMsg") && (
					<Flex>
						<ErrorMsg errorMsg={params.errorMsg as string} />
					</Flex>
				)}
			</Table.Cell>
			<Table.Cell>{Object.hasOwn(params, "badgeStatus") && <StatusBadge badgeStatus={params.badgeStatus as string} />}</Table.Cell>
		</Table.Row>
	);
}

function TextInputs({ siteKey }: { siteKey: string }): JSX.Element {
	const updateInputs = useContext(UpdaterContext);
	const registerObj = useContext(InputContext);
	return (
		<Flex gap={"2"} p={"2"}>
			<TextField.Root>
				<TextField.Input id={siteKey} name={siteKey} onBlur={(e) => validateInput(registerObj, siteKey, e.target.value, updateInputs)} autoComplete={siteKey} />
			</TextField.Root>
		</Flex>
	);
}

function ToggleInputs({ siteKey, params }: { siteKey: string; params: SubObject }): JSX.Element {
	const updateInputs = useContext(UpdaterContext);

	const checkStatus = params.value;

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

function SelectInput({ siteKey, params }: { siteKey: string; params: SubObject }): JSX.Element {
	const updateInputs = useContext(UpdaterContext);
	const choices = params.input.choices as string[];
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

function ErrorMsg({ errorMsg }: { errorMsg: string }): JSX.Element {
	return (
		<Text as="div" size={"1"} color="tomato">
			{errorMsg}
		</Text>
	);
}

function StatusBadge({ badgeStatus }: { badgeStatus: string }): JSX.Element {
	/** create statusBadge */
	let color: "gray" | "green" | "tomato" = "gray";
	switch (badgeStatus) {
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
		<Flex p={"2"} gap={"2"}>
			<Badge color={color} size={"2"}>
				{badgeStatus}
			</Badge>
		</Flex>
	);
}

/*
function registerFlat(obj: RegisterObj, output: RegisterObj = {}) {
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

function registerUpdate(obj: RegisterObj, siteKey: string, keyValArr: updateValues): RegisterObj {
	for (const key in obj) {
		if (key === siteKey) {
			for (const kv of keyValArr) {
				obj[key] = { ...obj[key], ...kv };
			}
		}

		const child = extractChild(obj[key], "select");
		child && registerUpdate(child, siteKey, keyValArr);
	}

	return { ...obj };
}

function isRegisterable(registerObj: RegisterObj): boolean {
	for (const val of Object.values(registerObj)) {
		//exit conditions
		if ((val.input.method === "text" && val.badgeStatus !== "Pass") || (val.input.method === "select" && val.value === null)) {
			return false;
		}

		if (!Object.hasOwn(val, "child")) {
			continue;
		}

		const child = extractChild(val);
		child && isRegisterable(child);
	}

	return true;
}

type registerFind = (obj: SubObject, propName: string) => string | boolean | null;
function registerFn(obj: RegisterObj, siteKey: string, arg: string, fn: registerFind) {
	for (const [k, v] of Object.entries(obj)) {
		if (k === siteKey) {
			return fn(v, arg);
		}

		const child = extractChild(v);
		child && registerFn(child, siteKey, arg, fn);
	}
}

function hasProp(obj: SubObject, propName: string) {
	return Object.hasOwn(obj, propName) ? true : false;
}

function getValue(obj: SubObject, propName: string) {
	return Object.hasOwn(obj, propName) ? obj[propName as keyof SubObject] : null;
}

function extractChild(obj: SubObject, mode = ""): null | RegisterObj {
	if (!Object.hasOwn(obj, "child")) {
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
*/

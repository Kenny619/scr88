import { Badge, Flex, RadioGroup, Switch, Table, Text, TextField, Button, Box } from "@radix-ui/themes";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { createContext, useContext, useState, useRef } from "react";
import type { registerUpdateArg, registerObjFlex, registerObj, registerProps } from "../../typings/index";
import { rObj } from "../config/registerConfig";
import validateInput from "../utils/validator";
import { registerFlat, registerUpdate, isRegisterable } from "../utils/register";
import saveRegisterConfig from "../utils/saveRegisterConfig";
import "./dialog.css";
type inputComp = (obj: { siteKey: string; params: registerProps }) => JSX.Element;
type textComp = (obj: { siteKey: string }) => JSX.Element;
type attrComp = (obj: { siteKey: string; attr: string }) => JSX.Element;
type setState = React.Dispatch<React.SetStateAction<registerObjFlex>>;
//type defaultSetRegisterObj = (setRegisterObj: setState) => void;
const defaultFn: setState = (setRegisterObj) => {};
const setRegisterObjContext = createContext(defaultFn);
const registerObjContext = createContext(rObj as registerObjFlex);
const UpdaterContext = createContext((siteKey: string, values: registerUpdateArg): void => {});

// const usePageReload = () => {
// 	const forceUpdate = useReducer((x) => x + 1, 0)[1];
// 	return () => forceUpdate();
// };

const TableRow: inputComp = ({ siteKey, params }) => {
	return (
		<Table.Row key={`${siteKey}-TableRow`}>
			<Table.Cell>
				<Text as="div" size={"3"}>
					<label htmlFor={siteKey}>{siteKey}</label>
				</Text>
				<Text as="div" size={"1"}>
					{params.label}
				</Text>
			</Table.Cell>
			<Table.Cell key={`${siteKey}-TableCell-Input`}>
				{params.input.method === "text" && <TextInputs siteKey={siteKey} />}
				{params.input.method === "toggle" && <ToggleInputs siteKey={siteKey} params={params} />}
				{params.input.method === "select" && <SelectInput siteKey={siteKey} params={params} />}
				{Object.hasOwn(params, "errorMsg") && (
					<Flex>
						<ErrorMsg siteKey={siteKey} attr={params.errorMsg as string} />
					</Flex>
				)}
			</Table.Cell>
			<Table.Cell key={`${siteKey}-TableCell-BadgeStatus`}>
				{Object.hasOwn(params, "badgeStatus") && <StatusBadge siteKey={siteKey} attr={params.badgeStatus as string} />}
			</Table.Cell>
		</Table.Row>
	);
};

const TextInputs: textComp = ({ siteKey }) => {
	const updateInputs = useContext(UpdaterContext);
	const registerObj = useContext(registerObjContext);
	return (
		<Flex gap={"2"} p={"2"}>
			<TextField.Root key={`${siteKey}-textInput`}>
				<TextField.Input
					id={`${siteKey}-textInput`}
					name={`${siteKey}-nameAttr`}
					onBlur={(e) => validateInput(registerObj, siteKey, e.target.value, updateInputs)}
					autoComplete={siteKey}
				/>
			</TextField.Root>
		</Flex>
	);
};

const ToggleInputs: inputComp = ({ siteKey, params }) => {
	const updateInputs = useContext(UpdaterContext);
	const checkStatus = params.value;

	return (
		<Flex gap="2" p="2">
			<Switch
				key={`${siteKey}-toggleInput`}
				defaultChecked={false}
				className="CheckboxRoot"
				checked={checkStatus as boolean}
				id={`${siteKey}-toggleInput`}
				onCheckedChange={() => updateInputs(siteKey, [{ value: !checkStatus }])}
				size={"2"}
				radius="none"
			/>
		</Flex>
	);
};

const SelectInput: inputComp = ({ siteKey, params }) => {
	const updateInputs = useContext(UpdaterContext);
	const choices = params.input.choices as string[];
	//
	//radio button
	return (
		<RadioGroup.Root key={`${siteKey}-selectInput`} name={`${siteKey}-selectInput`}>
			<Flex gap="2" direction="column">
				{choices.map((v) => {
					return (
						<Text as="label" size="2" key={v}>
							<Flex gap="2">
								<RadioGroup.Item
									defaultChecked={false}
									aria-checked={params.value === v}
									id={`${siteKey}-selectInput-${v}`}
									key={`${siteKey}-selectInput-${v}`}
									value={v}
									onClick={() => updateInputs(siteKey, [{ value: v }])}
								/>
								<label htmlFor={`${siteKey}-selectInput-${v}`}>{v}</label>
							</Flex>
						</Text>
					);
				})}
			</Flex>
		</RadioGroup.Root>
	);
};

const ErrorMsg: attrComp = ({ siteKey, attr }) => {
	return (
		<Text key={`${siteKey}-errMsg`} id={`${siteKey}-errMsg`} as="div" size={"1"} color="tomato">
			{attr}
		</Text>
	);
};

const StatusBadge: attrComp = ({ siteKey, attr }) => {
	/** create statusBadge */
	let color: "gray" | "green" | "tomato" = "gray";
	switch (attr) {
		case "Pending Input":
			color = "gray";
			break;
		case "Pass":
			color = "green";
			break;
		case "Fail":
			color = "tomato";
			break;
		default:
			color = "gray";
	}

	return (
		<Flex key={`${siteKey}-badge`} p={"2"} gap={"2"}>
			<Badge id={`${siteKey}-badge`} color={color} size={"2"}>
				{attr}
			</Badge>
		</Flex>
	);
};

const RegisterConfigButton = ({ registable, renderObj }: { registable: boolean; renderObj: registerObjFlex }): JSX.Element => {
	const [dialogOpenState, setDialogOpenState] = useState(false);
	const saveResult = useRef({ saved: false, dialogMessage: "" });
	return (
		<>
			<Box key={"registerConfigButton"} display={"inline-block"}>
				<Button
					size={"3"}
					m={"2"}
					color="green"
					disabled={!registable}
					onClick={async () => {
						saveResult.current = await saveRegisterConfig(renderObj);
						setDialogOpenState(true);
						console.log(saveResult, dialogOpenState);
					}}
				>
					Save Scraper Configuration
				</Button>
			</Box>
			{dialogOpenState && <RegisterConfigSaveDialog result={saveResult.current} />}
		</>
	);
};

const RegisterConfigSaveDialog = ({ result }: { result: { saved: boolean; dialogMessage: string } }) => {
	console.log("registerConfigDialog!");
	const [open, setOpen] = useState(true);
	const setRegisterObj = useContext(setRegisterObjContext);
	return (
		<AlertDialog.Root key={"registerConfigSaveDialog"} defaultOpen={true} open={open} onOpenChange={setOpen}>
			<AlertDialog.Portal>
				<AlertDialog.Overlay className="AlertDialogOverlay" />
				<AlertDialog.Content className="AlertDialogContent">
					<AlertDialog.Title className="AlertDialogTitle">{result.saved ? "Success!" : "Save failed"}</AlertDialog.Title>
					<AlertDialog.Description className="AlertDialogDescription">{result.dialogMessage}</AlertDialog.Description>
					<AlertDialog.Cancel asChild>
						<Button className="mauve" size={"2"} color={"gray"} type="button" onClick={() => result.saved && setRegisterObj(rObj)}>
							Close
						</Button>
					</AlertDialog.Cancel>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
};

export default function InputTable() {
	const [registerObj, setRegisterObj] = useState(rObj as registerObjFlex);
	//useState fn wrapper
	function updateRegisterObj(siteKey: string, keyValArr: registerUpdateArg): void {
		const obj = registerUpdate(registerObj, siteKey, keyValArr);
		setRegisterObj(obj as registerObj);
	}

	//reset the input page when registration completed successfully
	// function usePageReset() {
	// 	setRegisterObj(rObj);
	// 	usePageReload();
	// }

	//Create a flat OoO that only contains rendering objects
	const renderObj: registerObjFlex = registerFlat(registerObj);
	const registable = isRegisterable(renderObj);
	console.log(renderObj);
	return (
		<>
			<registerObjContext.Provider value={registerObj}>
				<UpdaterContext.Provider value={updateRegisterObj}>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
								<Table.ColumnHeaderCell>Input</Table.ColumnHeaderCell>
								<Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
							</Table.Row>
						</Table.Header>
						<Table.Body className="inputFields">
							{Object.entries(renderObj).map(([key, params]) => {
								return <TableRow key={`${key}-tableRow`} siteKey={key} params={params} />;
							})}
						</Table.Body>
					</Table.Root>

					<setRegisterObjContext.Provider value={setRegisterObj}>
						<RegisterConfigButton registable={registable} renderObj={renderObj} />
					</setRegisterObjContext.Provider>
				</UpdaterContext.Provider>
			</registerObjContext.Provider>
		</>
	);
}

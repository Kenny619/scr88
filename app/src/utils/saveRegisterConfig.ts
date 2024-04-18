import type { registerObjFlex } from "../../typings";
import fetchPost from "./fetch";
type ReturnSaveRegisterConfig = { saved: boolean; dialogMessage: string };
const saveRegisterConfig = async (rednerObj: registerObjFlex): Promise<ReturnSaveRegisterConfig> => {
	const keys = Object.keys(rednerObj);
	const vals = Object.values(rednerObj)
		.map((v) => {
			return v.input.method === "toggle" ? v.value : `'${v.value}'`;
		})
		.join(",");

	const postData = { key: keys, val: vals };
	const res = await fetchPost(`${process.env.REACT_APP_REGISTER_API_ADDR}/saveconfig`, postData);
	return res.pass ? { saved: true, dialogMessage: res.result } : { saved: false, dialogMessage: res.errMsg };
};

export default saveRegisterConfig;

/*
test cases:
 wrong server address:
 invalid endpoint
 empty post data:
 invalid post data format:
 correct post data format, failed result:
 correct post data format, correct result: 
*/

import fetchPost from "../app/src/utils/fetch.js";

const invalidServerAddress = "http://localhost:3003/register";
const validServerAddress = "http://localhost:3001/register";
const invalidEndPoint = "/urll";
const validEndPoint = "/url";
const emptyPostData = {};
const invalidPostData = { key: "rooUrl", input: "https://www.google.com" };
const validPostData = { key: "rootUrl", input: "https://www.google.com" };

describe("fetchPost", () => {
	test("incorrect server address", async () => {
		expect(fetchPost(`${invalidServerAddress}${validEndPoint}`, validPostData)).rejects.toThrow(/fetch API failed/);
	});

	test("Invalid enpoint", async () => {
		expect(fetchPost(`${validServerAddress}${invalidEndPoint}`, validPostData)).rejects.toThrow(/Endpoint not found/);
	});

	test("Valid post data format", async () => {
		const res = await fetchPost(`${validServerAddress}${validEndPoint}`, validPostData);
		console.log(res);
		expect(res).toBeTruthy;
		expect(res).toMatchObject({ pass: true, result: validPostData.input });
	});
});

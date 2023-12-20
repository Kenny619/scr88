import { describe, expect, test } from "vitest";
import userAgent from "../dist/app/utils/userAgents";

describe("random userAgent", () => {
	const ua1 = userAgent();
	const ua2 = userAgent();

	test("get user-agent #1", () => {
		expect(ua1).toBeDefined();
		expect(ua1).toBeTypeOf("string");
		expect(ua1).toBeTruthy(ua1.includes("Windows"));
		console.log("user-agent #1:", ua1);
	});

	test("get user-agent #2", () => {
		expect(ua2).toBeDefined();
		expect(ua2).toBeTypeOf("string");
		expect(ua2).toBeTruthy(ua2.includes("Windows"));
		console.log("user-agent #2:", ua2);
	});

	test("user-agents are switched everytime userAgent() is called", () => {
		expect(ua1 !== ua2).toBe(true);
	});
});

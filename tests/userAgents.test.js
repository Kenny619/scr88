import { expect, test } from "vitest";
import userAgent from "../dist/app/utils/userAgents";

test("random userAgent", async () => {
	const ua1 = await userAgent();
	const ua2 = await userAgent();

	expect(ua1).toBeDefined();
	expect(ua1).toBeTypeOf("string");
	expect(ua1).toBeTruthy(ua1.includes("Windows"));

	expect(ua2).toBeDefined();
	expect(ua2).toBeTypeOf("string");
	expect(ua2).toBeTruthy(ua2.includes("Windows"));
	expect(ua1 !== ua2).toBe(true);
});

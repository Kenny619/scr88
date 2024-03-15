import { JSDOM, ResourceLoader } from "jsdom";
import userAgent from "../dist/app/utils/userAgents.js";

const re = "12\\";
try {
	const regex = new RegExp(re);
	//console.log(regex);
} catch (e) {
	console.log(e);
}

console.log("this is the end of code.");

const loader = new ResourceLoader({
	userAgent: userAgent(),
});
async function serialize() {
	try {
		const url = "https://enigma2.ahoseek.com/";

		const jd = await JSDOM.fromURL(url, { resources: loader });
		const sdom = jd.serialize();
		const rdom = new JSDOM(sdom);
		const extracted = rdom.window.document.querySelectorAll("a.entry-read-link");
		if (extracted) {
			const links = Array.from(extracted).map((el) => el.outerHTML);

			const rlinks = links.map((st) => {
				const eldom = new JSDOM(st);
				return eldom.window.document.querySelector("a.entry-read-link").getAttribute("href");
			});
			console.log(rlinks);
		}
	} catch (e) {
		throw new Error(e);
	}
}

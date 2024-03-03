import https from "https";
const r = 1; //null;

const fallback = () => "fallback executed!";

const m = r ?? fallback();

const url = "https://qiita.com/n0bisuke/items/788dc4379fd57e8453a3";
const urlF = "https://qiita.com/n0bisuke/items/788dc4379fd57e84";

/**
 * https
	.get(urlF, (res) => {
		let data = "";
		res.on("data", (chunk) => {
			data += chunk;
		});
		res.on("end", () => {
			console.log(data);
		});
	})
	.on("error", (err) => {
		console.log(err);
	});
*/

https
	.get(urlF, (res) => {
		console.log(typeof res.statusCode);
	})
	.on("error", (err) => {
		console.log(err);
	});

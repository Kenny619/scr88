import https from "https";
const url = "https://qiita.com/n0bisuke/items/788dc4379fd57e8453a3";
const urlF = "https://qiita.com/n0bisuke/items/788dc4379fd57e84";

export function isURLalive(url: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		https
			.get(url, (res) => {
				(res.statusCode as number) < 400 ? resolve(true) : reject(false);
			})
			.on("error", (e) => {
				reject(false);
			});
	});
}

console.log(await isURLalive(url));

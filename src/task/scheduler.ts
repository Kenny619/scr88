import mysql from "mysql2/promise";
type getScrapersResult =
	| {
			id: number;
			name: string;
			lastRun: null | string;
			nextRunSchedule: null | string;
	  }[]
	| string;

const mysqlEnv = {
	host: process.env.DB_HOST as string,
	port: Number(process.env.DB_PORT),
	user: process.env.DB_USER as string,
	password: process.env.DB_PASSWORD as string,
	database: "scr88",
	namedPlaceholders: true,
};

async function main() {
	const results = await getScrapersMysql();
	if (Array.isArray(results)) {
		for (const { id, name, lastRun, nextRunSchedule } of results) {
			console.log(`${id} ${name} ready to run? ${runScheduleDue(lastRun)}. when's next? ${nextRunSchedule || "TBC"}`);
		}
		return;
	}
	console.log(results);
	return;
}

async function getScrapersMysql(): Promise<getScrapersResult> {
	const connection = await mysql.createConnection(mysqlEnv);
	try {
		const [results] = await connection.query("SELECT id,name,lastRun,nextRunScheduled FROM scrapers;");
		return results as getScrapersResult;
	} catch (e) {
		return typeof e === "object" ? (JSON.stringify(e) as string) : (e as string);
	} finally {
		connection.end();
	}
}

function runScheduleDue(lastRun: null | string): boolean {
	if (lastRun) {
		const lastRunDT = new Date(lastRun).getTime();
		return lastRunDT >= new Date().getTime() ? true : false;
	}

	const tmpDT = new Date("2024-04-10 17:10:00").getTime();
	return tmpDT >= new Date().getTime() ? true : false;
}

//run checker hourly
setInterval(async () => {
	await main();
}, 3600 * 1000);

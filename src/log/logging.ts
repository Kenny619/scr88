import fs from "node:fs";

/*
LOG format
datetime appName eventName Level Message
*/

type baseObj = {
	createdAt: string; //YYYY-MM-DD HH:MM:SS
	appName: string;
	eventname: string;
	level: "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG";
	messsage: string;
};
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type logObj = baseObj & Record<string, any>;
class Log {
	private static instance: Log;
	private static filePath: string;
	private static appName: string;
	private constructor() {
		// Log.filePath = "";
		// Log.appName = "";
	}

	static init(appName: string, logFilePath: string) {
		fs.stat(logFilePath, (err) => {
			if (err) throw new Error(`Could not find log file ${logFilePath}.  ERROR: ${err}`);
		});

		if (Log.instance) {
			return Log.instance;
		}
		Log.instance = new Log();
		Log.filePath = logFilePath;
		Log.appName = appName;
		return Log.instance;
	}

	static record(level: baseObj["level"], eventName: string, message: string) {
		const obj: Partial<logObj> = {};
		obj.createdAt = new Date().toISOString();
		obj.appName = Log.appName;
		obj.eventname = eventName;
		obj.level = level;
		obj.messsage = message;
		const log = Object.values(obj).join("\t");
		fs.appendFile(Log.filePath, log, (err) => {
			if (err) throw new Error(`Failed to record application log to ${Log.filePath}. ERROR:${err}`);
		});
	}

	static debug(eventName: string, message: string) {
		Log.record("DEBUG", eventName, message);
	}

	static info(eventName: string, message: string) {
		Log.record("INFO", eventName, message);
	}

	static warn(eventName: string, message: string) {
		Log.record("WARN", eventName, message);
	}

	static error(eventName: string, message: string) {
		Log.record("ERROR", eventName, message);
	}

	static fatal(eventName: string, message: string) {
		Log.record("FATAL", eventName, message);
	}
}
export default Log;

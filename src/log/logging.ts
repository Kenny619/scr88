type baseObj = {
	type: "error" | "warning" | "success" | "comment";
	createdAt: string; //YYYY-MM-DD HH:MM:SS
	source: string;
	messsage: string;
};
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type logObj = baseObj & Record<string, any>;
class Log {
	private static instance: Log;
	private static logs: logObj[] = [];
	private constructor() {
		Log.logs = [];
	}

	static init() {
		if (Log.instance) {
			return Log.instance;
		}
		Log.instance = new Log();
		return Log.instance;
	}

	static record(obj: logObj) {
		Log.logs.push(obj);
	}

	static export() {
		return Log.logs;
	}
}

export default Log;

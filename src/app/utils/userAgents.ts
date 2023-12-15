export default async function userAgent(): Promise<string> {
	try {
		const res = await fetch("https://jnrbsn.github.io/user-agents/user-agents.json");
		const uaList = await res.json();
		const os = {
			win32: "Windows",
			linux: "Linux",
			darwin: "Mac OS",
			aix: "AIX",
			freebsd: "FreeBSD",
			openbsd: "OpenBSD",
			android: "Android",
			haiku: "Haiku",
			sunos: "SunOS",
			cygwin: "Cygwin",
			netbsd: "NetBSD",
		};
		const userAgents = uaList.filter((ua: string) => {
			ua.includes(os[process.platform]);
		});

		return userAgents[Math.floor(Math.random() * userAgents.length)];
	} catch (e) {
		return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"; //fallback
	}
}

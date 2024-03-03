const cachedUserAgents: string[] = await fetchUserAgents();
let lastReturnedUserAgent: string;

async function fetchUserAgents() {
	try {
		const res = await fetch("https://jnrbsn.github.io/user-agents/user-agents.json");
		const uajson = await res.json();
		return uajson;
	} catch (e) {
		// Handle fetch error
		console.error("Failed to fetch user agents:", e);
		return [];
	}
}

export default function userAgent(): string {
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

	const fallbacks = {
		win32:
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
		linux: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
		darwin:
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
		aix: "Mozilla/5.0 (X11; U; AIX 005A471A4C00; en-US; rv:1.0rc2) Gecko/20020514",
		freebsd: "Mozilla/5.0 (X11; FreeBSD amd64; rv:109.0) Gecko/20100101 Firefox/113.0",
		openbsd:
			"Mozilla/5.0 (X11; U; OpenBSD arm; en-us) AppleWebKit/531.2+ (KHTML, like Gecko) Safari/531.2+ Epiphany/2.30.0",
		android:
			"Mozilla/5.0 (Linux; Android 11; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36",
		haiku:
			"Mozilla/5.0 (X11; Haiku x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Falkon/23.08.3 QtWebEngine/5.15.17 Chrome/87.0.4280.144 Safari/537.36",
		sunos: "Mozilla/5.0",
		cygwin: "Mozilla/5.0",
		netbsd: "Mozilla/5.0 (X11; NetBSD amd64; rv:109.0) Gecko/20100101 Firefox/117.0",
	};

	const userAgents = cachedUserAgents.filter((agent) => agent.includes(os[process.platform]));

	if (userAgents.length > 1) {
		let randomIndex;
		do {
			randomIndex = Math.floor(Math.random() * userAgents.length);
		} while (userAgents[randomIndex] === lastReturnedUserAgent);

		lastReturnedUserAgent = userAgents[randomIndex];
	} else {
		lastReturnedUserAgent = userAgents[0];
	}

	return lastReturnedUserAgent || fallbacks[process.platform];
}

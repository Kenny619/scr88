const postOption: RequestInit = {
	method: "POST",
	mode: "cors",
	headers: { "Content-Type": "application/json" },
	credentials: "include",
	//signal: AbortSignal.timeout(10000),
};
type PostData = { [key: string]: unknown };
type Response = { pass: true; result: string } | { pass: false; errMsg: string };
type FetchPost = (endpoint: string, postData: PostData, option?: RequestInit) => Promise<Response>;
const fetchPost: FetchPost = async (endpoint, postData, option = postOption) => {
	const body = { body: JSON.stringify(postData) };
	try {
		const response = await fetch(endpoint, { ...option, ...body });
		if (!response.ok) {
			throw new Error(`network error.  error status: ${response.statusText}`);
		}
		return await response.json();
	} catch (e) {
		if (e instanceof Error && e.message.match("network error.  error status: Not Found")) {
			throw new Error("Error:  Endpoint not found");
		}
		if (e instanceof Error) {
			switch (e.name) {
				case "TimeoutError":
					throw new Error("Timeout Error");
				case "AbortError":
					throw new Error("Error: Request aborted by client action");
				case "TypeError":
					throw new Error(`Error: fetch API failed.  Most likely an error in the internet connection or invalid target server/endpoint.  ${e.name} ${e.cause} ${e.message}`);
				default:
					throw new Error(`Error: type: ${e.name}, message: ${e.message}`);
			}
		}
		throw new Error(`Error: ${e}`);
	}
};

export default fetchPost;

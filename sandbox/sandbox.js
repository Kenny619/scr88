const registerObj = {
	name: {
		label: "Scraper config name",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: "/name",
		extracted: null,
	},

	rootUrl: {
		label: "Target site FQDN",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: "/url",
		extracted: null,
	},

	entryUrl: {
		label: "Target site entry point URL",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: "/url",
		extracted: null,
	},

	language: {
		label: "Target site language JP or EN",
		input: { method: "select", defaultValue: null, choices: ["JP", "EN"] },
		value: null,
	},

	siteType: {
		label: "Target site page structure",
		input: {
			method: "select",
			defaultValue: null,
			choices: ["links", "single", "multiple"],
		},
		value: null,
		child: {
			links: {
				label: "CSS link selector for links on the index page.",
				input: {
					method: "text",
					defaultValue: null,
					choices: null,
				},
				value: null,
				badgeStatus: "Pending Input",
				errorMsg: null,
				preValidation: null,
				apiEndPoint: "/indexlinks",
				extracted: null,
			},
			multiple: {
				label: "CSS selector for article blocks",
				input: {
					method: "text",
					defaultValue: null,
					choices: null,
				},
				value: null,
				badgeStatus: "Pending Input",
				errorMsg: null,
				preValidation: null,
				apiEndPoint: "/nodes",
				extracted: null,
			},
		},
	},
	nextPageType: {
		label: "Next page URL source",
		input: {
			method: "select",
			defaultValue: null,
			choices: ["last", "parameter", "url", "next", "pagenation"],
		},
		value: null,
		child: {
			last: {
				label: "CSS link selector of last URL",
				input: {
					method: "text",
					defaultValue: null,
					choices: null,
				},
				value: null,
				badgeStatus: "Pending Input",
				errorMsg: null,
				preValidation: null,
				apiEndPoint: "/lasturl",
				extracted: null,
				child: {
					lastPageNumberRegExp: {
						label: "Last URL pageNumber RegExp",
						input: {
							method: "text",
							defaultValue: null,
							choices: null,
						},
						value: null,
						badgeStatus: "Pending Input",
						errorMsg: null,
						preValidation: null,
						apiEndPoint: "/lasturlregex",
						extracted: null,
					},
				},
			},

			parameter: {
				label: "URL parameter name for page number",
				input: {
					method: "text",
					defaultValue: null,
					choices: null,
				},
				value: null,
				badgeStatus: "Pending Input",
				errorMsg: null,
				preValidation: null,
				apiEndPoint: "/parameter",
				extracted: null,
			},

			next: {
				label: "CSS selector for acquiring the next page URL",
				input: {
					method: "text",
					defaultValue: null,
					choices: null,
				},
				value: null,
				badgeStatus: "Pending Input",
				errorMsg: null,
				preValidation: null,
				apiEndPoint: "/link",
				extracted: null,
			},

			url: {
				label: "Regex for acquiring the page number within the URL",
				input: {
					method: "text",
					defaultValue: null,
					choices: null,
				},
				value: null,
				badgeStatus: "Pending Input",
				errorMsg: null,
				preValidation: null,
				apiEndPoint: "/nexturlregex",
				extracted: null,
			},
		},
	},
	tagFiltering: {
		label: "Enable to scrape articles that match the tags",
		input: {
			method: "toggle",
			defaultValue: false,
			choices: [true, false],
		},
		value: false,
		child: {
			tags: {
				label: "Provide tags for tag filtering.",
				input: {
					method: "text",
					defaultValue: null,
					choices: null,
				},
				value: null,
				badgeStatus: "Pending Input",
				errorMsg: null,
				preValidation: null,
				apiEndPoint: null,
				extracted: null,
			},
		},
	},
	tagCollect: {
		label: "Enable to scrape article tags",
		input: {
			method: "toggle",
			defaultValue: false,
			choices: [true, false],
		},
		value: false,
		child: {
			articleTagSelector: {
				label: "CSS selector for article tags",
				input: {
					method: "text",
					defaultValue: null,
					choices: null,
				},
				value: null,
				badgeStatus: "Pending Input",
				errorMsg: null,
				preValidation: null,
				apiEndPoint: "/text",
				extracted: null,
			},
		},
	},
	articleTitleSelector: {
		label: "CSS selector for article title",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: "/text",
		extracted: null,
	},
	articleBodySelector: {
		label: "CSS selector for article body",
		input: {
			method: "text",
			defaultValue: null,
			choices: null,
		},
		value: null,
		badgeStatus: "Pending Input",
		errorMsg: null,
		preValidation: null,
		apiEndPoint: "/text",
		extracted: null,
	},
};

function update(siteKey, updateObj, obj) {
	for (const key in obj) {
		if (key === siteKey) {
			for (const uObj of updateObj) {
				obj[key] = { ...obj[key], ...uObj };
			}
		}

		if (Object.hasOwn(obj[key], "child")) {
			update(siteKey, updateObj, obj[key].child);
		}
	}

	return obj;
}

const showFields = (registerObj) => {
	for (const [k, v] of Object.entries(registerObj)) {
		console.log(k, v.value);

		if (Object.hasOwn(v, "child")) {
			if (v.input.method === "select" && v.value !== null) {
				const o = {};
				o[v.value] = v.child[v.value];
				showFields(o);
			}
			if ((v.input.method === "toggle" && v.value === true) || v.input.method === "text") {
				showFields(v.child);
			}
		}
	}
};

const showNewObj = (registerObj, output = {}) => {
	for (const [k, v] of Object.entries(registerObj)) {
		output[k] = v;

		if (Object.hasOwn(v, "child")) {
			if (v.input.method === "select" && v.value !== null) {
				const o = {};
				o[v.value] = v.child[v.value];
				showNewObj(o, output);
			}

			if ((v.input.method === "toggle" && v.value === true) || (v.input.method === "text" && v.value !== null)) {
				showNewObj(v.child, output);
			}
		}
	}
	return output;
};

const first = update("tagCollect", [{ value: true }], registerObj);
const updated = update("articleTagSelector", [{ value: "updated!" }], first);

const second = update("nextPageType", [{ value: "last" }], updated);
const third = update("last", [{ value: "this is the last url" }], updated);
const updatedd = update("lastPageNumberRegExp", [{ value: "this is also updated!" }, third]);

const registerGetKeys = (obj, mode, cond, output = []) => {
	if (mode === "parent") {
		return Object.entries(obj)
			.filter(([k, v]) => v.input.method === cond)
			.map(([k, v]) => k);
	}

	if (mode === "child") {
		for (const key in obj) {
			if (Object.hasOwn(obj[key], "child")) {
				const childNode = obj[key].child;
				const childKeys = Object.keys(childNode);
				obj[key].input.method === cond && output.push(...childKeys);
				registerGetKeys(childNode, mode, cond, output);
			}
		}
		return output;
	}

	return output;
};

const returnInt = () => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const randomInt = Math.floor(Math.random() * 100);
			randomInt % 2 ? resolve("x2") : reject("not x2");
		}, 500);
	});
};

const receiveInt = async () => {
	//return await returnInt();
	/*
	try {
		return await returnInt();
		//return true;
	} catch (e) {
		return e;
	}
	*/
};

const displayResult = async () => {
	console.log(await receiveInt());
};

displayResult();
//console.log(registerGetKeys(registerObj, "parent", "text"));
// console.dir(showNewObj(third));
//showFields(updated);

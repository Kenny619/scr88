import express from "express";
//import cookieParser from "cookie-parser";
//import cors from "cors";
//import session from "express-session";
//import { createClient } from "redis";
//import RedisStore from "connect-redis";
import * as val from "../utils/registerServices.js";
import { getSerializedDOM } from "../utils/registerHelper.js";
type result = { pass: true; result: string | string[] } | { pass: false; errMsg: unknown | string };
declare module "express-session" {
	interface SessionData {
		entryUrl?: string;
		articleUrl?: string;
		indexDOM?: string;
		articleDOM?: string;
		lastUrl?: string;
	}
}
//const app = express();
const register = express.Router();
/*
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(
	session({
		name: "scr88-register",
		secret: "secret_key",
		resave: false,
		saveUninitialized: false,
		//store: redisStore,
		cookie: { path: "/", httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 2 },
	}),
);
*/

const errorMessages = {
	entryUrl: "entryUrl input required",
	lastUrl: "lastUrl input required",
	indexDOM: "Failed to acquire index page DOM.  entryUrl input required",
	dom: (url: string, e: unknown) => `Faild to create DOM from URL ${url}\r\n<br>Error: ${e}`,
};

register.post("/name", async (req, res) => res.send(await val.name(req.body.name)));

register.post("/url", async (req, res) => {
	const vresult = await val.url(req.body.input);
	if (vresult.pass && req.body.key === "entryUrl") {
		req.session.entryUrl = req.body.input;
		req.session.articleUrl = req.body.input; //placeholder.  If the user chooses siteType="links", this will be updated with correct article URL.

		getDOM(req.body.input)
			.then((dom) => {
				req.session.indexDOM = dom;
				//	req.session.save((err) => err && console.log(err));
				res.send(vresult);
			})
			.catch((e) => res.send({ pass: false, errMsg: e }));
	} else {
		res.send(vresult);
	}
});

register.post("/lasturl", (req, res) => {
	if (req.session.indexDOM) {
		const vresult = val.testSelector("link", req.session.indexDOM, req.body.input);
		if (vresult.pass) req.session.lastUrl = vresult.result as string;
		res.send(vresult);
	} else {
		res.send({ pass: false, errMsg: errorMessages.entryUrl });
	}
});

register.post("/lasturlregex", async (req, res) => {
	if (req.session.lastUrl) {
		let vresult: result;
		vresult = val.regex(req.session.lastUrl, req.body.input);
		vresult = await generateArticleDOM(req.session, vresult);
		res.send(vresult);
	} else {
		res.send({ pass: false, errMsg: errorMessages.lastUrl });
	}
});

register.post("/parameter", async (req, res) => {
	if (req.session.entryUrl) {
		let vresult: result;
		vresult = await val.parameter(req.session.entryUrl, req.body.input);
		vresult = await generateArticleDOM(req.session, vresult);
		res.send(vresult);
	} else {
		res.send({ pass: false, errMsg: errorMessages.entryUrl });
	}
});

register.post("/pagenuminurl", async (req, res) => {
	if (req.session.entryUrl) {
		let vresult: result;
		vresult = await val.pageNumInUrl(req.session.entryUrl, req.body.input);
		vresult = await generateArticleDOM(req.session, vresult);
		res.send(vresult);
	} else {
		res.send({ pass: false, errMsg: errorMessages.entryUrl });
	}
});

register.post("/nexturlregex", async (req, res) => {
	if (req.session.entryUrl) {
		let vresult: result;
		vresult = val.regex(req.session.entryUrl, req.body.input);
		vresult = await generateArticleDOM(req.session, vresult);
		res.send(vresult);
	} else {
		res.send({ pass: false, errMsg: errorMessages.entryUrl });
	}
});

register.post("/nexturl", async (req, res) => {
	if (req.session.indexDOM) {
		let vresult: result;
		vresult = val.testSelector("link", req.session.indexDOM, req.body.input);
		vresult = await generateArticleDOM(req.session, vresult);
		res.send(vresult);
	} else {
		res.send({ pass: false, errMsg: errorMessages.entryUrl });
	}
});

register.post("/indexlinks", async (req, res) => {
	if (req.session.indexDOM) {
		const vresult = val.testSelector("links", req.session.indexDOM, req.body.input);
		if (vresult.pass) {
			req.session.articleUrl = vresult.result[0];
			getDOM(req.session.articleUrl)
				.then((dom) => {
					req.session.articleDOM = dom;
					res.send(vresult);
				})
				.catch((e) => res.send({ pass: false, errMsg: e }));
		}
	} else {
		res.send({ pass: false, errMsg: errorMessages.entryUrl });
	}
});

register.post("/link", (req, res) => {
	req.session.indexDOM ? res.send(val.testSelector("link", req.session.indexDOM, req.body.input)) : res.send({ pass: false, errMsg: errorMessages.entryUrl });
});

register.post("/links", (req, res) => {
	req.session.indexDOM ? res.send(val.testSelector("links", req.session.indexDOM, req.body.input)) : res.send({ pass: false, errMsg: errorMessages.entryUrl });
});

register.post("/text", (req, res) => {
	req.session.articleDOM ? res.send(val.testSelector("text", req.session.articleDOM, req.body.input)) : res.send({ pass: false, errMsg: errorMessages.entryUrl });
});

register.post("/texts", (req, res) => {
	req.session.articleDOM ? res.send(val.testSelector("texts", req.session.articleDOM, req.body.input)) : res.send({ pass: false, errMsg: errorMessages.entryUrl });
});

register.post("/articleblock", (req, res) => {
	if (req.session.articleDOM) {
		const vresult = val.testSelector("nodes", req.session.articleDOM, req.body.input);
		if (vresult.pass) {
			req.session.articleDOM = vresult.result[0] as string;
		}
		res.send(vresult);
	} else {
		res.send({ pass: false, errMsg: errorMessages.entryUrl });
	}
});

export default register;

async function getDOM(nextUrl: string | string[]) {
	const url = Array.isArray(nextUrl) ? nextUrl[0] : nextUrl;

	try {
		const dom = await getSerializedDOM(url);
		return dom;
	} catch (e) {
		throw new Error(`Faild to create DOM from URL ${url}\r\n<br>Error: ${e}`);
	}
}

async function generateArticleDOM(session: Express.Request["session"], vresult: result): Promise<result> {
	if (!session.articleUrl) {
		return { pass: false, errMsg: errorMessages.entryUrl };
	}
	if (vresult.pass) {
		let vr: result = vresult;
		try {
			session.articleDOM = await getDOM(session.articleUrl);
		} catch (e) {
			vr = { pass: false, errMsg: e };
		}
		return vr;
	}
	return vresult;
}

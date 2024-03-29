import express from "express";
//import cookieParser from "cookie-parser";
//import cors from "cors";
//import session from "express-session";
//import { createClient } from "redis";
//import RedisStore from "connect-redis";
import * as val from "../utils/registerServices.js";
import { getSerializedDOM } from "../utils/registerHelper.js";
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
async function generateDOM(session: Express.Request["session"]) {
	if (session.entryUrl && !session.indexDOM) {
		session.indexDOM = await getSerializedDOM(session.entryUrl);
	}
	if (session.articleUrl && !session.articleDOM) {
		session.articleDOM = await getSerializedDOM(session.articleUrl);
	}
}

register.post("/name", async (req, res) => {
	const vresult = await val.name(req.body.name);
	res.send(vresult);
});

register.post("/url", async (req, res) => {
	const vresult = await val.url(req.body.input);
	if (vresult.pass) {
		if (req.body.key === "entryUrl") {
			req.session.entryUrl = vresult.result;
			req.session.articleUrl = vresult.result;
			req.session.indexDOM = await getSerializedDOM(req.body.input);
			req.session.articleDOM = req.session.indexDOM;
		}
		req.session.save((err) => {
			if (err) {
				console.log(err);
			}
		});
	}
	res.send(vresult);
});

register.post("/lasturlregex", (req, res) => {
	if (req.session.lastUrl) {
		res.send(val.regex(req.body.input, req.session.lastUrl));
	} else {
		res.send({
			pass: false,
			errMsg: "lastUrl input required",
		});
	}
});

register.post("/parameter", async (req, res) => {
	req.session.entryUrl ? res.send(await val.parameter(req.body.parameter, req.session.entryUrl)) : res.send({ pass: false, errMsg: "entryUrl input required" });
});

register.post("/pagenuminurl", async (req, res) => {
	req.session.entryUrl ? res.send(await val.pageNumInUrl(req.body.regex, req.session.entryUrl)) : res.send({ pass: false, errMsg: "entryUrl input required" });
});

register.post("/nexturlregex", async (req, res) => {
	req.session.entryUrl ? res.send(await val.regex(req.body.regex, req.session.entryUrl)) : res.send({ pass: false, errMsg: "entryUrl input required" });
});
register.post("/nexturl", async (req, res) => {
	req.session.entryUrl ? res.send(await val.link(req.body.input, req.session.entryUrl)) : res.send({ pass: false, errMsg: "entryUrl input required" });
});

register.post("/lasturl", async (req: express.Request, res: express.Response) => {
	console.log(req.session);
	if (req.session.indexDOM) {
		const vresult = await val.link(req.body.input, req.session.indexDOM);
		if (vresult.pass) {
			req.session.lastUrl = vresult.result;
		}
		res.send(vresult);
	} else {
		res.send({
			pass: false,
			errMsg: "entryUrl input required",
		});
	}
});

register.post("/indexlinks", async (req, res) => {
	if (req.session.indexDOM) {
		const vresult = await val.links(req.body.input, req.session.indexDOM);

		if (vresult.pass) {
			req.session.articleUrl = vresult.result[0];
			req.session.articleDOM = await getSerializedDOM(req.session.articleUrl);
		}
		res.send(vresult);
	} else {
		res.send({
			pass: false,
			errMsg: "entryUrl input required",
		});
	}
});

register.post("/link", async (req, res) => {
	await generateDOM(req.session);

	req.session.indexDOM
		? res.send(await val.link(req.body.input, req.session.indexDOM))
		: res.send({
				pass: false,
				errMsg: "entryUrl input required",
		  });
});

register.post("/links", async (req, res) => {
	await generateDOM(req.session);

	req.session.indexDOM
		? res.send(await val.links(req.body.input, req.session.indexDOM))
		: res.send({
				pass: false,
				errMsg: "entryUrl input required",
		  });
});
register.post("/text", async (req, res) => {
	if (req.session.articleDOM) {
		res.send(await val.text(req.body.input, req.session.articleDOM));
	}
});

register.post("/texts", async (req, res) => {
	if (req.session.articleDOM) {
		res.send(await val.texts(req.body.input, req.session.articleDOM));
	}
});

register.post("/articleblock", async (req, res) => {
	if (req.session.articleDOM) {
		const vresult = await val.nodes(req.body.input, req.session.articleDOM);
		if (vresult.pass) {
			req.session.articleDOM = vresult.result[0] as string;
		}
		res.send(vresult);
	} else {
		res.send({ pass: false, errMsg: "entryUrl input required" });
	}
});

export default register;

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
//import { createClient } from "redis";
//import RedisStore from "connect-redis";
import * as val from "./utils/registerServices.js";
import { getSerializedDOM } from "./utils/registerHelper.js";

declare module "express-session" {
	interface SessionData {
		entryUrl?: string;
		rootUrl?: string;
		articleUrl?: string;
		indexDOM?: string;
		articleDOM?: string;
	}
}

const app = express();
/*
const redisClient = await createClient()
	.on("error", (err) => console.log("Redis Client Error", err))
	.connect();

const redisStore = new RedisStore({ client: redisClient, prefix: "scr88:" });
*/
app.use(express.json());
app.use(cookieParser());
app.use(cors());
/*
app.use((req, res, next) => {
	// CORS headers
	res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
	res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
	// Set custom headers for CORS
	res.header("Access-Control-Allow-Headers", "Content-type,Accept,X-Custom-Header");
	//res.header("Content-Type", "application/json; charset=utf-8");
	res.header("Access-Control-Allow-Credentials", true);

	if (req.method === "OPTIONS") {
		return res.status(200).end();
	}

	return next();
});
*/
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
async function generateDOM(session: Express.Request["session"]) {
	if (session.entryUrl && !session.indexDOM) {
		session.indexDOM = await getSerializedDOM(session.entryUrl);
	}
	if (session.articleUrl && !session.articleDOM) {
		session.articleDOM = await getSerializedDOM(session.articleUrl);
	}
}

app.post("/url", async (req, res) => {
	const result = await val.url(req.body.url);
	if (result.pass) {
		if (req.body.key === "rootUrl") req.session.rootUrl = result.result as string;
		if (req.body.key === "entryUrl") {
			req.session.entryUrl = result.result as string;
			req.session.articleUrl = result.result as string;
			req.session.indexDOM = await getSerializedDOM(req.body.url);
			req.session.articleDOM = req.session.indexDOM as string;
		}
	}
	res.send(result);
});

app.post("/regex", (req, res) => {
	res.send(val.regex(req.body.regex, req.body.string as string));
});

app.post("/parameter", async (req, res) => {
	console.log(req.body);
	res.send(await val.parameter(req.body.parameter, req.session.entryUrl as string));
});

app.post("/pagenuminurl", async (req, res) => {
	res.send(await val.pageNumInUrl(req.body.regex, req.session.entryUrl as string));
});

app.post("/nexturl", async (req, res) => {
	res.send(await val.link(req.body.selector, req.session.entryUrl as string));
});

app.post("/indexlinks", async (req, res) => {
	if (req.session.indexDOM) {
		const vresult = await val.links(req.body.selector, req.session.indexDOM);

		if (vresult.pass) {
			req.session.articleUrl = vresult.result[0] as string;
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

app.post("/link", async (req, res) => {
	await generateDOM(req.session);

	if (req.session.indexDOM) {
		res.send(await val.link(req.body.selector, req.session.indexDOM));
	} else {
		res.send({
			pass: false,
			errMsg: "entryUrl input required",
		});
	}
});

app.post("/text", async (req, res) => {
	if (req.session.articleDOM) {
		res.send(await val.text(req.body.selector, req.session.articleDOM));
	}
});

app.post("/texts", async (req, res) => {
	if (req.session.articleDOM) {
		res.send(await val.texts(req.body.selector, req.session.articleDOM));
	}
});

app.post("/articleblock", async (req, res) => {
	await generateDOM(req.session);
	const vresult = await val.nodes(req.body.selector, req.session.articleDOM as string);
	if (vresult.pass) {
		req.session.articleDOM = vresult.result[0] as string;
		res.send(vresult);
	}
	res.send(vresult);
});

app.listen(3001, () => console.log("Running Express for scr88-register API"));

import express from "express";
import cors from "cors";
import session from "express-session";
import register from "./routes/register.routes.js";
//import { createClient } from "redis";
//import RedisStore from "connect-redis";

const app = express();
/*
const redisClient = await createClient()
	.on("error", (err) => console.log("Redis Client Error", err))
	.connect();

const redisStore = new RedisStore({ client: redisClient, prefix: "scr88:" });
*/
app.use(express.json());
//app.use(cookieParser());
//app.set("trust proxy", 1);
app.use(
	session({
		name: "scr88-register",
		secret: "scr88register",
		resave: true,
		saveUninitialized: true,
		//store: redisStore,
		//		proxy: true,
		cookie: {
			path: "/register",
			httpOnly: true,
			domain: "localhost",
			secure: false,
			sameSite: "strict",
			maxAge: 1000 * 60 * 60 * 2,
		},
	}),
);

app.use(
	cors({
		credentials: true,
		origin: "http://localhost:3000", //specify origin URL.  do not set it to true.
	}),
);

app.use("/register", register);

//routing

app.listen(3001, () => console.log("Register API server running on port 3001"));

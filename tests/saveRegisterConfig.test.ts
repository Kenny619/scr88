/*
test cases:
 wrong server address:
 invalid endpoint
 empty post data:
 invalid post data format:
 correct post data format, failed result:
 correct post data format, correct result: 
*/

import fetchPost from "../app/src/utils/fetch";

const rObj = {
	name: {
		label: "Scraper config name",
		input: {
			method: "text",
			defaultValue: null,
		},
		value: "enigma",
		badgeStatus: "Pass",
		errorMsg: "",
		preValidation: null,
		apiEndPoint: "/name",
		extracted: "Valid name",
	},
	rootUrl: {
		label: "Target site FQDN",
		input: {
			method: "text",
			defaultValue: null,
		},
		value: "https://enigma2.ahoseek.com/",
		badgeStatus: "Pass",
		errorMsg: "",
		preValidation: ["url"],
		apiEndPoint: "/url",
		extracted: "https://enigma2.ahoseek.com/",
	},
	entryUrl: {
		label: "Target site entry point URL",
		input: {
			method: "text",
			defaultValue: null,
		},
		value: "https://enigma2.ahoseek.com/",
		badgeStatus: "Pass",
		errorMsg: "",
		preValidation: ["url"],
		apiEndPoint: "/url",
		extracted: "https://enigma2.ahoseek.com/",
	},
	language: {
		label: "Target site language JP or EN",
		input: {
			method: "select",
			defaultValue: null,
			choices: ["JP", "EN"],
		},
		value: "JP",
	},
	siteType: {
		label: "Target site page structure",
		input: {
			method: "select",
			defaultValue: null,
			choices: ["links", "single", "multiple"],
		},
		value: "links",
		child: {
			links: {
				label: "CSS link selector for links on the index page.",
				input: {
					method: "text",
					defaultValue: null,
				},
				value: "a.entry-read-link",
				badgeStatus: "Pass",
				errorMsg: "",
				preValidation: ["entryUrl"],
				apiEndPoint: "/indexlinks",
				extracted: [
					"https://enigma2.ahoseek.com/categories/animal/5001/",
					"https://enigma2.ahoseek.com/categories/shadow/5000/",
					"https://enigma2.ahoseek.com/categories/elevator/4999/",
					"https://enigma2.ahoseek.com/categories/railway/4998/",
					"https://enigma2.ahoseek.com/categories/ufo/4995/",
					"https://enigma2.ahoseek.com/categories/dream/4994/",
					"https://enigma2.ahoseek.com/categories/contingency/4993/",
					"https://enigma2.ahoseek.com/categories/ruins/4990/",
					"https://enigma2.ahoseek.com/categories/spirit/4987/",
					"https://enigma2.ahoseek.com/categories/dailynecessities/4985/",
				],
			},
		},
	},
	links: {
		label: "CSS link selector for links on the index page.",
		input: {
			method: "text",
			defaultValue: null,
		},
		value: "a.entry-read-link",
		badgeStatus: "Pass",
		errorMsg: "",
		preValidation: ["entryUrl"],
		apiEndPoint: "/indexlinks",
		extracted: [
			"https://enigma2.ahoseek.com/categories/animal/5001/",
			"https://enigma2.ahoseek.com/categories/shadow/5000/",
			"https://enigma2.ahoseek.com/categories/elevator/4999/",
			"https://enigma2.ahoseek.com/categories/railway/4998/",
			"https://enigma2.ahoseek.com/categories/ufo/4995/",
			"https://enigma2.ahoseek.com/categories/dream/4994/",
			"https://enigma2.ahoseek.com/categories/contingency/4993/",
			"https://enigma2.ahoseek.com/categories/ruins/4990/",
			"https://enigma2.ahoseek.com/categories/spirit/4987/",
			"https://enigma2.ahoseek.com/categories/dailynecessities/4985/",
		],
	},
	nextPageType: {
		label: "Next page URL source",
		input: {
			method: "select",
			defaultValue: null,
			choices: ["last", "parameter", "url", "next", "pagenation"],
		},
		value: "last",
		child: {
			last: {
				label: "CSS link selector of last URL",
				input: {
					method: "text",
					defaultValue: null,
				},
				value: "li.last > a",
				badgeStatus: "Pass",
				errorMsg: "",
				preValidation: ["entryUrl"],
				apiEndPoint: "/lasturl",
				extracted: "https://enigma2.ahoseek.com/page/375/",
				child: {
					lastPageNumberRegExp: {
						label: "Last URL pageNumber RegExp",
						input: {
							method: "text",
							defaultValue: null,
						},
						value: "(\\d+)\\/$",
						badgeStatus: "Pass",
						errorMsg: "",
						preValidation: ["lastUrl"],
						apiEndPoint: "/lasturlregex",
						extracted: "375",
					},
				},
			},
		},
	},
	last: {
		label: "CSS link selector of last URL",
		input: {
			method: "text",
			defaultValue: null,
		},
		value: "li.last > a",
		badgeStatus: "Pass",
		errorMsg: "",
		preValidation: ["entryUrl"],
		apiEndPoint: "/lasturl",
		extracted: "https://enigma2.ahoseek.com/page/375/",
		child: {
			lastPageNumberRegExp: {
				label: "Last URL pageNumber RegExp",
				input: {
					method: "text",
					defaultValue: null,
				},
				value: "(\\d+)\\/$",
				badgeStatus: "Pass",
				errorMsg: "",
				preValidation: ["lastUrl"],
				apiEndPoint: "/lasturlregex",
				extracted: "375",
			},
		},
	},
	lastPageNumberRegExp: {
		label: "Last URL pageNumber RegExp",
		input: {
			method: "text",
			defaultValue: null,
		},
		value: "(\\d+)\\/$",
		badgeStatus: "Pass",
		errorMsg: "",
		preValidation: ["lastUrl"],
		apiEndPoint: "/lasturlregex",
		extracted: "375",
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
		value: true,
		child: {
			articleTagSelector: {
				label: "CSS selector for article tags",
				input: {
					method: "text",
					defaultValue: null,
				},
				value: "span.category > a",
				badgeStatus: "Pass",
				errorMsg: "",
				preValidation: null,
				apiEndPoint: "/text",
				extracted: "Part117",
			},
		},
	},
	articleTagSelector: {
		label: "CSS selector for article tags",
		input: {
			method: "text",
			defaultValue: null,
		},
		value: "span.category > a",
		badgeStatus: "Pass",
		errorMsg: "",
		preValidation: null,
		apiEndPoint: "/text",
		extracted: "Part117",
	},
	articleTitleSelector: {
		label: "CSS selector for article title",
		input: {
			method: "text",
			defaultValue: null,
		},
		value: "h1.entry-title",
		badgeStatus: "Pass",
		errorMsg: "",
		preValidation: ["entryUrl"],
		apiEndPoint: "/text",
		extracted: "第3781話 エノコロ草",
	},
	articleBodySelector: {
		label: "CSS selector for article body",
		input: {
			method: "text",
			defaultValue: null,
		},
		value: "div.entry-content",
		badgeStatus: "Pass",
		errorMsg: "",
		preValidation: ["entryUrl"],
		apiEndPoint: "/text",
		extracted:
			"\n  145本当にあった怖い名無し2022/07/20(水) 03:44:28.06ID:5shBPnUh0\nついさっき雨があがったので、ねこの葉っぱを取りにいった\n近所の集合集宅の周りの植え込みに生えてる「エノコロ草」ってやつで、うちの猫たちの大好物\n雨が続いたからかな、いろんな雑草が元気よく伸びてて、細長い葉っぱに着いた雨粒が街灯の明かりでキラキラ光ってた\n植え込みに沿って探してたら群れになって生えてる場所を見つけたので、出来るだけ若くてやわらかそうな葉っぱを１０枚ぐらい集めた\nサンダルの隙間から出てる足の甲を蚊に刺されたようで、少しかがんで掻いてたら後ろから「それ苦いんだよ」って声がした\nへ？ってかんじで振り返ったら、２，３メートル後ろの街灯の柱の横に、茶色のねこがこっちを向いて座ってた\n150本当にあった怖い名無し2022/07/20(水) 10:01:56.36ID:6OAMENvJ0\n>>145\n人間でいうとどんな感じの声ですか？\n151本当にあった怖い名無し2022/07/20(水) 11:10:36.72ID:Q/SbEvCg0\n>>145\n良い話ありがとう\n145さんが飼い猫さんのために草を摘んであげてるのをその猫さん知ってたんだね\n自分は声ではないんだけど虫と心が通じる事がたまにある\nアゲハ蝶とか蛍とか\n瞬間的に綺麗だな！って心から思った時に\n「こっち来てもう一回姿見せて」\nって純粋に念じる？心から呼びかける？と物凄いスピードで一瞬だけ顔のそばに飛んで来て見せてくれたり\nあと部屋の中で視線を感じて、というかガン見されてる気配があってびっくりしてそっちのほう見たら可愛い蜘蛛がぶらんぶらんしながらこっち見てた\n（うちは園芸やってるので蜘蛛は益虫。部屋で見かけたら薔薇の鉢まで連れてってあげる）\n親に話したらあんた変わってるわ普通虫と心通じないし蜘蛛と目合わないしwって\n156本当にあった怖い名無し2022/07/20(水) 17:18:11.29ID:ZS3Y6P8R0\n>>151\n郊外に住んでた義理の父の家に遊びにいったら、部屋の中を一匹のアシナガバチが飛んでた\n２日ほど前にハチが家の中に入ってきた時に、小さな皿に水を入れてテーブルの上に置いてあげたんだって\nハチは朝になると窓のスキマからどこかに飛んでいって、夕方になるとまた帰ってきて水を飲んで次の朝まで部屋の中にいてるんだって\n次の週も仕事の関係で父の家に行ったら、やっぱり部屋の中をハチが飛んでた\n父は「もう寿命が近いみたいでだいぶ弱ってきてる」って言ってた\nその次の朝にアシナガバチはテーブルの上で動かなくなってたそうです\nわりと変わり者扱いされる自分もいろいろな虫との思い出あります\n158本当にあった怖い名無し2022/07/20(水) 21:18:25.43ID:ZS3Y6P8R0\n>>150\n遠藤憲一さんっぽかったような気が\n>>151\n読んでくれてありがとう\n私はハエトリグモとコミュニケーションを取ろうとしたことが何度もありますが、なかなかうまくいかないです\n  ",
	},
	frequency: {
		label: "Program running cycle.",
		input: {
			method: "select",
			defaultValue: null,
			choices: ["daily", "weekly", "monthly"],
		},
		value: "weekly",
	},
};

const keys = Object.keys(rObj);
const vals = Object.values(rObj)
	.map((v) => {
		return v.input.method === "toggle" ? v.value : `'${v.value}'`;
	})
	.join(",");

const postData = { key: keys, val: vals };
describe("saveRegisterConfig", () => {
	test("saveconfig connect", async () => {
		fetchPost("http://localhost:3001/register/saveconfig", postData)
			.then((res) => {
				console.log(res); //show success dialog.  close button closes the dialog and reloads and clear the config page
				expect(res).toBeTruthy();
			})
			.catch((e) => {
				console.log(e);
				expect(e).toBeTruthy();
			});
	});
});

// import { EventEmitter } from "events";

// const em = new EventEmitter();

// em.on("valGenerated", (val) => {
// 	console.log(`Generated value is ${val}.`);
// });

// em.on("pushedToQueue", (val) => {
// 	console.log(`value ${val} is pushed to the Queue.`);
// 	pushQ(val);
// 	console.log(`Queue is now holding ${Queue}`);
// });

// em.on("accumulate", () => {
// 	const n = Queue.shift();
// 	console.log(`${n} shifted out from the Queue.`);
// 	console.log(`Accumulated value is now ${acc(n)}\n\n`);
// });

// /* driver */
// const Queue = [];
// const acc = accumulate();
// for (let i = 1; i < 4; i++) {
// 	generateValue();
// }

// function generateValue() {
// 	const timeout = Math.random() * 5000;
// 	setTimeout(() => {
// 		const val = Math.ceil(Math.random() * 10);
// 		em.emit("valGenerated", val);
// 		em.emit("pushedToQueue", val);
// 		em.emit("accumulate");
// 	}, timeout);
// }

// function accumulate() {
// 	let ttl = 0;

// 	return (n) => {
// 		ttl += n;
// 		return ttl;
// 	};
// }

// function pushQ(val) {
// 	Queue.push(val);
// }

//-------------------------

// function generateValue(order) {
// 	const timeout = Math.random() * 8000;
// 	setTimeout(() => {
// 		const val = Math.ceil(Math.random() * 10);
// 		console.log(`#${order} value is ${val}`);
// 	}, timeout);
// }

// for (let i = 1; i < 6; i++) {
// 	generateValue(i);
// }

//--------------------------

class Names {
	constructor() {
		this.name = "name";
	}

	showMethodName() {
		console.log(this.showMethodName.name);
	}
}

const n = new Names();
n.showMethodName();

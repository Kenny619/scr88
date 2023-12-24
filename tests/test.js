import { enigma } from "../dist/app/config/sourceConfig.js";
import validateSelectors from "../dist/app/utils/selectorTest.js";

validateSelectors(enigma)
	.then((res) => {
		const m = JSON.stringify(res);
		console.log(m);
		console.debug(res);
	})
	.catch((res) => console.log(res));

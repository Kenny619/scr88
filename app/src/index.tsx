import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
//import "./styles.css";
import reportWebVitals from "./reportWebVitals";
import InputTable from "./components/register";
//import App from "./App";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
	<React.StrictMode>
		<Theme>
			<InputTable />
		</Theme>
	</React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

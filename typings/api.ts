export type singleTypes = "text" | "link" | "node" | "nodeElement";
export type multiTypes = "texts" | "links" | "nodes" | "nodeElements";

export type extractTypes = singleTypes | multiTypes;
export type result<T extends string | string[] | Element | Element[]> = { pass: true; result: T } | { pass: false; errMsg: string } | { pass: false; errMsg: unknown };
export type TestSelectorR<T extends extractTypes> = T extends "nodeElement" ? Element : T extends "nodeElements" ? Element[] : string;
export type TestSelector = <T extends extractTypes>(type: T, serializedDom: string, selector: string) => result<TestSelectorR<T>>;

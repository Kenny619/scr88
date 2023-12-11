import fs from 'fs';

export function isURL(url: string): boolean {
	const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-zA-Z]{2,})(\/[\w.-]*)*\/?(\?[\w%.-]+=[\w%.-]+&?)*$/;
	return urlRegex.test(url);
}

export function isAllTruthy(arr: []): boolean {
	for (let entry of arr) {
		if (!!entry) return false;
	}
	return true;
}
export function isArrayUnique(arr: []): boolean {
	const set = new Set(arr);
	return set.size === arr.length;
}

export function isCommonValue<T>(arr1: T, arr2: T): boolean {
	if (Array.isArray(arr1) && Array.isArray(arr2)) {
		const arrSet = new Set([...arr1, ...arr2]);
		return !(arrSet.size === arr1.length + arr2.length);
	} else {
		throw new Error(`Both parameters needs to be type array.`);
	}

}

export function isObjectConsistent(arr: []): boolean {
	{
		return arr.length > 0 ? true : false;
	}

}

export function areKeysValuesValid(obj: Record<string, any>, arr: string[]): boolean {

	if (typeof obj !== 'object') return false;
	for (let key of arr) {
		if (!obj.hasOwnProperty(key) || !obj[key]) return false;
	}
	return true;
}

export function iskeyValueValid(obj: Record<string, any>, key: string) {
	return typeof obj === 'object' && obj.hasOwnProperty(key) && !!obj[key];
}

export function isWritable(directoryPath: string): boolean {
	if (!fs.existsSync(directoryPath)) {
		return false;
	}
	try {
		fs.accessSync(directoryPath, fs.constants.R_OK | fs.constants.W_OK);
		return true;
	} catch (err) {
		return false;
	}
}
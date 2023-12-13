export interface articles {
	name: string,
	id: string
	url: string,
	title?: string,
	body: string,
	tags?: (string | null)[]
}

export interface exportedArticles {
	name: string,
	id: string,
	url: string,
}
export type User = {
	id: number
	name: string
	email: string
	gender: 'male' | 'female'
	status: 'active' | 'inactive'
}

export type Post = {
	id: number
	user_id: number
	title: string
	body: string
}

export type Comment = {
	id: number
	post_id: number
	name: string
	email: string
	body: string
}

export type Pagination = {
	total: number
	pages: number
	page: number
	limit: number
}

export type PaginatedResponse<T> = {
	data: T
	pagination: Pagination
}

export type ListRequestParams = {
	token: string
	page: number
	perPage: number
	signal?: AbortSignal
}

export type DetailRequestParams = {
	token: string
	id: number
	signal?: AbortSignal
}

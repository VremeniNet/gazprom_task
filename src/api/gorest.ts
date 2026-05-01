import type {
	Comment,
	DetailRequestParams,
	ListRequestParams,
	PaginatedResponse,
	Pagination,
	Post,
	User,
} from '../types/gorest'

const API_BASE_URL = 'https://gorest.co.in/public/v2'

type RequestOptions = {
	token: string
	path: string
	query?: Record<string, string | number>
	signal?: AbortSignal
}

type GoRestErrorResponse = {
	message?: string
	field?: string
}

export class GoRestApiError extends Error {
	status: number
	details: unknown

	constructor(status: number, message: string, details: unknown) {
		super(message)

		this.name = 'GoRestApiError'
		this.status = status
		this.details = details
	}
}

const getHeaderNumber = (headers: Headers, headerName: string) => {
	const value = headers.get(headerName)

	return value ? Number(value) : 0
}

const getPaginationFromHeaders = (headers: Headers): Pagination => ({
	total: getHeaderNumber(headers, 'x-pagination-total'),
	pages: getHeaderNumber(headers, 'x-pagination-pages'),
	page: getHeaderNumber(headers, 'x-pagination-page'),
	limit: getHeaderNumber(headers, 'x-pagination-limit'),
})

const getErrorMessage = (status: number, details: unknown) => {
	if (Array.isArray(details)) {
		const firstError = details[0] as GoRestErrorResponse | undefined

		if (firstError?.message) {
			return firstError.field
				? `${firstError.field}: ${firstError.message}`
				: firstError.message
		}
	}

	if (
		details &&
		typeof details === 'object' &&
		'message' in details &&
		typeof details.message === 'string'
	) {
		return details.message
	}

	if (status === 401) {
		return 'Ошибка авторизации. Проверьте access token.'
	}

	if (status === 403) {
		return 'Нет доступа к запрошенному ресурсу.'
	}

	if (status === 404) {
		return 'Запрошенные данные не найдены.'
	}

	if (status === 429) {
		return 'Слишком много запросов. Попробуйте позже.'
	}

	return 'Произошла ошибка при запросе к GoREST API.'
}

const request = async <T>({
	token,
	path,
	query,
	signal,
}: RequestOptions): Promise<PaginatedResponse<T>> => {
	const url = new URL(`${API_BASE_URL}${path}`)

	if (query) {
		Object.entries(query).forEach(([key, value]) => {
			url.searchParams.set(key, String(value))
		})
	}

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`,
		},
		signal,
	})

	const data = (await response.json().catch(() => null)) as T

	if (!response.ok) {
		throw new GoRestApiError(
			response.status,
			getErrorMessage(response.status, data),
			data,
		)
	}

	return {
		data,
		pagination: getPaginationFromHeaders(response.headers),
	}
}

export const getUsers = ({
	token,
	page,
	perPage,
	signal,
}: ListRequestParams) => {
	return request<User[]>({
		token,
		path: '/users',
		query: {
			page,
			per_page: perPage,
		},
		signal,
	})
}

export const getPosts = ({
	token,
	page,
	perPage,
	signal,
}: ListRequestParams) => {
	return request<Post[]>({
		token,
		path: '/posts',
		query: {
			page,
			per_page: perPage,
		},
		signal,
	})
}

export const getUser = ({ token, id, signal }: DetailRequestParams) => {
	return request<User>({
		token,
		path: `/users/${id}`,
		signal,
	})
}

export const getPost = ({ token, id, signal }: DetailRequestParams) => {
	return request<Post>({
		token,
		path: `/posts/${id}`,
		signal,
	})
}

export const getPostComments = ({ token, id, signal }: DetailRequestParams) => {
	return request<Comment[]>({
		token,
		path: `/posts/${id}/comments`,
		signal,
	})
}

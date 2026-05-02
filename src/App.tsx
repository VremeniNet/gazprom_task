import { type FormEvent, type ChangeEvent, useState } from 'react'
import { Button } from '@consta/uikit/Button'
import { TextField } from '@consta/uikit/TextField'

import {
	getPost,
	getPostComments,
	getPosts,
	getUser,
	getUsers,
	GoRestApiError,
} from './api/gorest'
import type {
	Comment as PostComment,
	Pagination,
	Post,
	User,
} from './types/gorest'

import './App.css'

const PER_PAGE_OPTIONS = [10, 25, 50] as const

type PerPageOption = (typeof PER_PAGE_OPTIONS)[number]
type ActiveSection = 'users' | 'posts'

const getUserNameParts = (name: string) => {
	const [firstName, ...lastNameParts] = name.trim().split(/\s+/)

	return {
		firstName: firstName || '—',
		lastName: lastNameParts.join(' ') || '—',
	}
}

function App() {
	const [token, setToken] = useState('')
	const [accessToken, setAccessToken] = useState('')
	const [tokenError, setTokenError] = useState('')

	const [activeSection, setActiveSection] = useState<ActiveSection>('users')

	const [posts, setPosts] = useState<Post[]>([])
	const [postsPagination, setPostsPagination] = useState<Pagination | null>(
		null,
	)
	const [postsPage, setPostsPage] = useState(1)
	const [postsPerPage, setPostsPerPage] = useState<PerPageOption>(10)
	const [isPostsLoading, setIsPostsLoading] = useState(false)
	const [postsError, setPostsError] = useState('')

	const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
	const [selectedPost, setSelectedPost] = useState<Post | null>(null)
	const [postComments, setPostComments] = useState<PostComment[]>([])
	const [isPostDetailsLoading, setIsPostDetailsLoading] = useState(false)
	const [postDetailsError, setPostDetailsError] = useState('')

	const [users, setUsers] = useState<User[]>([])
	const [usersPagination, setUsersPagination] = useState<Pagination | null>(
		null,
	)
	const [usersPage, setUsersPage] = useState(1)
	const [usersPerPage, setUsersPerPage] = useState<PerPageOption>(10)
	const [isUsersLoading, setIsUsersLoading] = useState(false)
	const [usersError, setUsersError] = useState('')

	const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
	const [selectedUser, setSelectedUser] = useState<User | null>(null)
	const [isUserDetailsLoading, setIsUserDetailsLoading] = useState(false)
	const [userDetailsError, setUserDetailsError] = useState('')

	const loadUsers = async (
		tokenForRequest: string,
		pageForRequest: number,
		perPageForRequest: PerPageOption,
	) => {
		setIsUsersLoading(true)
		setUsersError('')

		try {
			const result = await getUsers({
				token: tokenForRequest,
				page: pageForRequest,
				perPage: perPageForRequest,
			})

			setUsers(result.data)
			setUsersPagination(result.pagination)
		} catch (error) {
			if (error instanceof GoRestApiError) {
				setUsersError(error.message)
				return
			}

			setUsersError('Не удалось загрузить пользователей. Попробуйте позже.')
		} finally {
			setIsUsersLoading(false)
		}
	}

	const loadUserDetails = async (tokenForRequest: string, userId: number) => {
		setSelectedPostId(null)
		setSelectedPost(null)
		setPostComments([])
		setPostDetailsError('')
		setSelectedUserId(userId)
		setSelectedUser(null)
		setIsUserDetailsLoading(true)
		setUserDetailsError('')

		try {
			const result = await getUser({
				token: tokenForRequest,
				id: userId,
			})

			setSelectedUser(result.data)
		} catch (error) {
			if (error instanceof GoRestApiError) {
				setUserDetailsError(error.message)
				return
			}

			setUserDetailsError(
				'Не удалось загрузить пользователя. Попробуйте позже.',
			)
		} finally {
			setIsUserDetailsLoading(false)
		}
	}

	const loadPosts = async (
		tokenForRequest: string,
		pageForRequest: number,
		perPageForRequest: PerPageOption,
	) => {
		setIsPostsLoading(true)
		setPostsError('')

		try {
			const result = await getPosts({
				token: tokenForRequest,
				page: pageForRequest,
				perPage: perPageForRequest,
			})

			setPosts(result.data)
			setPostsPagination(result.pagination)
		} catch (error) {
			if (error instanceof GoRestApiError) {
				setPostsError(error.message)
				return
			}

			setPostsError('Не удалось загрузить посты. Попробуйте позже.')
		} finally {
			setIsPostsLoading(false)
		}
	}

	const loadPostDetails = async (tokenForRequest: string, postId: number) => {
		setSelectedUserId(null)
		setSelectedUser(null)
		setUserDetailsError('')

		setSelectedPostId(postId)
		setSelectedPost(null)
		setPostComments([])
		setIsPostDetailsLoading(true)
		setPostDetailsError('')

		try {
			const [postResult, commentsResult] = await Promise.all([
				getPost({
					token: tokenForRequest,
					id: postId,
				}),
				getPostComments({
					token: tokenForRequest,
					id: postId,
				}),
			])

			setSelectedPost(postResult.data)
			setPostComments(commentsResult.data)
		} catch (error) {
			if (error instanceof GoRestApiError) {
				setPostDetailsError(error.message)
				return
			}

			setPostDetailsError('Не удалось загрузить пост. Попробуйте позже.')
		} finally {
			setIsPostDetailsLoading(false)
		}
	}

	const handleActiveSectionChange = (nextSection: ActiveSection) => {
		setActiveSection(nextSection)

		if (nextSection === 'posts' && accessToken && posts.length === 0) {
			void loadPosts(accessToken, postsPage, postsPerPage)
		}
	}

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		const trimmedToken = token.trim()

		if (!trimmedToken) {
			setTokenError('Введите access token')
			return
		}

		setTokenError('')
		setAccessToken(trimmedToken)
		setUsersPage(1)
		void loadUsers(trimmedToken, 1, usersPerPage)
	}

	const handleResetToken = () => {
		setToken('')
		setAccessToken('')
		setTokenError('')
		setUsers([])
		setUsersPagination(null)
		setUsersPage(1)
		setUsersError('')
		setActiveSection('users')
		setPosts([])
		setPostsPagination(null)
		setPostsPage(1)
		setPostsError('')
		setSelectedUserId(null)
		setSelectedUser(null)
		setUserDetailsError('')
		setSelectedPostId(null)
		setSelectedPost(null)
		setPostComments([])
		setPostDetailsError('')
	}

	const handleUsersPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const nextPerPage = Number(event.target.value) as PerPageOption

		setUsersPerPage(nextPerPage)
		setUsersPage(1)

		if (accessToken) {
			void loadUsers(accessToken, 1, nextPerPage)
		}
	}

	const handlePostsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const nextPerPage = Number(event.target.value) as PerPageOption

		setPostsPerPage(nextPerPage)
		setPostsPage(1)

		if (accessToken) {
			void loadPosts(accessToken, 1, nextPerPage)
		}
	}

	const handleRetryUsersLoading = () => {
		if (accessToken) {
			void loadUsers(accessToken, usersPage, usersPerPage)
		}
	}

	const handleRetryPostsLoading = () => {
		if (accessToken) {
			void loadPosts(accessToken, postsPage, postsPerPage)
		}
	}

	const handleUserRowClick = (userId: number) => {
		if (accessToken) {
			void loadUserDetails(accessToken, userId)
		}
	}

	const handleBackToUsersList = () => {
		setSelectedUserId(null)
		setSelectedUser(null)
		setUserDetailsError('')
	}

	const handlePostRowClick = (postId: number) => {
		if (accessToken) {
			void loadPostDetails(accessToken, postId)
		}
	}

	const handleBackToPostsList = () => {
		setSelectedPostId(null)
		setSelectedPost(null)
		setPostComments([])
		setPostDetailsError('')
	}

	const usersTotalPages = usersPagination?.pages ?? 1
	const canGoToPreviousUsersPage = usersPage > 1 && !isUsersLoading
	const canGoToNextUsersPage = usersPage < usersTotalPages && !isUsersLoading

	const postsTotalPages = postsPagination?.pages ?? 1
	const canGoToPreviousPostsPage = postsPage > 1 && !isPostsLoading
	const canGoToNextPostsPage = postsPage < postsTotalPages && !isPostsLoading

	if (accessToken) {
		return (
			<main className='app app--dashboard'>
				<div className='dashboard'>
					<header className='dashboard__header'>
						<div>
							<p className='app__eyebrow'>GoREST API</p>
							<h1 className='dashboard__title'>Пользователи и Посты</h1>
							<p className='dashboard__description'>
								Работа со списками пользователей, постами и карточками деталей
								через GoREST API.
							</p>
						</div>

						<Button
							label='Сменить токен'
							view='secondary'
							onClick={handleResetToken}
						/>
					</header>
					{selectedUserId ? (
						<section className='details-card'>
							<div className='details-card__header'>
								<div>
									<p className='app__eyebrow'>Карточка пользователя</p>
									<h2 className='details-card__title'>Детали пользователя</h2>
								</div>

								<Button
									label='Назад к списку'
									view='secondary'
									onClick={handleBackToUsersList}
								/>
							</div>

							{isUserDetailsLoading ? (
								<div className='state-message'>Загружаем пользователя...</div>
							) : null}

							{userDetailsError ? (
								<div className='state-message state-message--error'>
									<p>{userDetailsError}</p>
									<Button
										label='Повторить'
										view='primary'
										onClick={() => {
											void loadUserDetails(accessToken, selectedUserId)
										}}
									/>
								</div>
							) : null}

							{selectedUser && !isUserDetailsLoading && !userDetailsError ? (
								<div className='details-grid'>
									<div className='details-field'>
										<span className='details-field__label'>ID</span>
										<strong className='details-field__value'>
											{selectedUser.id}
										</strong>
									</div>

									<div className='details-field'>
										<span className='details-field__label'>Имя</span>
										<strong className='details-field__value'>
											{getUserNameParts(selectedUser.name).firstName}
										</strong>
									</div>

									<div className='details-field'>
										<span className='details-field__label'>Фамилия</span>
										<strong className='details-field__value'>
											{getUserNameParts(selectedUser.name).lastName}
										</strong>
									</div>

									<div className='details-field'>
										<span className='details-field__label'>Email</span>
										<strong className='details-field__value'>
											{selectedUser.email}
										</strong>
									</div>

									<div className='details-field'>
										<span className='details-field__label'>Пол</span>
										<strong className='details-field__value'>
											{selectedUser.gender === 'male' ? 'Мужской' : 'Женский'}
										</strong>
									</div>

									<div className='details-field'>
										<span className='details-field__label'>Статус</span>
										<span
											className={`status-badge status-badge--${selectedUser.status}`}
										>
											{selectedUser.status === 'active'
												? 'Активен'
												: 'Неактивен'}
										</span>
									</div>
								</div>
							) : null}
						</section>
					) : selectedPostId !== null ? (
						<section className='details-card'>
							<div className='details-card__header'>
								<div>
									<p className='app__eyebrow'>Карточка поста</p>
									<h2 className='details-card__title'>Детали поста</h2>
								</div>

								<Button
									label='Назад к списку'
									view='secondary'
									onClick={handleBackToPostsList}
								/>
							</div>

							{isPostDetailsLoading ? (
								<div className='state-message'>Загружаем пост...</div>
							) : null}

							{postDetailsError ? (
								<div className='state-message state-message--error'>
									<p>{postDetailsError}</p>
									<Button
										label='Повторить'
										view='primary'
										onClick={() => {
											if (selectedPostId !== null) {
												void loadPostDetails(accessToken, selectedPostId)
											}
										}}
									/>
								</div>
							) : null}

							{selectedPost && !isPostDetailsLoading && !postDetailsError ? (
								<>
									<div className='details-grid'>
										<div className='details-field'>
											<span className='details-field__label'>ID поста</span>
											<strong className='details-field__value'>
												{selectedPost.id}
											</strong>
										</div>

										<div className='details-field'>
											<span className='details-field__label'>
												ID пользователя
											</span>
											<strong className='details-field__value'>
												{selectedPost.user_id}
											</strong>
										</div>
									</div>

									<div className='post-content'>
										<h3 className='post-content__title'>
											{selectedPost.title}
										</h3>
										<p className='post-content__body'>{selectedPost.body}</p>
									</div>

									<section className='comments-section'>
										<div className='comments-section__header'>
											<h3 className='comments-section__title'>Комментарии</h3>
											<span className='comments-section__count'>
												{postComments.length}
											</span>
										</div>

										{postComments.length > 0 ? (
											<div className='comments-list'>
												{postComments.map(comment => (
													<article key={comment.id} className='comment-card'>
														<div className='comment-card__header'>
															<strong className='comment-card__author'>
																{comment.name || 'Без имени'}
															</strong>
															<span className='comment-card__email'>
																{comment.email || '—'}
															</span>
														</div>

														<p className='comment-card__body'>{comment.body}</p>
													</article>
												))}
											</div>
										) : (
											<div className='state-message'>
												Комментариев пока нет.
											</div>
										)}
									</section>
								</>
							) : null}
						</section>
					) : (
						<>
							<div className='section-switch'>
								<Button
									label='Пользователи'
									view={activeSection === 'users' ? 'primary' : 'secondary'}
									onClick={() => handleActiveSectionChange('users')}
								/>

								<Button
									label='Посты'
									view={activeSection === 'posts' ? 'primary' : 'secondary'}
									onClick={() => handleActiveSectionChange('posts')}
								/>
							</div>

							{activeSection === 'users' ? (
								<section className='list-card'>
									<div className='list-card__header'>
										<div>
											<h2 className='list-card__title'>Список пользователей</h2>
											<p className='list-card__description'>
												Имя, фамилия, email и статус пользователя.
											</p>
										</div>

										<label className='select-field'>
											<span className='select-field__label'>На странице</span>
											<select
												className='select-field__control'
												value={usersPerPage}
												onChange={handleUsersPerPageChange}
												disabled={isUsersLoading}
											>
												{PER_PAGE_OPTIONS.map(option => (
													<option key={option} value={option}>
														{option}
													</option>
												))}
											</select>
										</label>
									</div>

									{usersError ? (
										<div className='state-message state-message--error'>
											<p>{usersError}</p>
											<Button
												label='Повторить'
												view='primary'
												onClick={handleRetryUsersLoading}
											/>
										</div>
									) : null}

									{!usersError && isUsersLoading && users.length === 0 ? (
										<div className='state-message'>
											Загружаем пользователей...
										</div>
									) : null}

									{!usersError && !isUsersLoading && users.length === 0 ? (
										<div className='state-message'>
											Пользователи не найдены.
										</div>
									) : null}

									{!usersError && users.length > 0 ? (
										<>
											<div className='table-wrapper'>
												<table className='data-table'>
													<thead>
														<tr>
															<th>Имя</th>
															<th>Фамилия</th>
															<th>Email</th>
															<th>Пол</th>
															<th>Статус</th>
														</tr>
													</thead>

													<tbody>
														{users.map(user => {
															const { firstName, lastName } = getUserNameParts(
																user.name,
															)

															return (
																<tr
																	key={user.id}
																	className='data-table__row data-table__row--clickable'
																	tabIndex={0}
																	onClick={() => handleUserRowClick(user.id)}
																	onKeyDown={event => {
																		if (
																			event.key === 'Enter' ||
																			event.key === ' '
																		) {
																			event.preventDefault()
																			handleUserRowClick(user.id)
																		}
																	}}
																>
																	<td>{firstName}</td>
																	<td>{lastName}</td>
																	<td>{user.email || '—'}</td>
																	<td>
																		{user.gender === 'male'
																			? 'Мужской'
																			: 'Женский'}
																	</td>
																	<td>
																		<span
																			className={`status-badge status-badge--${user.status}`}
																		>
																			{user.status === 'active'
																				? 'Активен'
																				: 'Неактивен'}
																		</span>
																	</td>
																</tr>
															)
														})}
													</tbody>
												</table>
											</div>

											<footer className='pagination'>
												<p className='pagination__info'>
													Страница {usersPage} из {usersTotalPages}. Всего:{' '}
													{usersPagination?.total ?? '—'}
													{isUsersLoading ? ' · обновляем...' : ''}
												</p>

												<div className='pagination__actions'>
													<Button
														label='Предыдущая'
														view='secondary'
														disabled={!canGoToPreviousUsersPage}
														onClick={() => {
															const nextPage = Math.max(1, usersPage - 1)

															setUsersPage(nextPage)
															void loadUsers(
																accessToken,
																nextPage,
																usersPerPage,
															)
														}}
													/>

													<Button
														label='Следующая'
														view='primary'
														disabled={!canGoToNextUsersPage}
														onClick={() => {
															const nextPage = Math.min(
																usersTotalPages,
																usersPage + 1,
															)

															setUsersPage(nextPage)
															void loadUsers(
																accessToken,
																nextPage,
																usersPerPage,
															)
														}}
													/>
												</div>
											</footer>
										</>
									) : null}
								</section>
							) : null}
							{activeSection === 'posts' ? (
								<section className='list-card'>
									<div className='list-card__header'>
										<div>
											<h2 className='list-card__title'>Список постов</h2>
											<p className='list-card__description'>
												ID и заголовок поста из GoREST API.
											</p>
										</div>

										<label className='select-field'>
											<span className='select-field__label'>На странице</span>
											<select
												className='select-field__control'
												value={postsPerPage}
												onChange={handlePostsPerPageChange}
												disabled={isPostsLoading}
											>
												{PER_PAGE_OPTIONS.map(option => (
													<option key={option} value={option}>
														{option}
													</option>
												))}
											</select>
										</label>
									</div>

									{postsError ? (
										<div className='state-message state-message--error'>
											<p>{postsError}</p>
											<Button
												label='Повторить'
												view='primary'
												onClick={handleRetryPostsLoading}
											/>
										</div>
									) : null}

									{!postsError && isPostsLoading && posts.length === 0 ? (
										<div className='state-message'>Загружаем посты...</div>
									) : null}

									{!postsError && !isPostsLoading && posts.length === 0 ? (
										<div className='state-message'>Посты не найдены.</div>
									) : null}

									{!postsError && posts.length > 0 ? (
										<>
											<div className='table-wrapper'>
												<table className='data-table'>
													<thead>
														<tr>
															<th>ID</th>
															<th>Заголовок</th>
														</tr>
													</thead>

													<tbody>
														{posts.map(post => (
															<tr
																key={post.id}
																className='data-table__row data-table__row--clickable'
																tabIndex={0}
																onClick={() => handlePostRowClick(post.id)}
																onKeyDown={event => {
																	if (
																		event.key === 'Enter' ||
																		event.key === ' '
																	) {
																		event.preventDefault()
																		handlePostRowClick(post.id)
																	}
																}}
															>
																<td>{post.id}</td>
																<td>{post.title || '—'}</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>

											<footer className='pagination'>
												<p className='pagination__info'>
													Страница {postsPage} из {postsTotalPages}. Всего:{' '}
													{postsPagination?.total ?? '—'}
													{isPostsLoading ? ' · обновляем...' : ''}
												</p>

												<div className='pagination__actions'>
													<Button
														label='Предыдущая'
														view='secondary'
														disabled={!canGoToPreviousPostsPage}
														onClick={() => {
															const nextPage = Math.max(1, postsPage - 1)

															setPostsPage(nextPage)
															void loadPosts(
																accessToken,
																nextPage,
																postsPerPage,
															)
														}}
													/>

													<Button
														label='Следующая'
														view='primary'
														disabled={!canGoToNextPostsPage}
														onClick={() => {
															const nextPage = Math.min(
																postsTotalPages,
																postsPage + 1,
															)

															setPostsPage(nextPage)
															void loadPosts(
																accessToken,
																nextPage,
																postsPerPage,
															)
														}}
													/>
												</div>
											</footer>
										</>
									) : null}
								</section>
							) : null}
						</>
					)}
				</div>
			</main>
		)
	}

	return (
		<main className='app'>
			<section className='app__content'>
				<p className='app__eyebrow'>GoREST API</p>
				<h1 className='app__title'>Users & Posts Dashboard</h1>
				<p className='app__description'>
					Введите access token, чтобы перейти к спискам пользователей и постов.
				</p>

				<form className='token-form' onSubmit={handleSubmit}>
					<div className='token-form__field'>
						<TextField
							label='Access token'
							placeholder='Вставьте токен GoREST'
							value={token}
							onChange={value => {
								setToken(value ?? '')

								if (value?.trim()) {
									setTokenError('')
								}
							}}
							state={tokenError ? 'alert' : undefined}
							caption={tokenError || 'Токен не должен быть пустым'}
							withClearButton
							size='l'
						/>
					</div>

					<div className='token-form__actions'>
						<Button label='Продолжить' view='primary' type='submit' size='l' />
					</div>
				</form>
			</section>
		</main>
	)
}

export default App

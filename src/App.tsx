import { type FormEvent, type ChangeEvent, useState } from 'react'
import { Button } from '@consta/uikit/Button'
import { TextField } from '@consta/uikit/TextField'

import { getUsers, GoRestApiError } from './api/gorest'
import type { Pagination, User } from './types/gorest'

import './App.css'

const PER_PAGE_OPTIONS = [10, 25, 50] as const

type PerPageOption = (typeof PER_PAGE_OPTIONS)[number]

function App() {
	const [token, setToken] = useState('')
	const [accessToken, setAccessToken] = useState('')
	const [tokenError, setTokenError] = useState('')

	const [users, setUsers] = useState<User[]>([])
	const [usersPagination, setUsersPagination] = useState<Pagination | null>(
		null,
	)
	const [usersPage, setUsersPage] = useState(1)
	const [usersPerPage, setUsersPerPage] = useState<PerPageOption>(10)
	const [isUsersLoading, setIsUsersLoading] = useState(false)
	const [usersError, setUsersError] = useState('')

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
	}

	const handleUsersPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const nextPerPage = Number(event.target.value) as PerPageOption

		setUsersPerPage(nextPerPage)
		setUsersPage(1)

		if (accessToken) {
			void loadUsers(accessToken, 1, nextPerPage)
		}
	}

	const handleRetryUsersLoading = () => {
		if (accessToken) {
			void loadUsers(accessToken, usersPage, usersPerPage)
		}
	}

	const usersTotalPages = usersPagination?.pages ?? 1
	const canGoToPreviousUsersPage = usersPage > 1 && !isUsersLoading
	const canGoToNextUsersPage = usersPage < usersTotalPages && !isUsersLoading

	if (accessToken) {
		return (
			<main className='app app--dashboard'>
				<div className='dashboard'>
					<header className='dashboard__header'>
						<div>
							<p className='app__eyebrow'>GoREST API</p>
							<h1 className='dashboard__title'>Пользователи</h1>
							<p className='dashboard__description'>
								Список пользователей загружается из GoREST API с учётом
								пагинации.
							</p>
						</div>

						<Button
							label='Сменить токен'
							view='secondary'
							onClick={handleResetToken}
						/>
					</header>

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
							<div className='state-message'>Загружаем пользователей...</div>
						) : null}

						{!usersError && !isUsersLoading && users.length === 0 ? (
							<div className='state-message'>Пользователи не найдены.</div>
						) : null}

						{!usersError && users.length > 0 ? (
							<>
								<div className='table-wrapper'>
									<table className='data-table'>
										<thead>
											<tr>
												<th>Имя</th>
												<th>Email</th>
												<th>Пол</th>
												<th>Статус</th>
											</tr>
										</thead>

										<tbody>
											{users.map(user => (
												<tr key={user.id}>
													<td>{user.name || '—'}</td>
													<td>{user.email || '—'}</td>
													<td>
														{user.gender === 'male' ? 'Мужской' : 'Женский'}
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
											))}
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
												void loadUsers(accessToken, nextPage, usersPerPage)
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
												void loadUsers(accessToken, nextPage, usersPerPage)
											}}
										/>
									</div>
								</footer>
							</>
						) : null}
					</section>
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

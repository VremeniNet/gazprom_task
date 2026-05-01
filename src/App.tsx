import { type FormEvent, useState } from 'react'
import { Button } from '@consta/uikit/Button'
import { TextField } from '@consta/uikit/TextField'

import './App.css'

function App() {
	const [token, setToken] = useState('')
	const [accessToken, setAccessToken] = useState('')
	const [tokenError, setTokenError] = useState('')

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		const trimmedToken = token.trim()

		if (!trimmedToken) {
			setTokenError('Введите access token')
			return
		}

		setTokenError('')
		setAccessToken(trimmedToken)
	}

	const handleResetToken = () => {
		setToken('')
		setAccessToken('')
		setTokenError('')
	}

	if (accessToken) {
		return (
			<main className='app'>
				<section className='app__content'>
					<p className='app__eyebrow'>GoREST API</p>
					<h1 className='app__title'>Токен принят</h1>
					<p className='app__description'></p>

					<div className='app__actions'>
						<Button
							label='Сменить токен'
							view='secondary'
							onClick={handleResetToken}
						/>
					</div>
				</section>
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

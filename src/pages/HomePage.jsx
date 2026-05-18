import { useState } from 'react'

export default function HomePage({ onLogin }) {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')

	function handleSubmit(e) {
		e.preventDefault()
		// Demo Account
		const u = username.trim().toLowerCase()
		const p = password.trim().toLowerCase()
		if (u === 'admin' && p === 'password') {
			setError('')
			onLogin()
		} else {
			setError('Invalid credentials')
		}
	}

	return (
		<div className="home-shell">
			<div className="login-card">
				<div className="brand-mark">EQ</div>
				<h1>EcoQuest Admin</h1>
				<p className="brand-role">Sign in to access the dashboard</p>

				<form className="login-form" onSubmit={handleSubmit}>
					<label className="visually-hidden">Username</label>
					<input
						className="login-input"
						placeholder="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						autoFocus
					/>

					<label className="visually-hidden">Password</label>
					<input
						className="login-input"
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

					<button className="filled-action" type="submit">Sign in</button>

					{error && <div className="login-error">{error}</div>}
				</form>
			</div>
		</div>
	)
}

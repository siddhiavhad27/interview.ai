import React, { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {
    const { loading, user, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ error, setError ] = useState("")
    const [ isSubmitting, setIsSubmitting ] = useState(false)

    if (loading) {
        return (<main><h1>Loading...</h1></main>)
    }

    if (user) {
        return <Navigate to="/dashboard" replace />
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)
        try {
            await handleLogin({ email, password })
            navigate('/dashboard')
        } catch (err) {
            setError(err.message || "Invalid email or password")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>
                {error && (
                    <div
                        className="auth-error"
                        style={{
                            backgroundColor: "#fee2e2",
                            color: "#dc2626",
                            padding: "0.75rem 1rem",
                            borderRadius: "0.5rem",
                            fontSize: "0.875rem",
                            border: "1px solid #fca5a5"
                        }}
                    >
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => { setEmail(e.target.value) }}
                            value={email}
                            type="email" id="email" name='email' placeholder='Enter email address' required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => { setPassword(e.target.value) }}
                            value={password}
                            type="password" id="password" name='password' placeholder='Enter password' required />
                    </div>
                    <button className='button primary-button' disabled={isSubmitting}>
                        {isSubmitting ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p>Don't have an account? <Link to={"/register"} >Register</Link> </p>
            </div>
        </main>
    )
}

export default Login
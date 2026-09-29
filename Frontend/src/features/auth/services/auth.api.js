import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
    withCredentials: true
})

function extractErrorMessage(err, fallbackMessage) {
    if (err.response) {
        return err.response.data?.message || err.response.statusText || fallbackMessage
    } else if (err.request) {
        return "Server unavailable. Please try again later."
    }
    return err.message || fallbackMessage
}

function createAuthError(err, fallbackMessage) {
    const message = extractErrorMessage(err, fallbackMessage)
    const error = new Error(message)
    error.status = err.response?.status
    error.originalError = err
    return error
}

export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })
        return response.data
    } catch (err) {
        throw createAuthError(err, "Registration failure")
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email, password
        })
        return response.data
    } catch (err) {
        throw createAuthError(err, "Invalid credentials")
    }
}

export async function logout() {
    try {
        const response = await api.get("/api/auth/logout")
        return response.data
    } catch (err) {
        throw createAuthError(err, "Logout failed")
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me")
        return response.data
    } catch (err) {
        throw createAuthError(err, "Authentication expired")
    }
}
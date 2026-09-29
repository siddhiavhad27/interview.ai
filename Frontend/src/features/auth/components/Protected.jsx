import React from 'react'
import { useAuth } from "../hooks/useAuth"
import { Navigate, useLocation } from "react-router"

const Protected = ({ children }) => {
    const { loading, user } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h1>Loading...</h1>
            </main>
        )
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

export default Protected
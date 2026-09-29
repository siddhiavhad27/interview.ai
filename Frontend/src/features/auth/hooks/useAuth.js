import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    const { user, setUser, loading, setLoading } = context;

    const handleLogin = async ({ email, password }) => {
        const data = await login({ email, password });
        setUser(data.user);
        return data.user;
    };

    const handleRegister = async ({ username, email, password }) => {
        const data = await register({ username, email, password });
        setUser(data.user);
        return data.user;
    };

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            setUser(null);
        }
    };

    return { user, loading, handleRegister, handleLogin, handleLogout };
};
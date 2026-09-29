import { createContext, useState, useEffect } from "react";
import { getMe } from "./services/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            try {
                const data = await getMe();
                if (isMounted) {
                    setUser(data?.user || null);
                }
            } catch (err) {
                // 401 or no active session is expected when logged out; handle silently
                if (isMounted) {
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        initAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
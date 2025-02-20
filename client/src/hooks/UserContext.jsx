import { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sayfa yüklendiğinde veya yenilendiğinde çalışır
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.PROFILE, {
                ...API_CONFIG.FETCH_CONFIG
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error('Oturum kontrolü hatası:', err);
            setUser(null);
        } finally {
            setLoading(false); // Loading durumunu güncelle
        }
    };

    const login = async (username, password) => {
        try {
            const response = await fetch(API_ENDPOINTS.LOGIN, {
                method: 'POST',
                ...API_CONFIG.FETCH_CONFIG,
                body: JSON.stringify({ username, password })
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Giriş yapılırken hata:', err);
            return false;
        }
    };

    const logout = async () => {
        try {
            await fetch(API_ENDPOINTS.LOGOUT, {
                method: 'POST',
                ...API_CONFIG.FETCH_CONFIG
            });
            setUser(null);
        } catch (err) {
            console.error('Çıkış yapılırken hata:', err);
        }
    };

    if (loading) {
        return <div>Yükleniyor...</div>;
    }

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}; 
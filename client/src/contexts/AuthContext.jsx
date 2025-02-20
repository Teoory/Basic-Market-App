import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '../hooks/UserContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { user } = useUser();
    const [authUser, setAuthUser] = useState(null);

    useEffect(() => {
        if (user) {
            setAuthUser({
                ...user,
                isAdmin: user.role === 'admin'
            });
        } else {
            setAuthUser(null);
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{ user: authUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 
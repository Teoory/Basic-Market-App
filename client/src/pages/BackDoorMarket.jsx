import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const BackDoorMarket = () => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        if (user?.isAdmin) {
            setIsAuthorized(true);
        }
    }, [user]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_ENDPOINTS.BACKDOOR_LOGIN, {
                method: 'POST',
                ...API_CONFIG.FETCH_CONFIG,
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsAuthorized(true);
            } else {
                setError('Geçersiz kullanıcı adı veya şifre');
            }
        } catch (err) {
            setError('Giriş sırasında bir hata oluştu');
        }
    };

    if (!isAuthorized) {
        return (
            <div className="page-wrapper">
                <Navbar />
                <main className="main-content">
                    <div className="container">
                        <div className="backdoor-access-form">
                            <h1>BackDoor Market</h1>
                            {error && <div className="error-message">{error}</div>}
                            <form onSubmit={handleLogin}>
                                <div className="form-group">
                                    <label>Kullanıcı Adı</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Şifre</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        required
                                    />
                                </div>
                                <button type="submit" className="submit-button">
                                    Giriş Yap
                                </button>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <Navbar />
            <main className="main-content">
                <div className="container">
                    <h1>BackDoor Market</h1>
                    {/* BackDoor Market içeriği buraya gelecek */}
                </div>
            </main>
        </div>
    );
};

export default BackDoorMarket; 
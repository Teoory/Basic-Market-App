import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../hooks/UserContext';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useUser();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_ENDPOINTS.LOGIN, {
                method: 'POST',
                ...API_CONFIG.FETCH_CONFIG,
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const userData = await response.json();
                login(userData);
                navigate('/');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Giriş yapılırken bir hata oluştu');
            }
        } catch (err) {
            console.error('Giriş hatası:', err);
            setError('Giriş yapılırken bir hata oluştu');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Giriş Yap</h1>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Kullanıcı Adı</label>
                        <input
                            type="text"
                            id="username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Şifre</label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">
                        Giriş Yap
                    </button>
                    <div className="auth-link">
                        Hesabın yok mu? <Link to="/register">Yeni Hesap Oluştur</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login; 
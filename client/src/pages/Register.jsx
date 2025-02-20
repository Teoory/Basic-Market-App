import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_ENDPOINTS.REGISTER, {
                method: 'POST',
                ...API_CONFIG.FETCH_CONFIG,
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                navigate('/login');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Kayıt olurken bir hata oluştu');
            }
        } catch (err) {
            console.error('Kayıt hatası:', err);
            setError('Kayıt olurken bir hata oluştu');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Kayıt Ol</h1>
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
                            minLength={4}
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
                            minLength={6}
                        />
                    </div>
                    <button type="submit" className="login-button">
                        Kayıt Ol
                    </button>
                    <div className="auth-link">
                        Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register; 
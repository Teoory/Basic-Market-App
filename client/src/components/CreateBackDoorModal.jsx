import { useState } from 'react';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

const CreateBackDoorModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
        username: '',
        note: ''
    });
    const [createdAccount, setCreatedAccount] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_ENDPOINTS.CREATE_BACKDOOR, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                setCreatedAccount(data.account);
            } else {
                const data = await response.json();
                setError(data.error || 'Bir hata oluştu');
            }
        } catch (err) {
            console.error('Hata:', err);
            setError('BackDoor hesabı oluşturulurken bir hata oluştu');
        }
    };

    if (createdAccount) {
        return (
            <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
                <div className="modal-content">
                    <h2>BackDoor Hesabı Oluşturuldu</h2>
                    <div className="account-info">
                        <p><strong>Kullanıcı Adı:</strong> {createdAccount.username}</p>
                        <p><strong>Şifre:</strong> {createdAccount.password}</p>
                        <p className="warning">Bu bilgileri kaydedin! Şifre bir daha görüntülenemeyecek.</p>
                    </div>
                    <button onClick={onClose} className="close-button">
                        Kapat
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <h2>BackDoor Hesabı Oluştur</h2>
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
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
                        <label>Not (Opsiyonel)</label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({...formData, note: e.target.value})}
                            placeholder="Hesap hakkında not..."
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-button">
                            İptal
                        </button>
                        <button type="submit" className="submit-button">
                            Oluştur
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBackDoorModal; 
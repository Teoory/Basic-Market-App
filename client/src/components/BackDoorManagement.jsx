import { useState, useEffect } from 'react';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

const BackDoorManagement = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.BACKDOOR_ACCOUNTS, {
                ...API_CONFIG.FETCH_CONFIG
            });
            if (!response.ok) {
                throw new Error('Sunucu yanıt vermedi');
            }
            const data = await response.json();
            setAccounts(data);
            setLoading(false);
        } catch (err) {
            console.error('Hata:', err);
            setError('Hesaplar yüklenirken bir hata oluştu');
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const response = await fetch(API_ENDPOINTS.BACKDOOR_TOGGLE_STATUS(id), {
                method: 'PATCH',
                ...API_CONFIG.FETCH_CONFIG
            });
            if (response.ok) {
                fetchAccounts();
            }
        } catch (err) {
            setError('Hesap durumu değiştirilirken bir hata oluştu');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu hesabı silmek istediğinize emin misiniz?')) return;

        try {
            const response = await fetch(API_ENDPOINTS.BACKDOOR_DELETE(id), {
                method: 'DELETE',
                ...API_CONFIG.FETCH_CONFIG
            });
            if (response.ok) {
                fetchAccounts();
            }
        } catch (err) {
            setError('Hesap silinirken bir hata oluştu');
        }
    };

    const handleResetPassword = async (id) => {
        try {
            const response = await fetch(API_ENDPOINTS.BACKDOOR_RESET_PASSWORD(id), {
                method: 'POST',
                ...API_CONFIG.FETCH_CONFIG
            });
            if (response.ok) {
                const data = await response.json();
                alert(`Yeni şifre: ${data.newPassword}`);
            }
        } catch (err) {
            setError('Şifre sıfırlanırken bir hata oluştu');
        }
    };

    if (loading) return <div>Yükleniyor...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="backdoor-management">
            <h2>BackDoor Hesapları</h2>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Kullanıcı Adı</th>
                            <th>Durum</th>
                            <th>Son Giriş</th>
                            <th>Oluşturulma Tarihi</th>
                            <th>Not</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map(account => (
                            <tr key={account._id}>
                                <td>{account.username}</td>
                                <td>
                                    <span className={`status-badge ${account.isActive ? 'active' : 'inactive'}`}>
                                        {account.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                                </td>
                                <td>{account.lastLogin ? new Date(account.lastLogin).toLocaleString('tr-TR') : '-'}</td>
                                <td>{new Date(account.createdAt).toLocaleString('tr-TR')}</td>
                                <td>{account.note || '-'}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button 
                                            onClick={() => handleToggleStatus(account._id)}
                                            className={account.isActive ? 'deactivate-button' : 'activate-button'}
                                        >
                                            {account.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                                        </button>
                                        <button 
                                            onClick={() => handleResetPassword(account._id)}
                                            className="reset-button"
                                        >
                                            Şifre Sıfırla
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(account._id)}
                                            className="delete-button"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BackDoorManagement; 
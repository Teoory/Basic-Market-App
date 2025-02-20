import { useState } from 'react';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

const OrderModal = ({ product, onClose }) => {
    const [orderData, setOrderData] = useState({
        fullName: '',
        phoneNumber: '',
        note: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(API_ENDPOINTS.ORDERS, {
                method: 'POST',
                ...API_CONFIG.FETCH_CONFIG,
                body: JSON.stringify({
                    productId: product._id,
                    fullName: orderData.fullName,
                    phoneNumber: orderData.phoneNumber,
                    note: orderData.note
                })
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Bir hata oluştu');
            }
        } catch (err) {
            console.error('Sipariş oluşturulurken hata:', err);
            setError('Sipariş oluşturulurken bir hata oluştu');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <h2>Sipariş Oluştur</h2>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">Siparişiniz başarıyla oluşturuldu!</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Ad Soyad</label>
                        <input
                            type="text"
                            value={orderData.fullName}
                            onChange={(e) => setOrderData({...orderData, fullName: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Telefon Numarası</label>
                        <input
                            type="tel"
                            value={orderData.phoneNumber}
                            onChange={(e) => setOrderData({...orderData, phoneNumber: e.target.value})}
                            placeholder="000-0000"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Sipariş Notu</label>
                        <div className="textarea-container">
                            <textarea
                                value={orderData.note}
                                onChange={(e) => setOrderData({...orderData, note: e.target.value})}
                                placeholder="Sipariş notunuzu girin (opsiyonel)"
                                maxLength={255}
                                className="order-note"
                            />
                            <div className="char-count">
                                {orderData.note.length}/255
                            </div>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-button">
                            İptal
                        </button>
                        <button type="submit" className="submit-button" disabled={isSubmitting}>
                            Sipariş Ver
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderModal; 
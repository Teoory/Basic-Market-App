import { useState } from 'react';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

const AddProductModal = ({ onClose, onAdd }) => {
    const [productData, setProductData] = useState({
        name: '',
        price: '',
        stock: '',
        description: '',
        imageUrl: '',
        discountPercentage: '0',
        originalPrice: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_ENDPOINTS.PRODUCTS, {
                method: 'POST',
                ...API_CONFIG.FETCH_CONFIG,
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                const newProduct = await response.json();
                onAdd(newProduct);
                onClose();
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Bir hata oluştu');
            }
        } catch (err) {
            console.error('Ürün eklenirken hata:', err);
            setError('Ürün eklenirken bir hata oluştu');
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <h2>Yeni Ürün Ekle</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Ürün Adı</label>
                        <input
                            type="text"
                            value={productData.name}
                            onChange={(e) => setProductData({...productData, name: e.target.value})}
                            placeholder="Ürün adını girin"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Fiyat (₺)</label>
                        <input
                            type="number"
                            value={productData.price}
                            onChange={(e) => setProductData({...productData, price: e.target.value, originalPrice: e.target.value})}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Stok Adedi</label>
                        <input
                            type="number"
                            value={productData.stock}
                            onChange={(e) => setProductData({...productData, stock: e.target.value})}
                            placeholder="0"
                            min="0"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>İndirim Yüzdesi (%)</label>
                        <input
                            type="number"
                            value={productData.discountPercentage}
                            onChange={(e) => setProductData({...productData, discountPercentage: e.target.value})}
                            placeholder="0"
                            min="0"
                            max="100"
                        />
                    </div>
                    <div className="form-group">
                        <label>Resim URL</label>
                        <input
                            type="url"
                            value={productData.imageUrl}
                            onChange={(e) => setProductData({...productData, imageUrl: e.target.value})}
                            placeholder="https://example.com/image.jpg"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Ürün Açıklaması</label>
                        <textarea
                            value={productData.description}
                            onChange={(e) => setProductData({...productData, description: e.target.value})}
                            placeholder="Ürün açıklamasını girin"
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-button">
                            İptal
                        </button>
                        <button type="submit" className="submit-button">
                            Ürün Ekle
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal; 
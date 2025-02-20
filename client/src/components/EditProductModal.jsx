import { useState } from 'react';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

const EditProductModal = ({ product, onClose, onUpdate }) => {
    const [productData, setProductData] = useState({
        name: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description,
        imageUrl: product.imageUrl,
        discountPercentage: product.discountPercentage || '0'
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_ENDPOINTS.PRODUCT_DETAIL(product._id), {
                method: 'PUT',
                ...API_CONFIG.FETCH_CONFIG,
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                const updatedProduct = await response.json();
                onUpdate(updatedProduct);
                onClose();
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Bir hata oluştu');
            }
        } catch (err) {
            console.error('Ürün güncellenirken hata:', err);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <h2>Ürünü Düzenle</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Ürün Adı</label>
                        <input
                            type="text"
                            value={productData.name}
                            onChange={(e) => setProductData({...productData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Fiyat (₺)</label>
                        <input
                            type="number"
                            value={productData.price}
                            onChange={(e) => setProductData({...productData, price: e.target.value})}
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
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Ürün Açıklaması</label>
                        <textarea
                            value={productData.description}
                            onChange={(e) => setProductData({...productData, description: e.target.value})}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-button">
                            İptal
                        </button>
                        <button type="submit" className="submit-button">
                            Güncelle
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductModal; 
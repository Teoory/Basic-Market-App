import { useState, useEffect } from 'react';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

const ProductSelectModal = ({ onClose, onSelect }) => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.PRODUCTS, {
                    ...API_CONFIG.FETCH_CONFIG
                });
                const data = await response.json();
                setProducts(data);
                setLoading(false);
            } catch (err) {
                console.error('Ürünler yüklenirken hata:', err);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content product-select-modal">
                <h2>Ürün Seç</h2>
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Ürün ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {loading ? (
                    <div className="loading">Yükleniyor...</div>
                ) : (
                    <div className="products-grid">
                        {filteredProducts.map(product => (
                            <div 
                                key={product._id} 
                                className="product-select-card"
                                onClick={() => onSelect(product)}
                            >
                                <img src={product.imageUrl} alt={product.name} />
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <p className="price">{product.price}₺</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button className="close-button" onClick={onClose}>
                    Kapat
                </button>
            </div>
        </div>
    );
};

export default ProductSelectModal; 
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

const ProductList = () => {
    const [products, setProducts] = useState([]);

    const fetchProducts = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.PRODUCTS, {
                ...API_CONFIG.FETCH_CONFIG
            });
            const data = await response.json();
            // İndirimli ürünleri öne al
            const sortedProducts = [...data].sort((a, b) => {
                // Önce indirimli ürünleri göster
                if (a.discountPercentage > 0 && b.discountPercentage === 0) return -1;
                if (a.discountPercentage === 0 && b.discountPercentage > 0) return 1;
                // İndirim oranı yüksek olanı daha önce göster
                if (a.discountPercentage > b.discountPercentage) return -1;
                if (a.discountPercentage < b.discountPercentage) return 1;
                return 0;
            });
            setProducts(sortedProducts);
        } catch (err) {
            console.error('Ürünler yüklenirken hata:', err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    if (products.length === 0) {
        return (
            <div className="no-products">
                <p>Henüz ürün bulunmamaktadır.</p>
            </div>
        );
    }

    return (
        <div className="product-list">
            {products.map(product => (
                <Link 
                    to={`/product/${product._id}`} 
                    key={product._id} 
                    className={`product-card ${product.discountPercentage > 0 ? 'discounted' : ''}`}
                >
                    <div className="product-image">
                        <img src={product.imageUrl} alt={product.name} />
                    </div>
                    <div className="product-info">
                        <h3 className="product-name">{product.name}</h3>
                        <div className="product-price">
                            {product.discountPercentage > 0 ? (
                                <>
                                    <span className="original-price">{product.originalPrice}₺</span>
                                    <span className="discounted-price">{product.price}₺</span>
                                    <span className="discount-badge">%{product.discountPercentage}</span>
                                </>
                            ) : (
                                <span className="price">{product.price}₺</span>
                            )}
                        </div>
                        <div className="product-stock">
                            <span className="in-stock">Stokta: {product.stock}</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default ProductList; 
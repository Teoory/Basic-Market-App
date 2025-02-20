import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const query = searchParams.get('q');

    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                const response = await fetch(API_ENDPOINTS.PRODUCT_SEARCH_FULL(query), {
                    ...API_CONFIG.FETCH_CONFIG
                });
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                }
            } catch (err) {
                console.error('Arama sonuçları yüklenirken hata:', err);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchSearchResults();
        }
    }, [query]);

    return (
        <div className="page-wrapper">
            <Navbar />
            <main className="main-content">
                <div className="container">
                    <div className="search-results-header">
                        <h1>
                            {loading ? (
                                'Aranıyor...'
                            ) : (
                                products.length > 0 ? (
                                    `"${query}" için ${products.length} sonuç bulundu`
                                ) : (
                                    `"${query}" için sonuç bulunamadı`
                                )
                            )}
                        </h1>
                    </div>

                    {loading ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                        </div>
                    ) : products.length > 0 ? (
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
                    ) : (
                        <div className="no-results">
                            <p>Aramanızla eşleşen ürün bulunamadı.</p>
                            <p>Farklı anahtar kelimeler deneyebilir veya filtreleri değiştirebilirsiniz.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SearchResults; 
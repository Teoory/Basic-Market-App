import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ProductList from '../components/ProductList';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [cars, setCars] = useState([]);
    const [activeTab, setActiveTab] = useState('products'); // 'products' veya 'cars'

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.PRODUCTS, {
                    ...API_CONFIG.FETCH_CONFIG
                });
                const data = await response.json();
                
                // Ürünleri ve arabaları ayır
                const normalProducts = data.filter(item => item.type !== 'car');
                const carProducts = data.filter(item => item.type === 'car');
                
                setProducts(normalProducts);
                setCars(carProducts);
            } catch (err) {
                console.error('Ürünler yüklenirken hata:', err);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="page-wrapper">
            <Navbar />
            <main className="main-content">
                <div className="container">
                    <div className="tabs">
                        <button 
                            className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
                            onClick={() => setActiveTab('products')}
                        >
                            Ürünlerimiz
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'cars' ? 'active' : ''}`}
                            onClick={() => setActiveTab('cars')}
                        >
                            Arabalarımız
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'products' && (
                            <section className="products-section">
                                <ProductList products={products} />
                            </section>
                        )}

                        {activeTab === 'cars' && (
                            <section className="cars-section">
                                <ProductList products={cars} />
                            </section>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home; 
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Slider from 'react-slick';
import Navbar from '../components/Navbar';
import OrderModal from '../components/OrderModal';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

// Slick carousel stillerini import et
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ProductDetail = () => {
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const { id } = useParams();
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [globalSettings, setGlobalSettings] = useState({
        isOrderButtonGloballyHidden: false
    });

    // Slider ayarları
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false,
        afterChange: (index) => setCurrentImageIndex(index),
        adaptiveHeight: true,
        arrows: true,
        className: "product-slider"
    };

    useEffect(() => {
        let isMounted = true; // Component mount durumunu kontrol et
        
        const fetchProduct = async () => {
            try {
                // Önce ürün detayını getir
                const response = await fetch(API_ENDPOINTS.PRODUCT_DETAIL(id), {
                    ...API_CONFIG.FETCH_CONFIG
                });
                const data = await response.json();
                
                if (isMounted) {
                    setProduct(data);
                    
                    // Görüntüleme sayısını artır (sadece bir kez)
                    await fetch(API_ENDPOINTS.PRODUCT_VIEW(id), {
                        method: 'POST',
                        ...API_CONFIG.FETCH_CONFIG
                    });
                }
            } catch (err) {
                console.error('Ürün detayı yüklenirken hata:', err);
            }
        };

        const fetchRelatedProducts = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.PRODUCTS, {
                    ...API_CONFIG.FETCH_CONFIG
                });
                const data = await response.json();
                const filtered = data.filter(p => p._id !== id);
                const shuffled = filtered.sort(() => 0.5 - Math.random());
                
                if (isMounted) {
                    setRelatedProducts(shuffled.slice(0, 4));
                }
            } catch (err) {
                console.error('İlgili ürünler yüklenirken hata:', err);
            }
        };

        const fetchSettings = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.SETTINGS, {
                    ...API_CONFIG.FETCH_CONFIG
                });
                if (response.ok) {
                    const data = await response.json();
                    setGlobalSettings(data);
                }
            } catch (err) {
                console.error('Ayarlar yüklenirken hata:', err);
            }
        };

        fetchProduct();
        fetchRelatedProducts();
        fetchSettings();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [id]); // Sadece id değiştiğinde tetiklensin

    if (!product) return <div>Yükleniyor...</div>;

    // Tüm görselleri bir araya getir
    const allImages = product.type === 'car' && product.images?.length > 0
        ? [product.imageUrl, ...product.images.map(img => img.url)]
        : [product.imageUrl];

    return (
        <div className="page-wrapper">
            <Navbar />
            <main className="main-content">
                <div className="container">
                    <div className="product-detail-container">
                        <div className="product-detail-left">
                            <div className="product-detail-image">
                                {allImages.length > 1 ? (
                                    <>
                                        <Slider {...sliderSettings}>
                                            {allImages.map((imgUrl, index) => (
                                                <div key={index} className="slider-image-container">
                                                    <img 
                                                        src={imgUrl} 
                                                        alt={`${product.name} - Görsel ${index + 1}`}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/400x300?text=Resim+Yüklenemedi';
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </Slider>
                                        <div className="image-counter">
                                            {currentImageIndex + 1} / {allImages.length}
                                        </div>
                                    </>
                                ) : (
                                    <img 
                                        src={product.imageUrl} 
                                        alt={product.name}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/400x300?text=Resim+Yüklenemedi';
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="product-detail-right">
                            <h1 className="product-detail-title">{product.name}</h1>
                            <div className="product-detail-price">
                                {product.discountPercentage > 0 ? (
                                    <>
                                        <span className="original-price">{product.originalPrice}₺</span>
                                        <span className="discounted-price">{product.price}₺</span>
                                        <span className="discount-badge">%{product.discountPercentage} İndirim</span>
                                    </>
                                ) : (
                                    <span className="price">{product.price}₺</span>
                                )}
                            </div>
                            <div className="product-detail-stock">
                                <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                                    {product.stock > 0 ? `Stokta ${product.stock} adet var` : 'Tükendi'}
                                </span>
                            </div>
                            <div className="product-detail-description">
                                <h2>Ürün Açıklaması</h2>
                                <p>{product.description}</p>
                            </div>
                            {!globalSettings.isOrderButtonGloballyHidden && (
                                <button 
                                    className="order-button"
                                    onClick={() => setIsOrderModalOpen(true)}
                                    disabled={product.stock === 0}
                                >
                                    {product.stock === 0 ? 'Stokta Yok' : 'Almak İstiyorum'}
                                </button>
                            )}
                        </div>
                    </div>

                    {relatedProducts.length > 0 && (
                        <div className="related-products">
                            <h2>Diğer Ürünler</h2>
                            <div className="related-products-grid">
                                {relatedProducts.map(relatedProduct => (
                                    <Link 
                                        to={`/product/${relatedProduct._id}`} 
                                        key={relatedProduct._id} 
                                        className="product-card"
                                    >
                                        <div className="product-image">
                                            <img src={relatedProduct.imageUrl} alt={relatedProduct.name} />
                                        </div>
                                        <div className="product-info">
                                            <h3 className="product-name">{relatedProduct.name}</h3>
                                            <div className="product-price">
                                                {relatedProduct.discountPercentage > 0 ? (
                                                    <>
                                                        <span className="original-price">{relatedProduct.originalPrice}₺</span>
                                                        <span className="discounted-price">{relatedProduct.price}₺</span>
                                                        <span className="discount-badge">%{relatedProduct.discountPercentage}</span>
                                                    </>
                                                ) : (
                                                    <span className="price">{relatedProduct.price}₺</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {isOrderModalOpen && (
                <OrderModal 
                    product={product}
                    onClose={() => setIsOrderModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ProductDetail; 
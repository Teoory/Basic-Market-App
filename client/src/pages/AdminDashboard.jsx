import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AddProductModal from '../components/AddProductModal';
import EditProductModal from '../components/EditProductModal';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import { Link } from 'react-router-dom';
import AddCarModal from '../components/AddCarModal';
import CreateBackDoorModal from '../components/CreateBackDoorModal';
import BackDoorManagement from '../components/BackDoorManagement';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [sortConfig, setSortConfig] = useState({
        key: 'viewCount',
        direction: 'desc'
    });
    const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
    const [isBackDoorModalOpen, setIsBackDoorModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('products'); // 'products' veya 'backdoor'
    const [globalSettings, setGlobalSettings] = useState({
        isOrderButtonGloballyHidden: false
    });

    useEffect(() => {
        fetchProducts();
        fetchSettings();
    }, []);

    useEffect(() => {
        // Arama terimi değiştiğinde filtreleme yap
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    const fetchProducts = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.PRODUCTS + '?showAll=true', {
                ...API_CONFIG.FETCH_CONFIG
            });
            const data = await response.json();
            // Başlangıçta görüntülenme sayısına göre azalan sıralama
            const sortedData = [...data].sort((a, b) => {
                return b.viewCount - a.viewCount; // Büyükten küçüğe sıralama
            });
            setProducts(sortedData);
        } catch (err) {
            console.error('Ürünler yüklenirken hata:', err);
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

    const handleAddProduct = (newProduct) => {
        setProducts([...products, newProduct]);
        setIsAddModalOpen(false);
    };

    const handleUpdateProduct = (updatedProduct) => {
        setProducts(products.map(p => 
            p._id === updatedProduct._id ? updatedProduct : p
        ));
        setEditingProduct(null);
    };

    const handleToggleVisibility = async (productId) => {
        try {
            const response = await fetch(API_ENDPOINTS.PRODUCT_TOGGLE_VISIBILITY(productId), {
                method: 'PATCH',
                ...API_CONFIG.FETCH_CONFIG
            });

            if (response.ok) {
                const updatedProduct = await response.json();
                setProducts(products.map(p => 
                    p._id === updatedProduct._id ? updatedProduct : p
                ));
            }
        } catch (err) {
            console.error('Ürün görünürlüğü değiştirilirken hata:', err);
        }
    };

    const handleToggleOrderButton = async (productId) => {
        try {
            const response = await fetch(API_ENDPOINTS.PRODUCT_TOGGLE_ORDER_BUTTON(productId), {
                method: 'PATCH',
                ...API_CONFIG.FETCH_CONFIG
            });

            if (response.ok) {
                const updatedProduct = await response.json();
                setProducts(products.map(p => 
                    p._id === updatedProduct._id ? updatedProduct : p
                ));
            }
        } catch (err) {
            console.error('Sipariş butonu durumu değiştirilirken hata:', err);
        }
    };

    const handleToggleGlobalOrderButton = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.SETTINGS_TOGGLE_ORDER_BUTTON, {
                method: 'PATCH',
                ...API_CONFIG.FETCH_CONFIG
            });
            if (response.ok) {
                const data = await response.json();
                setGlobalSettings(data);
            }
        } catch (err) {
            console.error('Global sipariş butonu durumu değiştirilirken hata:', err);
        }
    };

    const sortData = (key, data = products) => {
        let direction = 'desc'; // Varsayılan sıralama yönünü desc yap
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc'; // Sadece aynı sütuna tekrar tıklandığında asc yap
        }
        setSortConfig({ key, direction });

        const sortedData = [...data].sort((a, b) => {
            if (key === 'name' || key === 'status') {
                const aValue = key === 'status' ? (a.isHidden ? 'Gizli' : 'Aktif') : a[key].toLowerCase();
                const bValue = key === 'status' ? (b.isHidden ? 'Gizli' : 'Aktif') : b[key].toLowerCase();
                return direction === 'asc' 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            
            if (key === 'price' || key === 'stock' || key === 'viewCount' || key === 'discountPercentage') {
                const aValue = parseFloat(a[key]);
                const bValue = parseFloat(b[key]);
                return direction === 'asc' ? aValue - bValue : bValue - aValue;
            }
            
            return 0;
        });

        setProducts(sortedData);
    };

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
        }
        return '';
    };

    return (
        <div className="page-wrapper">
            <Navbar />
            <main className="main-content">
                <div className="container">
                    <div className="dashboard-header">
                        <h1>Admin Paneli</h1>
                        <div className="dashboard-actions">
                            <button 
                                className="add-product-button"
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                Yeni Ürün Ekle
                            </button>
                            <button 
                                className="add-car-button"
                                onClick={() => setIsAddCarModalOpen(true)}
                            >
                                Yeni Araba Ekle
                            </button>
                            <button 
                                className="backdoor-button action-button"
                                onClick={() => setIsBackDoorModalOpen(true)}
                            >
                                BackDoor Hesabı Oluştur
                            </button>
                            <button 
                                className={`global-order-button ${globalSettings.isOrderButtonGloballyHidden ? 'show-button' : 'hide-button'}`}
                                onClick={handleToggleGlobalOrderButton}
                            >
                                {globalSettings.isOrderButtonGloballyHidden ? 
                                    'Tüm Almak İstiyorum Butonlarını Aç' : 
                                    'Tüm Almak İstiyorum Butonlarını Kapat'}
                            </button>
                        </div>
                    </div>

                    <div className="admin-tabs">
                        <button 
                            className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
                            onClick={() => setActiveTab('products')}
                        >
                            Ürünler
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'backdoor' ? 'active' : ''}`}
                            onClick={() => setActiveTab('backdoor')}
                        >
                            BackDoor Hesapları
                        </button>
                    </div>

                    {activeTab === 'products' ? (
                        <div className="products-section">
                            <div className="products-header">
                                <h2>Ürün Listesi</h2>
                                <div className="search-box">
                                    <input
                                        type="text"
                                        placeholder="Ürün ara..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="table-container">
                                <table className="popular-products-table">
                                    <thead>
                                        <tr>
                                            <th onClick={() => sortData('name')} className="sortable">
                                                Ürün {getSortIcon('name')}
                                            </th>
                                            <th onClick={() => sortData('price')} className="sortable">
                                                Fiyat {getSortIcon('price')}
                                            </th>
                                            <th onClick={() => sortData('discountPercentage')} className="sortable">
                                                İndirim {getSortIcon('discountPercentage')}
                                            </th>
                                            <th onClick={() => sortData('stock')} className="sortable">
                                                Stok {getSortIcon('stock')}
                                            </th>
                                            <th onClick={() => sortData('viewCount')} className="sortable">
                                                Görüntülenme {getSortIcon('viewCount')}
                                            </th>
                                            <th onClick={() => sortData('status')} className="sortable">
                                                Durum {getSortIcon('status')}
                                            </th>
                                            <th>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map(product => (
                                            <tr key={product._id}>
                                                <td>
                                                    <img src={product.imageUrl} alt={product.name} />
                                                    <Link to={`/product/${product._id}`} className="product-name-link">
                                                        {product.name}
                                                    </Link>
                                                </td>
                                                <td>
                                                    {product.discountPercentage > 0 ? (
                                                        <div className="price-column">
                                                            <span className="discounted-price">{product.price}₺</span>
                                                            <span className="original-price">{product.originalPrice}₺</span>
                                                        </div>
                                                    ) : (
                                                        <span>{product.price}₺</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {product.discountPercentage > 0 ? (
                                                        <span className="discount-badge">%{product.discountPercentage}</span>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td>{product.stock}</td>
                                                <td>
                                                    <span className="view-count">{product.viewCount}</span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${product.isHidden ? 'hidden' : 'active'}`}>
                                                        {product.isHidden ? 'Gizli' : 'Aktif'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        className="edit-button"
                                                        onClick={() => setEditingProduct(product)}
                                                    >
                                                        Düzenle
                                                    </button>
                                                    <button 
                                                        className={`visibility-button ${product.isHidden ? 'show-button' : 'hide-button'}`}
                                                        onClick={() => handleToggleVisibility(product._id)}
                                                    >
                                                        {product.isHidden ? 'Göster' : 'Gizle'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <BackDoorManagement />
                    )}
                </div>
            </main>

            {isAddModalOpen && (
                <AddProductModal 
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={handleAddProduct}
                />
            )}

            {isAddCarModalOpen && (
                <AddCarModal 
                    onClose={() => setIsAddCarModalOpen(false)}
                    onAdd={handleAddProduct}
                />
            )}

            {editingProduct && (
                <EditProductModal 
                    product={editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onUpdate={handleUpdateProduct}
                />
            )}

            {isBackDoorModalOpen && (
                <CreateBackDoorModal 
                    onClose={() => setIsBackDoorModalOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminDashboard; 
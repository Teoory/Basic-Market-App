import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const SaleDetailsModal = ({ sale, onClose }) => {
    if (!sale) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Satış Detayları</h2>
                <div className="sale-details-content">
                    <div className="detail-group">
                        <h3>Temel Bilgiler</h3>
                        <p><strong>İsim:</strong> {sale.name}</p>
                        {sale.description && (
                            <p><strong>Açıklama:</strong> {sale.description}</p>
                        )}
                        <p><strong>Tarih:</strong> {new Date(sale.createdAt).toLocaleString('tr-TR')}</p>
                    </div>

                    <div className="detail-group">
                        <h3>Değerler</h3>
                        <div className="values-list">
                            {sale.values.map((value, index) => (
                                <span key={index} className="value-chip">
                                    {value}₺
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="detail-group">
                        <h3>Hesaplamalar</h3>
                        <p><strong>Toplam Maliyet:</strong> {sale.totalCost}₺</p>
                        <p><strong>Kar Oranı:</strong> %{sale.profitRate}</p>
                        <p><strong>Kar Miktarı:</strong> {(sale.profitPrice - sale.totalCost).toFixed(2)}₺</p>
                        <p><strong>Karlı Fiyat:</strong> {sale.profitPrice}₺</p>
                        <p><strong>Vergi Oranı:</strong> %{sale.taxRate}</p>
                        <p><strong>Vergi Miktarı:</strong> {sale.tax}₺</p>
                        <p className="final-price"><strong>Toplam Fiyat:</strong> {sale.finalPrice}₺</p>
                    </div>
                </div>
                <button onClick={onClose} className="close-button">
                    Kapat
                </button>
            </div>
        </div>
    );
};

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [selectedSale, setSelectedSale] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        if (user?.isAdmin) {
            fetchSales();
        }
    }, [user]);

    const fetchSales = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.SALES, {
                ...API_CONFIG.FETCH_CONFIG
            });
            const data = await response.json();
            setSales(data);
        } catch (err) {
            console.error('Satışlar yüklenirken hata:', err);
        }
    };

    // Filtreleme fonksiyonu
    const filteredSales = sales.filter(sale => 
        sale.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.finalPrice.toString().includes(searchTerm)
    );

    if (!user?.isAdmin) {
        return (
            <div className="page-wrapper">
                <Navbar />
                <main className="main-content">
                    <div className="container">
                        <h1>Yetkisiz Erişim</h1>
                        <p>Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <Navbar />
            <main className="main-content">
                <div className="container">
                    <div className="sales-header">
                        <h1>Satışlar</h1>
                        <div className="search-box">
                            <input 
                                type="text" 
                                placeholder="İsim, açıklama veya fiyata göre ara..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="sales-grid">
                        {filteredSales.map(sale => (
                            <div key={sale._id} className="sale-card">
                                <div className="sale-info">
                                    <h3>{sale.name}</h3>
                                    <p className="sale-price">Fiyat: {sale.finalPrice}₺</p>
                                    <p className="sale-date">{new Date(sale.createdAt).toLocaleDateString('tr-TR')}</p>
                                </div>
                                <button 
                                    className="details-button"
                                    onClick={() => setSelectedSale(sale)}
                                >
                                    Detaylar
                                </button>
                            </div>
                        ))}
                    </div>

                    {filteredSales.length === 0 && (
                        <div className="no-results">
                            <p>Arama sonucuna uygun satış bulunamadı.</p>
                        </div>
                    )}

                    {selectedSale && (
                        <SaleDetailsModal 
                            sale={selectedSale} 
                            onClose={() => setSelectedSale(null)} 
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default Sales; 
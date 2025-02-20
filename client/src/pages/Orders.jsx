import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_ENDPOINTS.ORDERS, {
                ...API_CONFIG.FETCH_CONFIG
            });
            const data = await response.json();
            // Sadece productId'si olan siparişleri filtrele
            const validOrders = data.filter(order => order.productId && order.productId._id);
            setOrders(validOrders);
        } catch (err) {
            console.error('Siparişler yüklenirken hata:', err);
            setError('Siparişler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleMarkAsRead = async (orderId) => {
        try {
            const response = await fetch(API_ENDPOINTS.ORDER_MARK_READ(orderId), {
                method: 'PATCH',
                ...API_CONFIG.FETCH_CONFIG
            });

            if (response.ok) {
                setOrders(orders.map(order => 
                    order._id === orderId ? { ...order, isRead: true } : order
                ));
            }
        } catch (err) {
            console.error('Sipariş okundu olarak işaretlenirken hata:', err);
        }
    };

    if (loading) {
        return (
            <div className="page-wrapper">
                <Navbar />
                <main className="main-content">
                    <div className="container">
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-wrapper">
                <Navbar />
                <main className="main-content">
                    <div className="container">
                        <div className="error-message">
                            {error}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="page-wrapper">
                <Navbar />
                <main className="main-content">
                    <div className="container">
                        <div className="no-orders">
                            <p>Henüz sipariş bulunmamaktadır.</p>
                        </div>
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
                    <h1>Siparişler</h1>
                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order._id} className={`order-card ${!order.isRead ? 'unread' : ''}`}>
                                <div className="order-header">
                                    <div className="order-info">
                                        <span className="order-date">
                                            {new Date(order.createdAt).toLocaleString('tr-TR')}
                                        </span>
                                        {!order.isRead && (
                                            <span className="unread-badge">Yeni</span>
                                        )}
                                    </div>
                                    {!order.isRead && (
                                        <button 
                                            className="mark-read-button"
                                            onClick={() => handleMarkAsRead(order._id)}
                                        >
                                            Okundu Olarak İşaretle
                                        </button>
                                    )}
                                </div>
                                <div className="order-content">
                                    <div className="order-product">
                                        {order.productId && (
                                            <>
                                                <img src={order.productId.imageUrl} alt={order.productId.name} />
                                                <div className="product-details">
                                                    <h3>{order.productId.name}</h3>
                                                    <p className="product-price">
                                                        Fiyat: {order.productId.price}₺
                                                        {order.productId.discountPercentage > 0 && (
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px'}}>
                                                                <span style={{ marginLeft: '10px', fontSize: '14px', color: 'gray' }}>
                                                                    Gerçek Fiyat: 
                                                                    <span style={{ marginLeft: '5px' }}>
                                                                        {order.productId.originalPrice}₺
                                                                    </span>
                                                                </span>
                                                                <span style={{ marginLeft: '10px', fontSize: '14px', color: 'gray' }}>
                                                                    İndirim Oranı: {order.productId.discountPercentage}%
                                                                </span>
                                                            </div>
                                                        )}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="customer-details">
                                        <h4>Müşteri Bilgileri</h4>
                                        <p>İsim: {order.fullName}</p>
                                        <p>Telefon: {order.phoneNumber}</p>
                                        {order.note && (
                                            <div className="order-note">
                                                <strong>Sipariş Notu:</strong>
                                                <p>{order.note}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Orders; 
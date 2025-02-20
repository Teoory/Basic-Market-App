import { useState, useEffect, useRef } from 'react';
import { useUser } from '../hooks/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import icon from '../assets/icon.svg';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

const Navbar = () => {
    const { user, logout } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchUnreadCount();
        }

        // Arama dışı tıklamaları dinle
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearching(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ORDER_UNREAD_COUNT, {
                ...API_CONFIG.FETCH_CONFIG
            });
            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.count);
            }
        } catch (err) {
            console.error('Okunmamış sipariş sayısı alınamadı:', err);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearching(false);
            setSearchResults([]);
        }
    };

    const handleSearchInput = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim().length > 2) {
            try {
                const response = await fetch(API_ENDPOINTS.PRODUCT_SEARCH(query), {
                    ...API_CONFIG.FETCH_CONFIG
                });
                const data = await response.json();
                setSearchResults(data);
                setIsSearching(true);
            } catch (err) {
                console.error('Arama hatası:', err);
            }
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-left">
                    <Link to="/" className="navbar-brand">
                        <img src={icon} alt="Senzo" className="navbar-icon" />
                        {/*<span className="navbar-brand-text">Senzo</span>*/}
                    </Link>
                    <button className="menu-toggle" onClick={toggleMenu}>
                        <span className="menu-icon"></span>
                    </button>
                </div>

                <div className={`navbar-center ${isMenuOpen ? 'active' : ''}`}>
                    <div className="search-container" ref={searchRef}>
                        <form onSubmit={handleSearch} className="search-form">
                            <input
                                type="text"
                                placeholder="Ürün ara..."
                                value={searchQuery}
                                onChange={handleSearchInput}
                                onFocus={() => setIsSearching(true)}
                                className="search-input"
                            />
                            <button type="submit" className="search-button">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </form>
                        {isSearching && searchResults.length > 0 && (
                            <div className="search-results">
                                {searchResults.map(product => (
                                    <Link
                                        key={product._id}
                                        to={`/product/${product._id}`}
                                        className="search-result-item"
                                        onClick={() => setIsSearching(false)}
                                    >
                                        <img src={product.imageUrl} alt={product.name} />
                                        <div className="search-result-info">
                                            <h4>{product.name}</h4>
                                            <div className="search-result-price">
                                                {product.discountPercentage > 0 ? (
                                                    <>
                                                        <span className="discounted-price">{product.price}₺</span>
                                                        <span className="original-price">{product.originalPrice}₺</span>
                                                    </>
                                                ) : (
                                                    <span>{product.price}₺</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={`navbar-right ${isMenuOpen ? 'active' : ''}`}>
                    {user ? (
                        <div className="user-menu">
                            {user.role === 'admin' && (
                                <>
                                    <Link to="/admin" className="nav-link admin-link">
                                        Admin Panel
                                    </Link>
                                    <Link 
                                        to="/orders" 
                                        className={`nav-link orders-link ${unreadCount > 0 ? 'has-unread' : ''}`}
                                    >
                                        Siparişler {unreadCount > 0 && `(${unreadCount})`}
                                    </Link>
                                </>
                            )}
                            <span className="username">
                                Merhaba, {user.username}
                            </span>
                            <button onClick={logout} className="logout-button">
                                Çıkış Yap
                            </button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="nav-link login-link">
                                Giriş Yap
                            </Link>
                            <Link to="/register" className="nav-link register-link">
                                Kayıt Ol
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 
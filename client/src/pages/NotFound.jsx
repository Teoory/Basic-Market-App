import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const NotFound = () => {
    return (
        <div className="page-wrapper">
            <Navbar />
            <main className="main-content">
                <div className="not-found-container">
                    <div className="not-found-content">
                        <div className="not-found-code">404</div>
                        <h1>Sayfa Bulunamadı</h1>
                        <p>Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.</p>
                        <div className="not-found-actions">
                            <Link to="/" className="home-button">
                                Ana Sayfaya Dön
                            </Link>
                            <button 
                                onClick={() => window.history.back()} 
                                className="back-button"
                            >
                                Geri Git
                            </button>
                        </div>
                        <div className="not-found-illustration">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M9 9H9.01M15 9H15.01M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NotFound; 
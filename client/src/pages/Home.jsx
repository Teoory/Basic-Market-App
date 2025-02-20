import Navbar from '../components/Navbar';
import ProductList from '../components/ProductList';

const Home = () => {
    return (
        <div className="page-wrapper">
            <Navbar />
            <main className="main-content">
                <div className="container">
                    <h1>Ürünlerimiz</h1>
                    <ProductList />
                </div>
            </main>
        </div>
    );
};

export default Home; 
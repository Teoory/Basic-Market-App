import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { UserProvider } from './hooks/UserContext';
import { AuthProvider } from './contexts/AuthContext';
import Footer from './components/Footer';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <UserProvider>
                <AuthProvider>
                    <AppRouter />
                    <Footer/>
                </AuthProvider>
            </UserProvider>
        </BrowserRouter>
    );
}

export default App;
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { UserProvider } from './hooks/UserContext';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
import Notes from './pages/Notes';
import Calculator from './pages/Calculator';
import Sales from './pages/Sales';

function App() {
    return (
        <BrowserRouter>
            <UserProvider>
                <AuthProvider>
                    <Routes>
                        <Route path="/*" element={<AppRouter />} />
                        <Route path="/notes" element={<Notes />} />
                        <Route path="/calculator" element={<Calculator />} />
                        <Route path="/sales" element={<Sales />} />
                    </Routes>
                </AuthProvider>
            </UserProvider>
        </BrowserRouter>
    );
}

export default App;
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { UserProvider } from './hooks/UserContext';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <UserProvider>
                <AppRouter />
            </UserProvider>
        </BrowserRouter>
    );
}

export default App;
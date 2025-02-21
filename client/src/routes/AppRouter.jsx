import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useUser } from '../hooks/UserContext';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import ProductDetail from '../pages/ProductDetail';
import AdminDashboard from '../pages/AdminDashboard';
import NotFound from '../pages/NotFound';
import Orders from '../pages/Orders';
import Notes from '../pages/Notes';
import Calculator from '../pages/Calculator';
import Sales from '../pages/Sales';

import SearchResults from '../pages/SearchResults';

const AppRouter = () => {
  const location = useLocation();
  const { user } = useUser();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="*" element={<NotFound />} />
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/calculator" element={<Calculator />} />
      {/*<Route path="/search" element={<SearchResults />} />*/}
      {user ? (
        <>
          {user.role === 'admin' && (
            <>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/orders" element={<Orders />} />
            </>
          )}
          <Route path="/notes" element={<Notes />} />
        </>
      ) : (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </>
      )}
    </Routes>
  );
};

export default AppRouter;
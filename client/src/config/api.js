const API_BASE_URL = 'http://localhost:3030';

export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: `${API_BASE_URL}/login`,
    REGISTER: `${API_BASE_URL}/register`,
    LOGOUT: `${API_BASE_URL}/logout`,
    PROFILE: `${API_BASE_URL}/profile`,

    // Product endpoints
    PRODUCTS: `${API_BASE_URL}/products`,
    PRODUCT_DETAIL: (id) => `${API_BASE_URL}/products/${id}`,
    PRODUCT_SEARCH: (query) => `${API_BASE_URL}/products/search?q=${query}`,
    PRODUCT_SEARCH_FULL: (query) => `${API_BASE_URL}/products/search?q=${query}&full=true`,
    PRODUCT_POPULAR: `${API_BASE_URL}/products/popular`,
    PRODUCT_VIEW: (id) => `${API_BASE_URL}/products/${id}/view`,
    PRODUCT_TOGGLE_VISIBILITY: (id) => `${API_BASE_URL}/products/${id}/toggle-visibility`,

    // Order endpoints
    ORDERS: `${API_BASE_URL}/orders`,
    ORDER_MARK_READ: (id) => `${API_BASE_URL}/orders/${id}/mark-as-read`,
    ORDER_UNREAD_COUNT: `${API_BASE_URL}/orders/unread-count`,
    ORDER_DELETE: (id) => `${API_BASE_URL}/orders/${id}`,

    // New endpoint
    SALES: `${API_BASE_URL}/sales`,

    // Notes endpoints
    NOTES: `${API_BASE_URL}/notes`,
    NOTE_STATUS: (id) => `${API_BASE_URL}/notes/${id}/status`,
    NOTE_DELETE: (id) => `${API_BASE_URL}/notes/${id}`,
};

export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    FETCH_CONFIG: {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    }
}; 
/**
 * FanZones API Client
 * Handles all API requests with authentication
 */

const API_BASE_URL = 'https://fanzones-backend.fanzones.workers.dev';

// Token storage
let accessToken = null;
let refreshToken = localStorage.getItem('refreshToken');

export const setTokens = (access, refresh) => {
    accessToken = access;
    if (refresh) {
        refreshToken = refresh;
        localStorage.setItem('refreshToken', refresh);
    }
};

export const clearTokens = () => {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem('refreshToken');
};

export const getAccessToken = () => accessToken;
export const getRefreshToken = () => refreshToken;

/**
 * Make an API request with automatic token refresh
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    let response = await fetch(url, {
        ...options,
        headers,
    });

    // If 401 and we have a refresh token, try to refresh
    if (response.status === 401 && refreshToken && !endpoint.includes('/auth/refresh')) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            // Retry the original request with new token
            headers['Authorization'] = `Bearer ${accessToken}`;
            response = await fetch(url, {
                ...options,
                headers,
            });
        }
    }

    return response;
}

/**
 * Refresh the access token
 */
async function refreshAccessToken() {
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            setTokens(data.accessToken, data.refreshToken);
            return true;
        } else {
            clearTokens();
            return false;
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
        clearTokens();
        return false;
    }
}

// ============ Auth API ============

export async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Login failed');
    }

    setTokens(data.accessToken, data.refreshToken);
    return data;
}

export async function register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
    }

    return data;
}

export async function logout() {
    try {
        await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        clearTokens();
    }
}

// ============ User API ============

export async function getCurrentUser() {
    const response = await apiRequest('/me');

    if (!response.ok) {
        throw new Error('Failed to get user');
    }

    return response.json();
}

export async function getUsers(limit = 50, offset = 0) {
    const response = await apiRequest(`/users?limit=${limit}&offset=${offset}`);

    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }

    return response.json();
}

export async function getUserCount() {
    const response = await apiRequest('/users/count');

    if (!response.ok) {
        throw new Error('Failed to fetch user count');
    }

    return response.json();
}

export async function getUser(id) {
    const response = await apiRequest(`/users/${id}`);

    if (!response.ok) {
        throw new Error('Failed to fetch user');
    }

    return response.json();
}

export async function updateUser(id, userData) {
    const response = await apiRequest(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
    }

    return data;
}

export async function deleteUser(id) {
    const response = await apiRequest(`/users/${id}`, {
        method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
    }

    return data;
}

// Create user (uses register endpoint)
export async function createUser(userData) {
    return register(userData);
}

export default {
    login,
    register,
    logout,
    getCurrentUser,
    getUsers,
    getUserCount,
    getUser,
    updateUser,
    deleteUser,
    createUser,
    setTokens,
    clearTokens,
    getAccessToken,
    getRefreshToken,
};

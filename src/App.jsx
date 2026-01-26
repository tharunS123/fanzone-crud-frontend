import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <Routes>
            {/* Public routes */}
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
            />

            {/* Protected routes with layout */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    )
}

export default App

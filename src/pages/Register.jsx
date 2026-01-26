import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function Register() {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { register } = useAuth();
    const { success, error: showError } = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.username) {
            newErrors.username = 'Username is required';
        } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(formData.username)) {
            newErrors.username = 'Username must be 3-30 chars, alphanumeric and underscores only';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 12) {
            newErrors.password = 'Password must be at least 12 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);

        try {
            await register({
                email: formData.email,
                username: formData.username,
                password: formData.password,
                first_name: formData.first_name || undefined,
                last_name: formData.last_name || undefined,
            });
            success('Account created! Please log in.', 'Registration Successful');
            navigate('/login');
        } catch (err) {
            showError(err.message || 'Registration failed');
            setErrors({ general: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-logo">
                    <h1>🏟️ FanZones</h1>
                    <p>Create Admin Account</p>
                </div>

                <div className="auth-card">
                    <form onSubmit={handleSubmit} className="auth-form">
                        <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                            Sign Up
                        </h2>

                        {errors.general && (
                            <div className="form-error" style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--error-bg)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center'
                            }}>
                                {errors.general}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div className="form-group">
                                <label htmlFor="first_name" className="form-label">First Name</label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    className="form-input"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="John"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="last_name" className="form-label">Last Name</label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    className="form-input"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email *</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className={`form-input ${errors.email ? 'error' : ''}`}
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                            />
                            {errors.email && <span className="form-error">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="username" className="form-label">Username *</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                className={`form-input ${errors.username ? 'error' : ''}`}
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="johndoe"
                                required
                            />
                            {errors.username && <span className="form-error">{errors.username}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Password *</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className={`form-input ${errors.password ? 'error' : ''}`}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••••••"
                                required
                            />
                            {errors.password && <span className="form-error">{errors.password}</span>}
                            <span className="form-hint">Minimum 12 characters</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••••••"
                                required
                            />
                            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                            style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner" style={{ width: 20, height: 20 }}></span>
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>
                </div>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;

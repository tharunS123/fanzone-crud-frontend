import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const { success } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            success('Welcome back!', 'Login Successful');
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-logo">
                    <h1>🏟️ FanZones</h1>
                    <p>Admin Dashboard</p>
                </div>

                <div className="auth-card">
                    <form onSubmit={handleSubmit} className="auth-form">
                        <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                            Sign In
                        </h2>

                        {error && (
                            <div className="form-error" style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--error-bg)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                id="email"
                                type="email"
                                className={`form-input ${error ? 'error' : ''}`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                id="password"
                                type="password"
                                className={`form-input ${error ? 'error' : ''}`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                required
                                autoComplete="current-password"
                            />
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
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;

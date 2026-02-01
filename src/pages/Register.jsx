import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Common passwords list (subset for client-side validation)
const COMMON_PASSWORDS = new Set([
    'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
    'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
    'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
    'qazwsx', 'michael', 'football', 'password1', 'password123', 'batman',
    'login', 'admin', 'welcome', 'welcome1', 'p@ssw0rd', 'p@ssword', 'pass@123',
    'admin123', 'root', 'toor', 'changeme', 'password!', 'qwerty123', 'qwerty1',
    '111111', '000000', '1234', '12345', '123456789', '1234567890', '0987654321',
]);

// Weak patterns to detect
const WEAK_PATTERNS = [
    /^(.)\1+$/,                     // All same character
    /^(012|123|234|345|456|567|678|789|890)+$/,  // Number sequences
    /^(abc|bcd|cde|def|efg|fgh|ghi)+$/i,  // Alphabetic sequences
    /^(qwerty|asdf|zxcv)/i,         // Keyboard patterns
];

// Password validation function
function validatePasswordRequirements(password, email, username) {
    const requirements = {
        length: password.length >= 12,
        maxLength: password.length <= 128,
        notCommon: !COMMON_PASSWORDS.has(password.toLowerCase()),
        noPattern: !WEAK_PATTERNS.some(pattern => pattern.test(password)),
        noEmail: !email || !password.toLowerCase().includes(email.split('@')[0].toLowerCase()),
        noUsername: !username || !password.toLowerCase().includes(username.toLowerCase()),
    };

    // Character diversity (optional but improves score)
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[^a-zA-Z0-9]/.test(password);
    const diversityCount = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;

    // Calculate strength score
    let score = 0;
    if (password.length >= 12 && password.length < 16) score += 20;
    else if (password.length >= 16 && password.length < 24) score += 30;
    else if (password.length >= 24) score += 40;
    if (requirements.notCommon) score += 15;
    if (requirements.noPattern) score += 10;
    score += diversityCount * 10;

    const uniqueChars = new Set(password.toLowerCase()).size;
    if (uniqueChars > password.length * 0.6) score += 10;
    score = Math.min(score, 100);

    let strength = 'weak';
    if (score >= 75) strength = 'strong';
    else if (score >= 50) strength = 'good';
    else if (score >= 30) strength = 'fair';

    const allRequired = Object.values(requirements).every(Boolean);

    return { requirements, score, strength, allRequired, diversityCount };
}

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

    // Real-time password validation
    const passwordValidation = useMemo(() => {
        if (!formData.password) {
            return { requirements: {}, score: 0, strength: 'weak', allRequired: false, diversityCount: 0 };
        }
        return validatePasswordRequirements(formData.password, formData.email, formData.username);
    }, [formData.password, formData.email, formData.username]);

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
        } else if (!passwordValidation.allRequired) {
            newErrors.password = 'Password does not meet all requirements';
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

                            {/* Password Strength Meter */}
                            {formData.password && (
                                <div style={{ marginTop: 'var(--spacing-sm)' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-sm)',
                                        marginBottom: 'var(--spacing-xs)'
                                    }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            Strength:
                                        </span>
                                        <div style={{
                                            flex: 1,
                                            height: '6px',
                                            backgroundColor: 'var(--bg-tertiary)',
                                            borderRadius: '3px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${passwordValidation.score}%`,
                                                height: '100%',
                                                backgroundColor: passwordValidation.strength === 'strong' ? '#22c55e' :
                                                    passwordValidation.strength === 'good' ? '#84cc16' :
                                                        passwordValidation.strength === 'fair' ? '#eab308' : '#ef4444',
                                                transition: 'width 0.3s ease, background-color 0.3s ease',
                                                borderRadius: '3px'
                                            }} />
                                        </div>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            textTransform: 'capitalize',
                                            color: passwordValidation.strength === 'strong' ? '#22c55e' :
                                                passwordValidation.strength === 'good' ? '#84cc16' :
                                                    passwordValidation.strength === 'fair' ? '#eab308' : '#ef4444'
                                        }}>
                                            {passwordValidation.strength}
                                        </span>
                                    </div>

                                    {/* Requirements Checklist */}
                                    <div style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: 'var(--spacing-sm)',
                                        marginTop: 'var(--spacing-xs)'
                                    }}>
                                        <p style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            color: 'var(--text-secondary)',
                                            marginBottom: 'var(--spacing-xs)'
                                        }}>
                                            Password Requirements:
                                        </p>
                                        <ul style={{
                                            listStyle: 'none',
                                            padding: 0,
                                            margin: 0,
                                            display: 'grid',
                                            gap: '4px'
                                        }}>
                                            <li style={{
                                                fontSize: '0.75rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                color: passwordValidation.requirements.length ? '#22c55e' : 'var(--text-muted)'
                                            }}>
                                                {passwordValidation.requirements.length ? '✓' : '○'} At least 12 characters
                                            </li>
                                            <li style={{
                                                fontSize: '0.75rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                color: passwordValidation.requirements.maxLength === false ? '#ef4444' :
                                                    passwordValidation.requirements.maxLength ? '#22c55e' : 'var(--text-muted)'
                                            }}>
                                                {passwordValidation.requirements.maxLength === false ? '✗' :
                                                    passwordValidation.requirements.maxLength ? '✓' : '○'} Maximum 128 characters
                                            </li>
                                            <li style={{
                                                fontSize: '0.75rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                color: passwordValidation.requirements.notCommon === false ? '#ef4444' :
                                                    passwordValidation.requirements.notCommon ? '#22c55e' : 'var(--text-muted)'
                                            }}>
                                                {passwordValidation.requirements.notCommon === false ? '✗' :
                                                    passwordValidation.requirements.notCommon ? '✓' : '○'} Not a common password
                                            </li>
                                            <li style={{
                                                fontSize: '0.75rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                color: passwordValidation.requirements.noPattern === false ? '#ef4444' :
                                                    passwordValidation.requirements.noPattern ? '#22c55e' : 'var(--text-muted)'
                                            }}>
                                                {passwordValidation.requirements.noPattern === false ? '✗' :
                                                    passwordValidation.requirements.noPattern ? '✓' : '○'} No predictable patterns
                                            </li>
                                            {formData.email && (
                                                <li style={{
                                                    fontSize: '0.75rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    color: passwordValidation.requirements.noEmail === false ? '#ef4444' :
                                                        passwordValidation.requirements.noEmail ? '#22c55e' : 'var(--text-muted)'
                                                }}>
                                                    {passwordValidation.requirements.noEmail === false ? '✗' :
                                                        passwordValidation.requirements.noEmail ? '✓' : '○'} Does not contain your email
                                                </li>
                                            )}
                                            {formData.username && (
                                                <li style={{
                                                    fontSize: '0.75rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    color: passwordValidation.requirements.noUsername === false ? '#ef4444' :
                                                        passwordValidation.requirements.noUsername ? '#22c55e' : 'var(--text-muted)'
                                                }}>
                                                    {passwordValidation.requirements.noUsername === false ? '✗' :
                                                        passwordValidation.requirements.noUsername ? '✓' : '○'} Does not contain your username
                                                </li>
                                            )}
                                        </ul>

                                        {/* Optional: Character diversity tip */}
                                        {passwordValidation.diversityCount < 3 && (
                                            <p style={{
                                                fontSize: '0.7rem',
                                                color: 'var(--text-muted)',
                                                marginTop: 'var(--spacing-xs)',
                                                fontStyle: 'italic'
                                            }}>
                                                💡 Tip: Mix uppercase, lowercase, numbers, and symbols for a stronger password
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Initial hint when no password yet */}
                            {!formData.password && (
                                <span className="form-hint">Minimum 12 characters required</span>
                            )}
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

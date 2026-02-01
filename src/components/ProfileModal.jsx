import { useState, useEffect } from 'react';
import { getSecurityEvents } from '../api/client';

/**
 * ProfileModal - Displays user profile details and security events
 */
function ProfileModal({ user, onClose }) {
    const [securityEvents, setSecurityEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);

    useEffect(() => {
        const fetchSecurityEvents = async () => {
            try {
                const data = await getSecurityEvents(10);
                setSecurityEvents(data.events || []);
            } catch (error) {
                console.error('Failed to fetch security events:', error);
            } finally {
                setIsLoadingEvents(false);
            }
        };

        fetchSecurityEvents();
    }, []);

    const getInitials = () => {
        if (user?.first_name && user?.last_name) {
            return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        }
        return user?.username?.[0]?.toUpperCase() || 'U';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return formatDate(dateString);
    };

    const getEventIcon = (eventType) => {
        switch (eventType) {
            case 'login_success': return '✅';
            case 'login_failure': return '❌';
            case 'logout': return '🚪';
            case 'password_reset': return '🔑';
            case 'account_locked': return '🔒';
            case 'token_refresh': return '🔄';
            default: return '📋';
        }
    };

    const getEventLabel = (eventType) => {
        switch (eventType) {
            case 'login_success': return 'Successful Login';
            case 'login_failure': return 'Failed Login';
            case 'logout': return 'Logged Out';
            case 'password_reset': return 'Password Reset';
            case 'account_locked': return 'Account Locked';
            case 'token_refresh': return 'Session Refreshed';
            default: return eventType.replace(/_/g, ' ');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)',
                    padding: 'var(--spacing-xl)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                        <div style={{
                            width: '72px',
                            height: '72px',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: 'var(--radius-full)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.75rem',
                            fontWeight: '700',
                            color: 'white',
                            border: '3px solid rgba(255,255,255,0.3)'
                        }}>
                            {user?.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt="Avatar"
                                    style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
                                />
                            ) : getInitials()}
                        </div>
                        <div>
                            <h3 className="modal-title" style={{ color: 'white', margin: 0 }}>
                                {user?.first_name && user?.last_name
                                    ? `${user.first_name} ${user.last_name}`
                                    : user?.username}
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                                @{user?.username}
                            </p>
                        </div>
                    </div>
                    <button
                        className="modal-close"
                        onClick={onClose}
                        style={{ color: 'white' }}
                    >
                        ×
                    </button>
                </div>

                <div className="modal-body" style={{ padding: 0 }}>
                    {/* Profile Information */}
                    <div style={{ padding: 'var(--spacing-xl)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <h4 style={{ margin: '0 0 var(--spacing-md) 0', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                            Profile Information
                        </h4>

                        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Email</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    {user?.email}
                                    {user?.email_verified ? (
                                        <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>Verified</span>
                                    ) : (
                                        <span className="badge badge-warning" style={{ fontSize: '0.625rem' }}>Unverified</span>
                                    )}
                                </span>
                            </div>

                            {user?.bio && (
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Bio</span>
                                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{user.bio}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Account Details */}
                    <div style={{ padding: 'var(--spacing-xl)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <h4 style={{ margin: '0 0 var(--spacing-md) 0', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                            Account Details
                        </h4>

                        <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>User ID</span>
                                <code style={{
                                    fontSize: '0.75rem',
                                    background: 'var(--bg-tertiary)',
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-muted)'
                                }}>
                                    {user?.id}
                                </code>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Account Created</span>
                                <span>{formatDate(user?.created_at)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Last Updated</span>
                                <span>{formatDate(user?.updated_at)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Phone Verified</span>
                                {user?.phone_verified ? (
                                    <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>Yes</span>
                                ) : (
                                    <span className="badge badge-info" style={{ fontSize: '0.625rem' }}>No</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Security Events */}
                    <div style={{ padding: 'var(--spacing-xl)' }}>
                        <h4 style={{ margin: '0 0 var(--spacing-md) 0', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                            Recent Security Activity
                        </h4>

                        {isLoadingEvents ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-lg)' }}>
                                <span className="loading-spinner" style={{ width: 24, height: 24 }}></span>
                            </div>
                        ) : securityEvents.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                                No recent security events
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                {securityEvents.slice(0, 5).map((event) => (
                                    <div
                                        key={event.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--spacing-md)',
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.25rem' }}>{getEventIcon(event.type)}</span>
                                        <div style={{ flex: 1 }}>
                                            <span style={{ fontWeight: '500' }}>{getEventLabel(event.type)}</span>
                                            {event.ip && (
                                                <span style={{ color: 'var(--text-muted)', marginLeft: 'var(--spacing-sm)', fontSize: '0.75rem' }}>
                                                    from {event.ip}
                                                </span>
                                            )}
                                        </div>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                            {formatRelativeTime(event.createdAt)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfileModal;

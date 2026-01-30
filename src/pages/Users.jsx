import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

function Users() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, verified: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ limit: 10, offset: 0 });
    const [activeTab, setActiveTab] = useState('active'); // 'all' or 'active'

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const { success, error: showError } = useToast();

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const showAll = activeTab === 'all';
            const [usersData, statsData] = await Promise.all([
                api.getUsers(pagination.limit, pagination.offset, showAll),
                api.getUserCount()
            ]);
            setUsers(usersData.users);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            showError('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    }, [pagination, activeTab, showError]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleDelete = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handlePermanentDelete = (user) => {
        setSelectedUser(user);
        setShowPermanentDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await api.deleteUser(selectedUser.id);
            success(`User "${selectedUser.username}" deleted`);
            setShowDeleteModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            showError(error.message || 'Failed to delete user');
        }
    };

    const confirmPermanentDelete = async () => {
        try {
            await api.permanentDeleteUser(selectedUser.id);
            success(`User "${selectedUser.username}" permanently deleted`);
            setShowPermanentDeleteModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            showError(error.message || 'Failed to permanently delete user');
        }
    };

    const filteredUsers = users.filter(user => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            user.username?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.first_name?.toLowerCase().includes(searchLower) ||
            user.last_name?.toLowerCase().includes(searchLower)
        );
    });

    const getInitials = (user) => {
        if (user.first_name && user.last_name) {
            return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        }
        return user.username?.[0]?.toUpperCase() || 'U';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div>
            {/* Stats Row */}
            <div className="dashboard-stats mb-xl">
                <div className="stats-card">
                    <div className="stats-card-icon">👥</div>
                    <div className="stats-card-value">{stats.total}</div>
                    <div className="stats-card-label">Total Users</div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon">✅</div>
                    <div className="stats-card-value">{stats.active}</div>
                    <div className="stats-card-label">Active</div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon">📧</div>
                    <div className="stats-card-value">{stats.verified}</div>
                    <div className="stats-card-label">Verified</div>
                </div>
            </div>

            {/* Header with search and add button */}
            <div className="users-header">
                <div className="users-search">
                    <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    ➕ Add User
                </button>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                borderBottom: '2px solid var(--border-color)',
                paddingBottom: '0'
            }}>
                <button
                    onClick={() => { setActiveTab('all'); setPagination(p => ({ ...p, offset: 0 })); }}
                    style={{
                        padding: '12px 20px',
                        border: 'none',
                        background: activeTab === 'all' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'all' ? 'white' : 'var(--text-secondary)',
                        borderRadius: '8px 8px 0 0',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                    }}
                >
                    📊 All Users ({stats.total})
                </button>
                <button
                    onClick={() => { setActiveTab('active'); setPagination(p => ({ ...p, offset: 0 })); }}
                    style={{
                        padding: '12px 20px',
                        border: 'none',
                        background: activeTab === 'active' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'active' ? 'white' : 'var(--text-secondary)',
                        borderRadius: '8px 8px 0 0',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                    }}
                >
                    ✅ Active Users ({stats.active})
                </button>
            </div>

            {/* Users Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {isLoading ? (
                    <div className="text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                        <p className="mt-md text-muted">Loading users...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <h3 className="empty-state-title">No users found</h3>
                        <p className="empty-state-description">
                            {search ? 'Try a different search term' : 'Get started by adding your first user'}
                        </p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-avatar">{getInitials(user)}</div>
                                                <div>
                                                    <div className="user-name">
                                                        {user.first_name && user.last_name
                                                            ? `${user.first_name} ${user.last_name}`
                                                            : user.username}
                                                    </div>
                                                    <div className="user-email">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            {user.is_active !== false ? (
                                                <span className="badge badge-success">Active</span>
                                            ) : (
                                                <span className="badge" style={{ background: '#fee2e2', color: '#dc2626' }}>Inactive</span>
                                            )}
                                        </td>
                                        <td>{formatDate(user.created_at)}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="flex gap-sm" style={{ justifyContent: 'flex-end' }}>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm text-error"
                                                    onClick={() => handleDelete(user)}
                                                >
                                                    🗑️ Delete
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ color: '#ef4444', fontWeight: '600' }}
                                                    onClick={() => handlePermanentDelete(user)}
                                                >
                                                    ⚠️ Permanent
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!isLoading && filteredUsers.length > 0 && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        disabled={pagination.offset === 0}
                        onClick={() => setPagination(p => ({ ...p, offset: Math.max(0, p.offset - p.limit) }))}
                    >
                        ← Previous
                    </button>
                    <span className="pagination-info">
                        Showing {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, stats.active)} of {stats.active}
                    </span>
                    <button
                        className="pagination-btn"
                        disabled={pagination.offset + pagination.limit >= stats.active}
                        onClick={() => setPagination(p => ({ ...p, offset: p.offset + p.limit }))}
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Add User Modal */}
            {showAddModal && (
                <AddUserModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        fetchUsers();
                        setShowAddModal(false);
                    }}
                />
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <EditUserModal
                    user={selectedUser}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedUser(null);
                    }}
                    onSuccess={() => {
                        fetchUsers();
                        setShowEditModal(false);
                        setSelectedUser(null);
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Delete User</h3>
                            <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete <strong>{selectedUser.username}</strong>?</p>
                            <p className="text-muted mt-sm">This action will deactivate the user account.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={confirmDelete}>
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Permanent Delete Confirmation Modal */}
            {showPermanentDeleteModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowPermanentDeleteModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}>
                            <h3 className="modal-title" style={{ color: 'white' }}>⚠️ Permanent Delete</h3>
                            <button className="modal-close" style={{ color: 'white' }} onClick={() => setShowPermanentDeleteModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '16px'
                            }}>
                                <p style={{ color: '#dc2626', fontWeight: '600', marginBottom: '8px' }}>
                                    ⚠️ This action is IRREVERSIBLE!
                                </p>
                                <p style={{ color: '#7f1d1d', fontSize: '14px' }}>
                                    The user and ALL related data (sessions, credentials, tokens) will be permanently removed from the database.
                                </p>
                            </div>
                            <p>Are you sure you want to permanently delete <strong>{selectedUser.username}</strong>?</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowPermanentDeleteModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn"
                                style={{ background: '#dc2626', color: 'white' }}
                                onClick={confirmPermanentDelete}
                            >
                                🗑️ Permanently Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Add User Modal Component
function AddUserModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        first_name: '',
        last_name: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { success } = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.createUser(formData);
            success('User created successfully');
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Add New User</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && (
                            <div className="form-error mb-lg" style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--error-bg)',
                                borderRadius: 'var(--radius-md)'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input
                                    name="first_name"
                                    type="text"
                                    className="form-input"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input
                                    name="last_name"
                                    type="text"
                                    className="form-input"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group mt-md">
                            <label className="form-label">Email *</label>
                            <input
                                name="email"
                                type="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group mt-md">
                            <label className="form-label">Username *</label>
                            <input
                                name="username"
                                type="text"
                                className="form-input"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                pattern="^[a-zA-Z0-9_]{3,30}$"
                                title="3-30 characters, letters, numbers, and underscores only"
                            />
                            <span className="form-hint">3-30 characters, letters, numbers, and underscores only</span>
                        </div>

                        <div className="form-group mt-md">
                            <label className="form-label">Password *</label>
                            <input
                                name="password"
                                type="password"
                                className="form-input"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <span className="form-hint">Minimum 12 characters</span>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { success } = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.updateUser(user.id, formData);
            success('User updated successfully');
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Edit User: {user.username}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && (
                            <div className="form-error mb-lg" style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--error-bg)',
                                borderRadius: 'var(--radius-md)'
                            }}>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={user.email}
                                disabled
                                style={{ opacity: 0.6 }}
                            />
                            <span className="form-hint">Email cannot be changed</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }} className="mt-md">
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input
                                    name="first_name"
                                    type="text"
                                    className="form-input"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input
                                    name="last_name"
                                    type="text"
                                    className="form-input"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group mt-md">
                            <label className="form-label">Bio</label>
                            <textarea
                                name="bio"
                                className="form-input"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={3}
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Users;

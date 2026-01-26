import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/dashboard':
                return 'Dashboard';
            case '/users':
                return 'User Management';
            default:
                return 'FanZones Admin';
        }
    };

    const getInitials = (user) => {
        if (user?.first_name && user?.last_name) {
            return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        }
        return user?.username?.[0]?.toUpperCase() || 'U';
    };

    return (
        <div className="layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <h2>🏟️ FanZones</h2>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-nav-group">
                        <div className="sidebar-nav-label">Main Menu</div>
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                `sidebar-nav-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <span className="sidebar-nav-item-icon">📊</span>
                            Dashboard
                        </NavLink>
                        <NavLink
                            to="/users"
                            className={({ isActive }) =>
                                `sidebar-nav-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <span className="sidebar-nav-item-icon">👥</span>
                            Users
                        </NavLink>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">
                            {getInitials(user)}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">
                                {user?.first_name && user?.last_name
                                    ? `${user.first_name} ${user.last_name}`
                                    : user?.username}
                            </div>
                            <div className="sidebar-user-email">{user?.email}</div>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="btn btn-ghost mt-md"
                        style={{ width: '100%' }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="main-header">
                    <div className="main-header-title">
                        <h1>{getPageTitle()}</h1>
                    </div>
                    <div className="main-header-actions">
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                            Welcome back, {user?.first_name || user?.username}!
                        </span>
                    </div>
                </header>

                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default Layout;

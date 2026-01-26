import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total: 0, active: 0, verified: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.getUserCount();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div>
            {/* Welcome Message */}
            <div className="card mb-xl">
                <h2>
                    Welcome back, {user?.first_name || user?.username}! 👋
                </h2>
                <p className="mt-sm">
                    Here's an overview of your FanZones user base.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="dashboard-stats">
                <div className="stats-card">
                    <div className="stats-card-icon">👥</div>
                    <div className="stats-card-value">
                        {isLoading ? '...' : stats.total}
                    </div>
                    <div className="stats-card-label">Total Users</div>
                </div>

                <div className="stats-card">
                    <div className="stats-card-icon">✅</div>
                    <div className="stats-card-value">
                        {isLoading ? '...' : stats.active}
                    </div>
                    <div className="stats-card-label">Active Users</div>
                </div>

                <div className="stats-card">
                    <div className="stats-card-icon">📧</div>
                    <div className="stats-card-value">
                        {isLoading ? '...' : stats.verified}
                    </div>
                    <div className="stats-card-label">Verified Emails</div>
                </div>

                <div className="stats-card">
                    <div className="stats-card-icon">📈</div>
                    <div className="stats-card-value">
                        {isLoading ? '...' : stats.active > 0
                            ? Math.round((stats.verified / stats.active) * 100)
                            : 0}%
                    </div>
                    <div className="stats-card-label">Verification Rate</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card mt-xl">
                <h3 className="mb-lg">Quick Actions</h3>
                <div className="flex gap-md">
                    <Link to="/users" className="btn btn-primary">
                        👥 Manage Users
                    </Link>
                    <Link to="/users" className="btn btn-secondary">
                        ➕ Add User
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

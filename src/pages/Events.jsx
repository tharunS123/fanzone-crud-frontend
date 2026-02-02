import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

function Events() {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useState({
        keyword: '',
        city: '',
        stateCode: '',
        size: '20'
    });
    const [page, setPage] = useState({ number: 0, totalPages: 0 });

    const fetchEvents = async (params = {}) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getEvents({ ...searchParams, ...params });
            if (data._embedded?.events) {
                setEvents(data._embedded.events);
            } else {
                setEvents([]);
            }
            if (data.page) {
                setPage({
                    number: data.page.number || 0,
                    totalPages: data.page.totalPages || 0
                });
            }
        } catch (err) {
            console.error('Failed to fetch events:', err);
            setError('Failed to load events. Please try again.');
            setEvents([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchEvents({ page: '0' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'TBA';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getEventImage = (event) => {
        if (!event.images || event.images.length === 0) {
            return 'https://via.placeholder.com/300x200?text=No+Image';
        }
        // Find the best image (prefer ratio_16_9 or 4_3)
        const preferred = event.images.find(img =>
            img.ratio === '16_9' && img.width >= 300
        ) || event.images.find(img =>
            img.ratio === '4_3' && img.width >= 300
        ) || event.images[0];
        return preferred.url;
    };

    const getPriceRange = (event) => {
        if (!event.priceRanges || event.priceRanges.length === 0) {
            return null;
        }
        const range = event.priceRanges[0];
        return {
            min: range.min,
            max: range.max,
            currency: range.currency || 'USD'
        };
    };

    return (
        <div>
            {/* Search Form */}
            <div className="card mb-xl">
                <h3 className="mb-lg">🔍 Search Events</h3>
                <form onSubmit={handleSearch} className="events-search-form">
                    <div className="events-search-grid">
                        <div className="form-group">
                            <label className="form-label">Keyword</label>
                            <input
                                type="text"
                                name="keyword"
                                className="form-input"
                                placeholder="Artist, team, event..."
                                value={searchParams.keyword}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">City</label>
                            <input
                                type="text"
                                name="city"
                                className="form-input"
                                placeholder="Los Angeles, New York..."
                                value={searchParams.city}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">State</label>
                            <input
                                type="text"
                                name="stateCode"
                                className="form-input"
                                placeholder="CA, NY, TX..."
                                value={searchParams.stateCode}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                Search Events
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="events-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading events...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="card" style={{ borderColor: 'var(--error)' }}>
                    <p style={{ color: 'var(--error)' }}>⚠️ {error}</p>
                    <button className="btn btn-secondary mt-md" onClick={() => fetchEvents()}>
                        Try Again
                    </button>
                </div>
            )}

            {/* No Results */}
            {!isLoading && !error && events.length === 0 && (
                <div className="card" style={{ textAlign: 'center' }}>
                    <p className="text-muted">No events found. Try adjusting your search criteria.</p>
                </div>
            )}

            {/* Events Grid */}
            {!isLoading && !error && events.length > 0 && (
                <>
                    <div className="events-results-header mb-lg">
                        <h3>📅 {events.length} Events Found</h3>
                        <p className="text-muted">Page {page.number + 1} of {page.totalPages}</p>
                    </div>
                    <div className="events-grid">
                        {events.map((event) => {
                            const priceRange = getPriceRange(event);
                            const venue = event._embedded?.venues?.[0];

                            return (
                                <Link
                                    key={event.id}
                                    to={`/events/${event.id}`}
                                    className="event-card event-card-link"
                                >
                                    <div className="event-card-image">
                                        <img
                                            src={getEventImage(event)}
                                            alt={event.name}
                                            loading="lazy"
                                        />
                                        {priceRange && (
                                            <div className="event-card-price">
                                                ${priceRange.min} - ${priceRange.max}
                                            </div>
                                        )}
                                    </div>
                                    <div className="event-card-content">
                                        <h4 className="event-card-title">{event.name}</h4>

                                        <div className="event-card-date">
                                            <span className="event-card-icon">📅</span>
                                            {formatDate(event.dates?.start?.localDate)}
                                            {event.dates?.start?.localTime && (
                                                <span className="event-card-time">
                                                    {' '}at {formatTime(event.dates.start.localTime)}
                                                </span>
                                            )}
                                        </div>

                                        {venue && (
                                            <div className="event-card-venue">
                                                <span className="event-card-icon">📍</span>
                                                {venue.name}
                                                {venue.city && <span>, {venue.city.name}</span>}
                                                {venue.state && <span>, {venue.state.stateCode}</span>}
                                            </div>
                                        )}

                                        {event.classifications?.[0] && (
                                            <div className="event-card-tags">
                                                {event.classifications[0].segment?.name && (
                                                    <span className="badge badge-info">
                                                        {event.classifications[0].segment.name}
                                                    </span>
                                                )}
                                                {event.classifications[0].genre?.name && (
                                                    <span className="badge badge-success">
                                                        {event.classifications[0].genre.name}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="event-card-actions">
                                            <span className="btn btn-secondary btn-sm">
                                                🗺️ View Details & Map
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {page.totalPages > 1 && (
                        <div className="events-pagination mt-xl">
                            <button
                                className="btn btn-secondary"
                                disabled={page.number === 0}
                                onClick={() => fetchEvents({ page: String(page.number - 1) })}
                            >
                                ← Previous
                            </button>
                            <span className="events-pagination-info">
                                Page {page.number + 1} of {page.totalPages}
                            </span>
                            <button
                                className="btn btn-secondary"
                                disabled={page.number >= page.totalPages - 1}
                                onClick={() => fetchEvents({ page: String(page.number + 1) })}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Events;

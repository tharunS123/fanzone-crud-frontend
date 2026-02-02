import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import VenueMap from '../components/VenueMap';

/**
 * Event Details Page
 * Applies UX Psychology: Von Restorff (distinct CTA), Serial Position (key info first/last),
 * Aesthetic-Usability (premium feel), Figure/Ground (visual hierarchy)
 */
function EventDetails() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await api.getEventById(eventId);
                setEvent(data);
            } catch (err) {
                console.error('Failed to fetch event:', err);
                setError(err.message || 'Failed to load event details');
            } finally {
                setIsLoading(false);
            }
        };

        if (eventId) {
            fetchEvent();
        }
    }, [eventId]);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'Date TBA';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format time for display
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

    // Get best image
    const getHeroImage = () => {
        if (!event?.images?.length) {
            return 'https://via.placeholder.com/1200x500?text=No+Image';
        }
        // Prefer large 16:9 images for hero
        const large = event.images.find(img =>
            img.ratio === '16_9' && img.width >= 1000
        ) || event.images.find(img =>
            img.width >= 800
        ) || event.images[0];
        return large.url;
    };

    // Get seatmap URL
    const getSeatmapUrl = () => {
        return event?.seatmap?.staticUrl || null;
    };

    // Get venue details
    const getVenue = () => {
        return event?._embedded?.venues?.[0] || null;
    };

    // Get price range
    const getPriceRange = () => {
        if (!event?.priceRanges?.length) return null;
        const range = event.priceRanges[0];
        return {
            min: range.min,
            max: range.max,
            currency: range.currency || 'USD'
        };
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="event-details-loading">
                <div className="loading-spinner"></div>
                <p>Loading event details...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="event-details-error card">
                <h2>⚠️ Error Loading Event</h2>
                <p className="text-muted">{error}</p>
                <div className="event-details-actions mt-lg">
                    <button className="btn btn-secondary" onClick={() => navigate('/events')}>
                        ← Back to Events
                    </button>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Not found
    if (!event) {
        return (
            <div className="event-details-error card">
                <h2>Event Not Found</h2>
                <p className="text-muted">The event you're looking for doesn't exist or has been removed.</p>
                <Link to="/events" className="btn btn-primary mt-lg">
                    ← Back to Events
                </Link>
            </div>
        );
    }

    const venue = getVenue();
    const priceRange = getPriceRange();
    const seatmapUrl = getSeatmapUrl();

    return (
        <div className="event-details">
            {/* Back Navigation */}
            <div className="event-details-breadcrumb">
                <Link to="/events" className="event-details-back">
                    ← Back to Events
                </Link>
            </div>

            {/* Hero Section - Serial Position: Key info first */}
            <div className="event-details-hero">
                <img
                    src={getHeroImage()}
                    alt={event.name}
                    className="event-details-hero-image"
                />
                <div className="event-details-hero-overlay">
                    <div className="event-details-hero-content">
                        {event.classifications?.[0] && (
                            <div className="event-details-badges">
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
                        <h1 className="event-details-title">{event.name}</h1>
                        <div className="event-details-meta">
                            <span className="event-details-date">
                                📅 {formatDate(event.dates?.start?.localDate)}
                                {event.dates?.start?.localTime && (
                                    <span className="event-details-time">
                                        {' '}at {formatTime(event.dates.start.localTime)}
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="event-details-grid">
                {/* Left Column - Event Info */}
                <div className="event-details-main">
                    {/* Venue Card */}
                    {venue && (
                        <div className="card event-details-venue-card">
                            <h3>📍 Venue</h3>
                            <div className="event-details-venue-info">
                                <h4>{venue.name}</h4>
                                {venue.address?.line1 && (
                                    <p>{venue.address.line1}</p>
                                )}
                                <p>
                                    {venue.city?.name && <span>{venue.city.name}</span>}
                                    {venue.state?.stateCode && <span>, {venue.state.stateCode}</span>}
                                    {venue.postalCode && <span> {venue.postalCode}</span>}
                                </p>
                                {venue.country?.name && (
                                    <p className="text-muted">{venue.country.name}</p>
                                )}
                            </div>
                            {venue.url && (
                                <a
                                    href={venue.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary btn-sm mt-md"
                                >
                                    View Venue Details →
                                </a>
                            )}
                        </div>
                    )}

                    {/* Venue Map Component */}
                    <div className="card event-details-map-card">
                        <VenueMap
                            seatmapUrl={seatmapUrl}
                            venueName={venue?.name}
                        />
                    </div>

                    {/* Event Info */}
                    {event.info && (
                        <div className="card">
                            <h3>ℹ️ Event Information</h3>
                            <p className="event-details-info-text">{event.info}</p>
                        </div>
                    )}

                    {/* Please Note */}
                    {event.pleaseNote && (
                        <div className="card event-details-note">
                            <h3>📝 Please Note</h3>
                            <p>{event.pleaseNote}</p>
                        </div>
                    )}
                </div>

                {/* Right Column - Sidebar */}
                <div className="event-details-sidebar">
                    {/* Price Card - Von Restorff: Make distinct */}
                    <div className="card event-details-price-card">
                        <h3>🎟️ Tickets</h3>
                        {priceRange ? (
                            <div className="event-details-price">
                                <span className="event-details-price-range">
                                    ${priceRange.min} - ${priceRange.max}
                                </span>
                                <span className="event-details-price-currency">
                                    {priceRange.currency}
                                </span>
                            </div>
                        ) : (
                            <p className="text-muted">Price information unavailable</p>
                        )}

                        {/* Primary CTA - Fitts' Law: Large button */}
                        <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary event-details-cta"
                        >
                            🎟️ Get Tickets on Ticketmaster
                        </a>

                        {event.dates?.status?.code && (
                            <div className={`event-details-status ${event.dates.status.code.toLowerCase()}`}>
                                {event.dates.status.code === 'onsale' && '✅ On Sale'}
                                {event.dates.status.code === 'offsale' && '🔴 Off Sale'}
                                {event.dates.status.code === 'cancelled' && '❌ Cancelled'}
                                {event.dates.status.code === 'postponed' && '⏸️ Postponed'}
                                {event.dates.status.code === 'rescheduled' && '📅 Rescheduled'}
                            </div>
                        )}
                    </div>

                    {/* Quick Info Card */}
                    <div className="card event-details-quick-info">
                        <h3>📋 Quick Info</h3>
                        <ul className="event-details-quick-list">
                            {event.dates?.start?.localDate && (
                                <li>
                                    <span className="label">Date</span>
                                    <span className="value">{formatDate(event.dates.start.localDate)}</span>
                                </li>
                            )}
                            {event.dates?.start?.localTime && (
                                <li>
                                    <span className="label">Time</span>
                                    <span className="value">{formatTime(event.dates.start.localTime)}</span>
                                </li>
                            )}
                            {venue?.name && (
                                <li>
                                    <span className="label">Venue</span>
                                    <span className="value">{venue.name}</span>
                                </li>
                            )}
                            {venue?.city?.name && (
                                <li>
                                    <span className="label">Location</span>
                                    <span className="value">{venue.city.name}, {venue.state?.stateCode || ''}</span>
                                </li>
                            )}
                            {event.ageRestrictions?.legalAgeEnforced && (
                                <li>
                                    <span className="label">Age</span>
                                    <span className="value">18+</span>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Attractions/Performers */}
                    {event._embedded?.attractions?.length > 0 && (
                        <div className="card">
                            <h3>🌟 Performers</h3>
                            <div className="event-details-attractions">
                                {event._embedded.attractions.map(attraction => (
                                    <div key={attraction.id} className="event-details-attraction">
                                        {attraction.images?.[0] && (
                                            <img
                                                src={attraction.images[0].url}
                                                alt={attraction.name}
                                                className="event-details-attraction-image"
                                            />
                                        )}
                                        <span>{attraction.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom CTA - Serial Position: Key info at end */}
            <div className="event-details-bottom-cta">
                <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-lg"
                >
                    🎟️ Get Tickets Now
                </a>
            </div>
        </div>
    );
}

export default EventDetails;

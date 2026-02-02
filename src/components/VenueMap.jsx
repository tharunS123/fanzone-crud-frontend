import { useState, useRef, useEffect } from 'react';

/**
 * Interactive Venue Map Component
 * Applies UX Psychology: Fitts' Law (large controls), Figure/Ground (depth), Aesthetic-Usability
 */
function VenueMap({ seatmapUrl, venueName }) {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const containerRef = useRef(null);
    const dragStart = useRef({ x: 0, y: 0 });

    // Reset when seatmap changes
    useEffect(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setImageLoaded(false);
        setImageError(false);
    }, [seatmapUrl]);

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.25, 0.5));
    };

    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e) => {
        if (scale > 1) {
            setIsDragging(true);
            dragStart.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y
            };
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Handle keyboard accessibility
    const handleKeyDown = (e) => {
        if (e.key === 'Escape' && isFullscreen) {
            setIsFullscreen(false);
        }
        if (e.key === '+' || e.key === '=') {
            handleZoomIn();
        }
        if (e.key === '-') {
            handleZoomOut();
        }
    };

    useEffect(() => {
        if (isFullscreen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isFullscreen]);

    // No seatmap available
    if (!seatmapUrl) {
        return (
            <div className="venue-map-container venue-map-empty">
                <div className="venue-map-placeholder">
                    <span className="venue-map-placeholder-icon">🗺️</span>
                    <h4>Venue Map Unavailable</h4>
                    <p>Interactive seat map is not available for this event.</p>
                    {venueName && <p className="venue-map-hint">Visit {venueName}'s website for seating information.</p>}
                </div>
            </div>
        );
    }

    const mapContent = (
        <div
            ref={containerRef}
            className={`venue-map-viewport ${isDragging ? 'dragging' : ''} ${scale > 1 ? 'zoomed' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {!imageLoaded && !imageError && (
                <div className="venue-map-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading venue map...</p>
                </div>
            )}

            {imageError && (
                <div className="venue-map-placeholder">
                    <span className="venue-map-placeholder-icon">⚠️</span>
                    <h4>Failed to Load Map</h4>
                    <p>The venue map could not be loaded.</p>
                </div>
            )}

            <img
                src={seatmapUrl}
                alt={`Seating map for ${venueName || 'venue'}`}
                className="venue-map-image"
                style={{
                    transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                    opacity: imageLoaded ? 1 : 0
                }}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                draggable={false}
            />
        </div>
    );

    const controls = (
        <div className="venue-map-controls">
            <button
                className="venue-map-control-btn"
                onClick={handleZoomIn}
                disabled={scale >= 3}
                aria-label="Zoom in"
                title="Zoom in (+)"
            >
                ➕
            </button>
            <button
                className="venue-map-control-btn"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                aria-label="Zoom out"
                title="Zoom out (-)"
            >
                ➖
            </button>
            <button
                className="venue-map-control-btn"
                onClick={handleReset}
                aria-label="Reset view"
                title="Reset view"
            >
                🔄
            </button>
            <button
                className="venue-map-control-btn"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
            >
                {isFullscreen ? '✕' : '⛶'}
            </button>
        </div>
    );

    if (isFullscreen) {
        return (
            <div className="venue-map-fullscreen-overlay" onClick={toggleFullscreen}>
                <div className="venue-map-fullscreen-content" onClick={e => e.stopPropagation()}>
                    <div className="venue-map-fullscreen-header">
                        <h3>🗺️ {venueName || 'Venue'} - Seating Map</h3>
                        <button className="venue-map-close" onClick={toggleFullscreen}>✕</button>
                    </div>
                    {mapContent}
                    {controls}
                    <div className="venue-map-zoom-indicator">
                        {Math.round(scale * 100)}%
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="venue-map-container">
            <div className="venue-map-header">
                <h4>🗺️ Interactive Venue Map</h4>
                <span className="venue-map-hint-text">Click fullscreen for better view</span>
            </div>
            {mapContent}
            {controls}
            <div className="venue-map-zoom-indicator">
                {Math.round(scale * 100)}%
            </div>
        </div>
    );
}

export default VenueMap;

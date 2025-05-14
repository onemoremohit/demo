import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../ui/Loading';
import './MapView.css';

const MapView = () => {
    const { userProfile } = useAuth();
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [center, setCenter] = useState({ lat: 20, lng: 0 });
    const [zoom, setZoom] = useState(2);

    // Fetch destinations data
    useEffect(() => {
        const fetchDestinations = async () => {
            setLoading(true);
            try {
                const destinationsRef = collection(db, 'destinations');
                const snapshot = await getDocs(destinationsRef);
                const destinationsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).filter(dest => dest.coordinates); // Only include destinations with coordinates

                setDestinations(destinationsList);
            } catch (err) {
                console.error('Error fetching destinations:', err);
                setError('Failed to load map data. Please try again later.');
            }
            setLoading(false);
        };

        fetchDestinations();
    }, []);

    // Try to get user's current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCenter({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setZoom(10);
                },
                (error) => {
                    console.log('Geolocation error:', error);
                    // Keep default center if geolocation fails
                }
            );
        }
    }, []);

    const handleMarkerClick = useCallback((destination) => {
        setSelectedPlace(destination);
    }, []);

    const handleCloseInfoWindow = useCallback(() => {
        setSelectedPlace(null);
    }, []);

    // Render map with destinations
    const renderMap = () => {
        const mapStyles = {
            width: '100%',
            height: '70vh'
        };

        return (
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                    mapContainerStyle={mapStyles}
                    center={center}
                    zoom={zoom}
                    options={{
                        styles: [
                            {
                                featureType: 'poi',
                                elementType: 'labels',
                                stylers: [{ visibility: 'off' }]
                            }
                        ]
                    }}
                >
                    {destinations.map(destination => (
                        <Marker
                            key={destination.id}
                            position={destination.coordinates}
                            onClick={() => handleMarkerClick(destination)}
                            icon={{
                                url: destination.trending
                                    ? '/assets/images/trending-marker.png'
                                    : '/assets/images/destination-marker.png',
                                scaledSize: new window.google.maps.Size(40, 40)
                            }}
                        />
                    ))}

                    {selectedPlace && (
                        <InfoWindow
                            position={selectedPlace.coordinates}
                            onCloseClick={handleCloseInfoWindow}
                        >
                            <div className="info-window">
                                <h3>{selectedPlace.name}</h3>
                                <p className="info-location">{selectedPlace.location}, {selectedPlace.country}</p>
                                {selectedPlace.photoUrl && (
                                    <img
                                        src={selectedPlace.photoUrl}
                                        alt={selectedPlace.name}
                                        className="info-image"
                                    />
                                )}
                                <p className="info-description">{selectedPlace.shortDescription}</p>
                                <div className="info-tags">
                                    {selectedPlace.tags?.map((tag, index) => (
                                        <span key={index} className="info-tag">{tag}</span>
                                    ))}
                                </div>
                                <button
                                    className="info-button"
                                    onClick={() => window.open(`/recommendations/${selectedPlace.id}`, '_blank')}
                                >
                                    View Details
                                </button>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            </LoadScript>
        );
    };

    if (loading) return <Loading />;

    return (
        <div className="map-container">
            <h2>Explore Destinations</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="map-wrapper">
                {renderMap()}
            </div>
            <div className="map-instructions">
                <p>Click on markers to see destination details. Trending destinations are highlighted.</p>
            </div>
        </div>
    );
};

export default MapView;
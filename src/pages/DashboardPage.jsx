import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserTrips, getUserConnections } from '../firebase/firestore';
import UserStats from '../components/dashboard/UserStats';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import './DashboardPage.css';

const DashboardPage = () => {
    const { currentUser, userProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [trips, setTrips] = useState([]);
    const [connections, setConnections] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentUser) return;

            setLoading(true);
            try {
                const [userTrips, userConnections] = await Promise.all([
                    getUserTrips(currentUser.uid),
                    getUserConnections(currentUser.uid)
                ]);

                setTrips(userTrips);
                setConnections(userConnections);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load your dashboard. Please try again later.');
            }
            setLoading(false);
        };

        fetchDashboardData();
    }, [currentUser]);

    if (loading) return <Loading />;

    const pendingConnections = connections.filter(conn =>
        conn.status === 'pending' && conn.direction === 'received'
    );

    const activeConnections = connections.filter(conn =>
        conn.status === 'accepted'
    );

    return (
        <div className="dashboard-container">
            <h1>Welcome, {userProfile?.fullName || 'Traveler'}!</h1>
            {error && <div className="error-message">{error}</div>}

            <div className="dashboard-stats">
                <UserStats
                    connections={connections.length}
                    trips={trips.length}
                    pendingRequests={pendingConnections.length}
                    interests={userProfile?.interests?.length || 0}
                />
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h2>Trip Plans</h2>
                    {trips.length === 0 ? (
                        <div className="empty-state">
                            <p>You haven't planned any trips yet.</p>
                            <Link to="/explore">
                                <Button variant="secondary">Find Travel Buddies</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="dashboard-list">
                            {trips.slice(0, 3).map(trip => (
                                <div key={trip.id} className="dashboard-list-item">
                                    <div className="item-info">
                                        <h3>{trip.destination}</h3>
                                        <p>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                                        <div className="trip-participants">
                                            {trip.participantCount} traveler{trip.participantCount !== 1 && 's'}
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="small"
                                        onClick={() => console.log('View trip', trip.id)}
                                    >
                                        View
                                    </Button>
                                </div>
                            ))}
                            {trips.length > 3 && (
                                <Link to="/trips" className="view-all-link">
                                    View all trips
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                <div className="dashboard-card">
                    <h2>Travel Connections</h2>
                    {activeConnections.length === 0 ? (
                        <div className="empty-state">
                            <p>You haven't connected with any travelers yet.</p>
                            <Link to="/explore">
                                <Button variant="secondary">Explore Travelers</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="dashboard-list">
                            {activeConnections.slice(0, 3).map(connection => (
                                <div key={connection.id} className="dashboard-list-item">
                                    <div className="item-info">
                                        <h3>{connection.direction === 'sent' ? connection.targetUserName : connection.userName}</h3>
                                        <p>Connected since {new Date(connection.updatedAt?.toDate()).toLocaleDateString()}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="small"
                                        onClick={() => console.log('View profile', connection.targetUserId || connection.userId)}
                                    >
                                        Profile
                                    </Button>
                                </div>
                            ))}
                            {activeConnections.length > 3 && (
                                <Link to="/connections" className="view-all-link">
                                    View all connections
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {pendingConnections.length > 0 && (
                <div className="dashboard-notification">
                    <h3>Connection Requests</h3>
                    <p>You have {pendingConnections.length} pending connection request{pendingConnections.length !== 1 && 's'}.</p>
                    <Link to="/connections">
                        <Button variant="secondary" size="small">
                            View Requests
                        </Button>
                    </Link>
                </div>
            )}

            <div className="dashboard-actions">
                <h2>What would you like to do?</h2>
                <div className="action-buttons">
                    <Link to="/explore">
                        <Button>Find Travel Companions</Button>
                    </Link>
                    <Link to="/recommendations">
                        <Button variant="secondary">Discover Destinations</Button>
                    </Link>
                    <Link to="/map">
                        <Button variant="outline">Explore Map</Button>
                    </Link>
                </div>
            </div>

            {(!userProfile || !userProfile.profileCompleted) && (
                <div className="dashboard-prompt">
                    <h3>Complete Your Profile</h3>
                    <p>Add your travel preferences and interests to get better matches!</p>
                    <Link to="/profile">
                        <Button variant="secondary">Update Profile</Button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;

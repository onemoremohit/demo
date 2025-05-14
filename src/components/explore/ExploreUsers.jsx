import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import UserCard from './UserCard';
import Button from '../ui/Button';
import Loading from '../ui/Loading';
import './ExploreUsers.css';

const ExploreUsers = () => {
    const { currentUser, userProfile } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const usersPerPage = 6;

    // Calculate compatibility score between current user and another user
    const calculateCompatibility = (otherUser) => {
        if (!userProfile || !userProfile.interests || !otherUser.interests) {
            return 0;
        }

        // Common interests
        const commonInterests = userProfile.interests.filter(interest =>
            otherUser.interests.includes(interest)
        );

        // Common destinations
        const commonDestinations = userProfile.preferredDestinations?.filter(dest =>
            otherUser.preferredDestinations?.includes(dest)
        ) || [];

        // Calculate score
        const interestScore = commonInterests.length * 10;
        const destinationScore = commonDestinations.length * 15;

        return Math.min(100, interestScore + destinationScore);
    };

    // Fetch compatible users
    const fetchUsers = async () => {
        if (!currentUser || !userProfile) return;

        setLoading(true);
        setError('');

        try {
            // Get users who have completed their profiles and are not the current user
            const usersRef = collection(db, 'users');
            const userQuery = query(
                usersRef,
                where('profileCompleted', '==', true),
                where('userId', '!=', currentUser.uid),
                limit(50) // Get a reasonable number to filter locally
            );

            const querySnapshot = await getDocs(userQuery);
            const userData = [];

            querySnapshot.forEach(doc => {
                userData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Calculate compatibility scores and sort
            const usersWithScores = userData.map(user => ({
                ...user,
                compatibilityScore: calculateCompatibility(user)
            })).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

            setUsers(usersWithScores);
            setHasMore(usersWithScores.length > page * usersPerPage);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please try again later.');
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, [currentUser, userProfile]);

    const displayedUsers = users.slice(0, page * usersPerPage);

    if (loading && page === 1) return <Loading />;

    return (
        <div className="explore-container">
            <h2>Explore Travel Companions</h2>
            {error && <div className="error-message">{error}</div>}

            {userProfile && !userProfile.profileCompleted && (
                <div className="warning-message">
                    Complete your profile to get better matches!
                </div>
            )}

            {displayedUsers.length === 0 ? (
                <div className="no-users-message">
                    No compatible travelers found. Try adjusting your interests or check back later!
                </div>
            ) : (
                <>
                    <div className="users-grid">
                        {displayedUsers.map(user => (
                            <UserCard
                                key={user.id}
                                user={user}
                                compatibilityScore={user.compatibilityScore}
                            />
                        ))}
                    </div>

                    {hasMore && (
                        <Button
                            onClick={() => setPage(prevPage => prevPage + 1)}
                            className="load-more-btn"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Load More'}
                        </Button>
                    )}
                </>
            )}
        </div>
    );
};

export default ExploreUsers;
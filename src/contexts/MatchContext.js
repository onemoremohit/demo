import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
    getPotentialMatches,
    likeUser,
    dislikeUser,
    getUserMatches
} from '../firebase/firestore';

const MatchContext = createContext();

export function useMatch() {
    return useContext(MatchContext);
}

export function MatchProvider({ children }) {
    const { currentUser, userData } = useAuth();
    const [potentialMatches, setPotentialMatches] = useState([]);
    const [userMatches, setUserMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [matchNotification, setMatchNotification] = useState(null);

    // Load potential matches
    const loadPotentialMatches = async () => {
        if (!currentUser || !userData) return;

        setLoading(true);
        setError(null);

        try {
            // Get combined list of users to exclude (liked, disliked, and matches)
            const excludeIds = [
                ...(userData.likedUsers || []),
                ...(userData.dislikedUsers || []),
                ...(userData.matches || [])
            ];

            const matches = await getPotentialMatches(
                currentUser.uid,
                userData.interests || [],
                excludeIds
            );

            setPotentialMatches(matches);
            setLoading(false);
        } catch (err) {
            console.error('Error loading potential matches:', err);
            setError('Failed to load potential matches');
            setLoading(false);
        }
    };

    // Load user matches
    const loadUserMatches = async () => {
        if (!currentUser) return;

        setLoading(true);
        setError(null);

        try {
            const matches = await getUserMatches(currentUser.uid);
            setUserMatches(matches);
            setLoading(false);
        } catch (err) {
            console.error('Error loading user matches:', err);
            setError('Failed to load matches');
            setLoading(false);
        }
    };

    // Handle like user
    const handleLikeUser = async (likedUserId) => {
        if (!currentUser) return;

        setLoading(true);
        setError(null);

        try {
            const result = await likeUser(currentUser.uid, likedUserId);

            // If it's a match, show notification
            if (result.isMatch) {
                setMatchNotification({
                    matchId: result.matchId,
                    userId: likedUserId,
                    timestamp: new Date()
                });

                // Reload matches
                await loadUserMatches();
            }

            // Remove from potential matches
            setPotentialMatches(prev => prev.filter(match => match.id !== likedUserId));

            setLoading(false);
            return result;
        } catch (err) {
            console.error('Error liking user:', err);
            setError('Failed to like user');
            setLoading(false);
            return { isMatch: false };
        }
    };

    // Handle dislike user
    const handleDislikeUser = async (dislikedUserId) => {
        if (!currentUser) return;

        setLoading(true);
        setError(null);

        try {
            await dislikeUser(currentUser.uid, dislikedUserId);

            // Remove from potential matches
            setPotentialMatches(prev => prev.filter(match => match.id !== dislikedUserId));

            setLoading(false);
            return true;
        } catch (err) {
            console.error('Error disliking user:', err);
            setError('Failed to dislike user');
            setLoading(false);
            return false;
        }
    };

    // Clear match notification
    const clearMatchNotification = () => {
        setMatchNotification(null);
    };

    // Load initial data when user data changes
    useEffect(() => {
        if (userData && userData.interests && userData.interests.length > 0) {
            loadPotentialMatches();
            loadUserMatches();
        }
    }, [userData]);

    const value = {
        potentialMatches,
        userMatches,
        loading,
        error,
        matchNotification,
        loadPotentialMatches,
        loadUserMatches,
        handleLikeUser,
        handleDislikeUser,
        clearMatchNotification
    };

    return (
        <MatchContext.Provider value={value}>
            {children}
        </MatchContext.Provider>
    );
}

export default MatchContext;
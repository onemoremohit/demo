import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    arrayUnion,
    arrayRemove,
    limit,
    orderBy,
    deleteDoc
} from 'firebase/firestore';
import { db } from './config';

// Get user data
export const getUserData = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() };
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        throw error;
    }
};

// Update user profile
export const updateUserProfile = async (userId, data) => {
    try {
        await updateDoc(doc(db, 'users', userId), data);
        return true;
    } catch (error) {
        throw error;
    }
};

// Get potential matches (users with similar interests)
export const getPotentialMatches = async (userId, userInterests, excludeIds = []) => {
    try {
        // Get all users
        const usersQuery = query(collection(db, 'users'));
        const querySnapshot = await getDocs(usersQuery);

        // Filter out current user and already swiped users
        const potentialMatches = [];
        querySnapshot.forEach(doc => {
            const userData = doc.data();
            // Skip current user and users already in exclude list
            if (doc.id !== userId && !excludeIds.includes(doc.id)) {
                // Calculate match score based on common interests
                const commonInterests = userData.interests.filter(interest =>
                    userInterests.includes(interest)
                );

                const matchScore = commonInterests.length;

                potentialMatches.push({
                    id: doc.id,
                    ...userData,
                    matchScore,
                    commonInterests
                });
            }
        });

        // Sort by match score (highest first)
        return potentialMatches.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
        throw error;
    }
};

// Like a user
export const likeUser = async (userId, likedUserId) => {
    try {
        // Add likedUserId to current user's likedUsers array
        await updateDoc(doc(db, 'users', userId), {
            likedUsers: arrayUnion(likedUserId)
        });

        // Check if there's a match (if the other user already liked current user)
        const likedUserDoc = await getDoc(doc(db, 'users', likedUserId));
        const likedUserData = likedUserDoc.data();

        if (likedUserData.likedUsers && likedUserData.likedUsers.includes(userId)) {
            // It's a match! Add to both users' matches array
            await updateDoc(doc(db, 'users', userId), {
                matches: arrayUnion(likedUserId)
            });

            await updateDoc(doc(db, 'users', likedUserId), {
                matches: arrayUnion(userId)
            });

            // Create a match document
            const matchId = userId < likedUserId
                ? `${userId}_${likedUserId}`
                : `${likedUserId}_${userId}`;

            await setDoc(doc(db, 'matches', matchId), {
                users: [userId, likedUserId],
                createdAt: new Date(),
                messages: []
            });

            return { isMatch: true, matchId };
        }

        return { isMatch: false };
    } catch (error) {
        throw error;
    }
};

// Dislike a user
export const dislikeUser = async (userId, dislikedUserId) => {
    try {
        await updateDoc(doc(db, 'users', userId), {
            dislikedUsers: arrayUnion(dislikedUserId)
        });
        return true;
    } catch (error) {
        throw error;
    }
};

// Get user matches
export const getUserMatches = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();

        if (!userData.matches || userData.matches.length === 0) {
            return [];
        }

        // Get details of all matched users
        const matchedUsers = await Promise.all(
            userData.matches.map(async (matchId) => {
                const matchUserDoc = await getDoc(doc(db, 'users', matchId));
                if (matchUserDoc.exists()) {
                    return { id: matchUserDoc.id, ...matchUserDoc.data() };
                }
                return null;
            })
        );

        return matchedUsers.filter(user => user !== null);
    } catch (error) {
        throw error;
    }
};

// Get destinations recommendations
export const getDestinationRecommendations = async (limit = 10) => {
    try {
        const destinationsQuery = query(
            collection(db, 'destinations'),
            orderBy('rating', 'desc'),
            limit(limit)
        );

        const querySnapshot = await getDocs(destinationsQuery);
        const destinations = [];

        querySnapshot.forEach(doc => {
            destinations.push({ id: doc.id, ...doc.data() });
        });

        return destinations;
    } catch (error) {
        throw error;
    }
};

// Add a new destination
export const addDestination = async (destinationData) => {
    try {
        const newDestinationRef = doc(collection(db, 'destinations'));
        await setDoc(newDestinationRef, {
            ...destinationData,
            createdAt: new Date()
        });

        return newDestinationRef.id;
    } catch (error) {
        throw error;
    }
};

// Search users by name or interests
export const searchUsers = async (searchTerm) => {
    try {
        // For a real application, you would use Firestore's advanced querying
        // This is a simplified version that gets all users and filters client-side
        const usersQuery = query(collection(db, 'users'));
        const querySnapshot = await getDocs(usersQuery);

        const users = [];
        const searchTermLower = searchTerm.toLowerCase();

        querySnapshot.forEach(doc => {
            const userData = doc.data();

            // Search by display name
            if (userData.displayName && userData.displayName.toLowerCase().includes(searchTermLower)) {
                users.push({ id: doc.id, ...userData });
                return;
            }

            // Search by interests
            if (userData.interests && userData.interests.some(interest =>
                interest.toLowerCase().includes(searchTermLower)
            )) {
                users.push({ id: doc.id, ...userData });
                return;
            }
        });

        return users;
    } catch (error) {
        throw error;
    }
  };
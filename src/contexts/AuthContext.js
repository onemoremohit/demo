import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserData } from '../firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            setError(null);

            if (user) {
                try {
                    const userProfileData = await getUserData(user.uid);
                    setUserData(userProfileData);
                } catch (err) {
                    console.error('Error fetching user data:', err);
                    setError('Failed to load user data');
                }
            } else {
                setUserData(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Refresh user data function
    const refreshUserData = async () => {
        if (currentUser) {
            try {
                const userProfileData = await getUserData(currentUser.uid);
                setUserData(userProfileData);
                return userProfileData;
            } catch (err) {
                console.error('Error refreshing user data:', err);
                setError('Failed to refresh user data');
                return null;
            }
        }
        return null;
    };

    const value = {
        currentUser,
        userData,
        loading,
        error,
        refreshUserData
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
import React, { createContext, useContext, useState } from 'react';
import { updateUserProfile } from '../firebase/firestore';
import { uploadProfileImage } from '../firebase/storage';
import { updateProfile } from 'firebase/auth';
import { useAuth } from './AuthContext';

const ProfileContext = createContext();

export function useProfile() {
    return useContext(ProfileContext);
}

export function ProfileProvider({ children }) {
    const { currentUser, userData, refreshUserData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Update user profile
    const updateProfile = async (profileData) => {
        if (!currentUser) {
            setError('User not authenticated');
            return false;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await updateUserProfile(currentUser.uid, profileData);
            await refreshUserData();
            setSuccess('Profile updated successfully');
            setLoading(false);
            return true;
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile');
            setLoading(false);
            return false;
        }
    };

    // Update profile picture
    const updateProfilePicture = async (imageFile) => {
        if (!currentUser) {
            setError('User not authenticated');
            return false;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const photoURL = await uploadProfileImage(currentUser.uid, imageFile);

            // Update auth profile
            await updateProfile(currentUser, { photoURL });

            // Update Firestore profile
            await updateUserProfile(currentUser.uid, { photoURL });

            await refreshUserData();
            setSuccess('Profile picture updated successfully');
            setLoading(false);
            return true;
        } catch (err) {
            console.error('Error updating profile picture:', err);
            setError('Failed to update profile picture');
            setLoading(false);
            return false;
        }
    };

    // Update user interests
    const updateInterests = async (interests) => {
        if (!currentUser) {
            setError('User not authenticated');
            return false;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await updateUserProfile(currentUser.uid, { interests });
            await refreshUserData();
            setSuccess('Interests updated successfully');
            setLoading(false);
            return true;
        } catch (err) {
            console.error('Error updating interests:', err);
            setError('Failed to update interests');
            setLoading(false);
            return false;
        }
    };

    const value = {
        updateProfile,
        updateProfilePicture,
        updateInterests,
        loading,
        error,
        success,
        setError,
        setSuccess
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
}

export default ProfileContext;
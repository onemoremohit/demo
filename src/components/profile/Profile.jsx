import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import ProfileForm from './ProfileForm';
import InterestTags from './InterestTags';
import Button from '../ui/Button';
import Loading from '../ui/Loading';
import './Profile.css';

const Profile = () => {
    const { currentUser, userProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [profileData, setProfileData] = useState({
        fullName: '',
        bio: '',
        interests: [],
        preferredDestinations: [],
        photoURL: null
    });
    const [photoFile, setPhotoFile] = useState(null);

    useEffect(() => {
        if (userProfile) {
            setProfileData({
                fullName: userProfile.fullName || '',
                bio: userProfile.bio || '',
                interests: userProfile.interests || [],
                preferredDestinations: userProfile.preferredDestinations || [],
                photoURL: userProfile.photoURL || null
            });
        }
    }, [userProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handlePhotoChange = (e) => {
        if (e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
            // Preview the image
            setProfileData(prevData => ({
                ...prevData,
                photoURL: URL.createObjectURL(e.target.files[0])
            }));
        }
    };

    const handleInterestChange = (interests) => {
        setProfileData(prevData => ({
            ...prevData,
            interests
        }));
    };

    const handleDestinationChange = (destinations) => {
        setProfileData(prevData => ({
            ...prevData,
            preferredDestinations: destinations
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            let updatedData = {
                ...profileData,
                profileCompleted: true
            };

            // Upload photo if a new one is selected
            if (photoFile) {
                const photoRef = ref(storage, `profilePhotos/${currentUser.uid}`);
                await uploadBytes(photoRef, photoFile);
                const photoURL = await getDownloadURL(photoRef);
                updatedData.photoURL = photoURL;
            }

            await updateDoc(userDocRef, updatedData);
            setSuccess(true);
        } catch (err) {
            setError('Failed to update profile. Please try again.');
            console.error('Profile update error:', err);
        }

        setLoading(false);
    };

    if (!userProfile) return <Loading />;

    return (
        <div className="profile-container">
            <h2>Edit Your Profile</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Profile updated successfully!</div>}

            <form onSubmit={handleSubmit} className="profile-form">
                <div className="profile-photo-section">
                    <div className="profile-photo">
                        {profileData.photoURL ? (
                            <img src={profileData.photoURL} alt="Profile" />
                        ) : (
                            <div className="profile-photo-placeholder">
                                {profileData.fullName ? profileData.fullName[0].toUpperCase() : 'U'}
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        id="photo"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="photo-input"
                    />
                    <label htmlFor="photo" className="photo-input-label">
                        Change Photo
                    </label>
                </div>

                <ProfileForm
                    profileData={profileData}
                    handleInputChange={handleInputChange}
                />

                <div className="form-section">
                    <h3>Your Travel Interests</h3>
                    <InterestTags
                        selectedInterests={profileData.interests}
                        onChange={handleInterestChange}
                    />
                </div>

                <div className="form-section">
                    <h3>Preferred Destinations</h3>
                    <InterestTags
                        selectedInterests={profileData.preferredDestinations}
                        onChange={handleDestinationChange}
                        tagType="destination"
                    />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Save Profile'}
                </Button>
            </form>
        </div>
    );
};

export default Profile;
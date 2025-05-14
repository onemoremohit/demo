import React from 'react';
import './ProfileForm.css';

const ProfileForm = ({ profileData, handleInputChange }) => {
    return (
        <>
            <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="bio">About Me</label>
                <textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell others about yourself and your travel preferences..."
                    rows="5"
                ></textarea>
            </div>
        </>
    );
};

export default ProfileForm;
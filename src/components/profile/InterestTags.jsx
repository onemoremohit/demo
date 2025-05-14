import React, { useState } from 'react';
import './InterestTags.css';

const commonInterests = [
    'Adventure', 'Beaches', 'Camping', 'Culture', 'Cuisine',
    'Hiking', 'History', 'Museums', 'Nature', 'Nightlife',
    'Photography', 'Relaxation', 'Road Trips', 'Shopping',
    'Sightseeing', 'Wildlife', 'Winter Sports', 'Urban Exploration'
];

const commonDestinations = [
    'Asia', 'Australia', 'Caribbean', 'Europe', 'Middle East',
    'North America', 'South America', 'Africa', 'Mountains',
    'Islands', 'Cities', 'Countryside', 'Beaches', 'Forests'
];

const InterestTags = ({ selectedInterests = [], onChange, tagType = 'interest' }) => {
    const [customTag, setCustomTag] = useState('');
    const options = tagType === 'destination' ? commonDestinations : commonInterests;

    const handleTagClick = (tag) => {
        let newTags;
        if (selectedInterests.includes(tag)) {
            newTags = selectedInterests.filter(t => t !== tag);
        } else {
            newTags = [...selectedInterests, tag];
        }
        onChange(newTags);
    };

    const handleAddCustomTag = (e) => {
        e.preventDefault();
        if (customTag.trim() && !selectedInterests.includes(customTag.trim())) {
            const newTags = [...selectedInterests, customTag.trim()];
            onChange(newTags);
            setCustomTag('');
        }
    };

    return (
        <div className="interest-tags-container">
            <div className="tags-grid">
                {options.map(tag => (
                    <div
                        key={tag}
                        className={`tag ${selectedInterests.includes(tag) ? 'selected' : ''}`}
                        onClick={() => handleTagClick(tag)}
                    >
                        {tag}
                    </div>
                ))}
            </div>

            <div className="custom-tag-form">
                <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder={`Add custom ${tagType}...`}
                    className="custom-tag-input"
                />
                <button
                    onClick={handleAddCustomTag}
                    className="custom-tag-button"
                    disabled={!customTag.trim()}
                >
                    Add
                </button>
            </div>

            {selectedInterests.length > 0 && (
                <div className="selected-tags">
                    <p>Selected {tagType === 'destination' ? 'destinations' : 'interests'}:</p>
                    <div className="selected-tags-grid">
                        {selectedInterests.map(tag => (
                            <div
                                key={tag}
                                className="selected-tag"
                                onClick={() => handleTagClick(tag)}
                            >
                                {tag} <span className="remove-tag">×</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterestTags;
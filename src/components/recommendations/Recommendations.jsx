import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import DestinationCard from './DestinationCard';
import Loading from '../ui/Loading';
import './Recommendations.css';

const Recommendations = () => {
    const { userProfile } = useAuth();
    const [destinations, setDestinations] = useState([]);
    const [filteredDestinations, setFilteredDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchPrompt, setSearchPrompt] = useState('');
    const [error, setError] = useState('');

    // Fetch destinations from Firestore
    useEffect(() => {
        const fetchDestinations = async () => {
            setLoading(true);
            try {
                const destinationsRef = collection(db, 'destinations');
                const destinationsQuery = query(
                    destinationsRef,
                    orderBy('rating', 'desc'),
                    limit(20)
                );

                const snapshot = await getDocs(destinationsQuery);
                const destinationsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setDestinations(destinationsList);
                setFilteredDestinations(destinationsList);
            } catch (err) {
                console.error('Error fetching destinations:', err);
                setError('Failed to load recommendations. Please try again later.');
            }
            setLoading(false);
        };

        fetchDestinations();
    }, []);

    // Filter destinations based on user preferences and search prompt
    useEffect(() => {
        if (!destinations.length) return;

        // Default state - show all destinations
        let filtered = [...destinations];

        // Filter based on user interests if available
        if (userProfile && userProfile.interests && userProfile.interests.length > 0) {
            // Boost destinations that match user interests
            filtered = destinations.map(dest => {
                const matchingTags = dest.tags?.filter(tag =>
                    userProfile.interests.includes(tag.toLowerCase())
                ) || [];

                return {
                    ...dest,
                    relevanceScore: matchingTags.length
                };
            }).sort((a, b) => b.relevanceScore - a.relevanceScore);
        }

        // Filter based on search prompt
        if (searchPrompt) {
            const promptLower = searchPrompt.toLowerCase();

            // Simple keyword search logic
            if (promptLower.includes('near') || promptLower.includes('nearby')) {
                // Show destinations marked as local or nearby
                filtered = filtered.filter(dest => dest.tags?.includes('local') || dest.isNearby);
            } else if (promptLower.includes('hidden') || promptLower.includes('gem')) {
                // Show hidden gems
                filtered = filtered.filter(dest => dest.tags?.includes('hidden gem'));
            } else if (promptLower.includes('trending') || promptLower.includes('popular')) {
                // Show trending places
                filtered = filtered.filter(dest => dest.trending);
            } else {
                // Generic search across name and description
                filtered = filtered.filter(dest =>
                    dest.name.toLowerCase().includes(promptLower) ||
                    dest.description.toLowerCase().includes(promptLower) ||
                    dest.country.toLowerCase().includes(promptLower) ||
                    dest.tags?.some(tag => tag.toLowerCase().includes(promptLower))
                );
            }
        }

        setFilteredDestinations(filtered);
    }, [destinations, searchPrompt, userProfile]);

    const handlePromptSubmit = (e) => {
        e.preventDefault();
        // Search is handled by the useEffect above
    };

    if (loading) return <Loading />;

    return (
        <div className="recommendations-container">
            <h2>Travel Recommendations</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="recommendations-prompt">
                <p>Ask our recommendation system:</p>
                <form onSubmit={handlePromptSubmit} className="prompt-form">
                    <input
                        type="text"
                        value={searchPrompt}
                        onChange={(e) => setSearchPrompt(e.target.value)}
                        placeholder="e.g., Best places nearby me, Hidden gems in Europe..."
                        className="prompt-input"
                    />
                    <button type="submit" className="prompt-button">Search</button>
                </form>
                <div className="prompt-suggestions">
                    <span onClick={() => setSearchPrompt('Best places nearby me')}>
                        Best places nearby me
                    </span>
                    <span onClick={() => setSearchPrompt('Hidden gems')}>
                        Hidden gems
                    </span>
                    <span onClick={() => setSearchPrompt('Trending destinations')}>
                        Trending destinations
                    </span>
                </div>
            </div>

            <div className="destinations-grid">
                {filteredDestinations.length === 0 ? (
                    <div className="no-results">No destinations found for your query</div>
                ) : (
                    filteredDestinations.map(destination => (
                        <DestinationCard
                            key={destination.id}
                            destination={destination}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default Recommendations;
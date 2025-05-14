import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import './HomePage.css';

const HomePage = () => {
    const { currentUser } = useAuth();

    return (
        <div className="home-container">
            <div className="hero-section">
                <h1>Find Your Perfect Travel Companion</h1>
                <p className="hero-description">
                    Connect with like-minded travelers, discover new destinations, and make memories together.
                </p>

                {currentUser ? (
                    <div className="cta-buttons">
                        <Link to="/explore">
                            <Button>Find Companions</Button>
                        </Link>
                        <Link to="/recommendations">
                            <Button variant="secondary">Discover Destinations</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="cta-buttons">
                        <Link to="/auth">
                            <Button>Get Started</Button>
                        </Link>
                        <a href="#how-it-works">
                            <Button variant="text">Learn More</Button>
                        </a>
                    </div>
                )}
            </div>

            <div id="how-it-works" className="features-section">
                <h2>How It Works</h2>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">👤</div>
                        <h3>Create Your Profile</h3>
                        <p>Sign up and tell us about your travel preferences, interests, and destinations you'd love to visit.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🔍</div>
                        <h3>Explore Travelers</h3>
                        <p>Browse through profiles of like-minded travelers and connect with potential companions.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🗺️</div>
                        <h3>Discover Places</h3>
                        <p>Get personalized recommendations for exciting destinations based on your preferences.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">✈️</div>
                        <h3>Plan Your Journey</h3>
                        <p>Connect with your new travel buddy and start planning your adventure together.</p>
                    </div>
                </div>
            </div>

            <div className="testimonials-section">
                <h2>Traveler Stories</h2>

                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <div className="testimonial-content">
                            <p>"I found my hiking buddy through Trip Companion. We've already explored three national parks together!"</p>
                        </div>
                        <div className="testimonial-author">
                            <div className="testimonial-avatar">JD</div>
                            <div className="testimonial-name">John D.</div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <div className="testimonial-content">
                            <p>"As a solo female traveler, I was looking for safe companionship. Trip Companion helped me find the perfect travel friend."</p>
                        </div>
                        <div className="testimonial-author">
                            <div className="testimonial-avatar">SM</div>
                            <div className="testimonial-name">Sarah M.</div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <div className="testimonial-content">
                            <p>"The destination recommendations were spot on! I discovered amazing places I never would have found otherwise."</p>
                        </div>
                        <div className="testimonial-author">
                            <div className="testimonial-avatar">AK</div>
                            <div className="testimonial-name">Alex K.</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="cta-section">
                <h2>Ready to Find Your Travel Companion?</h2>
                <p>Join thousands of travelers already connecting on our platform.</p>

                {currentUser ? (
                    <Link to="/explore">
                        <Button size="large">Explore Now</Button>
                    </Link>
                ) : (
                    <Link to="/auth">
                        <Button size="large">Sign Up Free</Button>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default HomePage;
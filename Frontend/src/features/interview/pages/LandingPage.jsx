import React from 'react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import '../style/landing.scss'

const LandingPage = () => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <main className="loading-screen">
                <h1>Loading...</h1>
            </main>
        )
    }

    if (user) {
        return <Navigate to="/dashboard" />
    }

    return (
        <div className="landing-page">
            {/* Header / Navbar */}
            <header className="landing-header">
                <div className="logo">
                    <span className="highlight">Interview</span>.AI
                </div>
                <nav className="nav-links">
                    <Link to="/login" className="nav-link">Login</Link>
                    <Link to="/register" className="button nav-cta">Get Started</Link>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Master Your Next Interview with <span className="highlight">AI-Powered</span> Strategy
                    </h1>
                    <p className="hero-subtitle">
                        Upload your resume, paste target job descriptions, and get customized technical roadmap checklists, interactive mock practice scoring, and tailored preparation plans.
                    </p>
                    <div className="hero-ctas">
                        <Link to="/register" className="button primary-button hero-cta-btn">
                            Create Your Free Account
                        </Link>
                        <Link to="/login" className="button secondary-button hero-cta-btn">
                            Sign In
                        </Link>
                    </div>
                </div>

                {/* Decorative visual elements */}
                <div className="hero-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="features-section">
                <h2 className="section-title">Why Use <span className="highlight">Interview.AI</span>?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🎯</div>
                        <h3>Tailored Roadmap</h3>
                        <p>Receive a customized day-by-day preparation plan analyzing the gaps in your profile for any specific target role.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💬</div>
                        <h3>Mock Practice Mode</h3>
                        <p>Submit responses to technical and behavioral questions to receive immediate AI analysis, grades, and improvement tips.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎴</div>
                        <h3>Active Recall Flashcards</h3>
                        <p>Review potential interview questions with animated flashcards using spaced-repetition concepts.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📄</div>
                        <h3>ATS Resume Optimizer</h3>
                        <p>Generate styled, ATS-optimized, job-tailored resumes in PDF format instantly with AI analysis.</p>
                    </div>
                </div>
            </section>

            {/* Platform Stats / Social proof */}
            <section className="stats-section">
                <div className="stat-item">
                    <h4>90%+</h4>
                    <p>Accuracy Matching</p>
                </div>
                <div className="stat-item">
                    <h4>30s</h4>
                    <p>Plan Generation</p>
                </div>
                <div className="stat-item">
                    <h4>100%</h4>
                    <p>Personalized Feedback</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p>&copy; {new Date().getFullYear()} Interview.AI. All rights reserved.</p>
                <div className="footer-links">
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                    <a href="#">Help Center</a>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage

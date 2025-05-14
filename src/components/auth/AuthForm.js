import React from 'react';
import PropTypes from 'prop-types';

function AuthForm({
    formType,
    formData,
    handleChange,
    handleSubmit,
    handleGoogleSignIn,
    error,
    loading
}) {
    return (
        <div className="auth-form-container">
            {error && (
                <div className="auth-error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
                {formType === 'register' && (
                    <div className="form-group">
                        <label htmlFor="displayName">Display Name</label>
                        <input
                            type="text"
                            id="displayName"
                            name="displayName"
                            value={formData.displayName || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password || ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                {formType === 'register' && (
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}

                <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={loading}
                >
                    {loading
                        ? (formType === 'login' ? 'Signing In...' : 'Creating Account...')
                        : (formType === 'login' ? 'Sign In' : 'Create Account')
                    }
                </button>
            </form>

            <div className="auth-separator">
                <span>OR</span>
            </div>

            <button
                onClick={handleGoogleSignIn}
                className="google-sign-in-btn"
                disabled={loading}
            >
                <svg className="google-icon" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                <span>Continue with Google</span>
            </button>
        </div>
    );
}

AuthForm.propTypes = {
    formType: PropTypes.oneOf(['login', 'register']).isRequired,
    formData: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    handleGoogleSignIn: PropTypes.func.isRequired,
    error: PropTypes.string,
    loading: PropTypes.bool
};

export default AuthForm;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import emoji from '../assets/emoji.png';
import '../styles/Auth.css';

const UserLogin = () => {
    const [formData, setFormData] = useState({
        Email: '',
        Password: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { userLogin } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.Email.trim()) newErrors.Email = 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) newErrors.Email = 'Invalid email format';

        if (!formData.Password) newErrors.Password = 'Password is required';
        if (formData.Password.length < 8) newErrors.Password = 'Password must be at least 8 characters';

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSubmitting(true);
        const result = await userLogin(formData);
        setSubmitting(false);

        if (result.success) {
            navigate('/');
        } else {
            setErrors({ submit: result.message });
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <div className="header-content">
                        <img src={emoji} alt="User Emoji" className="header-emoji" />
                        <h2>Welcome Back</h2>
                    </div>
                </div>

                {errors.submit && <div className="error-banner">{errors.submit}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="Email">Email Address</label>
                        <input
                            type="email"
                            id="Email"
                            name="Email"
                            value={formData.Email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className={errors.Email ? 'error' : ''}
                        />
                        {errors.Email && <span className="error-text">{errors.Email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="Password">Password</label>
                        <input
                            type="password"
                            id="Password"
                            name="Password"
                            value={formData.Password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className={errors.Password ? 'error' : ''}
                        />
                        {errors.Password && <span className="error-text">{errors.Password}</span>}
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={submitting}
                    >
                        {submitting ? 'Logging In...' : 'Login'}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/user/signup">Sign up here</Link>
                </p>

            </div>
        </div>
    );
};

export default UserLogin;


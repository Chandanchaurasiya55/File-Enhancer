import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import emoji from '../assets/emoji.webp';
import '../styles/Auth.css';

const UserSignup = () => {
    const [formData, setFormData] = useState({
        Fullname: '',
        Email: '',
        Phone: '',
        Password: '',
        confirmPassword: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { userSignup } = useAuth();

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

        if (!formData.Fullname.trim()) newErrors.Fullname = 'Full name is required';
        if (formData.Fullname.trim().length < 3) newErrors.Fullname = 'Full name must be at least 3 characters';

        if (!formData.Email.trim()) newErrors.Email = 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) newErrors.Email = 'Invalid email format';

        if (!formData.Phone.trim()) newErrors.Phone = 'Phone number is required';
        if (!/^[0-9]{10}$/.test(formData.Phone)) newErrors.Phone = 'Phone number must be exactly 10 digits';

        if (!formData.Password) newErrors.Password = 'Password is required';
        if (formData.Password.length < 8) newErrors.Password = 'Password must be at least 8 characters';

        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        if (formData.Password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

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
        
        // Send only required fields to backend (exclude confirmPassword)
        const { confirmPassword, ...dataToSend } = formData;
        const result = await userSignup(dataToSend);
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
                        <h2>Get Started</h2>
                    </div>
                </div>

                {errors.submit && <div className="error-banner">{errors.submit}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="Fullname">Full Name</label>
                        <input
                            type="text"
                            id="Fullname"
                            name="Fullname"
                            value={formData.Fullname}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className={errors.Fullname ? 'error' : ''}
                        />
                        {errors.Fullname && <span className="error-text">{errors.Fullname}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="Email">Email Address</label>
                        <input
                            type="email"
                            id="Email"
                            name="Email"
                            value={formData.Email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            className={errors.Email ? 'error' : ''}
                        />
                        {errors.Email && <span className="error-text">{errors.Email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="Phone">Phone Number</label>
                        <input
                            type="tel"
                            id="Phone"
                            name="Phone"
                            value={formData.Phone}
                            onChange={handleChange}
                            placeholder="10-digit mobile number"
                            className={errors.Phone ? 'error' : ''}
                        />
                        {errors.Phone && <span className="error-text">{errors.Phone}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="Password">Password</label>
                        <input
                            type="password"
                            id="Password"
                            name="Password"
                            value={formData.Password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className={errors.Password ? 'error' : ''}
                        />
                        {errors.Password && <span className="error-text">{errors.Password}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className={errors.confirmPassword ? 'error' : ''}
                        />
                        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={submitting}
                    >
                        {submitting ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/user/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default UserSignup;
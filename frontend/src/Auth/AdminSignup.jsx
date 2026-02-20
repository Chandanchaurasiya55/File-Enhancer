import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';
import emoji from '../assets/emoji.png';

const AdminSignup = () => {
    const [adminExists, setAdminExists] = useState(null);
    const [formData, setFormData] = useState({
        Fullname: '',
        Email: '',
        Password: '',
        confirmPassword: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { adminSignup } = useAuth();

    // Check if admin already exists
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/auth/admin/check');
                const data = await response.json();
                setAdminExists(data.exists);
            } catch (err) {
                console.error('Error checking admin:', err);
            }
        };
        checkAdmin();
    }, []);

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
        const { confirmPassword: _, ...dataToSend } = formData;
        const result = await adminSignup(dataToSend);
        setSubmitting(false);

        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setErrors({ submit: result.message });
        }
    };

    if (adminExists === null) {
        return (
            <div className="auth-container">
                <div className="auth-box">
                    <p>Checking admin status...</p>
                </div>
            </div>
        );
    }

    if (adminExists) {
        return (
            <div className="auth-container">
                <div className="auth-box">
                    <div className="auth-header">
                        <h2>Admin Account Exists</h2>
                        <p>An admin account already exists</p>
                    </div>
                    <p className="auth-footer">
                        <Link to="/admin/login">Login to your admin account</Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <div className="header-content">
                        <img src={emoji} alt="Admin Emoji" className="header-emoji" />
                        <h2>Create Admin Account</h2>
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
                            placeholder="admin@email.com"
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
                        {submitting ? 'Creating Account...' : 'Create Admin Account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an admin account? <Link to="/admin/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default AdminSignup;

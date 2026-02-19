import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const UserLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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

        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';

        if (!formData.password) newErrors.password = 'Password is required';

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
            navigate('/user/dashboard');
        } else {
            setErrors({ submit: result.message });
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <h2>User Login</h2>
                    <p>Welcome back</p>
                </div>

                {errors.submit && <div className="error-banner">{errors.submit}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className={errors.password ? 'error' : ''}
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={submitting}
                    >
                        {submitting ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/user/signup">Sign up here</Link>
                </p>

                <div className="auth-divider">or</div>

                <p className="auth-footer">
                    Are you an admin? <Link to="/admin/login">Login as Admin</Link>
                </p>
            </div>
        </div>
    );
};

export default UserLogin;

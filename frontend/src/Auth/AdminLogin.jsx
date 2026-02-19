import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { adminLogin } = useAuth();

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
        const result = await adminLogin(formData);
        setSubmitting(false);

        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setErrors({ submit: result.message });
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box admin-auth">
                <div className="auth-header">
                    <h2>Admin Login</h2>
                    <p>Welcome back, Admin</p>
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
                            placeholder="admin@example.com"
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
                        className="submit-btn admin-btn"
                        disabled={submitting}
                    >
                        {submitting ? 'Logging in...' : 'Admin Login'}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/admin/signup">Sign up here</Link>
                </p>

                <div className="auth-divider">or</div>

                <p className="auth-footer">
                    Are you a user? <Link to="/user/login">Login as User</Link>
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;

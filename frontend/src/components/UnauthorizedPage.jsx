import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
    return (
        <div className="error-container">
            <div className="error-box">
                <h1>403</h1>
                <h2>Unauthorized Access</h2>
                <p>You do not have permission to access this resource.</p>
                <Link to="/user/login" className="error-btn">Go to Login</Link>
            </div>
        </div>
    );
};

export default UnauthorizedPage;

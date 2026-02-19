# File Enhancer - Authentication System Guide

## Overview

This is a complete production-ready authentication system with separate login/signup pages for Users and Admins. The system uses JWT tokens for secure authentication and MongoDB for data persistence.

---

## Backend Setup

### 1. Environment Variables

Create a `.env` file in the `Backend` folder:

```
MONGODB_URI=mongodb://localhost:27017/fileenhancer
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRE=7d
ADMIN_SECRET_KEY=admin_secret_123_change_this
FRONTEND_URL=http://localhost:5173
```

**Important**: Change these values in production!

### 2. Install Dependencies

```bash
cd Backend
npm install
```

### 3. Database Setup

Make sure MongoDB is running locally or use MongoDB Atlas:

```bash
# For local MongoDB
mongod

# For MongoDB Atlas, update MONGODB_URI in .env with your connection string
```

### 4. Run Backend Server

```bash
npm run dev
```

Server will run on `http://localhost:3000`

---

## Frontend Setup

### 1. Environment Variables

Create a `.env.local` file in the `frontend` folder:

```
VITE_API_URL=http://localhost:3000/api
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Run Frontend

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## API Endpoints

### User Authentication

#### Sign Up
```
POST /api/auth/user/signup
Content-Type: application/json

{
  "username": "johndoe123",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "firstname": "John",
  "lastname": "Doe"
}
```

#### Login
```
POST /api/auth/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Admin Authentication

#### Sign Up
```
POST /api/auth/admin/signup
Content-Type: application/json

{
  "username": "admin123",
  "email": "admin@example.com",
  "password": "AdminPass123",
  "confirmPassword": "AdminPass123",
  "firstname": "Admin",
  "lastname": "User",
  "adminSecret": "admin_secret_123_change_this"
}
```

#### Login
```
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "AdminPass123"
}
```

### Protected Routes

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <jwt_token>
```

---

## Frontend Components & Pages

### Authentication Pages

1. **User Login** - `/user/login`
   - Email and password validation
   - Responsive design
   - Error handling

2. **User Signup** - `/user/signup`
   - Username, email, name validation
   - Password matching
   - Form validation

3. **Admin Login** - `/admin/login`
   - Similar to user login
   - Admin-specific styling

4. **Admin Signup** - `/admin/signup`
   - Requires admin secret key
   - Additional admin-specific fields

### Dashboard Pages

1. **User Dashboard** - `/user/dashboard`
   - Protected route (requires user role)
   - User profile information
   - Quick actions (Upload, My Files, Profile)

2. **Admin Dashboard** - `/admin/dashboard`
   - Protected route (requires admin role)
   - Admin statistics
   - Management options (Users, Admins, Reports, Settings)

### Components

- **ProtectedRoute** - Wrapper component for protected routes
  - Checks authentication status
  - Validates user role
  - Redirects to login if not authenticated

- **UnauthorizedPage** - 403 error page
  - Shown when user tries to access restricted content

---

## Context API - AuthContext

The authentication system uses React Context for state management.

### Hook Usage

```jsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const {
    user,           // Current user object
    token,          // JWT token
    loading,        // Loading state
    error,          // Error messages
    userSignup,     // Function to sign up user
    userLogin,      // Function to login user
    adminSignup,    // Function to sign up admin
    adminLogin,     // Function to login admin
    logout,         // Function to logout
    isAuthenticated,// Boolean - is user authenticated
    isAdmin,        // Boolean - is user admin
    isUser          // Boolean - is user a regular user
  } = useAuth();

  return // JSX
}
```

---

## Database Models

### User Model

```javascript
{
  _id: ObjectId,
  username: String (unique, 3-30 chars),
  email: String (unique, valid email),
  password: String (hashed, min 6 chars),
  firstname: String,
  lastname: String,
  profilePicture: String (optional),
  role: String (enum: ['user']),
  isEmailVerified: Boolean (default: false),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Admin Model

```javascript
{
  _id: ObjectId,
  username: String (unique, 3-30 chars),
  email: String (unique, valid email),
  password: String (hashed, min 6 chars),
  firstname: String,
  lastname: String,
  profilePicture: String (optional),
  role: String (enum: ['admin', 'superadmin']),
  permissions: Array (enum: ['manage_users', 'manage_admins', 'view_reports', 'manage_content', 'manage_system']),
  isEmailVerified: Boolean (default: false),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security Features

✅ **Password Hashing**
- Passwords hashed with bcryptjs (10 salt rounds)
- Never stored in plain text

✅ **JWT Authentication**
- Secure token-based authentication
- Configurable expiration time
- Token stored in localStorage (frontend)

✅ **Input Validation**
- All fields validated on frontend and backend
- Email format validation
- Password strength requirements
- Username format validation

✅ **Role-Based Access Control**
- Different roles: user, admin, superadmin
- Protected routes based on user role
- Admin secret key for admin signup

✅ **Error Handling**
- User-friendly error messages
- HTTP status codes
- Input validation feedback

---

## Production Deployment

### Before Going Live

1. **Security Credentials**
   ```
   Change ADMIN_SECRET_KEY to a strong, random string
   Change JWT_SECRET to a secure 32+ character string
   Use environment variables from process.env
   ```

2. **Database**
   ```
   Use MongoDB Atlas or managed MongoDB service
   Set MONGODB_URI to production database
   Enable authentication on database
   ```

3. **Frontend**
   ```
   Build for production: npm run build
   Set VITE_API_URL to production backend URL
   Enable CORS only for your domain
   ```

4. **Backend**
   ```
   Set NODE_ENV=production
   Update FRONTEND_URL to production URL
   Enable HTTPS
   Set up proper logging
   Configure rate limiting
   ```

### Deployment Checklist

- [ ] Change all secret keys and passwords
- [ ] Set NODE_ENV to production
- [ ] Enable HTTPS on backend
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Enable logging and monitoring
- [ ] Test all endpoints
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Implement rate limiting
- [ ] Set up CI/CD pipeline

---

## Common Issues & Solutions

### CORS Error

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**: Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL

```env
FRONTEND_URL=http://localhost:5173  # for development
FRONTEND_URL=https://yourdomain.com # for production
```

### Token Not Persisting

**Issue**: User logs out when page is refreshed

**Solution**: The token is stored in localStorage automatically. Make sure localStorage is not cleared on page refresh.

### MongoDB Connection Error

**Error**: `MongoDB connection error`

**Solution**: 
1. Ensure MongoDB is running
2. Check MONGODB_URI format
3. For MongoDB Atlas, whitelist your IP address

### 401 Unauthorized

**Error**: Invalid or expired token

**Solution**: 
- Check token is included in Authorization header
- Format: `Authorization: Bearer <token>`
- Token may be expired; user needs to login again

---

## Testing the System

### 1. Test User Registration
```bash
POST http://localhost:3000/api/auth/user/signup
```

### 2. Test User Login
```bash
POST http://localhost:3000/api/auth/user/login
```

### 3. Test Admin Registration (with correct secret)
```bash
POST http://localhost:3000/api/auth/admin/signup
```

### 4. Test Protected Route
```bash
GET http://localhost:3000/api/auth/me
Authorization: Bearer <your_token>
```

---

## Next Steps

1. **Add Email Verification**
   - Send verification emails on signup
   - Verify email before allowing login

2. **Add Password Reset**
   - Forgot password functionality
   - Reset email with token

3. **Add Two-Factor Authentication**
   - OTP via email or SMS
   - Authenticator app support

4. **Add Social Login**
   - Google OAuth
   - Facebook, GitHub login

5. **Add User Profile Management**
   - Edit profile information
   - Change password
   - Upload profile picture

---

## Support & Documentation

For more information:
- [Express.js Documentation](https://expressjs.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [React Documentation](https://react.dev)
- [JWT Documentation](https://jwt.io)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Status**: Production Ready

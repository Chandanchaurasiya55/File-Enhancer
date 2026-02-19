# File Enhancer - Complete Full-Stack Application

A modern, production-ready web application for file enhancement with professional user and admin authentication system.

![React](https://img.shields.io/badge/react-19.2.0-blue)
![Node.js](https://img.shields.io/badge/node.js-18+-green)
![MongoDB](https://img.shields.io/badge/mongodb-7.1.0-green)
![Express](https://img.shields.io/badge/express-5.2.1-lightgrey)
![JWT](https://img.shields.io/badge/jwt-9.0.3-orange)

## 🎯 Overview

File Enhancer is a complete full-stack application featuring:
- **Dual Authentication System** - Separate login/signup for users and admins
- **JWT Token Security** - Secure authentication with JSON Web Tokens
- **Role-Based Access Control** - Different capabilities for users and admins
- **Production-Ready Code** - Enterprise-grade security and best practices
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## ✨ Features

### Authentication System
- ✅ User Registration & Login
- ✅ Admin Registration & Login (with secret key)
- ✅ JWT Token-based Authentication
- ✅ Password Hashing with bcryptjs
- ✅ Input Validation (Frontend & Backend)
- ✅ Protected Routes with Role-based Access
- ✅ Persistent Authentication with localStorage
- ✅ Error Handling & User Feedback

### User Features
- 📊 User Dashboard
- 📁 File Management
- ⚙️ Profile Settings
- 🔐 Secure Authentication

### Admin Features
- 👥 User Management Dashboard
- 👨‍💼 Admin Management
- 📈 System Statistics
- 📊 Reports & Analytics
- ⚙️ System Settings

## 📁 Project Structure

```
File-Enhancer/
├── Backend/
│   ├── src/
│   │   ├── app.js                      # Express app configuration
│   │   ├── Controller/
│   │   │   └── authController.js       # Authentication logic
│   │   ├── Models/
│   │   │   ├── User.js                 # User database model
│   │   │   └── Admin.js                # Admin database model
│   │   ├── Routes/
│   │   │   └── authRoutes.js           # Auth endpoint routes
│   │   ├── middleware/
│   │   │   └── authMiddleware.js       # JWT verification & role checking
│   │   └── DB/
│   │       └── db.js                   # MongoDB connection
│   ├── server.js                       # Server entry point
│   ├── package.json                    # Backend dependencies
│   └── .env.example                    # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── Auth/
│   │   │   ├── UserLogin.jsx           # User login page
│   │   │   ├── UserSignup.jsx          # User signup page
│   │   │   ├── AdminLogin.jsx          # Admin login page
│   │   │   └── AdminSignup.jsx         # Admin signup page
│   │   ├── components/
│   │   │   ├── Navigation.jsx          # Top navigation
│   │   │   ├── Home.jsx                # Landing page hero
│   │   │   ├── Services.jsx            # Services section
│   │   │   ├── Features.jsx            # Features section
│   │   │   ├── Upload.jsx              # File upload component
│   │   │   ├── Stats.jsx               # Statistics section
│   │   │   ├── Pricing.jsx             # Pricing plans
│   │   │   ├── Footer.jsx              # Footer section
│   │   │   ├── UserDashboard.jsx       # User dashboard page
│   │   │   ├── AdminDashboard.jsx      # Admin dashboard page
│   │   │   ├── ProtectedRoute.jsx      # Protected route wrapper
│   │   │   └── UnauthorizedPage.jsx    # 403 error page
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Global auth state management
│   │   ├── styles/
│   │   │   ├── Auth.css                # Authentication pages styling
│   │   │   ├── Dashboard.css           # Dashboard pages styling
│   │   │   ├── index.css               # Global styles
│   │   │   └── [other styles].css      # Component-specific styles
│   │   ├── App.jsx                     # Main React component with routing
│   │   └── main.jsx                    # React entry point
│   ├── package.json                    # Frontend dependencies
│   ├── .env.local                      # Frontend environment variables
│   └── vite.config.js                  # Vite configuration
│
├── AUTHENTICATION_GUIDE.md             # Detailed authentication documentation
└── README.md                           # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Install Dependencies**
```bash
cd Backend
npm install
```

2. **Create `.env` File**
```bash
cp .env.example .env
```

3. **Configure Environment Variables**
```
MONGODB_URI=mongodb://localhost:27017/fileenhancer
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_key_min_32_chars_change_this
JWT_EXPIRE=7d
ADMIN_SECRET_KEY=admin_secret_key_change_this
FRONTEND_URL=http://localhost:5173
```

4. **Start MongoDB**
```bash
mongod
```

5. **Run Development Server**
```bash
npm run dev
```

Server runs on: `http://localhost:3000`

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Create `.env.local` File**
```
VITE_API_URL=http://localhost:3000/api
```

3. **Run Development Server**
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 🔑 API Endpoints

### Public Endpoints

#### User Authentication
```
POST   /api/auth/user/signup         - Register new user
POST   /api/auth/user/login          - Login user
POST   /api/auth/admin/signup        - Register admin (requires secret)
POST   /api/auth/admin/login         - Login admin
GET    /api/health                   - Health check
```

### Protected Endpoints (Require JWT Token)

```
GET    /api/auth/me                  - Get current user info
POST   /api/auth/logout              - Logout (clear token)
```

## 📝 API Examples

### User Signup
```bash
curl -X POST http://localhost:3000/api/auth/user/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe123",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123",
    "firstname": "John",
    "lastname": "Doe"
  }'
```

### User Login
```bash
curl -X POST http://localhost:3000/api/auth/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Admin Signup
```bash
curl -X POST http://localhost:3000/api/auth/admin/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin123",
    "email": "admin@example.com",
    "password": "AdminPass123",
    "confirmPassword": "AdminPass123",
    "firstname": "Admin",
    "lastname": "User",
    "adminSecret": "admin_secret_key_change_this"
  }'
```

### Get Current User (Protected)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <your_jwt_token>"
```

## 🔐 Authentication Flow

1. **User Registration**
   - User fills signup form
   - Password validated and hashed
   - User created in MongoDB
   - JWT token generated and returned
   - Token stored in localStorage (frontend)

2. **User Login**
   - User provides email and password
   - Credentials validated against database
   - Password compared with hash
   - JWT token generated
   - Token stored in localStorage

3. **Protected Routes**
   - Token retrieved from localStorage
   - Token sent in Authorization header
   - Server verifies token validity
   - User role checked for route access
   - Access granted/denied accordingly

## 🎨 Frontend Pages

### Public Pages
- `/` - Landing page with features and pricing
- `/user/login` - User login page
- `/user/signup` - User registration page
- `/admin/login` - Admin login page
- `/admin/signup` - Admin registration page
- `/unauthorized` - 403 error page

### Protected Pages
- `/user/dashboard` - User dashboard (requires user role)
- `/admin/dashboard` - Admin dashboard (requires admin role)

## 🛡️ Security Features

✅ **Password Security**
- Hashed with bcryptjs (10 salt rounds)
- Minimum 6 characters requirement
- Never stored in plain text

✅ **JWT Authentication**
- Secure token-based authentication
- Configurable token expiration (default 7 days)
- Token validation on every protected request

✅ **Input Validation**
- Frontend validation for user experience
- Backend validation for security
- Email format validation
- Username format with regex

✅ **Role-Based Access Control**
- User role for regular users
- Admin and superadmin roles
- Permission-based system ready

✅ **Error Handling**
- User-friendly error messages
- Proper HTTP status codes
- Input validation feedback

✅ **Database Security**
- MongoDB connection with authentication
- Password hashing before storage
- No sensitive data in API responses

## 📊 Database Models

### User Model
```javascript
{
  username: String (unique),
  email: String (unique, validated),
  password: String (hashed),
  firstname: String,
  lastname: String,
  profilePicture: String,
  role: String (enum: ['user']),
  isEmailVerified: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Admin Model
```javascript
{
  username: String (unique),
  email: String (unique, validated),
  password: String (hashed),
  firstname: String,
  lastname: String,
  profilePicture: String,
  role: String (enum: ['admin', 'superadmin']),
  permissions: Array,
  isEmailVerified: Boolean,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Environment Variables

### Backend (.env)
```
MONGODB_URI          - MongoDB connection string
PORT                 - Server port (default: 3000)
NODE_ENV             - Environment (development/production)
JWT_SECRET           - Secret key for JWT signing
JWT_EXPIRE           - Token expiration time (default: 7d)
ADMIN_SECRET_KEY     - Secret key for admin registration
FRONTEND_URL         - Frontend URL for CORS
```

### Frontend (.env.local)
```
VITE_API_URL         - Backend API base URL
```

## 🧪 Testing

### Test User Registration
Navigate to `http://localhost:5173/user/signup` and fill the form.

### Test Admin Registration
Navigate to `http://localhost:5173/admin/signup` and use the admin secret key.

### Test Protected Routes
After logging in, you'll be redirected to the dashboard based on your role.

## 📦 Dependencies

### Backend
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT creation and verification
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable loading
- **nodemon** - Development auto-refresh

### Frontend
- **react** - UI library
- **react-dom** - React DOM rendering
- **react-router-dom** - Client-side routing
- **vite** - Build tool and dev server

## 🚢 Production Deployment

### Before Deploying

1. **Change All Secret Keys**
   ```
   JWT_SECRET - Use a strong, random string (32+ chars)
   ADMIN_SECRET_KEY - Use a strong, random string
   ```

2. **Update URLs**
   ```
   FRONTEND_URL - Set to your production domain
   VITE_API_URL - Set to your production API URL
   ```

3. **Database**
   ```
   Use MongoDB Atlas or managed service
   Enable authentication
   Set up backups
   ```

4. **Security**
   ```
   Enable HTTPS
   Configure CORS properly
   Set NODE_ENV=production
   ```

### Deployment Steps

**Backend (Vercel, Heroku, Railroad, etc.)**
```bash
# Build
npm install

# Set environment variables
# Deploy
```

**Frontend (Vercel, Netlify, AWS S3, etc.)**
```bash
# Build
npm run build

# Deploy dist folder
# Set VITE_API_URL to production API
```

## 📖 Documentation

For detailed authentication documentation, see [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [JWT.io](https://jwt.io)
- [MongoDB Documentation](https://docs.mongodb.com)

## 🐛 Troubleshooting

### CORS Error
- Ensure `FRONTEND_URL` in `.env` matches your frontend URL
- Check that backend server is running

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` format and connection string
- For Atlas, whitelist your IP address

### Token Expired
- User needs to login again
- Token expiration is set to 7 days by default
- Can be changed in `JWT_EXPIRE` environment variable

### 401 Unauthorized
- Ensure token is sent in Authorization header
- Format: `Authorization: Bearer <token>`
- Check token hasn't expired

## 📝 Notes

- This is a production-ready authentication system
- All passwords are hashed and never stored in plain text
- JWT tokens are valid for 7 days by default
- Admin accounts require a secret registration key
- All endpoints include proper error handling

## 📄 License

This project is ready for production use.

## ✅ Checklist for First Run

- [ ] Install MongoDB locally or set up Atlas
- [ ] Create `.env` file in Backend folder
- [ ] Create `.env.local` file in frontend folder
- [ ] Run `npm install` in both folders
- [ ] Start MongoDB
- [ ] Start Backend: `npm run dev` (Backend folder)
- [ ] Start Frontend: `npm run dev` (frontend folder)
- [ ] Open `http://localhost:5173` in browser
- [ ] Test user registration
- [ ] Test user login
- [ ] Test admin registration (use admin secret)
- [ ] Test admin login
- [ ] Verify token persistence after refresh

---

**Status**: ✅ Production Ready  
**Last Updated**: February 2026  
**Version**: 1.0.0

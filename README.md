# 🎬 File-Enhancer - Premium Video Studio Platform

A modern, full-stack web application for video and image processing with user authentication, role-based dashboards, and premium features.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Environment Variables](#environment-variables)
- [Folder Structure](#folder-structure)
- [Key Components](#key-components)
- [Contributing](#contributing)

---

## 🎯 Overview

**File-Enhancer** is a premium video processing platform that allows users to:
- Upload and process videos and images
- Access professional editing tools
- Subscribe to premium features
- Manage files in personalized dashboards

Admins can:
- Manage user accounts and content
- Monitor platform activity
- Configure premium features
- Track usage statistics

---

## ✨ Features

### 🔐 **Authentication & Authorization**
- User registration and login
- Admin account management (single admin per instance)
- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)

### 👤 **User Features**
- Create account with full name, email, phone, and password
- Upload and manage video/image files
- Access personal dashboard
- Purchase premium features
- View processing history

### ⚙️ **Admin Features**
- Manage user accounts
- Monitor system activity
- Configure premium pricing
- View platform statistics
- Manage content policies

### 🎨 **User Interface**
- Responsive landing page
- Service highlights section
- Premium feature showcase
- Pricing information
- Smooth navigation

### 📱 **File Support**
**Video Formats:** MP4, MOV, AVI, MKV, WEBM, PRORES, HEVC
**Image Formats:** JPEG, PNG, GIF, WEBP, SVG

---

## 🛠 Tech Stack

### **Backend**
- **Framework:** Node.js + Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** Custom middleware
- **Server:** Nodemon (development)

### **Frontend**
- **Library:** React 19.2
- **Build Tool:** Vite 7.3
- **Routing:** React Router DOM 7.13
- **Styling:** CSS3
- **HTTP Client:** Fetch API
- **State Management:** React Context API

### **Development Tools**
- ESLint for code quality
- Nodemon for auto-reload
- Vite for fast development

---

## 📁 Project Structure

```
File-Enhancer/
├── Backend/
│   ├── src/
│   │   ├── app.js                          # Express configuration
│   │   ├── Controller/
│   │   │   ├── auth.controller.js          # Authentication logic
│   │   │   └── admin.controller.js         # Admin operations
│   │   ├── Models/
│   │   │   ├── user.model.js               # User schema
│   │   │   └── admin.model.js              # Admin schema
│   │   ├── Routes/
│   │   │   └── auth.route.js               # Auth routes
│   │   ├── Middleware/
│   │   │   ├── auth.middleware.js          # User authentication
│   │   │   └── admin.middleware.js         # Admin authentication
│   │   └── DB/
│   │       └── db.js                       # MongoDB connection
│   ├── server.js                           # Server entry point
│   ├── .env                                # Environment variables
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                         # Main app component
│   │   ├── main.jsx                        # React entry point
│   │   ├── Auth/
│   │   │   ├── UserLogin.jsx               # User login page
│   │   │   ├── UserSignup.jsx              # User signup form
│   │   │   ├── AdminLogin.jsx              # Admin login page
│   │   │   └── AdminSignup.jsx             # Admin signup form
│   │   ├── components/
│   │   │   ├── Navigation.jsx              # Top navbar
│   │   │   ├── Home.jsx                    # Hero section
│   │   │   ├── Services.jsx                # Services showcase
│   │   │   ├── Upload.jsx                  # File upload widget
│   │   │   ├── Features.jsx                # Feature highlights
│   │   │   ├── Stats.jsx                   # Statistics section
│   │   │   ├── Premium.jsx                 # Premium offer
│   │   │   ├── Pricing.jsx                 # Pricing plans
│   │   │   ├── Footer.jsx                  # Footer
│   │   │   ├── UserDashboard.jsx           # User dashboard
│   │   │   ├── AdminDashboard.jsx          # Admin dashboard
│   │   │   ├── UnauthorizedPage.jsx        # 403 page
│   │   │   └── ProtectedRoute.jsx          # Route protection
│   │   ├── context/
│   │   │   └── AuthContext.jsx             # Global auth state
│   │   ├── styles/
│   │   │   ├── index.css                   # Global styles
│   │   │   ├── Auth.css                    # Auth pages styles
│   │   │   ├── Dashboard.css               # Dashboard styles
│   │   │   ├── Upload.css                  # Upload widget styles
│   │   │   ├── Home.css                    # Hero styles
│   │   │   ├── Navigation.css              # Navbar styles
│   │   │   └── ... (other component styles)
│   │   └── assets/                         # Images and icons
│   ├── .env                                # Environment variables
│   ├── vite.config.js                      # Vite configuration
│   ├── eslint.config.js                    # ESLint configuration
│   ├── index.html                          # HTML entry point
│   └── package.json
│
├── README.md                               # This file
├── PRODUCTION_SETUP.md                     # Production guide
└── CHANGES_MADE.md                         # Change log
```

---

## 🚀 Installation

### Troubleshooting

If uploads keep failing with messages such as:

```
ffmpeg exited with code 3752568763: frame= 0 fps=0.0 q=0.0 Lsize= 0kB time=N/A bitrate=N/A speed=N/A Conversion failed!
```

or the server log contains warnings about a "static binary failed to execute", then the bundled FFmpeg executable
is incompatible with your machine. To resolve the issue:

1. **Install the Visual C++ Redistributable** (2015–2022) on Windows – the static ffmpeg build depends on it.
2. Alternatively, install FFmpeg yourself and ensure `ffmpeg` is available on the system `PATH`.
3. Restart the backend after making these changes. The server will automatically fall back to the system
   binary if the static one fails.

---

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- **FFmpeg** – required for video compression. The project uses `ffmpeg-static`, which bundles a binary, but on Windows you may need the
  [Visual C++ Redistributable](https://learn.microsoft.com/cpp/windows/latest-supported-vc-redist) installed or a system-wide `ffmpeg` on
  your PATH. See the **Troubleshooting** section below if you encounter startup errors.

### Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# MONGODB_URI=mongodb://localhost:27017/fileenhancer
# PORT=3000
# JWT_SECRET=your_secret_key_here
# jwtExpiration=1d
# jwtRefreshExpiration=7d
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file (if not exists)
# Add: VITE_API_URL=http://localhost:3000/api
```

---

## 🏃 Running the Application

### Start Backend
```bash
cd Backend
npm run dev
# Server runs on http://localhost:3000
```

### Start Frontend (in another terminal)
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

### Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### User Registration
```
POST /auth/user/signup
Content-Type: application/json

{
  "Fullname": "John Doe",
  "Email": "john@example.com",
  "Phone": "9876543210",
  "Password": "SecurePass123"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "mongodb_id",
    "Email": "john@example.com",
    "Fullname": "John Doe",
    "Phone": "9876543210",
    "role": "user"
  }
}
```

#### User Login
```
POST /auth/user/login
Content-Type: application/json

{
  "Email": "john@example.com",
  "Password": "SecurePass123"
}

Response:
{
  "success": true,
  "message": "User logged in successfully",
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Get Current User
```
GET /auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "User data retrieved",
  "user": { ... }
}
```

#### User Logout
```
POST /auth/logout
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Admin Endpoints

#### Admin Registration
```
POST /auth/admin/signup
Content-Type: application/json

{
  "Fullname": "Admin Name",
  "Email": "admin@example.com",
  "Password": "AdminPass123"
}

Note: Only one admin allowed per instance
```

#### Admin Login
```
POST /auth/admin/login
Content-Type: application/json

{
  "Email": "admin@example.com",
  "Password": "AdminPass123"
}
```

#### Check Admin Exists
```
GET /auth/admin/check

Response:
{
  "success": true,
  "exists": true/false,
  "message": "Admin already exists / No admin found"
}
```

#### Get Current Admin
```
GET /auth/admin/me
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "user": { ... }
}
```

#### Admin Logout
```
POST /auth/admin/logout
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "message": "Admin logged out successfully"
}
```

---

## 💾 Database Schema

### User Schema
```javascript
{
  Fullname: String (required, min: 3 chars),
  Email: String (required, unique, lowercase),
  Phone: String (required, format: 10 digits),
  Password: String (required, hashed, min: 8 chars),
  role: String (default: 'user', enum: ['user', 'admin']),
  cart: [{
    product: ObjectId,
    quantity: Number
  }],
  createdAt: Date (default: now),
  updatedAt: Date
}
```

### Admin Schema
```javascript
{
  Fullname: String (required),
  Email: String (required, unique),
  Password: String (required, hashed, min: 8 chars),
  role: String (default: 'admin', enum: ['admin', 'superadmin']),
  createdAt: Date (default: now),
  updatedAt: Date
}
```

---

## 🔐 Authentication

### JWT Token
- **Expiration:** 12 hours
- **Signing:** JWT_SECRET from environment
- **Storage:** localStorage (frontend), cookies (optional)
- **Transmission:** Authorization header

### Password Security
- **Hashing Algorithm:** bcryptjs (salt rounds: 10)
- **Never Returned:** Passwords excluded from API responses
- **Validation:** Minimum 8 characters

### Authorization
- **User Routes:** Require valid user token
- **Admin Routes:** Require valid admin token with admin/superadmin role
- **Protected Routes:** Dashboard and profile routes protected

---

## 🔧 Environment Variables

### Backend (.env)
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/fileenhancer

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
jwtExpiration=1d
jwtRefreshExpiration=7d
```

### Frontend (.env)
```env
# API Endpoint
VITE_API_URL=http://localhost:3000/api
```

---

## 🎨 Key Components

### Frontend Components

#### Navigation (Navigation.jsx)
- Top navigation bar
- User profile menu
- Logout button
- Admin panel link

#### Hero Section (Home.jsx)
- Welcome message
- Call-to-action buttons
- Key selling points

#### Upload Widget (Upload.jsx)
- File input validation
- Supported format display
- Error handling
- File type checking

#### Dashboards
- **UserDashboard:** User files and profile
- **AdminDashboard:** User management and stats

#### Authentication Pages
- Clean, professional forms
- Real-time validation
- Error messages
- Links to signup/login pages

#### ProtectedRoute (ProtectedRoute.jsx)
- Role-based access
- Redirect to login if not authenticated
- Redirect to unauthorized page if insufficient role

---

## 📝 Validation Rules

### User Signup
- ✓ Full Name: 3+ characters
- ✓ Email: Valid format
- ✓ Phone: Exactly 10 digits
- ✓ Password: 8+ characters
- ✓ Password Match: Must confirm password

### User Login
- ✓ Email: Valid format
- ✓ Password: 8+ characters

### Admin Signup
- ✓ Full Name: 3+ characters
- ✓ Email: Valid format
- ✓ Password: 8+ characters
- ✓ Only 1 admin allowed

---

## 🎯 Supported File Formats

### Video Formats
- MP4 (video/mp4)
- MOV (video/quicktime)
- AVI (video/x-msvideo)
- MKV (video/x-matroska)
- WEBM (video/webm)
- PRORES (video/x-prores)
- HEVC (video/x-h265)

### Image Formats
- JPEG (image/jpeg)
- PNG (image/png)
- GIF (image/gif)
- WEBP (image/webp)
- SVG (image/svg+xml)

---

## 🚦 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid credentials |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal error |

---

## 🔄 Application Flow

### User Journey
1. Visit `/` (landing page)
2. Click "Sign up" → `/user/signup`
3. Fill form and submit
4. Redirected to `/user/dashboard`
5. Upload files and manage content
6. Click logout to return home

### Admin Journey
1. Visit `/admin/signup`
2. Register as admin (only once allowed)
3. Redirected to `/admin/dashboard`
4. Manage users and content
5. Click logout to return home

---

## 🚀 Future Enhancements

- [ ] File upload and storage (AWS S3 or local)
- [ ] File processing pipeline
- [ ] Payment integration for premium features
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] User profile management
- [ ] Advanced search and filtering
- [ ] Analytics and reporting
- [ ] Video transcoding
- [ ] Rate limiting
- [ ] API versioning
- [ ] WebSocket for real-time updates
- [ ] Mobile app (React Native)
- [ ] Docker containerization

---

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review the console logs (browser DevTools for frontend, terminal for backend)
3. Verify environment variables are set correctly
4. Ensure MongoDB is running
5. Check CORS and port configurations

---

## 🙏 Acknowledgments

- Express.js for the robust backend framework
- React for the modern UI library
- MongoDB for flexible data storage
- Vite for lightning-fast development
- All open-source contributors

---

**Last Updated:** February 20, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅

---

### Quick Start Commands

```bash
# Backend
cd Backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev

# Visit http://localhost:5173
```

**Enjoy building with File-Enhancer! 🎉**

# Quick Start Guide - File Enhancer

## 5-Minute Setup

### Step 1: Backend Setup (3 minutes)

```bash
# Navigate to backend
cd Backend

# Install dependencies
npm install

# Create .env file (copy the content below)
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/fileenhancer
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_32chars_minimum
JWT_EXPIRE=7d
ADMIN_SECRET_KEY=admin_secret_123_change_this_in_production
FRONTEND_URL=http://localhost:5173
EOF

# Start server (make sure MongoDB is running)
npm run dev
```

**Backend runs on**: `http://localhost:3000`

### Step 2: Frontend Setup (2 minutes)

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
VITE_API_URL=http://localhost:3000/api
EOF

# Start frontend
npm run dev
```

**Frontend runs on**: `http://localhost:5173`

### Step 3: Test the App

1. Open `http://localhost:5173` in your browser
2. Click "Sign Up" for user registration
3. Fill the form and create an account
4. You'll be logged in and redirected to user dashboard
5. Click logout and try admin login (use admin secret key from .env)

## Default Test Credentials

Create these via signup:

**User Account**
- Email: `user@test.com`
- Password: `Test1234`
- Username: `testuser`

**Admin Account** (use admin secret: `admin_secret_123_change_this_in_production`)
- Email: `admin@test.com`
- Password: `Admin1234`
- Username: `testadmin`

## Key Features

✅ User Registration & Login  
✅ Admin Registration & Login (with secret key)  
✅ Protected Routes  
✅ Dashboard Pages  
✅ JWT Authentication  
✅ Password Hashing  
✅ Input Validation  
✅ Error Handling  

## Stop the Servers

```bash
# Backend: Press Ctrl+C in backend terminal
# Frontend: Press Ctrl+C in frontend terminal
```

## Next Steps

1. Read [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) for detailed documentation
2. Add backend API endpoints for file upload and processing
3. Create additional dashboard pages
4. Add email verification
5. Deploy to production

## Common Issues

**MongoDB Connection Error**
- Make sure MongoDB is running: `mongod`

**CORS Error**
- Check FRONTEND_URL in .env matches your frontend URL

**Port Already in Use**
- Change PORT in .env to an unused port

**Token Not Working**
- Make sure token is sent with request: `Authorization: Bearer <token>`

## Support

For detailed documentation, see [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)

---

Happy coding! 🚀

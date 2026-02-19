# API Testing Guide - Postman/cURL Examples

## Setup Postman

1. Open Postman
2. Create a new collection called "File Enhancer"
3. Copy the requests below

## Base URL
```
http://localhost:3000/api
```

---

## 1. User Registration

### Request
```http
POST /auth/user/signup
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

### cURL Command
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

### Response (Success)
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe123",
    "email": "john@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "2026-02-19T10:30:00.000Z"
  }
}
```

---

## 2. User Login

### Request
```http
POST /auth/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### cURL Command
```bash
curl -X POST http://localhost:3000/api/auth/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Response (Success)
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe123",
    "email": "john@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "role": "user",
    "isActive": true
  }
}
```

### Response (Error - Invalid Credentials)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## 3. Admin Registration

### Request
```http
POST /auth/admin/signup
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

### cURL Command
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
    "adminSecret": "admin_secret_123_change_this"
  }'
```

### Response (Success)
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "username": "admin123",
    "email": "admin@example.com",
    "firstname": "Admin",
    "lastname": "User",
    "role": "admin",
    "permissions": ["manage_users", "view_reports"],
    "isActive": true,
    "createdAt": "2026-02-19T10:30:00.000Z"
  }
}
```

### Response (Error - Invalid Secret)
```json
{
  "success": false,
  "message": "Invalid admin registration code"
}
```

---

## 4. Admin Login

### Request
```http
POST /auth/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "AdminPass123"
}
```

### cURL Command
```bash
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123"
  }'
```

### Response (Success)
```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "username": "admin123",
    "email": "admin@example.com",
    "firstname": "Admin",
    "lastname": "User",
    "role": "admin",
    "permissions": ["manage_users", "view_reports"],
    "isActive": true,
    "lastLogin": "2026-02-19T10:35:00.000Z"
  }
}
```

---

## 5. Get Current User (Protected Route)

### Request
```http
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### cURL Command
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response (Success)
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe123",
    "email": "john@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "2026-02-19T10:30:00.000Z"
  }
}
```

### Response (Error - No Token)
```json
{
  "success": false,
  "message": "No token provided. Please authenticate."
}
```

### Response (Error - Invalid Token)
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

## 6. Logout

### Request
```http
POST /auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### cURL Command
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response (Success)
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 7. Health Check

### Request
```http
GET /health
```

### cURL Command
```bash
curl http://localhost:3000/api/health
```

### Response
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### Duplicate Email
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### Duplicate Username
```json
{
  "success": false,
  "message": "Username already taken"
}
```

### Account Deactivated
```json
{
  "success": false,
  "message": "Your account has been deactivated"
}
```

### Password Mismatch
```json
{
  "success": false,
  "message": "Passwords do not match"
}
```

### Unauthorized (Admin Route)
```json
{
  "success": false,
  "message": "Forbidden: Admin access required"
}
```

---

## Testing Workflow

### 1. Register User
```bash
POST /auth/user/signup
```
Save the token from response

### 2. Use the Token
```bash
GET /auth/me
Authorization: Bearer <token>
```

### 3. Test with Invalid Token
```bash
GET /auth/me
Authorization: Bearer invalid_token
```

### 4. Register Admin
```bash
POST /auth/admin/signup
Use correct adminSecret from .env
```

### 5. Admin Login
```bash
POST /auth/admin/login
```

### 6. Logout (clears token)
```bash
POST /auth/logout
Authorization: Bearer <token>
```

---

## Postman Collection JSON

Import this into Postman:

```json
{
  "info": {
    "name": "File Enhancer API",
    "description": "Authentication API Testing"
  },
  "item": [
    {
      "name": "User Registration",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/auth/user/signup",
        "body": {
          "mode": "raw",
          "raw": "{\"username\":\"johndoe123\",\"email\":\"john@example.com\",\"password\":\"SecurePass123\",\"confirmPassword\":\"SecurePass123\",\"firstname\":\"John\",\"lastname\":\"Doe\"}"
        }
      }
    },
    {
      "name": "User Login",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/auth/user/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"john@example.com\",\"password\":\"SecurePass123\"}"
        }
      }
    },
    {
      "name": "Get Current User",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/auth/me",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ]
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

### Setup Postman Variables
1. Create collection variable `base_url` = `http://localhost:3000/api`
2. Create collection variable `token` = (empty, will be filled after login)
3. After login, copy token and paste in the `token` variable

---

## Testing Tips

✅ Always set `Content-Type: application/json` header  
✅ Use Bearer token format: `Authorization: Bearer <token>`  
✅ Check response status codes  
✅ Validate all required fields  
✅ Test both success and error cases  
✅ Save tokens for subsequent requests  

---

For more info, see [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)

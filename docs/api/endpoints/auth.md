# Authentication Endpoints

Authentication and session management endpoints.

## POST /api/auth/login

Authenticate a user and create a session.

### Request
```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "securepassword",
  "stayLoggedIn": false
}
```

### Request Body Schema
```typescript
interface LoginRequest {
  identifier: string;    // Username or email
  password: string;      // User password
  stayLoggedIn?: boolean; // Optional: extend session duration
}
```

### Response - Success
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@company.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN",
      "status": "ACTIVE"
    },
    "sessionId": "sess_12345",
    "expiresAt": "2025-09-11T10:30:00Z"
  },
  "meta": {
    "timestamp": "2025-09-04T10:30:00Z"
  }
}
```

### Response - Error
```json
{
  "success": false,
  "error": "Invalid credentials",
  "meta": {
    "timestamp": "2025-09-04T10:30:00Z"
  }
}
```

### Cookies Set
The endpoint sets these HTTP-only cookies:
- `auth-token`: JWT containing user info and session
- `session-id`: Session identifier for server-side tracking

### Rate Limiting
- **IP-based rate limiting** applies (from `src/lib/security.ts`)
- Returns `429 Too Many Requests` when exceeded
- Includes `Retry-After` header

### Security Features
- Password validation
- Failed login attempt logging
- IP address and user agent tracking
- Session duration based on `stayLoggedIn` parameter

## POST /api/auth/logout

Invalidate the current session and clear authentication cookies.

### Request
```http
POST /api/auth/logout
Cookie: auth-token=<jwt>; session-id=<session>
```

### Response - Success
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  },
  "meta": {
    "timestamp": "2025-09-04T10:30:00Z"
  }
}
```

### Side Effects
- Session invalidated in database
- Authentication cookies cleared
- Security audit log entry created

## GET /api/auth/me

Get current authenticated user information.

### Request
```http
GET /api/auth/me
Cookie: auth-token=<jwt>; session-id=<session>
```

### Response - Success
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@company.com",
    "firstName": "Admin",
    "lastName": "User", 
    "role": "ADMIN",
    "status": "ACTIVE",
    "lastLoginAt": "2025-09-04T10:30:00Z",
    "createdAt": "2025-08-01T09:00:00Z"
  },
  "meta": {
    "timestamp": "2025-09-04T10:30:00Z"
  }
}
```

### Response - Unauthorized
```json
{
  "success": false,
  "error": "Authentication required",
  "meta": {
    "timestamp": "2025-09-04T10:30:00Z"
  }
}
```

## Authentication Flow Example

### 1. Login Flow
```bash
# Step 1: Login
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin",
    "password": "password",
    "stayLoggedIn": false
  }' \
  -c cookies.txt

# Response includes auth cookies in cookies.txt
```

### 2. Authenticated Request
```bash
# Step 2: Use cookies for authenticated requests
curl -X GET http://localhost:5173/api/auth/me \
  -b cookies.txt
```

### 3. Logout
```bash
# Step 3: Logout and clear session
curl -X POST http://localhost:5173/api/auth/logout \
  -b cookies.txt
```

## Security Implementation

### JWT Token Structure (from `src/lib/auth.ts`)
```typescript
interface JWTPayload {
  userId: number;
  username: string;
  role: string;
  sessionId: string;
  ipAddress: string;
  exp: number; // Expiration timestamp
}
```

### Session Management
- Sessions stored in database with metadata
- IP address validation on each request
- Automatic cleanup of expired sessions
- Concurrent session handling

### Rate Limiting Details
From `src/lib/security.ts`:
> TODO: Extract actual rate limit values and windows

### Security Audit Logging
All authentication events are logged with:
- Timestamp
- IP address  
- User agent
- Event type (LOGIN_ATTEMPT, LOGIN_SUCCESS, LOGOUT, etc.)
- Risk level assessment

---
*Implementation details in `src/routes/api/auth/` and `src/lib/auth.ts`*

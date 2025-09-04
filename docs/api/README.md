# API Documentation

REST API reference for the Etikettdrucker system.

## Base URL
- **Development**: `http://localhost:5173/api`
- **Production**: `https://your-domain.com/api`

## Authentication

The API uses a hybrid JWT + session-based authentication system (from `src/lib/auth.ts`).

### Authentication Flow
1. **Login**: POST to `/api/auth/login` with credentials
2. **Receive**: JWT token and session ID in HTTP-only cookies
3. **Access**: Include cookies in subsequent requests
4. **Logout**: POST to `/api/auth/logout` to invalidate session

### Security Features
- **Rate Limiting**: API requests are rate-limited per IP
- **CSRF Protection**: State-changing requests require CSRF validation
- **Security Logging**: All authentication events are audited
- **Session Management**: Sessions can be invalidated server-side

## Request/Response Format

### Standard Response Structure
All API endpoints return responses in this format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    timestamp: string;
    requestId: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}
```

### Success Response Example
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "role": "ADMIN"
  },
  "meta": {
    "timestamp": "2025-09-04T10:30:00Z"
  }
}
```

### Error Response Example
```json
{
  "success": false,
  "error": "Invalid credentials",
  "meta": {
    "timestamp": "2025-09-04T10:30:00Z"
  }
}
```

### Validation Error Example
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "username": ["Username is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

## Error Codes

| HTTP Status | Meaning | Common Causes |
|-------------|---------|---------------|
| 400 | Bad Request | Invalid input data, validation errors |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

## Rate Limiting

API requests are rate-limited based on IP address:
- **Limit**: > TODO: Extract from `src/lib/security.ts`
- **Window**: > TODO: Extract from `src/lib/security.ts`
- **Headers**: `Retry-After` header included in 429 responses

## Security Headers

Required headers for authenticated requests:
```http
Content-Type: application/json
Cookie: auth-token=<jwt>; session-id=<session>
```

CSRF-protected endpoints also require:
```http
X-CSRF-Token: <csrf-token>
```

## Endpoint Categories

### [Authentication](./endpoints/auth.md)
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout  
- `GET /api/auth/me` - Get current user info

### [User Management](./endpoints/users.md)
- `GET /api/users` - List all users (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### [Product Management](./endpoints/products.md)
- `POST /api/c2` - C2 product operations
- `POST /api/cpro` - C-Pro product operations  
- `POST /api/cbasic` - C-Basic product operations
- `POST /api/kk` - KK product operations

### [Dashboard Analytics](./endpoints/dashboard.md)
- `GET /api/dashboard-stats` - Production statistics
- `GET /api/{product}/stats` - Product-specific analytics

### [Printing & Labels](./endpoints/printing.md)
- `POST /api/printer/test` - Test printer connection
- `POST /api/{product}/qr` - Generate QR codes

### [System Management](./endpoints/management.md)
- `POST /api/outerkarton` - Outer carton management
- `POST /api/zubehoer` - Accessories management
- `GET /api/database/stats` - Database statistics

## Common Patterns

### Pagination
List endpoints support pagination:
```http
GET /api/users?page=1&limit=20
```

Response includes pagination metadata:
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150
    }
  }
}
```

### Filtering and Search
> TODO: Document filtering patterns from actual endpoints

### File Uploads
> TODO: Document file upload endpoints and formats

## Testing the API

### Using curl
```bash
# Login
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "admin", "password": "password"}'

# Authenticated request (cookies from login)
curl -X GET http://localhost:5173/api/users \
  -b "auth-token=<token>; session-id=<session>"
```

### Using Postman/Insomnia
1. Create a collection for the API
2. Set up environment variables for base URL
3. Use cookie authentication for session management

## Development Notes

### Adding New Endpoints
All API routes are located in `src/routes/api/` following SvelteKit conventions:
- `+server.ts` files define HTTP handlers
- Folder structure matches URL structure
- Use TypeScript for type safety

### Security Middleware
All protected endpoints use `SecurityMiddleware.secureEndpoint()` for:
- Authentication validation
- Role-based authorization
- CSRF protection
- Input validation
- Security audit logging

Example usage (from `src/routes/api/users/+server.ts`):
```typescript
const { context } = await SecurityMiddleware.secureEndpoint(event, {
  requiredRole: 'ADMIN',
  validateCSRF: true,
  validateInput: true
});
```

---
*For detailed endpoint documentation, see the individual endpoint files in the [endpoints/](./endpoints/) directory.*

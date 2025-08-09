# Role-Based Access Control Documentation

## User Roles & Permissions

### Role Hierarchy
1. **VIEWER** (Level 0) - Lowest access
2. **PRUEFER_B** (Level 1)
3. **PRUEFER_A** (Level 2)
4. **PRUEFER_AB** (Level 3)
5. **MANAGEMENT** (Level 4)
6. **ADMIN** (Level 5) - Highest access

## Role Permissions Matrix

| Feature | VIEWER | PRUEFER_B | PRUEFER_A | PRUEFER_AB | MANAGEMENT | ADMIN |
|---------|--------|-----------|-----------|------------|------------|-------|
| Home Page | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Produktsysteme Section | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| C Pro - Prüfer A | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| C Pro - Prüfer B | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| C Pro - QR Preview | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| C2 - Prüfer A | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| C2 - Prüfer B | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| C2 - QR Preview | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| C Basic - Prüfer A | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| C Basic - Prüfer B | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| KK - Prüfer A | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| KK - Prüfer B | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Dashboard (C Pro) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Dashboard (C2) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Dashboard (C Basic) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Database Management | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Admin Functions | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## Sidebar Navigation

### VIEWER
- Produktsysteme section: Hidden
- Profile: Visible
- Logout: Visible

### PRUEFER_B
- Produktsysteme: C Pro (Prüfer B only), C2 (Prüfer B only), C Basic (Prüfer B only), KK (Prüfer B only)
- Zubehör: Visible
- Verpackung: Visible
- Profile: Visible
- Logout: Visible

### PRUEFER_A
- Produktsysteme: C Pro (Prüfer A only), C2 (Prüfer A only), C Basic (Prüfer A only), KK (Prüfer A only)
- Zubehör: Visible
- Verpackung: Visible
- Profile: Visible
- Logout: Visible

### PRUEFER_AB
- Produktsysteme: C Pro (Both Prüfer A & B), C2 (Both Prüfer A & B), C Basic (Both Prüfer A & B), KK (Both Prüfer A & B)
- Zubehör: Visible
- Verpackung: Visible
- Profile: Visible
- Logout: Visible

### MANAGEMENT
- Produktsysteme: Full access to all products
- Zubehör: Visible
- Verpackung: Visible
- Dashboard: C Pro, C2, C Basic
- Profile: Visible
- Logout: Visible

### ADMIN
- Produktsysteme: Full access to all products
- Zubehör: Visible
- Verpackung: Visible
- Dashboard: C Pro, C2, C Basic
- Database: Full database management
- Admin: User management and system settings
- Profile: Visible
- Logout: Visible

## Route Protection

### Layout-Based Guards
Each protected route has a `+layout.svelte` file that wraps the route content with a `RouteGuard` component:

- **Prüfer A Routes**: Require `PRUEFER_A` level or higher
- **Prüfer B Routes**: Require `PRUEFER_B` level or higher
- **QR Preview Routes**: Require `ANY_PRUEFER` (any Prüfer role)
- **Dashboard Routes**: Require `MANAGEMENT` level or higher
- **Database Routes**: Require `ADMIN` level only
- **Admin Routes**: Require `ADMIN` level only

### Route Guard Component
The `RouteGuard` component:
- Checks user authentication status
- Validates user role against required role
- Redirects unauthorized users to home page
- Shows loading state during authentication checks

## Implementation Details

### Role Helper Functions
- `canActAsProeferA()`: Returns true for PRUEFER_A, PRUEFER_AB, MANAGEMENT, ADMIN
- `canActAsProeferB()`: Returns true for PRUEFER_B, PRUEFER_AB, MANAGEMENT, ADMIN
- `canAccessDatabase()`: Returns true for ADMIN only

### Security Features
- **Address Bar Protection**: Direct URL access is blocked for unauthorized users
- **Navigation Hiding**: Unauthorized menu items are hidden from navigation
- **Role Hierarchy**: Higher roles inherit permissions from lower roles
- **Automatic Redirection**: Unauthorized access attempts redirect to home page

## Testing Scenarios

### Test Each Role
1. Create test users with each role level
2. Verify navigation visibility matches role permissions
3. Test direct URL access attempts
4. Confirm proper redirections for unauthorized access
5. Validate role hierarchy inheritance

### Edge Cases
- Logged out users attempting to access protected routes
- Role changes while user is active (requires re-login)
- Invalid or corrupted JWT tokens
- Network connectivity issues during authentication
- **Admin Routes**: Require `ADMIN` level only

### Route Guard Component
The `RouteGuard` component:
- Checks user authentication status
- Validates user role against required role
- Redirects unauthorized users to home page
- Shows loading state during authentication checks

## Implementation Details

### Role Helper Functions
- `canActAsProeferA()`: Returns true for PRUEFER_A, PRUEFER_AB, MANAGEMENT, ADMIN
- `canActAsProeferB()`: Returns true for PRUEFER_B, PRUEFER_AB, MANAGEMENT, ADMIN
- `canAccessDatabase()`: Returns true for ADMIN only

### Security Features
- **Address Bar Protection**: Direct URL access is blocked for unauthorized users
- **Navigation Hiding**: Unauthorized menu items are hidden from navigation
- **Role Hierarchy**: Higher roles inherit permissions from lower roles
- **Automatic Redirection**: Unauthorized access attempts redirect to home page
- **Export-Ready**: Data formatted for easy analysis

### Available Data
- **C Pro Devices**: Complete inspection data with Prüfer A/B information
- **C2 Devices**: All registered C2 units and their status
- **C Basic Devices**: C Basic product line data
- **KK (Kamerakopf)**: Camera head devices
- **Zubehör Etiketten**: Accessory labels
- **Outer Kartons**: Packaging data
- **Karton Entries**: Individual package contents

## Implementation Notes

### Authentication Updates
- Database APIs verify role permissions before data access
- Frontend components check user roles for UI visibility
- Navigation menu dynamically shows/hides based on permissions

### Role Assignment
- New roles can be assigned through the admin user management interface
- Existing users can be upgraded to new roles without data loss
- Role changes take effect immediately upon assignment

### Security
- All database operations require authentication
- Role checks performed on both frontend and backend
- Sensitive data only accessible to authorized roles

## Usage Examples

### For PRUEFER_AB Users
```
Can access:
- /cpro/pruefer-a (C Pro Prüfer A form)
- /cpro/pruefer-b (C Pro Prüfer B form) 
- /c2/pruefer-a (C2 Prüfer A form)
- /c2/pruefer-b (C2 Prüfer B form)
- All other Prüfer forms for all product lines
```

### For MANAGEMENT Users
```
Can access:
- All Prüfer functions (A & B for all products)
- /database (Full database management)
- Database statistics and analytics
- Search across all product data
- Product inspection history
```

### Role Checking in Code
```typescript
import { canAccessDatabase, canActAsProeferA } from '$lib/auth';

// Check database access
if (canAccessDatabase(user.role)) {
  // Show database management option
}

// Check Prüfer A capabilities  
if (canActAsProeferA(user.role)) {
  // Allow Prüfer A functions
}
```

## Migration Notes

- Existing users retain their current roles and permissions
- Database schema updated to include new roles
- No data loss during role system upgrade
- Backward compatibility maintained for existing functionality

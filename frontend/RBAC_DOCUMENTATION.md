# Role-Based Access Control (RBAC) System

## Overview
SiteBoss now includes a comprehensive Role-Based Access Control system that manages user permissions across the application. The system provides fine-grained access control for different features and routes based on user roles.

## Roles and Permissions

### User Roles (Hierarchy)
1. **Company Admin** (Level 5) - Full system access
2. **Project Manager** (Level 4) - Project and team management
3. **Foreman** (Level 3) - Field operations management  
4. **Worker** (Level 2) - Basic task and time tracking
5. **Client** (Level 1) - Read-only project access

### Permission Categories
- **Project Management**: view, create, edit, delete projects
- **Task Management**: view, create, edit, delete, assign tasks
- **Budget Management**: view, create, edit, delete, approve budgets
- **Team Management**: view, create, edit, delete, invite team members
- **Contractor Management**: view, create, edit, delete, approve contractors
- **Document Management**: view, upload, edit, delete documents
- **Time Tracking**: view, track, edit, approve time entries
- **Reports**: view, export, advanced reporting
- **Settings & Administration**: system configuration and user management

## Implementation Files

### Core RBAC Files
- `src/types/permissions.ts` - Permission definitions and role mappings
- `src/contexts/RBACContext.tsx` - RBAC context provider and hooks
- `src/config/routePermissions.ts` - Route-level permission configuration
- `src/components/ProtectedRoute/ProtectedRoute.tsx` - Route protection component
- `src/hooks/usePermissions.ts` - Convenience hooks for permission checks

### UI Components
- `src/components/UI/PermissionButton.tsx` - Permission-based button component
- `src/components/UI/PermissionLink.tsx` - Permission-based link component  
- `src/components/UI/RoleIndicator.tsx` - User role display component
- `src/contexts/RBACContext.tsx` - WithPermissions HOC for conditional rendering

## Usage Examples

### Route Protection
Routes are automatically protected based on the permissions defined in `routePermissions.ts`:

```typescript
// User must have PROJECT_VIEW permission to access /projects
'/projects': [Permission.PROJECT_VIEW]
```

### Component-Level Permission Checks
```typescript
import { usePermissions } from '../hooks/usePermissions';

function ProjectActions() {
  const { canCreateProjects, canEditProjects } = usePermissions();
  
  return (
    <div>
      {canCreateProjects() && (
        <button>Create Project</button>
      )}
      {canEditProjects() && (
        <button>Edit Project</button>
      )}
    </div>
  );
}
```

### Permission-Based UI Components
```typescript
import PermissionButton from '../components/UI/PermissionButton';
import { Permission } from '../types/permissions';

<PermissionButton 
  permissions={[Permission.PROJECT_CREATE]}
  className="btn-primary"
>
  Create Project
</PermissionButton>
```

### Conditional Rendering
```typescript
import { WithPermissions } from '../contexts/RBACContext';

<WithPermissions 
  permissions={[Permission.BUDGET_APPROVE]}
  fallback={<div>Access Denied</div>}
>
  <ApprovalPanel />
</WithPermissions>
```

## Role-Specific Features

### Company Admin
- Full access to all features
- User management capabilities
- System settings and configuration
- Audit log access
- Can manage all lower-level roles

### Project Manager
- Project creation and management
- Task assignment and tracking
- Budget management and approval
- Team management
- Contractor management
- Advanced reporting

### Foreman
- View projects and tasks
- Create and edit tasks
- Basic team management
- Time tracking oversight
- Basic reporting

### Worker
- View assigned projects
- Edit own tasks
- Time tracking
- Basic document access

### Client
- Read-only project access
- View project progress
- Access to project documents
- Basic reporting

## Security Features

### Route-Level Protection
- All routes require authentication
- Permission-based route access
- Automatic redirect to access denied page
- Debug information in development mode

### Component-Level Security
- Conditional rendering based on permissions
- Permission-based button/link visibility
- Role hierarchy enforcement
- Fallback content for unauthorized access

### Error Handling
- Graceful degradation for missing permissions
- User-friendly access denied messages
- Development-mode debug information
- Automatic navigation protection

## Development Notes

### Adding New Permissions
1. Add permission to `Permission` enum in `permissions.ts`
2. Map permission to roles in `ROLE_PERMISSIONS`
3. Add route permissions in `routePermissions.ts` if needed
4. Update `usePermissions` hook with convenience methods

### Adding New Roles
1. Add role to `UserRole` type
2. Define permissions in `ROLE_PERMISSIONS`
3. Set hierarchy level in `ROLE_HIERARCHY`
4. Update role indicator component

### Testing Permissions
The system includes development-mode debugging that shows:
- Current user role
- Required permissions for routes
- Permission check results

## Integration Points

### Supabase Integration
- User roles stored in Supabase user metadata
- Role information synchronized on login
- Persistent across sessions

### Navigation
- Sidebar navigation filtered by permissions
- Role indicator displayed in user profile
- Dynamic menu generation

### Error Boundaries
- RBAC errors caught by error boundary
- Graceful fallback for permission failures
- User-friendly error messages

This RBAC system provides enterprise-grade access control while maintaining ease of use and development efficiency.
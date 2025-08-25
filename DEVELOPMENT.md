# SiteBoss Development Guide

## 🚀 Quick Start

### Prerequisites
```bash
# Install Node.js 18+
node --version

# Install PostgreSQL 13+
psql --version
```

### Development Setup
```bash
# 1. Clone and setup backend
cd backend
npm install
cp .env.example .env

# 2. Setup database
createdb siteboss
psql -d siteboss -f src/database/schema.sql

# 3. Start backend
npm run dev  # http://localhost:3001

# 4. Setup frontend (new terminal)
cd ../frontend
npm install
npm start    # http://localhost:3000
```

## 🏗️ Architecture Overview

### Backend (Node.js/Express/PostgreSQL)
```
src/
├── controllers/    # Route handlers
├── models/        # Database operations
├── routes/        # API endpoints
├── middleware/    # Auth, validation, uploads
├── services/      # Business logic
├── database/      # DB connection & schema
└── types/         # TypeScript definitions
```

### Frontend (React/TypeScript/Tailwind)
```
src/
├── components/    # React components
│   ├── Layout/    # Header, Sidebar, Layout
│   ├── Dashboard/ # Dashboard components
│   ├── Auth/      # Login, Register
│   └── ...
├── contexts/      # React contexts (Auth)
├── services/      # API calls
└── types/         # TypeScript types
```

## 🔧 Key Technologies

### Backend Stack
- **Express.js**: Web framework
- **PostgreSQL**: Database
- **JWT**: Authentication
- **Joi**: Validation
- **Multer**: File uploads
- **bcryptjs**: Password hashing

### Frontend Stack
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **React Query**: Data fetching
- **React Router**: Navigation
- **Headless UI**: Components

## 📊 Database Schema

### Core Tables
- `companies`: Multi-tenant organization data
- `users`: User accounts with role-based access
- `projects`: Construction projects
- `tasks`: Project tasks and subtasks
- `budget_categories`: Budget planning
- `expenses`: Cost tracking
- `resources`: Equipment and materials
- `subcontractors`: External contractor management

### Key Relationships
```sql
companies (1) -> (many) users
companies (1) -> (many) projects
projects (1) -> (many) tasks
projects (1) -> (many) budget_categories
projects (1) -> (many) expenses
```

## 🔐 Authentication Flow

1. User logs in with email/password
2. Backend validates credentials
3. JWT token generated and returned
4. Frontend stores token in localStorage
5. Token included in API requests
6. Backend validates token on protected routes

### Role-Based Access
```typescript
type UserRole = 'super_admin' | 'company_admin' | 'project_manager' | 
                'foreman' | 'worker' | 'client';
```

## 📱 API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/profile
PUT  /api/auth/profile
```

### Projects
```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### Tasks
```
GET    /api/tasks/project/:projectId
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
GET    /api/tasks/my-tasks
```

### Budget & Expenses
```
GET  /api/budget/project/:projectId/categories
POST /api/budget/project/:projectId/categories
GET  /api/budget/project/:projectId/expenses
POST /api/budget/expenses
```

## 🎨 UI Components

### Layout Components
- `Header`: Navigation and user menu
- `Sidebar`: Role-based navigation
- `Layout`: Main layout wrapper

### Dashboard Components
- `Dashboard`: Main dashboard view
- `StatsCard`: Metric display cards
- `TaskList`: Task summary component
- `ProjectList`: Project overview
- `RecentActivity`: Activity feed

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow component-based design
- Maintain consistent spacing and colors
- Responsive mobile-first approach

## 🔍 Development Workflow

### Adding New Features

1. **Backend Development**
   ```bash
   # 1. Create database migration
   # 2. Update schema.sql
   # 3. Create model in models/
   # 4. Add controller in controllers/
   # 5. Define routes in routes/
   # 6. Add validation schemas
   ```

2. **Frontend Development**
   ```bash
   # 1. Define types in types/
   # 2. Add API calls in services/
   # 3. Create components
   # 4. Add routing
   # 5. Style with Tailwind
   ```

### Code Standards
- Use TypeScript for type safety
- Follow ESLint configurations
- Write meaningful component and function names
- Add comments for complex business logic
- Use proper error handling

## 🧪 Testing Strategy

### Backend Testing (Planned)
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Frontend Testing (Planned)
```bash
npm test              # React Testing Library
npm run test:e2e      # End-to-end tests
```

## 🚀 Deployment

### Production Environment
```bash
# Backend
npm run build
npm start

# Frontend
npm run build
# Deploy build/ folder to web server
```

### Environment Variables
- Keep sensitive data in .env files
- Use different configs for dev/prod
- Never commit .env files to git

## 🐛 Debugging

### Common Issues
1. **CORS errors**: Check frontend/backend URLs
2. **Database connection**: Verify PostgreSQL is running
3. **Authentication issues**: Check JWT token validity
4. **File upload issues**: Verify upload directory exists

### Development Tools
- Browser DevTools
- React Developer Tools
- PostgreSQL client (pgAdmin, DBeaver)
- API testing (Postman, Insomnia)

## 📈 Performance Considerations

### Backend
- Use database indexes on frequently queried fields
- Implement pagination for large datasets
- Cache frequently accessed data
- Optimize SQL queries

### Frontend
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Lazy load routes and components
- Optimize images and assets

## 🔒 Security Checklist

- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Secure file uploads
- [ ] Environment variable protection

## 📚 Useful Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/)

## 🤝 Contributing

1. Follow the established code patterns
2. Write tests for new features
3. Update documentation as needed
4. Use meaningful commit messages
5. Create focused pull requests

---

Happy coding! 🚀
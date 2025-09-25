# Education Management System

A comprehensive full-stack Next.js application for managing educational agencies, colleges, student applications, and payments.

## Features

### Admin Portal
- **Dashboard**: Analytics overview with interactive charts and statistics
- **Agency Management**: Complete CRUD operations for managing agency partners
- **College Management**: Manage educational institutions and their course offerings
- **Application Review**: Review and approve/reject student applications
- **Payment Tracking**: Monitor payments and commission calculations
- **Reports & Export**: Generate and export various reports

### Agency Portal
- **Dashboard**: Application statistics and recent activity overview
- **Student Applications**: Submit and manage student applications with multi-step forms
- **Document Management**: Upload and organize student documents
- **Payment Tracking**: View earnings and commission history

### Authentication
- JWT-based secure authentication
- Role-based access control (Admin/Agency)
- Protected routes with middleware

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add:
   ```
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   MONGODB_URI=mongodb://admin:password123@localhost:27017/edu-management?authSource=admin
   ```

## Environment Variables

The application requires the following environment variables to be configured:

### Required Variables

| Variable | Description | Example | Default |
|----------|-------------|---------|---------|
| `JWT_SECRET` | Secret key for JWT token signing and verification. **Must be changed in production!** | `your-super-secret-jwt-key-change-this-in-production` | `your-secret-key-change-in-production` |
| `MONGODB_URI` | MongoDB connection string with authentication | `mongodb://admin:password123@localhost:27017/edu-management?authSource=admin` | `mongodb://localhost:27017/edu-management` |

### Optional Variables

| Variable | Description | Example | Default |
|----------|-------------|---------|---------|
| `NODE_ENV` | Environment mode (affects cookie security settings) | `production` | `development` |

### Environment Setup Examples

#### Development (Local MongoDB)
```bash
# .env.local
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGODB_URI=mongodb://localhost:27017/edu-management
NODE_ENV=development
```

#### Development (Docker MongoDB with Authentication)
```bash
# .env.local
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGODB_URI=mongodb://admin:password123@localhost:27017/edu-management?authSource=admin
NODE_ENV=development
```

#### Production
```bash
# .env.local or environment variables
JWT_SECRET=your-actual-production-secret-key-minimum-32-characters
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edu-management?retryWrites=true&w=majority
NODE_ENV=production
```

### Security Notes

- **JWT_SECRET**: Use a strong, random secret key (minimum 32 characters) in production
- **MONGODB_URI**: Ensure your MongoDB instance is properly secured with authentication
- **Environment Files**: Never commit `.env.local` or `.env` files to version control
- **Production**: Use your hosting platform's environment variable settings instead of `.env` files

4. Start MongoDB and migrate data:
   \`\`\`bash
   # Start MongoDB with Docker (recommended)
   docker-compose up -d
   
   # Migrate existing JSON data to MongoDB
   npm run migrate
   \`\`\`

5. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

7. Access MongoDB Admin Interface (optional):
   - Mongo Express: [http://localhost:8081](http://localhost:8081)

### Demo Credentials

**Admin Access:**
- Email: `admin@grindx.io`
- Password: `admin123`

**Agency Access:**
- Email: `agency@grindx.io`
- Password: `agency123`

## Project Structure

\`\`\`
├── app/
│   ├── admin/          # Admin dashboard and pages
│   ├── agency/         # Agency portal pages
│   ├── api/auth/       # Authentication API routes
│   └── login/          # Login page
├── components/
│   ├── admin/          # Admin-specific components
│   ├── agency/         # Agency-specific components
│   └── ui/             # Reusable UI components
├── lib/
│   └── auth.ts         # Authentication utilities
└── middleware.ts       # Route protection middleware
\`\`\`

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Authentication**: JWT with jose library + bcrypt
- **Icons**: Lucide React
- **Charts**: Recharts
- **TypeScript**: Full type safety

## Security Features

- JWT-based session management
- HTTP-only cookies for token storage
- Role-based route protection
- CSRF protection via SameSite cookies
- Secure password handling (ready for bcrypt integration)

## Database Integration

The application now uses **MongoDB** for data storage with the following features:

- **Secure Authentication**: Bcrypt password hashing
- **Relational Data**: Proper ObjectId references between collections
- **Schema Validation**: Mongoose models with validation
- **Performance**: Indexed queries and optimized data access
- **Real-time Updates**: Event-driven architecture

### Quick Setup:
\`\`\`bash
# Start MongoDB with Docker
docker-compose up -d

# Migrate existing data
npm run migrate

# Start development server
npm run dev
\`\`\`

See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed setup instructions.

## Deployment

The application is ready for deployment on Vercel, Netlify, or any Node.js hosting platform.

For Vercel deployment:
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the `JWT_SECRET` environment variable in Vercel dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

# MongoDB Integration Setup

This project has been updated to use MongoDB instead of JSON files for data storage. Follow these steps to set up and run the application with MongoDB.

## Quick Start with Docker (Recommended)

1. **Start MongoDB with Docker Compose:**
   ```bash
   docker-compose up -d
   ```
   This will start:
   - MongoDB on port 27017
   - Mongo Express (web admin) on port 8081

2. **Run the migration to populate data:**
   ```bash
   npm run migrate
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Application: http://localhost:3000
   - MongoDB Admin: http://localhost:8081

## Manual MongoDB Installation

### Windows:
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install with default settings
3. Update `.env.local` if needed:
   ```
   MONGODB_URI=mongodb://localhost:27017/edu-management
   ```

### macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu):
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

## MongoDB Atlas (Cloud Option)

1. Create account at https://www.mongodb.com/atlas
2. Create a free cluster
3. Get connection string
4. Update `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edu-management
   ```

## Database Schema

The application uses the following collections:

- **users** - User accounts (Admin/Agency)
- **agencies** - Agency information
- **colleges** - Educational institutions
- **courses** - Course offerings
- **applications** - Student applications
- **payments** - Payment records

## Migration Details

The migration script (`scripts/migrate-to-mongodb.js`) will:

1. Connect to MongoDB
2. Clear existing data (if any)
3. Create collections with proper schemas
4. Import data from JSON files:
   - `data/users.json`
   - `data/agencies.json` 
   - `data/applications.json`
5. Create sample colleges and courses
6. Generate payment records
7. Hash all passwords with bcrypt

## Default Login Credentials

After migration, use these credentials:

**Admin Access:**
- Email: `admin@grindx.io`
- Password: `admin123`

**Agency Access:**
- Email: `agency@grindx.io`
- Password: `agency123`

## Key Changes from JSON Storage

1. **Authentication**: Passwords are now properly hashed with bcrypt
2. **Relationships**: Proper MongoDB ObjectId references between collections
3. **Validation**: Schema validation at database level
4. **Performance**: Indexed queries and optimized data access
5. **Scalability**: Can handle much larger datasets

## Troubleshooting

### Connection Issues:
- Ensure MongoDB is running: `docker ps` or check system services
- Verify connection string in `.env.local`
- Check firewall settings for port 27017

### Migration Errors:
- Ensure MongoDB is accessible
- Check that JSON files exist in `data/` directory
- Verify Node.js has write permissions

### Authentication Errors:
- Run migration again to ensure users are created
- Check password hashing in database
- Verify JWT_SECRET is set in `.env.local`

## Development Commands

```bash
# Start MongoDB with Docker
docker-compose up -d

# Stop MongoDB
docker-compose down

# View MongoDB logs
docker-compose logs mongodb

# Run migration
npm run migrate

# Start development server
npm run dev

# View database (Mongo Express)
open http://localhost:8081
```

## Production Considerations

1. **Security**: Change default passwords and use strong authentication
2. **Backup**: Set up regular database backups
3. **Monitoring**: Implement database monitoring
4. **Scaling**: Consider MongoDB Atlas or replica sets for production
5. **Environment**: Use separate databases for development/staging/production
# MongoDB Setup Instructions

## Option 1: Install MongoDB Locally

### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install MongoDB with default settings
3. MongoDB will run on `mongodb://localhost:27017` by default

### Alternative: Use MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update `.env.local` with your MongoDB Atlas URI:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edu-management
   ```

## Option 2: Use Docker (Recommended for Development)

1. Install Docker Desktop
2. Run MongoDB in Docker:
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

## Running the Migration

After MongoDB is running, execute the migration:

```bash
npm run migrate
```

This will:
- Connect to MongoDB
- Create the database and collections
- Migrate all existing JSON data to MongoDB
- Set up proper indexes and relationships

## Verify Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Login with existing credentials:
   - Admin: `admin@grindx.io` / `admin123`
   - Agency: `agency@grindx.io` / `agency123`

The application will now use MongoDB instead of JSON files for data storage.
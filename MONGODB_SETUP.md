# MongoDB Connection Setup Guide

## Prerequisites
- Node.js installed on your system
- MongoDB Atlas account (or local MongoDB instance)
- Your MongoDB connection string

## Quick Setup

### 1. Configure MongoDB connection
The project reads the MongoDB connection string from the environment variable `MONGODB_URI` (using `dotenv`).

Preferred approach:

1. Copy `server/.env.example` to `server/.env` and set your real connection string there.

	Example `server/.env`:

	```text
	MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/onduty?retryWrites=true&w=majority
	PORT=5000
	```

If you have created a new DB user called `vineela2685_db_user`, you can use this template (replace `<db_password>`):

	```text
	MONGODB_URI=mongodb+srv://vineela2685_db_user:<db_password>@mango.ryyyfxj.mongodb.net/onduty?appName=mango&retryWrites=true&w=majority
	PORT=5000
	```

2. Alternatively, set `MONGODB_URI` as an environment variable in your hosting environment.

The server will fall back to `mongodb://127.0.0.1:27017/onduty` if `MONGODB_URI` is not provided.

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Backend Server
```bash
npm run server:dev
```

This will start your Express server on port 5000 and attempt to connect to MongoDB.

### 4. Test the Connection
Open `mongodb-demo.html` in your browser. The interface will automatically check if the backend is running and show the connection status.

## What's Included

- **Express Server** (`server/server.js`) - Handles HTTP requests
- **MongoDB Connection** (`server/config/database.js`) - Manages database connection
- **User Model** (`server/models/User.js`) - Defines user schema
- **API Routes** (`server/routes/users.js`) - Handles CRUD operations
- **Demo Interface** (`mongodb-demo.html`) - Test MongoDB operations

## API Endpoints

- `GET /api/health` - Check server status
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Troubleshooting

### Connection Issues
- Verify your MongoDB connection string is correct
- Check if MongoDB Atlas network access allows your IP
- Ensure the database user has proper permissions

### Server Issues
- Make sure port 5000 is available
- Check console for error messages
- Verify all dependencies are installed

### CORS Issues
- The server is configured to allow requests from any origin
- If you have issues, check the CORS configuration in `server/server.js`

## Next Steps

Once connected, you can:
1. Create users through the demo interface
2. View all users in the database
3. Test the connection health
4. Integrate the API with your React frontend

## Environment Variables (Optional)

For production, consider using environment variables:

```bash
# Create a .env file
MONGODB_URI=your_connection_string_here
PORT=5000
NODE_ENV=production
```

The server will automatically use these if available.

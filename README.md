# OnDuty Pro - MongoDB Integration

A React-based duty request management system with MongoDB backend integration.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up MongoDB connection:**
   - Replace `<db_password>` in `server/config/database.js` with your actual MongoDB password
   - Or create a `.env` file with your MongoDB connection string

3. **Start the backend server:**
   ```bash
   npm run server:dev
   ```

4. **Start the frontend (in a new terminal):**
   ```bash
   npm run dev
   ```

## 🗄️ MongoDB Setup

### Option 1: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `server/config/database.js` with your connection string

### Option 2: Local MongoDB
1. Install MongoDB locally
2. Update connection string to: `mongodb://localhost:27017/on-duty-pro`

## 📁 Project Structure

```
on-duty-pro/
├── src/                    # React frontend
│   ├── components/         # React components
│   │   └── MongoDBTest.jsx # MongoDB test component
│   ├── services/           # API services
│   │   └── api.js         # API client
│   └── App.jsx            # Main app component
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   │   └── database.js    # MongoDB connection
│   ├── models/            # Mongoose models
│   │   └── User.js        # User model
│   ├── routes/            # API routes
│   │   └── users.js       # User API endpoints
│   └── server.js          # Express server
└── package.json           # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start React development server
- `npm run server` - Start backend server
- `npm run server:dev` - Start backend with nodemon (auto-restart)
- `npm run build` - Build React app for production
- `npm run preview` - Preview production build

## 🌐 API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🧪 Testing MongoDB Connection

1. Start the backend server: `npm run server:dev`
2. Start the frontend: `npm run dev`
3. Log in as an instructor or admin
4. Click "MongoDB Test" button
5. Test the connection and CRUD operations

## 🔒 Security Notes

- **Never commit passwords or API keys to version control**
- Use environment variables for sensitive data
- Consider implementing authentication middleware
- Add input validation and sanitization

## 🚨 Troubleshooting

### Connection Issues
- Check your MongoDB connection string
- Ensure MongoDB service is running
- Verify network access (firewall, IP whitelist)

### CORS Issues
- Backend runs on port 5000
- Frontend runs on port 5173 (Vite default)
- CORS is configured to allow frontend requests

### Port Conflicts
- Change `PORT` in `server/server.js` if 5000 is busy
- Update `API_BASE_URL` in `src/services/api.js` accordingly

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
PORT=5000
NODE_ENV=development
```

Frontend API configuration (Vite)

You can make the frontend call a different API host by setting a Vite env variable that starts with `VITE_`.

- Create a file named `.env` or `.env.local` at the project root.
- Add a variable `VITE_API_BASE_URL` with the full API base URL (include the `/api` suffix if your backend expects it):

```text
# Example: point to local backend (default) or change to deployed API
VITE_API_BASE_URL=http://localhost:5000/api

# Example for production API
# VITE_API_BASE_URL=https://api.myapp.com/api
```

After updating the env file, restart the Vite dev server so the new value is picked up.

## 🔄 Database Models

### User Model
```javascript
{
  name: String,        // Required
  email: String,       // Required, unique
  role: String,        // 'admin', 'user', 'manager'
  isActive: Boolean,   // Default: true
  timestamps: true     // createdAt, updatedAt
}
```

## 🎯 Next Steps

- [ ] Add authentication middleware
- [ ] Implement user roles and permissions
- [ ] Add request validation
- [ ] Set up automated testing
- [ ] Add logging and monitoring
- [ ] Implement rate limiting
- [ ] Add data backup strategies

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Verify MongoDB connection
3. Check browser console for errors
4. Check server console for backend errors

---

**Happy coding! 🎉**

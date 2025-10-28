# Server (Node/Express) — On-Duty

This folder contains the Node/Express backend that connects to MongoDB and provides simple user CRUD endpoints used by the React frontend.

Quick setup

1. Copy `.env.example` to `.env` in the `server` folder (or set the env var globally):

   - Windows PowerShell (from repo root):

     ```powershell
     copy server\.env.example server\.env
     # then edit server\.env to set MONGODB_URI
     ```

2. Set `MONGODB_URI` inside `server/.env` to point to your MongoDB Atlas connection string or a local MongoDB instance. Examples:

   Generic Atlas example:

   ```text
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/onduty?retryWrites=true&w=majority
   ```

   Example using the new account name `vineela2685_db_user` (replace `<db_password>`):

   ```text
   MONGODB_URI=mongodb+srv://vineela2685_db_user:<db_password>@mango.ryyyfxj.mongodb.net/onduty?appName=mango&retryWrites=true&w=majority
   ```

   Or for local MongoDB:

   ```text
   MONGODB_URI=mongodb://127.0.0.1:27017/onduty
   ```

3. From the repository root, install dependencies (if not already):

   ```powershell
   npm install
   ```

4. Start the server:

   - Production (plain Node):
     ```powershell
     npm run server
     ```

   - Development (with automatic restarts using nodemon):
     ```powershell
     npm run server:dev
     ```

API endpoints

- GET  /api/health         — health check
- GET  /api/users          — list users
- POST /api/users          — create user
- GET  /api/users/:id      — get user by id
- PUT  /api/users/:id      — update user
- DELETE /api/users/:id    — delete user

Notes

- The backend reads `MONGODB_URI` from the environment using `dotenv`. If not set it falls back to `mongodb://127.0.0.1:27017/onduty`.
- If you change MongoDB account/credentials, update `server/.env` (or your environment) with the new connection string.
- The React frontend expects the backend at `http://localhost:5000` (see `src/services/api.js`).

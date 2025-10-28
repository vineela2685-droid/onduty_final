import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const MongoDBTest = () => {
  const [health, setHealth] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });
  const [message, setMessage] = useState('');

  // Check server health
  const checkHealth = async () => {
    try {
      const healthData = await apiService.checkHealth();
      setHealth(healthData);
      setMessage('✅ Server is healthy!');
    } catch (error) {
      setMessage('❌ Server health check failed: ' + error.message);
    }
  };

  // Get all users
  const getUsers = async () => {
    setLoading(true);
    try {
      const usersData = await apiService.getUsers();
      setUsers(usersData);
      setMessage('✅ Users fetched successfully!');
    } catch (error) {
      setMessage('❌ Failed to fetch users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new user
  const createUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      setMessage('❌ Name and email are required!');
      return;
    }

    setLoading(true);
    try {
      const createdUser = await apiService.createUser(newUser);
      setUsers([...users, createdUser]);
      setNewUser({ name: '', email: '', role: 'user' });
      setMessage('✅ User created successfully!');
    } catch (error) {
      setMessage('❌ Failed to create user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    try {
      await apiService.deleteUser(id);
      setUsers(users.filter(user => user._id !== id));
      setMessage('✅ User deleted successfully!');
    } catch (error) {
      setMessage('❌ Failed to delete user: ' + error.message);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
        MongoDB Connection Test
      </h1>

      {/* Health Status */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Server Health</h2>
        {health && (
          <div className="text-sm">
            <p><strong>Status:</strong> {health.status}</p>
            <p><strong>Message:</strong> {health.message}</p>
            <p><strong>Timestamp:</strong> {health.timestamp}</p>
          </div>
        )}
        <button
          onClick={checkHealth}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Check Health
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Create User Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New User</h2>
        <form onSubmit={createUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name:</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email:</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role:</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Users</h2>
          <button
            onClick={getUsers}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Users'}
          </button>
        </div>
        
        {users.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No users found. Create one above!</p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => deleteUser(user._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MongoDBTest;

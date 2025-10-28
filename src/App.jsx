/*
OnDuty Pro — Fresh New Version
- Clean, working React app with proper styling
- Student and Instructor role separation
- Instructor selection for student requests
- Dark theme with proper contrast
*/

import React, { useState, useEffect, useMemo } from "react";
import MongoDBTest from "./components/MongoDBTest";
import { apiService } from "./services/api";

// Simple localStorage helpers
const LS_USERS = "odp_users_v3";
const LS_REQUESTS = "odp_reqs_v3";

function getUsers() {
  try { return JSON.parse(localStorage.getItem(LS_USERS) || "[]"); } catch(e) { return []; }
}

function saveUsers(users) { 
  localStorage.setItem(LS_USERS, JSON.stringify(users)); 
}

function getRequests() {
  try { return JSON.parse(localStorage.getItem(LS_REQUESTS) || "[]"); } catch(e) { return []; }
}

function saveRequests(reqs) { 
  localStorage.setItem(LS_REQUESTS, JSON.stringify(reqs)); 
}

// Seed default data
(function seed() {
  const users = getUsers();
  if (!users.find(x => x.role === "admin")) {
    users.push({id: 'admin-1', name: 'Admin User', email: 'admin@company.local', password: 'admin', role: 'admin'});
  }
  if (!users.find(x => x.role === "instructor")) {
    users.push({id: 'instructor-1', name: 'Sarah Chen', email: 'sarah@company.local', password: 'instructor', role: 'instructor'});
  }
  if (!users.find(x => x.role === "manager")) {
    users.push({id: 'manager-1', name: 'Priya Singh', email: 'priya@company.local', password: 'manager', role: 'manager'});
  }
  if (!users.find(x => x.role === "student")) {
    users.push({id: 'student-1', name: 'Alex Johnson', email: 'alex@company.local', password: 'student', role: 'student'});
  }
  saveUsers(users);
  
  const requests = getRequests();
  if (requests.length === 0) {
    const sampleRequests = [
      {
        id: 'req-1',
        userId: 'student-1',
        userName: 'Alex Johnson',
        date: '2024-01-15',
        shift: 'morning',
        reason: 'Medical appointment',
        instructorId: 'instructor-1',
        instructorName: 'Sarah Chen',
        status: 'pending',
        imageUrl: null,
        createdAt: new Date().toISOString(),
        handledBy: null,
        handledAt: null
      }
    ];
    saveRequests(sampleRequests);
  }
})();

function uid(prefix = 'id') {
  return prefix + "_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

// Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(getUsers());
  const [mongodbUsers, setMongodbUsers] = useState([]);
  const [requests, setRequests] = useState(getRequests());
  const [view, setView] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => saveUsers(users), [users]);
  useEffect(() => saveRequests(requests), [requests]);

  // Load user session and theme
  useEffect(() => {
    const sid = localStorage.getItem('odp_session');
    if (sid) {
      const u = getUsers().find(x => x.id === sid);
      if (u) setUser(u);
    }
    
    const savedTheme = localStorage.getItem('odp_theme');
    if (savedTheme === 'light') setIsDarkMode(false);
    else setIsDarkMode(true);
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('odp_theme', isDarkMode ? 'dark' : 'light');
    document.body.className = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  // Fetch MongoDB users
  useEffect(() => {
    async function fetchMongoDBUsers() {
      try {
        const users = await apiService.getUsers();
        setMongodbUsers(users);
      } catch (error) {
        console.log('MongoDB users not available yet:', error.message);
      }
    }
    
    fetchMongoDBUsers();
  }, []);

  // Fetch requests from backend if available, otherwise use localStorage
  useEffect(() => {
    let mounted = true;
    async function loadRequests() {
      try {
        const remote = await apiService.getRequests();
        if (mounted && Array.isArray(remote) && remote.length) {
          // Map remote schema to local structure if necessary
          setRequests(remote.map(r => ({
            id: r._id || r.id,
            userId: r.userId,
            userName: r.userName,
            date: r.date,
            shift: r.shift,
            reason: r.reason,
            instructorId: r.instructorId,
            instructorName: r.instructorName,
            managerId: r.managerId,
            managerName: r.managerName,
            status: r.status,
            imageUrl: r.imageUrl,
            createdAt: r.createdAt,
            handledBy: r.handledBy,
            handledAt: r.handledAt
          })));
        }
      } catch (err) {
        // keep local requests if backend not available
        console.log('Could not load remote requests:', err.message);
      }
    }
    loadRequests();
    return () => { mounted = false; };
  }, []);

  // Set default view based on role
  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        setView('student-dashboard');
      } else if (user.role === 'instructor' || user.role === 'admin') {
        setView('instructor-dashboard');
      } else if (user.role === 'manager') {
        setView('manager-dashboard');
      }
    }
  }, [user]);

  async function register({name, email, password, role = 'student'}) {
    const all = getUsers();
    if (all.find(x => x.email === email)) throw new Error('Email already used');
    const nu = {id: uid('u'), name, email, password, role};
    const next = [...all, nu];
    setUsers(next);
    localStorage.setItem('odp_session', nu.id);
    setUser(nu);

    // Register user in MongoDB
    try {
      await apiService.createUser({ name, email, password, role });
      const mongoUsers = await apiService.getUsers();
      setMongodbUsers(mongoUsers);
    } catch (err) {
      console.error('MongoDB registration failed:', err.message);
    }
  }

  function login({email, password}) {
    const u = getUsers().find(x => x.email === email && x.password === password);
    if (!u) throw new Error('Invalid email or password');
    localStorage.setItem('odp_session', u.id);
    setUser(u);
  }

  function logout() { 
    localStorage.removeItem('odp_session'); 
    setUser(null); 
  }

  function createRequest({date, shift, reason, instructorId, instructorName, imageUrl, managerId, managerName}) {
    const r = {
      id: uid('r'), 
      userId: user.id, 
      userName: user.name, 
      date, 
      shift, 
      reason, 
      instructorId,
      instructorName,
      managerId: managerId || null,
      managerName: managerName || null,
      status: 'pending', 
      imageUrl,
      createdAt: new Date().toISOString(), 
      handledBy: null, 
      handledAt: null
    };
    setRequests(prev => [r, ...prev]);
    setView('student-dashboard');

    // Persist to backend (best-effort). If it fails, we keep local fallback.
    (async () => {
      try {
        const saved = await apiService.createRequest(r);
        // replace local temp id with real id from DB
        setRequests(prev => prev.map(x => x.id === r.id ? {...x, id: saved._id || saved.id} : x));
      } catch (err) {
        console.log('Failed to persist request remotely:', err.message);
      }
    })();
  }

  function updateRequest(id, patch) {
    setRequests(prev => prev.map(r => r.id === id ? {...r, ...patch} : r));

    // Persist update to backend
    (async () => {
      try {
        await apiService.updateRequest(id, patch);
      } catch (err) {
        console.log('Failed to update remote request:', err.message);
      }
    })();
  }

  function removeRequest(id) { 
    setRequests(prev => prev.filter(r => r.id !== id)); 

    (async () => {
      try {
        await apiService.deleteRequest(id);
      } catch (err) {
        console.log('Failed to delete remote request:', err.message);
      }
    })();
  }

  const isInstructor = user && (user.role === 'admin' || user.role === 'instructor');
  const isManager = user && user.role === 'manager';
  const isStudent = user && user.role === 'student';

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      <style dangerouslySetInnerHTML={{__html: `
        * { box-sizing: border-box; }
        body { 
          margin: 0; 
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
          color: #ffffff; 
          font-family: Inter, system-ui, sans-serif;
          transition: all 0.3s ease;
        }
        body.light { 
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
          color: #1e293b; 
        }
        body.dark { 
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
          color: #ffffff; 
        }
        
        .app {
          max-width: 1200px;
          margin: 40px auto;
          padding: 40px;
          text-align: center;
          min-height: calc(100vh - 80px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }
        
        .header {
          margin-bottom: 40px;
          width: 100%;
          text-align: center;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 30px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        body.light .header {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .logo {
          width: 70px;
          height: 70px;
          border-radius: 18px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 24px;
          color: white;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .h1 {
          font-size: 32px;
          font-weight: 900;
          margin: 0 0 8px 0;
          color: inherit;
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        body.light .h1 {
          background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .h2 {
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: inherit;
          text-align: center;
        }
        
        .muted {
          color: #94a3b8;
          font-size: 14px;
          margin: 0;
          text-align: center;
          font-weight: 500;
        }
        
        body.light .muted {
          color: #64748b;
        }
        
        .controls {
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          text-align: center;
        }
        
        .btn {
          border: 0;
          padding: 12px 20px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          font-size: 14px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
          backdrop-filter: blur(10px);
        }
        
        body.light .btn {
          background: rgba(0, 0, 0, 0.05);
          color: #1e293b;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
        }
        
        body.light .btn:hover {
          background: rgba(0, 0, 0, 0.1);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
        }
        
        .theme-toggle {
          font-size: 20px;
          padding: 10px 14px;
          border-radius: 50%;
          min-width: 44px;
          min-height: 44px;
        }
        
        .main-content {
          display: flex;
          gap: 24px;
          justify-content: center;
          align-items: flex-start;
          width: 100%;
          max-width: 1000px;
          text-align: center;
        }
        
        .sidebar {
          width: 300px;
          flex-shrink: 0;
          text-align: center;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        body.light .sidebar {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .page-header {
          text-align: center;
          margin-bottom: 24px;
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        body.light .page-header {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 32px;
          width: 100%;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.08);
          padding: 24px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          text-align: center;
          backdrop-filter: blur(20px);
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 15px 35px rgba(255, 255, 255, 0.1);
        }
        
        body.light .stat-card {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        body.light .stat-card:hover {
          background: rgba(255, 255, 255, 1);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }
        
        .stat-number {
          font-size: 36px;
          font-weight: 900;
          color: inherit;
          margin-bottom: 8px;
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        body.light .stat-number {
          background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .stat-label {
          font-size: 14px;
          color: #94a3b8;
          font-weight: 600;
          text-align: center;
        }
        
        body.light .stat-label {
          color: #64748b;
        }
        
        .section {
          margin-top: 24px;
          width: 100%;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
          text-align: center;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        body.light .section {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          text-align: center;
          flex-direction: column;
          gap: 12px;
        }
        
        .action-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          text-align: center;
        }
        
        .input, textarea, select {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 14px;
          text-align: center;
          max-width: 400px;
          margin-bottom: 8px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }
        
        body.light .input, body.light textarea, body.light select {
          border: 1px solid rgba(0, 0, 0, 0.2);
          background: rgba(255, 255, 255, 0.9);
          color: #1e293b;
        }
        
        .input::placeholder, textarea::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        
        body.light .input::placeholder, body.light textarea::placeholder {
          color: rgba(0, 0, 0, 0.6);
        }
        
        textarea {
          min-height: 100px;
          text-align: center;
        }
        
        .image-upload {
          border: 2px dashed rgba(255, 255, 255, 0.4);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }
        
        body.light .image-upload {
          border: 2px dashed rgba(0, 0, 0, 0.3);
          background: rgba(0, 0, 0, 0.05);
        }
        
        .image-upload:hover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          transform: translateY(-2px);
        }
        
        body.light .image-upload:hover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.1);
        }
        
        .image-preview {
          max-width: 200px;
          max-height: 200px;
          border-radius: 12px;
          margin: 10px auto;
          display: block;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
        
        .request {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 16px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        body.light .request {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .request:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(255, 255, 255, 0.15);
        }
        
        body.light .request:hover {
          background: rgba(255, 255, 255, 1);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }
        
        .request > div:first-child {
          text-align: center;
          flex: 1;
        }
        
        .status {
          padding: 8px 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 12px;
          text-align: center;
        }
        
        .status.pending {
          background: rgba(102, 126, 234, 0.2);
          color: #a78bfa;
          border: 1px solid rgba(102, 126, 234, 0.3);
        }
        
        .status.accepted {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .status.rejected {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .meta {
          font-size: 12px;
          color: #94a3b8;
          text-align: center;
        }
        
        body.light .meta {
          color: #64748b;
        }
        
        .actions {
          display: flex;
          gap: 8px;
          justify-content: center;
          text-align: center;
        }
        
        .empty {
          padding: 40px;
          text-align: center;
          color: #94a3b8;
          font-size: 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          border: 2px dashed rgba(255, 255, 255, 0.2);
          max-width: 400px;
          margin: 0 auto;
          backdrop-filter: blur(20px);
        }
        
        body.light .empty {
          background: rgba(255, 255, 255, 0.8);
          border: 2px dashed rgba(0, 0, 0, 0.2);
          color: #64748b;
        }
        
        .team-member {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 16px;
          background: rgba(255, 255, 255, 0.08);
          margin: 8px 0;
          border-radius: 12px;
          backdrop-filter: blur(20px);
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .team-member:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-2px);
        }
        
        body.light .team-member {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        body.light .team-member:hover {
          background: rgba(255, 255, 255, 1);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .member-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .member-info {
          flex: 1;
          text-align: center;
        }
        
        .member-name {
          font-weight: 600;
          font-size: 14px;
          color: inherit;
          text-align: center;
        }
        
        .member-role {
          font-size: 12px;
          color: #94a3b8;
          text-align: center;
        }
        
        body.light .member-role {
          color: #64748b;
        }
        
        .member-status {
          font-size: 12px;
          color: #667eea;
          font-weight: 500;
          text-align: center;
        }
        
        .footer {
          margin-top: 40px;
          padding: 24px;
          text-align: center;
          color: #94a3b8;
          font-size: 13px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        body.light .footer {
          color: #64748b;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 1024px) {
          .main-content {
            flex-direction: column;
            align-items: center;
          }
          .sidebar {
            width: 100%;
            max-width: 600px;
          }
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .controls {
            flex-direction: column;
            gap: 8px;
          }
          .section-header {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
          .app {
            padding: 20px;
            margin: 20px auto;
          }
          .request {
            flex-direction: column;
            text-align: center;
          }
          .request > div:first-child {
            text-align: center;
          }
          .header, .page-header, .section, .sidebar, .footer {
            padding: 20px;
          }
        }
      `}} />
      
      <div className="header">
        <div className="brand">
          <div className="logo">OD</div>
          <div>
            <div className="h1">OnDuty Pro</div>
            <div className="muted">smooth requests • fast approvals • human-friendly</div>
          </div>
        </div>
        
        <div className="controls">
          <button 
            className="btn theme-toggle" 
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          {user ? (
            <>
              <div className="muted">Signed in as <strong>{user.name}</strong> ({user.role})</div>
              {isStudent && (
                <>
                  <button className="btn" onClick={() => setView('student-dashboard')}>My Dashboard</button>
                  <button className="btn" onClick={() => setView('create-request')}>New Request</button>
                </>
              )}
              {isInstructor && (
                <>
                  <button className="btn" onClick={() => setView('instructor-dashboard')}>Instructor Dashboard</button>
                  <button className="btn" onClick={() => setView('approve-requests')}>Approve Requests</button>
                </>
              )}
              {isManager && (
                <>
                  <button className="btn" onClick={() => setView('manager-dashboard')}>Manager Dashboard</button>
                </>
              )}
              <button className="btn" onClick={() => setView('profile')}>Profile</button>
              <button className="btn btn-primary" onClick={logout}>Sign out</button>
            </>
          ) : (
            <button className="btn" onClick={() => setView('auth')}>Sign in / Register</button>
          )}
        </div>
      </div>

      {!user ? (
        <div>
          <div className="page-header">
            <div className="h1">Welcome to OnDuty Pro</div>
            <div className="muted">Sign in or create an account to get started</div>
          </div>
        <Auth onLogin={login} onRegister={register} users={users} />
        </div>
      ) : (
        <div className="main-content">
          {/* STUDENT PAGES */}
          {isStudent && (
            <>
              {view === 'student-dashboard' && (
                <div>
                  <div className="page-header">
                    <div className="h1">Student Dashboard</div>
                    <div className="muted">Welcome back, {user.name}!</div>
                  </div>
                  
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-number">{requests.filter(r => r.userId === user.id && r.status === 'pending').length}</div>
                      <div className="stat-label">Pending Requests</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{requests.filter(r => r.userId === user.id && r.status === 'accepted').length}</div>
                      <div className="stat-label">Approved</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{requests.filter(r => r.userId === user.id && r.status === 'rejected').length}</div>
                      <div className="stat-label">Rejected</div>
                </div>
              </div>

                  <div className="section">
                    <div className="section-header">
                      <div className="h2">Your Recent Requests</div>
                      <button className="btn btn-primary" onClick={() => setView('create-request')}>Create New Request</button>
                    </div>
                    <RequestList
                      requests={requests.filter(r => r.userId === user.id).slice(0, 5)}
                      onCancel={(id) => updateRequest(id, {status: 'revoked', handledBy: user.name, handledAt: new Date().toISOString()})}
                      onDelete={(id) => removeRequest(id)}
                      showActions={true}
                    />
                  </div>
                </div>
              )}

              {view === 'create-request' && (
                <div>
                  <div className="page-header">
                    <div className="h1">Create New Request</div>
                    <div className="muted">Submit your OnDuty request</div>
                  </div>
                  <CreateForm onCreate={createRequest} />
                </div>
              )}
            </>
          )}

          {/* INSTRUCTOR PAGES */}
          {isInstructor && (
            <>
              {view === 'instructor-dashboard' && (
                <div>
                  <div className="page-header">
                    <div className="h1">Instructor Dashboard</div>
                    <div className="muted">Manage student requests</div>
              </div>

                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-number">{requests.filter(r => r.status === 'pending').length}</div>
                      <div className="stat-label">Pending Approval</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{requests.filter(r => r.status === 'accepted').length}</div>
                      <div className="stat-label">Approved Today</div>
            </div>
                    <div className="stat-card">
                      <div className="stat-number">{requests.length}</div>
                      <div className="stat-label">Total Requests</div>
                    </div>
                  </div>

                  <div className="section">
                    <div className="section-header">
                      <div className="h2">Quick Actions</div>
                </div>
                    <div className="action-buttons">
                      <button className="btn btn-primary" onClick={() => setView('approve-requests')}>Review Pending Requests</button>
                      <button className="btn" onClick={() => setView('all-requests')}>View All Requests</button>
                      <button className="btn" onClick={() => setView('mongodb-test')}>MongoDB Test</button>
            </div>
          </div>
              </div>
            )}

              {view === 'approve-requests' && (
                <div>
                  <div className="page-header">
                    <div className="h1">Approve Requests</div>
                    <div className="muted">Review and approve student requests</div>
                </div>
                <RequestAdminView
                    requests={requests.filter(r => r.status === 'pending')}
                    onAccept={(id) => updateRequest(id, {status: 'accepted', handledBy: user.name, handledAt: new Date().toISOString()})}
                    onReject={(id) => updateRequest(id, {status: 'rejected', handledBy: user.name, handledAt: new Date().toISOString()})}
                    onDelete={(id) => removeRequest(id)}
                  currentUser={user}
                    showOnlyPending={true}
                />
              </div>
            )}

              {view === 'all-requests' && (
                <div>
                  <div className="page-header">
                    <div className="h1">All Requests</div>
                    <div className="muted">Complete overview of all requests</div>
                </div>
                <RequestAdminView
                  requests={requests}
                    onAccept={(id) => updateRequest(id, {status: 'accepted', handledBy: user.name, handledAt: new Date().toISOString()})}
                    onReject={(id) => updateRequest(id, {status: 'rejected', handledBy: user.name, handledAt: new Date().toISOString()})}
                    onDelete={(id) => removeRequest(id)}
                  currentUser={user}
                />
              </div>
              )}

              {view === 'mongodb-test' && (
                <div>
                  <div className="page-header">
                    <div className="h1">MongoDB Connection Test</div>
                    <div className="muted">Test your MongoDB connection and operations</div>
                  </div>
                  <MongoDBTest />
                </div>
              )}
            </>
          )}

          {/* MANAGER PAGES */}
          {isManager && (
            <>
              {view === 'manager-dashboard' && (
                <div>
                  <div className="page-header">
                    <div className="h1">Manager Dashboard</div>
                    <div className="muted">Requests assigned to you</div>
                  </div>

                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-number">{requests.filter(r => r.managerId === user.id && r.status === 'pending').length}</div>
                      <div className="stat-label">Pending Requests</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{requests.filter(r => r.managerId === user.id && r.status === 'accepted').length}</div>
                      <div className="stat-label">Approved</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{requests.filter(r => r.managerId === user.id).length}</div>
                      <div className="stat-label">Assigned to you</div>
                    </div>
                  </div>

                  <div className="section">
                    <div className="section-header">
                      <div className="h2">Your Assigned Requests</div>
                      <button className="btn btn-primary" onClick={() => setView('manager-approve')}>Review Pending</button>
                    </div>
                    <RequestList
                      requests={requests.filter(r => r.managerId === user.id).slice(0, 8)}
                      onCancel={(id) => updateRequest(id, {status: 'revoked', handledBy: user.name, handledAt: new Date().toISOString()})}
                      onDelete={(id) => removeRequest(id)}
                      showActions={false}
                    />
                  </div>
                </div>
              )}

              {view === 'manager-approve' && (
                <div>
                  <div className="page-header">
                    <div className="h1">Manager — Review Requests</div>
                    <div className="muted">Accept or reject requests assigned to you</div>
                  </div>
                  <RequestAdminView
                    requests={requests.filter(r => r.managerId === user.id)}
                    onAccept={(id) => updateRequest(id, {status: 'accepted', handledBy: user.name, handledAt: new Date().toISOString()})}
                    onReject={(id) => updateRequest(id, {status: 'rejected', handledBy: user.name, handledAt: new Date().toISOString()})}
                    onDelete={(id) => removeRequest(id)}
                    currentUser={user}
                    showOnlyPending={true}
                  />
                </div>
              )}
            </>
          )}

          {/* COMMON PAGES */}
          {view === 'profile' && (
            <div>
              <div className="page-header">
                <div className="h1">Profile</div>
                <div className="muted">Your account information</div>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{width: '80px', height: '80px', borderRadius: '16px', background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '24px', margin: '0 auto 16px auto'}}>
                  {user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div style={{marginBottom: '24px'}}>
                  <div style={{marginBottom: '16px'}}>
                    <div className="muted">Name</div>
                    <div style={{fontWeight: 600, color: '#ffffff'}}>{user.name}</div>
                  </div>
                  <div style={{marginBottom: '16px'}}>
                    <div className="muted">Email</div>
                    <div style={{fontWeight: 600, color: '#ffffff'}}>{user.email}</div>
                  </div>
                  <div style={{marginBottom: '16px'}}>
                    <div className="muted">Role</div>
                    <div style={{fontWeight: 600, color: '#ffffff'}}>{user.role}</div>
                  </div>
                </div>
                <div style={{marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                  <div className="muted" style={{marginBottom: '16px'}}>Danger zone</div>
                  <button className="btn" onClick={() => {
                    if (window.confirm('Delete your account?')) {
                      const next = getUsers().filter(x => x.id !== user.id);
                      saveUsers(next);
                      setUsers(next);
                      logout();
                    }
                  }}>Delete account</button>
                  </div>
                </div>
              </div>
            )}

          {/* TEAM MEMBERS SIDEBAR */}
          <div className="sidebar">
            <div>
              <div className="h2">Team Members</div>
              <div className="muted" style={{marginBottom: '16px'}}>From MongoDB Database</div>
              {mongodbUsers.length > 0 ? (
                mongodbUsers.map(u => (
                  <div key={u._id} className="team-member">
                    <div className="member-avatar">
                      {u.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div className="member-info">
                      <div className="member-name">{u.name}</div>
                      <div className="member-role">{u.role}</div>
                    </div>
                    <div className="member-status">{u.email === user?.email ? 'You' : ''}</div>
                  </div>
                ))
              ) : (
                <div className="empty">No MongoDB users found.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="footer">
        <div style={{marginBottom: '16px'}}>
          <strong>OnDuty Pro</strong> — Streamlined request management system
        </div>
        <div style={{fontSize: '12px', opacity: 0.7}}>
          Built with React • Local storage demo • Ready for production deployment
        </div>
        <div style={{marginTop: '16px', fontSize: '12px', opacity: 0.5}}>
          © 2024 OnDuty Pro. All rights reserved.
        </div>
      </div>
    </div>
  );
}

// Auth Component
function Auth({onLogin, onRegister, users}) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [err, setErr] = useState(null);

  function submit(e) {
    e.preventDefault();
    setErr(null);
    try {
      if (mode === 'login') onLogin({email, password});
      else onRegister({name, email, password, role});
    } catch(e) {
      setErr(e.message);
    }
  }

  return (
    <div style={{maxWidth: '400px', margin: '0 auto', textAlign: 'center'}}>
      <div style={{marginBottom: '24px', textAlign: 'center'}}>
        <div style={{fontWeight: 800, fontSize: '20px', marginBottom: '8px'}}>
          {mode === 'login' ? 'Welcome back' : 'Create an account'}
        </div>
        <div className="muted">Demo accounts are local-only</div>
      </div>

      <form onSubmit={submit} style={{display: 'grid', gap: '16px', textAlign: 'center'}}>
        {mode === 'register' && (
          <>
            <div className="muted">Full name</div>
            <input className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="Enter your full name" />
          </>
        )}

        <div className="muted">Email</div>
        <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" />

        <div className="muted">Password</div>
        <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" />

        {mode === 'register' && (
          <>
            <div className="muted">Role</div>
            <select className="input" value={role} onChange={e => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </>
        )}

        {err && <div style={{color: '#f87171', fontWeight: 700, textAlign: 'center'}}>{err}</div>}
        
        <div style={{display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'center'}}>
          <button className="btn btn-primary" type="submit" style={{flex: 1}}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
          <button type="button" className="btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'New? Create' : 'Have an account?'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Create Form Component
function CreateForm({onCreate}) {
  const [date, setDate] = useState('');
  const [shift, setShift] = useState('morning');
  const [reason, setReason] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [managerId, setManagerId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [err, setErr] = useState(null);

  const instructors = getUsers().filter(u => u.role === 'instructor' || u.role === 'admin');
  const managers = getUsers().filter(u => u.role === 'manager');

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErr('Image size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  }

  function submit(e) {
    e.preventDefault();
    setErr(null);
    if (!date) return setErr('Pick a date');
    if (!reason) return setErr('Write a reason');
  if (!instructorId) return setErr('Select an instructor');
    const selectedManager = managers.find(m => m.id === managerId) || null;
    const selectedInstructor = instructors.find(i => i.id === instructorId);
    onCreate({
      date, 
      shift, 
      reason, 
      instructorId, 
      instructorName: selectedInstructor.name,
      imageUrl: imagePreview,
      managerId: selectedManager ? selectedManager.id : null,
      managerName: selectedManager ? selectedManager.name : null
    });
    setDate('');
    setShift('morning');
    setReason('');
    setInstructorId('');
    setImageFile(null);
    setImagePreview(null);
  }

  return (
    <form onSubmit={submit} style={{maxWidth: '400px', margin: '0 auto', textAlign: 'center'}}>
      <div className="muted">Date</div>
      <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />

      <div className="muted">Shift</div>
      <select className="input" value={shift} onChange={e => setShift(e.target.value)}>
        <option value="morning">Morning</option>
        <option value="afternoon">Afternoon</option>
        <option value="night">Night</option>
      </select>

      <div className="muted">Select Instructor</div>
      <select className="input" value={instructorId} onChange={e => setInstructorId(e.target.value)} required>
        <option value="">Choose an instructor...</option>
        {instructors.map(instructor => (
          <option key={instructor.id} value={instructor.id}>
            {instructor.name} ({instructor.role})
          </option>
        ))}
      </select>

      <div className="muted">Assign Manager (optional)</div>
      <select id="manager-select" className="input" value={managerId} onChange={e => setManagerId(e.target.value)}>
        <option value="">No manager</option>
        {managers.map(m => (
          <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
        ))}
      </select>

      <div className="muted">Reason (short)</div>
      <textarea className="input" value={reason} onChange={e => setReason(e.target.value)} placeholder="Enter your reason for the request" />

      <div className="muted">Attach Image (optional)</div>
      <div className="image-upload" onClick={() => document.getElementById('image-input').click()}>
        {imagePreview ? (
          <div>
            <img src={imagePreview} alt="Preview" className="image-preview" />
            <div style={{marginTop: '10px', fontSize: '12px'}}>Click to change image</div>
          </div>
        ) : (
          <div>
            <div style={{fontSize: '24px', marginBottom: '8px'}}>📷</div>
            <div>Click to upload image</div>
            <div style={{fontSize: '12px', marginTop: '4px', opacity: 0.7}}>Max 5MB</div>
          </div>
        )}
        <input
          id="image-input"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{display: 'none'}}
        />
      </div>

      {err && <div style={{color: '#f87171', fontWeight: 700, textAlign: 'center'}}>{err}</div>}
      
      <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
        <button className="btn btn-primary" type="submit" style={{flex: 1}}>Request OnDuty</button>
        <button className="btn" type="button" onClick={() => {
          setDate('');
          setShift('morning');
          setReason('');
          setInstructorId('');
          setImageFile(null);
          setImagePreview(null);
        }}>Reset</button>
      </div>
    </form>
  );
}

// Request List Component
function RequestList({requests, onCancel, onDelete, showActions}) {
  if (!requests.length) return <div className="empty">No requests yet</div>;
  
  return (
    <div>
      {requests.map(r => (
        <div key={r.id} className="request">
          <div style={{flex: 1}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: '8px'}}>
              <div style={{fontWeight: 800}}>{r.userName} — <span className="meta">{r.shift}</span></div>
              <div className={`status ${r.status}`}>{r.status}</div>
            </div>
            <div className="meta" style={{marginBottom: '8px'}}>{r.date} • Requested {new Date(r.createdAt).toLocaleString()}</div>
            <div style={{marginBottom: '8px', fontSize: '15px'}}>{r.reason}</div>
            {r.instructorName && <div className="meta" style={{marginBottom: '8px'}}>Instructor: <strong>{r.instructorName}</strong></div>}
            {r.imageUrl && (
              <div style={{marginBottom: '8px'}}>
                <div className="muted" style={{marginBottom: '4px'}}>Attached Image:</div>
                <img src={r.imageUrl} alt="Request attachment" style={{maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)'}} />
              </div>
            )}
            {r.handledBy && <div className="meta">Handled by: {r.handledBy} • {r.handledAt ? new Date(r.handledAt).toLocaleString() : ''}</div>}
          </div>
          {showActions && (
            <div className="actions">
              {r.status === 'pending' && onCancel && <button className="btn" onClick={() => onCancel(r.id)}>Revoke</button>}
              <button className="btn" onClick={() => onDelete && onDelete(r.id)}>Delete</button>
          </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Request Admin View Component
function RequestAdminView({requests, onAccept, onReject, onDelete, currentUser, showOnlyPending}) {
  const [filter, setFilter] = useState(showOnlyPending ? 'pending' : 'all');
  const visible = useMemo(() => requests.filter(r => filter === 'all' ? true : r.status === filter), [requests, filter]);

  return (
    <div>
      {!showOnlyPending && (
        <div style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', justifyContent: 'center'}}>
          <div className="muted">Show:</div>
          <select className="input" value={filter} onChange={e => setFilter(e.target.value)} style={{maxWidth: '150px'}}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>
      )}

      {visible.length === 0 && <div className="empty">No matching requests</div>}

      {visible.map(r => (
        <div key={r.id} className="request">
          <div style={{flex: 1}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px'}}>
              <div style={{fontWeight: 800}}>{r.userName} <span className="meta">· {r.shift} · {r.date}</span></div>
              <div className={`status ${r.status}`}>{r.status}</div>
            </div>
            <div className="meta" style={{marginBottom: '8px'}}>{r.reason}</div>
            {r.instructorName && <div className="meta" style={{marginBottom: '8px'}}>Instructor: <strong>{r.instructorName}</strong></div>}
            {r.imageUrl && (
              <div style={{marginBottom: '8px'}}>
                <div className="muted" style={{marginBottom: '4px'}}>Attached Image:</div>
                <img src={r.imageUrl} alt="Request attachment" style={{maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)'}} />
              </div>
            )}
            <div className="meta" style={{marginBottom: '8px'}}>Requested {new Date(r.createdAt).toLocaleString()}</div>
            {r.handledBy && <div className="meta">Handled by {r.handledBy} • {new Date(r.handledAt).toLocaleString()}</div>}
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end'}}>
            {r.status === 'pending' && currentUser && (currentUser.role === 'admin' || currentUser.role === 'instructor' || currentUser.role === 'manager') && (
              <>
                <button className="btn" onClick={() => onAccept(r.id)}>Accept</button>
                <button className="btn" onClick={() => onReject(r.id)}>Reject</button>
              </>
            )}
            <button className="btn" onClick={() => onDelete(r.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}



// main.jsx (original working version)
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
// Import pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Settings from './pages/Settings.jsx';
import ProfileAnalytics from './pages/ProfileAnalytics';
import AIChat from './pages/AIChat';
import Logout from './pages/Logout';
import { ToastProvider } from './context/ToastContext';

// Create router
const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/Dashboard',
    element: <Dashboard />,
  },
  {
    path: '/login',
    element: <Login />,
  },
    {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/logout',
    element: <Logout />,
  },
   {
    path: '/settings',
    element: <Settings />,
  },
  {
    path: '/profile',
    element: <ProfileAnalytics />,
  },
    {
    path: '/ai-chat',
    element: <AIChat />,
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </React.StrictMode>
);
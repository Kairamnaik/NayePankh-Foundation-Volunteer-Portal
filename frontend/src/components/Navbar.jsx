import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut, User, Feather, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-3 shadow-sm flex items-center justify-between">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-gradient-to-tr from-orange-500 to-amber-400 p-2 rounded-xl text-white shadow-md shadow-orange-100 group-hover:scale-105 transition-all duration-200">
          <Feather className="h-5 w-5 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 text-lg tracking-tight leading-none">NayePankh</span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Foundation</span>
        </div>
      </Link>

      {/* Nav Controls */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* Dashboard Redirect */}
            <Link
              to={user.role === 'admin' ? '/admin' : '/dashboard'}
              className="hidden sm:flex items-center gap-1.5 text-slate-600 hover:text-orange-600 font-medium text-sm transition-colors duration-200"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            {/* Socket Notifications */}
            <NotificationBell />

            {/* Profile Dropdown */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <div className="flex flex-col text-right hidden md:flex">
                <span className="text-xs font-bold text-slate-700 leading-none">
                  {user.volunteerProfile?.fullName || (user.role === 'admin' ? 'Admin' : user.email)}
                </span>
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                  {user.role}
                </span>
              </div>

              {/* User Avatar */}
              <div className="h-9 w-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm border-2 border-orange-200 overflow-hidden">
                {user.volunteerProfile?.profilePhoto ? (
                  <img
                    src={user.volunteerProfile.profilePhoto}
                    alt="profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-orange-600" />
                )}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all duration-200 focus:outline-none"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-slate-600 hover:text-orange-600 font-semibold text-sm px-3 py-1.5 transition-colors duration-200"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-lg shadow-orange-100 hover:shadow-orange-200 hover:-translate-y-0.5 transition-all duration-200"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

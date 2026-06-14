import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Calendar,
  Award,
  Users,
  CheckSquare,
  FileText,
  Shield,
  Feather
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const volunteerLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/profile', label: 'My Profile', icon: User },
    { to: '/dashboard/events', label: 'Find Events', icon: Calendar },
    { to: '/dashboard/certificates', label: 'Certificates', icon: Award },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/volunteers', label: 'Manage Volunteers', icon: Users },
    { to: '/admin/events', label: 'Manage Events', icon: Calendar },
    { to: '/admin/attendance', label: 'Track Attendance', icon: CheckSquare },
    { to: '/admin/reports', label: 'Export Reports', icon: FileText },
  ];

  const links = isAdmin ? adminLinks : volunteerLinks;

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen border-r border-slate-800 shadow-xl">
      {/* Brand Header inside Sidebar for Mobile/Desktop branding */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-orange-500 p-1.5 rounded-lg text-white">
          {isAdmin ? <Shield className="h-5 w-5" /> : <Feather className="h-5 w-5" />}
        </div>
        <div>
          <h2 className="font-bold text-white text-sm leading-none">
            {isAdmin ? 'Admin Portal' : 'Volunteer Portal'}
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
            NayePankh Portal
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard' || link.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Branding Info */}
      <div className="p-4 border-t border-slate-800 text-center">
        <p className="text-[10px] text-slate-500">© 2026 NayePankh Foundation</p>
        <p className="text-[9px] text-slate-600 mt-0.5">v1.0.0 Stable</p>
      </div>
    </aside>
  );
}

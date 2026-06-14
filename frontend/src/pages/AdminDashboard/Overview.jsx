import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  Clock,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
  RefreshCw,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/volunteers/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching admin statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const cardData = [
    {
      title: 'Total Registrations',
      value: stats.totalVolunteers || 0,
      icon: Users,
      color: 'bg-indigo-50 border-indigo-100 text-indigo-600',
      to: '/admin/volunteers',
    },
    {
      title: 'Approved Volunteers',
      value: stats.approvedVolunteers || 0,
      icon: UserCheck,
      color: 'bg-emerald-50 border-emerald-100 text-emerald-600',
      to: '/admin/volunteers?status=approved',
    },
    {
      title: 'Pending Review',
      value: stats.pendingVolunteers || 0,
      icon: Clock,
      color: 'bg-amber-50 border-amber-100 text-amber-600',
      to: '/admin/volunteers?status=pending',
    },
    {
      title: 'Total Hours Contributed',
      value: `${stats.totalHours || 0} hrs`,
      icon: Clock,
      color: 'bg-orange-50 border-orange-100 text-orange-600',
      to: '/admin/attendance',
    },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Admin Dashboard</h1>
          <p className="text-xs text-slate-400">Overview of NGO volunteer growth and metrics</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-1.5 border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </button>
      </div>

      {/* Grid count cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              to={card.to}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md hover:border-orange-200 transition-all duration-200 group"
            >
              <div className={`p-4 rounded-2xl ${card.color.split(' ')[0]} ${card.color.split(' ')[2]} group-hover:scale-105 transition-transform duration-200`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{card.value}</p>
                <p className="text-xs text-slate-400 font-semibold">{card.title}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recharts growth line graph */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              Volunteer Growth (Current Year)
            </h3>
            <p className="text-[11px] text-slate-400">Accumulated sign-ups per month</p>
          </div>

          <div className="h-72 w-full text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.growthChart || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="New Volunteers"
                  stroke="#ea580c"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic statistics overview */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Participation Indicators</h3>
            <p className="text-[11px] text-slate-400">Analysis of volunteer involvement</p>
          </div>

          <div className="space-y-4">
            <div className="border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <span className="text-xs font-bold text-slate-500">Average Hours / Vol</span>
              <span className="text-sm font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                {stats.avgHours || 0} hrs
              </span>
            </div>

            <div className="border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <span className="text-xs font-bold text-slate-500">Active Campaign Coverage</span>
              <span className="text-sm font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                High Impact
              </span>
            </div>

            <div className="border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <span className="text-xs font-bold text-slate-500">Review SLA Rate</span>
              <span className="text-sm font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                98% (&lt;24h)
              </span>
            </div>
          </div>

          <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl text-[10px] text-slate-500 leading-relaxed">
            Note: Volunteer statistics are updated automatically as admins approve profiles and scan attendance badges.
          </div>
        </div>
      </div>
    </div>
  );
}

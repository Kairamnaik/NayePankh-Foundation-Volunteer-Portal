import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Award, Clock, Calendar, ShieldCheck, RefreshCw, Star, Heart } from 'lucide-react';

export default function Overview() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, eventsRes, logsRes] = await Promise.all([
        axios.get('/volunteers/profile'),
        axios.get('/events/registered'),
        axios.get('/attendance/my-logs'),
      ]);
      setProfile(profileRes.data);
      setRegisteredEvents(eventsRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      console.error('Error fetching volunteer dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.profileStatus === 'approved') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  // Awaiting Approval State
  if (user && user.profileStatus === 'pending') {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center p-8 bg-white border border-slate-100 rounded-3xl shadow-xl space-y-6">
        <div className="bg-orange-100 h-16 w-16 rounded-full flex items-center justify-center text-orange-600 mx-auto animate-pulse">
          <Clock className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800">Application Under Review</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your volunteer application is currently pending approval by NayePankh Foundation admins. You will receive an email and a socket alert as soon as your account is approved.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-center gap-3 text-xs text-slate-500 max-w-sm mx-auto">
          <span className="h-2.5 w-2.5 bg-orange-500 rounded-full animate-ping" />
          Listening for approval in real-time...
        </div>
      </div>
    );
  }

  // Application Rejected State
  if (user && user.profileStatus === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center p-8 bg-white border border-slate-100 rounded-3xl shadow-xl space-y-6">
        <div className="bg-rose-100 h-16 w-16 rounded-full flex items-center justify-center text-rose-600 mx-auto">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800">Application Declined</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Unfortunately, your volunteer application for NayePankh Foundation has been rejected by the administrator. Please contact support if you believe this was an error.
          </p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // Calculate Badge Limits & Progress
  const totalHours = profile.totalHours || 0;
  let nextBadge = 'Silver';
  let targetHours = 20;
  let currentTierHours = 0;

  if (profile.badge === 'Silver') {
    nextBadge = 'Gold';
    targetHours = 50;
    currentTierHours = 20;
  } else if (profile.badge === 'Gold') {
    nextBadge = 'Platinum';
    targetHours = 100;
    currentTierHours = 50;
  } else if (profile.badge === 'Platinum') {
    nextBadge = 'Max Rank';
    targetHours = 100;
    currentTierHours = 100;
  }

  const hoursInCurrentTier = Math.max(0, totalHours - currentTierHours);
  const totalHoursNeededInTier = targetHours - currentTierHours;
  const progressPercent = profile.badge === 'Platinum'
    ? 100
    : Math.min(100, (hoursInCurrentTier / totalHoursNeededInTier) * 100);

  const badgeGradients = {
    Bronze: 'from-amber-700 to-amber-900 shadow-amber-900/10',
    Silver: 'from-slate-400 to-slate-600 shadow-slate-600/10',
    Gold: 'from-yellow-400 to-amber-600 shadow-yellow-600/10',
    Platinum: 'from-indigo-400 to-purple-600 shadow-indigo-600/10',
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Welcome, {profile.fullName}!</h1>
          <p className="text-xs text-slate-400">Track your progress and upcoming activities</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all self-start md:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Stats
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hours Logged Widget */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-5">
          <div className="bg-orange-100 p-4 rounded-2xl text-orange-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{totalHours} hrs</p>
            <p className="text-xs text-slate-400 font-semibold">Total Hours Volunteered</p>
          </div>
        </div>

        {/* Badge Card */}
        <div className={`bg-gradient-to-tr ${badgeGradients[profile.badge]} rounded-3xl p-6 shadow-xl text-white flex items-center justify-between`}>
          <div className="space-y-1">
            <p className="text-2xl font-black tracking-wide leading-none">{profile.badge}</p>
            <p className="text-[10px] text-orange-100 font-semibold tracking-wider uppercase">Current Rank Level</p>
          </div>
          <Award className="h-12 w-12 text-white/30 animate-float" />
        </div>

        {/* Registered Events Count */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-5">
          <div className="bg-orange-100 p-4 rounded-2xl text-orange-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{registeredEvents.length}</p>
            <p className="text-xs text-slate-400 font-semibold">Active Registrations</p>
          </div>
        </div>
      </div>

      {/* Progress & Badge System Map */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Badge Progress Meter</h3>
            <p className="text-[11px] text-slate-400">Hours needed to advance to {nextBadge} rank</p>
          </div>
          {profile.badge !== 'Platinum' && (
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              {(targetHours - totalHours).toFixed(1)} hours to go
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Badge rank roadmap visual */}
        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-slate-400 mt-2">
          <div className={`p-2 rounded-xl border ${totalHours >= 0 ? 'bg-orange-50/50 border-orange-200 text-orange-700' : 'border-slate-100 bg-slate-50/50'}`}>
            <Star className="h-4 w-4 mx-auto mb-1 opacity-70" />
            Bronze (0h)
          </div>
          <div className={`p-2 rounded-xl border ${totalHours >= 20 ? 'bg-orange-50/50 border-orange-200 text-orange-700' : 'border-slate-100 bg-slate-50/50'}`}>
            <Star className="h-4 w-4 mx-auto mb-1 opacity-70" />
            Silver (20h)
          </div>
          <div className={`p-2 rounded-xl border ${totalHours >= 50 ? 'bg-orange-50/50 border-orange-200 text-orange-700' : 'border-slate-100 bg-slate-50/50'}`}>
            <Star className="h-4 w-4 mx-auto mb-1 opacity-70" />
            Gold (50h)
          </div>
          <div className={`p-2 rounded-xl border ${totalHours >= 100 ? 'bg-orange-50/50 border-orange-200 text-orange-700' : 'border-slate-100 bg-slate-50/50'}`}>
            <Star className="h-4 w-4 mx-auto mb-1 opacity-70" />
            Platinum (100h)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Registrations List */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-4">My Registered Campaigns</h3>
          {registeredEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              You are not registered for any upcoming events
            </div>
          ) : (
            <div className="space-y-3">
              {registeredEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-slate-50/60 border border-slate-100 p-4 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">{event.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(event.startDateTime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <span className="inline-block mt-2 text-[9px] font-semibold bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">
                      {event.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                    {event.hoursCredited} hrs
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Participation History Logs */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-4">My Attendance Log</h3>
          {logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              No participation history recorded yet
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
              {logs.map((log) => (
                <div
                  key={log._id}
                  className="bg-white border border-slate-100 p-3.5 rounded-2xl flex items-center justify-between hover:shadow-sm transition-all"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 truncate max-w-[180px]">
                      {log.event?.title || 'Event Completed'}
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-1">
                      {new Date(log.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      log.verified
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {log.verified ? `+${log.hoursWorked} hrs` : 'Checked In'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

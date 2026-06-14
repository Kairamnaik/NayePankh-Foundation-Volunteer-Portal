import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Calendar, MapPin, Tag, Users, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [registeredIds, setRegisteredIds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchEventsData = async () => {
    setLoading(true);
    try {
      const [eventsRes, registeredRes] = await Promise.all([
        axios.get('/events'),
        axios.get('/events/registered'),
      ]);
      setEvents(eventsRes.data);
      setRegisteredIds(registeredRes.data.map((e) => e._id));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch event listing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
  }, []);

  const handleRegister = async (eventId) => {
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(`/events/${eventId}/register`);
      setSuccess(response.data.message || 'Successfully registered for event!');
      setRegisteredIds((prev) => [...prev, eventId]);
      
      // Refresh count locally
      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === eventId
            ? { ...ev, participantCount: (ev.participantCount || 0) + 1 }
            : ev
        )
      );

      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  const handleCancel = async (eventId) => {
    setError('');
    setSuccess('');
    try {
      await axios.post(`/events/${eventId}/cancel`);
      setSuccess('Event registration cancelled.');
      setRegisteredIds((prev) => prev.filter((id) => id !== eventId));
      
      // Refresh count locally
      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === eventId
            ? { ...ev, participantCount: Math.max(0, (ev.participantCount || 1) - 1) }
            : ev
        )
      );

      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Cancellation failed.');
    }
  };

  // Local filtering based on criteria
  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category ? e.category === category : true;
    const matchesLocation = location ? e.location.toLowerCase().includes(location.toLowerCase()) : true;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  const categories = ['Education', 'Environment', 'Healthcare', 'Community', 'Disaster Relief', 'Other'];

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Find Events & Campaigns</h1>
          <p className="text-xs text-slate-400">Discover and register for volunteering campaigns</p>
        </div>
        <button
          onClick={fetchEventsData}
          className="flex items-center gap-1.5 border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all self-start md:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Feed
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold">
          <AlertTriangle className="h-4.5 w-4.5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events title/description..."
            className="w-full text-xs bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Category */}
        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Location filter */}
        <div className="relative">
          <MapPin className="absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Filter by location/address..."
            className="w-full text-xs bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
      </div>

      {/* Grid listing */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
          <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">No Events Found</h3>
          <p className="text-xs text-slate-400">Try adjusting your filters or search keywords</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isRegistered = registeredIds.includes(event._id);
            const isFull = (event.participantCount || 0) >= event.maxParticipants;
            const isCompleted = event.status === 'completed';
            const isCancelled = event.status === 'cancelled';
            
            const startStr = new Date(event.startDateTime).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={event._id}
                className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Category and Reward Hours */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {event.category}
                    </span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      +{event.hoursCredited} hrs
                    </span>
                  </div>

                  {/* Title and descriptions */}
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm truncate">{event.title}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-3 mt-1.5 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* Metadata: Date, Location, Vacancy */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4.5 w-4.5 text-slate-400" />
                      <span>{startStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4.5 w-4.5 text-slate-400" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4.5 w-4.5 text-slate-400" />
                      <span>
                        {event.participantCount || 0} / {event.maxParticipants} slots filled
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Button */}
                <div className="mt-6 pt-4 border-t border-slate-50">
                  {isCancelled ? (
                    <button
                      disabled
                      className="w-full bg-slate-100 text-slate-400 font-bold text-xs py-3 rounded-xl cursor-not-allowed"
                    >
                      Event Cancelled
                    </button>
                  ) : isCompleted ? (
                    <button
                      disabled
                      className="w-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-xs py-3 rounded-xl cursor-not-allowed"
                    >
                      Campaign Finished
                    </button>
                  ) : isRegistered ? (
                    <button
                      onClick={() => handleCancel(event._id)}
                      className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs py-3 rounded-xl transition-all shadow-sm"
                    >
                      Cancel Registration
                    </button>
                  ) : isFull ? (
                    <button
                      disabled
                      className="w-full bg-slate-100 text-slate-400 font-bold text-xs py-3 rounded-xl cursor-not-allowed"
                    >
                      Fully Booked
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(event._id)}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm"
                    >
                      Register
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

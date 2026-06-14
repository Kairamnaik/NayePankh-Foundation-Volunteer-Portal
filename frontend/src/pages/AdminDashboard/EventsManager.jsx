import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Calendar, MapPin, Users, RefreshCw, X, AlertTriangle, CheckCircle, Tag, Clock } from 'lucide-react';

export default function EventsManager() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Education');
  const [location, setLocation] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [hoursCredited, setHoursCredited] = useState(2);
  const [status, setStatus] = useState('upcoming');

  const [participants, setParticipants] = useState([]);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedEventName, setSelectedEventName] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/events');
      setEvents(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch events list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setCategory('Education');
    setLocation('');
    setStartDateTime('');
    setEndDateTime('');
    setMaxParticipants('');
    setHoursCredited(2);
    setStatus('upcoming');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description);
    setCategory(event.category);
    setLocation(event.location);
    
    // Format dates for datetime-local input fields
    const startStr = new Date(event.startDateTime).toISOString().slice(0, 16);
    const endStr = new Date(event.endDateTime).toISOString().slice(0, 16);
    
    setStartDateTime(startStr);
    setEndDateTime(endStr);
    setMaxParticipants(event.maxParticipants);
    setHoursCredited(event.hoursCredited);
    setStatus(event.status);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !description || !category || !location || !startDateTime || !endDateTime || !maxParticipants) {
      return setError('Please fill in all required fields.');
    }

    if (new Date(startDateTime) >= new Date(endDateTime)) {
      return setError('End date/time must be after start date/time.');
    }

    setActionLoading(true);

    const eventPayload = {
      title,
      description,
      category,
      location,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      maxParticipants: Number(maxParticipants),
      hoursCredited: Number(hoursCredited),
      status,
    };

    try {
      if (editingEvent) {
        await axios.put(`/events/${editingEvent._id}`, eventPayload);
        setSuccess('Event updated successfully!');
      } else {
        await axios.post('/events', eventPayload);
        setSuccess('Event created successfully!');
      }
      setShowModal(false);
      fetchEvents();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event details.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? All registered participants will be removed.')) {
      return;
    }

    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      await axios.delete(`/events/${id}`);
      setSuccess('Event and associated registrations deleted.');
      fetchEvents();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Deletion failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchParticipants = async (eventId, eventTitle) => {
    setError('');
    try {
      const response = await axios.get(`/events/${eventId}/participants`);
      setParticipants(response.data);
      setSelectedEventName(eventTitle);
      setShowParticipantsModal(true);
    } catch (err) {
      setError('Failed to fetch participant list.');
    }
  };

  const categories = ['Education', 'Environment', 'Healthcare', 'Community', 'Disaster Relief', 'Other'];

  return (
    <div className="space-y-8 text-left relative">
      <div className="flex justify-between items-center border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Manage Campaigns</h1>
          <p className="text-xs text-slate-400">Schedule drives, verify vacancies, and track participants</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </button>
          <button
            onClick={fetchEvents}
            className="flex items-center gap-1.5 border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
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

      {/* Events listing */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="h-8 w-8 text-orange-600 animate-spin mx-auto" />
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">
            No events scheduled. Click 'Create Event' to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4">Event Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Credits</th>
                  <th className="p-4">Vacancy</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {events.map((e) => {
                  const startStr = new Date(e.startDateTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <tr key={e._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-slate-700">{e.title}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {startStr}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-0.5 rounded-full">
                          {e.category}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 truncate max-w-[140px]">{e.location}</td>
                      <td className="p-4 font-bold text-slate-600">{e.hoursCredited}h</td>
                      <td className="p-4">
                        <button
                          onClick={() => fetchParticipants(e._id, e.title)}
                          className="font-bold text-slate-700 hover:text-orange-600 flex items-center gap-1 hover:underline"
                        >
                          <Users className="h-4 w-4" />
                          {e.participantCount || 0} / {e.maxParticipants}
                        </button>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                          e.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : e.status === 'ongoing'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            : e.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(e)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all inline-block"
                        >
                          <Edit2 className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(e._id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all inline-block"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="bg-slate-900 text-white p-6">
              <h3 className="font-bold text-lg">{editingEvent ? 'Edit Campaign Details' : 'Create New Campaign'}</h3>
              <p className="text-xs text-slate-400">Fill in dates, category filters, and credited hour points</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Literacy Drive Phase 1"
                  className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Campaign activities, expectations, and goals..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Location</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Sector 5 Park, Delhi"
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">End Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Capacity (Slots)</label>
                  <input
                    type="number"
                    required
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Credits (Hours)</label>
                  <input
                    type="number"
                    required
                    value={hoursCredited}
                    onChange={(e) => setHoursCredited(e.target.value)}
                    placeholder="e.g. 2"
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-800 px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-6 py-2 rounded-xl transition-all shadow-md shadow-orange-100"
                >
                  {actionLoading ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PARTICIPANTS DISPLAY MODAL */}
      {showParticipantsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setShowParticipantsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="bg-slate-900 text-white p-6">
              <h3 className="font-bold text-sm truncate">Participants: {selectedEventName}</h3>
              <p className="text-[10px] text-slate-400">Total Registered: {participants.length}</p>
            </div>

            <div className="p-6 max-h-[300px] overflow-y-auto space-y-2.5">
              {participants.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">No participants registered yet.</p>
              ) : (
                participants.map((v) => (
                  <div
                    key={v._id}
                    className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-2.5 rounded-xl"
                  >
                    <div className="h-8 w-8 bg-orange-100 rounded-lg overflow-hidden flex items-center justify-center font-bold text-orange-600 text-xs">
                      {v.profilePhoto ? (
                        <img src={v.profilePhoto} alt={v.fullName} className="h-full w-full object-cover" />
                      ) : (
                        v.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{v.fullName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{v.user?.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowParticipantsModal(false)}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all"
              >
                Close list
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

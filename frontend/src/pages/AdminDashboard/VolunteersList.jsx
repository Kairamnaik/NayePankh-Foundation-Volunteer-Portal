import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, UserCheck, Trash2, XCircle, AlertTriangle, Eye, ShieldCheck, Mail, Phone, MapPin, RefreshCw, Star } from 'lucide-react';

export default function VolunteersList() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState(initialStatus);

  // Synchronize status state when URL search parameters change
  useEffect(() => {
    const statusParam = searchParams.get('status') || '';
    setStatus(statusParam);
  }, [searchParams]);

  const [selectedVolunteer, setSelectedVolunteer] = useState(null); // Detail modal
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/volunteers', {
        params: { search, skill, location, status },
      });
      setVolunteers(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load volunteer records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [search, skill, location, status]);

  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.put(`/volunteers/${id}/status`, { status: newStatus });
      setSuccess(`Volunteer status successfully set to ${newStatus}`);
      fetchVolunteers();
      if (selectedVolunteer && selectedVolunteer._id === id) {
        setSelectedVolunteer(null);
      }
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this volunteer? This action will delete their profile and user login credentials.')) {
      return;
    }
    
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/volunteers/${id}`);
      setSuccess('Volunteer deleted successfully.');
      fetchVolunteers();
      if (selectedVolunteer && selectedVolunteer._id === id) {
        setSelectedVolunteer(null);
      }
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete volunteer.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-left relative">
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Manage Volunteers</h1>
          <p className="text-xs text-slate-400">Review, approve, search, and delete volunteer profiles</p>
        </div>
        <button
          onClick={fetchVolunteers}
          className="flex items-center gap-1.5 border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh List
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
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter panel */}
      <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Name Search */}
        <div className="relative">
          <Search className="absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full text-xs bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Skill Filter */}
        <div className="relative">
          <input
            type="text"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Filter by skill (e.g. Teaching)..."
            className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Location Filter */}
        <div className="relative">
          <MapPin className="absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Filter by location/city..."
            className="w-full text-xs bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="h-8 w-8 text-orange-600 animate-spin mx-auto" />
          </div>
        ) : volunteers.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">
            No volunteer applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4">Name</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Availability</th>
                  <th className="p-4">Badge</th>
                  <th className="p-4">Hours</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {volunteers.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-orange-100 rounded-xl overflow-hidden flex items-center justify-center font-bold text-orange-600">
                          {v.profilePhoto ? (
                            <img src={v.profilePhoto} alt={v.fullName} className="h-full w-full object-cover" />
                          ) : (
                            v.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">{v.fullName}</p>
                          <p className="text-[10px] text-slate-400">{v.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{v.phone}</td>
                    <td className="p-4 text-slate-600">{v.availability}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                        {v.badge || 'Bronze'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-700">{v.totalHours || 0}h</td>
                    <td className="p-4">
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        v.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : v.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedVolunteer(v)}
                        title="View Details"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all inline-block"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </button>
                      
                      {v.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(v._id, 'approved')}
                          disabled={actionLoading}
                          title="Approve Volunteer"
                          className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all inline-block"
                        >
                          <UserCheck className="h-4.5 w-4.5" />
                        </button>
                      )}

                      {v.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(v._id, 'rejected')}
                          disabled={actionLoading}
                          title="Reject Application"
                          className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all inline-block"
                        >
                          <XCircle className="h-4.5 w-4.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(v._id)}
                        disabled={actionLoading}
                        title="Delete Profile"
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all inline-block"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL PANEL */}
      {selectedVolunteer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setSelectedVolunteer(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>

            {/* Modal header details */}
            <div className="bg-slate-900 text-white p-6 flex items-center gap-4">
              <div className="h-16 w-16 bg-slate-800 border-2 border-orange-500 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-xl">
                {selectedVolunteer.profilePhoto ? (
                  <img src={selectedVolunteer.profilePhoto} alt="profile" className="h-full w-full object-cover" />
                ) : (
                  selectedVolunteer.fullName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg leading-tight">{selectedVolunteer.fullName}</h3>
                <p className="text-[10px] text-slate-400">Application status: {selectedVolunteer.status}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-400">Age / Gender</span>
                  <p className="font-bold text-slate-700 mt-0.5">{selectedVolunteer.age} years ({selectedVolunteer.gender})</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400">Availability</span>
                  <p className="font-bold text-slate-700 mt-0.5">{selectedVolunteer.availability}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{selectedVolunteer.user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{selectedVolunteer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>{selectedVolunteer.address}</span>
                </div>
              </div>

              {/* Skills and interests */}
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <div>
                  <span className="text-xs font-bold text-slate-500">Skills</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedVolunteer.skills?.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">None</span>
                    ) : (
                      selectedVolunteer.skills?.map((s, i) => (
                        <span key={i} className="text-[9px] font-bold bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-500">Interests</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedVolunteer.interests?.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">None</span>
                    ) : (
                      selectedVolunteer.interests?.map((int, i) => (
                        <span key={i} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {int}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t border-slate-100 pt-3 text-xs">
                <span className="font-bold text-slate-500 block">Emergency Contact Detail</span>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl mt-1 space-y-1">
                  <p className="font-bold text-slate-700">{selectedVolunteer.emergencyContact?.name} ({selectedVolunteer.emergencyContact?.relationship})</p>
                  <p className="text-slate-500">{selectedVolunteer.emergencyContact?.phone}</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedVolunteer(null)}
                className="text-xs font-bold text-slate-600 hover:text-slate-800 px-4 py-2"
              >
                Close
              </button>

              {selectedVolunteer.status !== 'approved' && (
                <button
                  onClick={() => handleUpdateStatus(selectedVolunteer._id, 'approved')}
                  disabled={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                >
                  Approve Application
                </button>
              )}

              {selectedVolunteer.status !== 'rejected' && (
                <button
                  onClick={() => handleUpdateStatus(selectedVolunteer._id, 'rejected')}
                  disabled={actionLoading}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                >
                  Reject
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCodeScanner from '../../components/QRCodeScanner';
import { Calendar, CheckSquare, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function AttendanceManager() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [participants, setParticipants] = useState([]);
  const [logs, setLogs] = useState([]);
  
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load upcoming/ongoing/completed events for selection
  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const response = await axios.get('/events');
      setEvents(response.data);
      if (response.data.length > 0) {
        // Default to first event
        setSelectedEventId(response.data[0]._id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load events list.');
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchEventData = async (eventId) => {
    if (!eventId) return;
    setLoadingData(true);
    try {
      const [participantsRes, logsRes] = await Promise.all([
        axios.get(`/events/${eventId}/participants`),
        axios.get('/attendance', { params: { eventId } }),
      ]);
      setParticipants(participantsRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch event attendance details.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchEventData(selectedEventId);
    }
  }, [selectedEventId]);

  const handleCheckIn = async (volunteerId) => {
    setError('');
    const response = await axios.post('/attendance/check-in', {
      volunteerId,
      eventId: selectedEventId,
    });
    // Refresh log grid
    await fetchEventData(selectedEventId);
    return response.data;
  };

  const handleCheckOut = async (volunteerId) => {
    setError('');
    const response = await axios.post('/attendance/check-out', {
      volunteerId,
      eventId: selectedEventId,
    });
    // Refresh log grid
    await fetchEventData(selectedEventId);
    return response.data;
  };

  return (
    <div className="space-y-8 text-left">
      <div className="flex justify-between items-center border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Track Attendance</h1>
          <p className="text-xs text-slate-400">Scan volunteer credentials, record hours, and inspect logs</p>
        </div>
        <button
          onClick={() => selectedEventId && fetchEventData(selectedEventId)}
          className="flex items-center gap-1.5 border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Logs
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold">
          <AlertTriangle className="h-4.5 w-4.5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Select active event */}
      <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-600 text-xs font-bold">
          <Calendar className="h-5 w-5 text-orange-500" />
          Select Event to Track:
        </div>
        
        {loadingEvents ? (
          <span className="text-xs text-slate-400">Loading events...</span>
        ) : (
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full md:w-80 text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer font-bold text-slate-700"
          >
            {events.length === 0 ? (
              <option value="">No events found</option>
            ) : (
              events.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title} ({e.status})
                </option>
              ))
            )}
          </select>
        )}
      </div>

      {selectedEventId && (
        <>
          {/* QR Code interface */}
          <QRCodeScanner
            eventId={selectedEventId}
            participants={participants}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            logs={logs}
          />

          {/* Today's log listing */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Attendance Log & Hours Worked</h3>
              <p className="text-[11px] text-slate-400">Live records for the selected campaign</p>
            </div>

            {loadingData ? (
              <div className="py-12 text-center">
                <RefreshCw className="h-6 w-6 text-orange-600 animate-spin mx-auto" />
              </div>
            ) : logs.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                No attendance logs found for today's selected event.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="p-4">Volunteer</th>
                      <th className="p-4">Check-In</th>
                      <th className="p-4">Check-Out</th>
                      <th className="p-4">Hours Worked</th>
                      <th className="p-4">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {logs.map((log) => {
                      const checkInStr = log.checkInTime
                        ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '-';
                      const checkOutStr = log.checkOutTime
                        ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '-';

                      return (
                        <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-700">
                            {log.volunteer?.fullName || 'Volunteer'}
                          </td>
                          <td className="p-4 text-slate-600 font-mono">{checkInStr}</td>
                          <td className="p-4 text-slate-600 font-mono">{checkOutStr}</td>
                          <td className="p-4 font-bold text-slate-700">{log.hoursWorked || 0} hrs</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              log.verified
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                            }`}>
                              {log.verified ? 'Completed & Credited' : 'Active (Check-out pending)'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

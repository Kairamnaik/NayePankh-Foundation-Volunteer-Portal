import React, { useState } from 'react';
import { Bell, X, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function NotificationBell() {
  const { notifications, removeNotification } = useSocket();
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-rose-500" />;
      default:
        return <Info className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200 focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto rounded-xl border border-slate-100 bg-white p-3 shadow-xl transition-all duration-200">
            <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
              {notifications.length > 0 && (
                <span className="text-xs font-medium bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                  {notifications.length} New
                </span>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No new notifications
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors duration-150"
                  >
                    <div className="mt-0.5">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[9px] text-slate-400 mt-1">
                        {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button
                      onClick={() => removeNotification(n.id)}
                      className="text-slate-400 hover:text-slate-600 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

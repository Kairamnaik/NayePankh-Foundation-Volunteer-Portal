import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (title, message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [{ id, title, message, type, date: new Date() }, ...prev]);

    // Simple toast alerts auto-cleanup in 6 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 6000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketInstance = io('http://localhost:5001', {
      transports: ['websocket'],
    });

    setSocket(socketInstance);

    // Socket listeners
    socketInstance.on('connect', () => {
      console.log('Socket connection established with backend.');
    });

    // 1. Listen for new event broadcasts
    socketInstance.on('new_event', (data) => {
      addNotification(
        'New Event Created!',
        `"${data.title}" is scheduled at ${data.location}. Register now!`,
        'success'
      );
    });

    // 2. Listen for Admin approval notifications for this volunteer
    if (user.role === 'volunteer') {
      socketInstance.on(`status_update_${user._id}`, (data) => {
        addNotification(
          'Application Status Update',
          data.message,
          data.status === 'approved' ? 'success' : 'error'
        );
        // Force reload page state or profiles state
        window.location.reload();
      });

      // 3. Listen for Attendance checked in/out and hours credited
      socketInstance.on(`attendance_update_${user._id}`, (data) => {
        addNotification(
          'Hours Credited! 🎉',
          data.message,
          'success'
        );
        if (data.badgeChanged) {
          // Import dynamic confetti for celebratory feel!
          import('canvas-confetti').then((confetti) => {
            confetti.default({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.6 },
            });
          });
        }
      });
    }

    // 4. Listen for admin notifications (new applications)
    if (user.role === 'admin') {
      socketInstance.on('new_application', (data) => {
        addNotification(
          'New Volunteer Application',
          `${data.fullName} has registered and requires approval.`,
          'info'
        );
      });
    }

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, notifications, addNotification, removeNotification }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

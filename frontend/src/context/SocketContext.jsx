import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getToken } from '../lib/tokenStorage';

const SocketContext = createContext(null);

function createSocket(token) {
  return io(import.meta.env.VITE_SOCKET_URL || '/', {
    auth: { token },
    transports: ['websocket', 'polling'],
  });
}

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return;
    }

    const token = getToken('accessToken');
    const s = createSocket(token);
    socketRef.current = s;

    s.on('connect', () => setSocket(s));
    s.on('connect_error', (err) => console.warn('Socket error:', err.message));

    // Reconnect with fresh token when the HTTP interceptor silently refreshes it
    const handleTokenRefresh = (e) => {
      const newToken = e.detail?.accessToken;
      if (!newToken) return;
      const prev = socketRef.current;
      const fresh = createSocket(newToken);
      socketRef.current = fresh;
      fresh.on('connect', () => setSocket(fresh));
      fresh.on('connect_error', (err) => console.warn('Socket error:', err.message));
      prev?.disconnect();
    };

    window.addEventListener('token:refreshed', handleTokenRefresh);

    return () => {
      window.removeEventListener('token:refreshed', handleTokenRefresh);
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [user]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export const useSocket = () => useContext(SocketContext);

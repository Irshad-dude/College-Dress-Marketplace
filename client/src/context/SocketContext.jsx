import { createContext, useContext, useEffect } from 'react';
import socket from '../socket/socket';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (token) {
      socket.auth = { token };
      socket.connect();

      socket.on('new-notification', (notification) => {
        addNotification(notification);
      });

      return () => {
        socket.off('new-notification');
        socket.disconnect();
      };
    }
  }, [token, addNotification]); // M7 fix: include addNotification in deps

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";
import api from "../services/api";

const SocketContext = createContext(null);

// Singleton socket — created once, reused across reconnects
let socketInstance = null;
const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(import.meta.env.VITE_SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
};
export function SocketProvider({ children }) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const connectedRef = useRef(false);

  // Track unread message count — resets when user visits /dashboard/chat
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const clearUnreadMsgCount = () => setUnreadMsgCount(0);
  useEffect(() => {
    const socket = getSocket();
    if (!user) {
      if (connectedRef.current) {
        socket.disconnect();
        connectedRef.current = false;
        setUnreadMsgCount(0);
      }
      return;
    }
    const connectSocket = async () => {
      let token = window.__authToken__;
      if (!token) {
        try {
          const res = await api.post("/auth/refresh-token");
          token = res.data?.token;
          if (token) window.__authToken__ = token;
        } catch {
          return; // Can't authenticate — don't connect
        }
      }
      if (!token) return;
      socket.auth = { token };
      // ── Clean up old handlers before re-attaching ──────────────────────────
      socket.off("new-notification");
      socket.off("receive-message-global");
      // ── new-notification: toast popup + notification badge ─────────────────
      socket.on("new-notification", (notification) => {
        addNotification(notification);
        if (notification.type === "message") {
          toast.info(`💬 ${notification.message}`, {
            toastId: `msg-${notification._id || Date.now()}`,
            autoClose: 4000,
            position: "bottom-right",
          });
        } else if (notification.type === "interest") {
          toast.info(`❤️ ${notification.message}`, {
            toastId: `int-${notification._id || Date.now()}`,
            autoClose: 5000,
            position: "bottom-right",
          });
        }
      });
      socket.on("receive-message", () => {
        // Only bump count if the user isn't actively viewing /dashboard/chat
        const onChatPage = window.location.pathname === "/dashboard/chat";
        if (!onChatPage) {
          setUnreadMsgCount((prev) => prev + 1);
        }
      });
      if (!socket.connected) {
        socket.connect();
        connectedRef.current = true;
      }
    };
    connectSocket();
  }, [user, addNotification]);
  return (
    <SocketContext.Provider
      value={{ socket: getSocket(), unreadMsgCount, clearUnreadMsgCount }}
    >
      {children}
    </SocketContext.Provider>
  );
}
export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "@/user/store/authStore";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export function useSocketChat() {
  const { token } = useAuthStore();
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("idle");
  const [partner, setPartner] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [queueMessage, setQueueMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setMessages([]);
      setStatus("idle");
      setPartner(null);
      setChatId(null);
      setRoomId(null);
      setIsPartnerTyping(false);
      setQueueMessage("");
      setError("");
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setError("");
    });

    socket.on("connect_error", (connectionError) => {
      setError(connectionError.message || "Unable to connect to chat.");
      setStatus("idle");
    });

    socket.on("chat:queue:joined", ({ message }) => {
      setQueueMessage(message || "Searching for a stranger...");
      setError("");
      setStatus("searching");
    });

    socket.on("chat:matched", (data) => {
      setPartner(data.partner || null);
      setChatId(data.chatId || null);
      setRoomId(data.roomId || null);
      setMessages([]);
      setIsPartnerTyping(false);
      setQueueMessage("");
      setStatus("chatting");
    });

    socket.on("chat:message:new", (data) => {
      setMessages((prev) => [...prev, data]);
      setIsPartnerTyping(false);
    });

    socket.on("chat:typing:update", ({ isTyping }) => {
      setIsPartnerTyping(Boolean(isTyping));
    });

    socket.on("chat:ended", () => {
      setStatus("idle");
      setPartner(null);
      setChatId(null);
      setRoomId(null);
      setIsPartnerTyping(false);
      setQueueMessage("");
      setMessages([]);
    });

    socket.on("chat:error", ({ message }) => {
      setError(message || "Something went wrong in chat.");
    });

    return () => {
      clearTimeout(typingTimeoutRef.current);
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [token]);

  const joinQueue = useCallback(() => {
    if (!socketRef.current) {
      setError("Chat service is not connected yet.");
      return;
    }

    setMessages([]);
    setPartner(null);
    setChatId(null);
    setRoomId(null);
    setIsPartnerTyping(false);
    setQueueMessage("Searching for a stranger...");
    setError("");
    setStatus("searching");
    socketRef.current.emit("chat:queue:join");
  }, []);

  const sendMessage = useCallback((content) => {
    const trimmed = String(content || "").trim();
    if (!trimmed) {
      return;
    }

    socketRef.current?.emit("chat:message:send", { content: trimmed });
  }, []);

  const sendTyping = useCallback((isTyping) => {
    clearTimeout(typingTimeoutRef.current);
    socketRef.current?.emit("chat:typing", { isTyping });

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("chat:typing", { isTyping: false });
      }, 900);
    }
  }, []);

  const cancelQueue = useCallback(() => {
    setStatus("idle");
    setQueueMessage("");
    setError("");
    socketRef.current?.emit("chat:queue:leave");
  }, []);

  const nextChat = useCallback(() => {
    setStatus("searching");
    setPartner(null);
    setMessages([]);
    setChatId(null);
    setRoomId(null);
    setIsPartnerTyping(false);
    setQueueMessage("Finding a new stranger...");
    setError("");
    socketRef.current?.emit("chat:next");
  }, []);

  const endChat = useCallback(() => {
    setStatus("idle");
    setPartner(null);
    setMessages([]);
    setChatId(null);
    setRoomId(null);
    setIsPartnerTyping(false);
    setQueueMessage("");
    socketRef.current?.emit("chat:end");
  }, []);

  return {
    messages,
    status,
    partner,
    chatId,
    roomId,
    isPartnerTyping,
    queueMessage,
    error,
    joinQueue,
    cancelQueue,
    sendMessage,
    sendTyping,
    nextChat,
    endChat,
  };
}

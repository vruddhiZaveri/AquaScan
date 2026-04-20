import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/chatService.js';

export function useChat(reportId) {
  const [msgs, setMsgs] = useState([]);
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    if (!reportId) return Promise.resolve();
    return chatService.getMessages(reportId).then((messages) => {
      setMsgs(messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
    });
  }, [reportId]);

  useEffect(() => {
    load();
    const onChange = (event) => {
      if (!event?.detail?.reportId || event.detail.reportId === reportId) load();
    };
    window.addEventListener('aqs:data-changed', onChange);
    const t = setInterval(load, 2500);
    return () => {
      window.removeEventListener('aqs:data-changed', onChange);
      clearInterval(t);
    };
  }, [load, reportId]);

  const send = useCallback(async (senderRole, senderName, message, type = 'public') => {
    setSending(true);
    await chatService.sendMessage(reportId, senderRole, senderName, message, type);
    await load();
    setSending(false);
  }, [reportId, load]);

  return { msgs, sending, send, reload: load };
}

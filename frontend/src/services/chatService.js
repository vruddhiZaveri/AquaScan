import { storage } from './storageService.js';
import { api } from './api.js';

const DATA_EVENT = 'aqs:data-changed';

function key(reportId) {
  return `aqs:chat:${reportId}`;
}

function normalizeMessage(message = {}) {
  const id = message.id || message._id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const timestamp = message.timestamp || message.createdAt || new Date().toISOString();
  return {
    ...message,
    id,
    timestamp,
    createdAt: timestamp,
    senderName: message.senderName || (message.senderRole === 'committee' ? 'Committee' : 'Citizen'),
    type: message.type || 'public',
  };
}

function emitChange(type, payload = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DATA_EVENT, { detail: { type, ...payload, at: Date.now() } }));
  }
}

async function saveLocal(reportId, messages) {
  await storage.set(key(reportId), messages.map(normalizeMessage));
  emitChange('chat', { reportId });
}

export const chatService = {
  async getMessages(reportId) {
    try {
      const data = await api(`/chat/${reportId}`);
      return (data.messages || []).map(normalizeMessage);
    } catch {
      return ((await storage.get(key(reportId))) || []).map(normalizeMessage);
    }
  },

  async sendMessage(reportId, senderRole, senderName, message, type = 'public') {
    try {
      const data = await api(`/chat/${reportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderRole, senderName, message, type }),
      });
      emitChange('chat', { reportId });
      return normalizeMessage(data.message);
    } catch {
      const msgs = ((await storage.get(key(reportId))) || []).map(normalizeMessage);
      const now = new Date().toISOString();
      const newMsg = normalizeMessage({ id: `msg_${Date.now()}`, senderRole, senderName, message, type, timestamp: now });
      msgs.push(newMsg);

      const lower = message.toLowerCase();
      if (senderRole === 'citizen') {
        let autoMessage = 'Your message has been received by the committee. An update will appear here once the team reviews the report.';
        if (/when|how soon|clean|resolved|update|status/.test(lower)) {
          autoMessage = 'The committee has acknowledged your query. The report is under review, and status updates will be posted in this thread.';
        } else if (/urgent|danger|immediate/.test(lower)) {
          autoMessage = 'Urgency noted. The committee has flagged this conversation for priority review.';
        }
        msgs.push(normalizeMessage({
          id: `msg_auto_${Date.now()+1}`,
          senderRole: 'committee',
          senderName: 'AquaScan Response Desk',
          message: autoMessage,
          type: 'public',
          timestamp: new Date(Date.now()+400).toISOString(),
        }));
      }

      await saveLocal(reportId, msgs);
      return newMsg;
    }
  },
};

import { storage } from './storageService.js';
import { api } from './api.js';

const USERS_KEY = 'aqs:users';
const SESSION_KEY = 'aqs:session';
const TOKEN_KEY = 'aqs:token';

function keyFromEmail(email = '') {
  return email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
}

function sanitizeUser(user, role) {
  if (!user) return null;
  const { password, ...safe } = user;
  return { ...safe, role };
}

async function saveSession(session, token) {
  await storage.set(SESSION_KEY, session);
  try { localStorage.setItem(TOKEN_KEY, token || ''); } catch {}
}

export const authService = {
  async restoreSession() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        const data = await api('/auth/me');
        const session = { role: data.role, user: data.user };
        await storage.set(SESSION_KEY, session);
        return session;
      }
    } catch {}
    return (await storage.get(SESSION_KEY)) || null;
  },

  async logout() {
    await storage.del(SESSION_KEY);
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
    return true;
  },

  async signup(role, fields) {
    try {
      const isCommittee = role === 'committee';
      const payload = isCommittee
        ? {
            committeeName: fields.committeeName || 'Committee',
            officialEmail: fields.email,
            password: fields.password,
            ownerName: fields.ownerName || '',
            organizationName: fields.organizationName || '',
            jurisdictionArea: fields.jurisdictionArea || '',
            phone: fields.phone || '',
          }
        : {
            fullName: fields.fullName || 'Citizen User',
            email: fields.email,
            password: fields.password,
            city: fields.city || '',
            phone: fields.phone || '',
          };
      const data = await api(`/auth/signup/${isCommittee ? 'committee' : 'citizen'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const session = { role: data.role, user: data.user };
      await saveSession(session, data.token);
      return session;
    } catch (err) {
      const users = (await storage.get(USERS_KEY)) || {};
      const email = fields.email?.toLowerCase().trim();
      if (!email) throw new Error('Email is required.');
      const key = keyFromEmail(email);
      if (users[key]) throw new Error('Account already exists.');
      const user = role === 'committee'
        ? { id: `committee_${Date.now()}`, role, email, password: fields.password, committeeName: fields.committeeName || 'Committee', ownerName: fields.ownerName || '', organizationName: fields.organizationName || '', jurisdictionArea: fields.jurisdictionArea || '', phone: fields.phone || '', createdAt: new Date().toISOString() }
        : { id: `citizen_${Date.now()}`, role, email, password: fields.password, fullName: fields.fullName || 'Citizen User', city: fields.city || '', phone: fields.phone || '', impactPoints: 0, totalReportsSubmitted: 0, streakDays: 0, badges: [], pointsHistory: [], createdAt: new Date().toISOString() };
      users[key] = user;
      await storage.set(USERS_KEY, users);
      const session = { role, user: sanitizeUser(user, role) };
      await storage.set(SESSION_KEY, session);
      return session;
    }
  },

  async login(email, password, role) {
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const session = { role: data.role, user: data.user };
      await saveSession(session, data.token);
      return session;
    } catch {
      const users = (await storage.get(USERS_KEY)) || {};
      const key = keyFromEmail(email);
      const user = users[key];
      if (!user) throw new Error('Account not found.');
      if (user.role !== role) throw new Error('Wrong account type selected.');
      if (user.password !== password) throw new Error('Invalid password.');
      const session = { role, user: sanitizeUser(user, role) };
      await storage.set(SESSION_KEY, session);
      return session;
    }
  },
};

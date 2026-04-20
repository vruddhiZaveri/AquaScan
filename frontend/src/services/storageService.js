const useArtifact = typeof window !== "undefined" && !!window.storage;

const LS = {
  get: (k) => {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
  del: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {}
  },
};

export const storage = {
  async get(k) {
    if (useArtifact) {
      try {
        const r = await window.storage.get(k);
        return r ? JSON.parse(r.value) : null;
      } catch {
        return null;
      }
    }
    return LS.get(k);
  },

  async set(k, v) {
    if (useArtifact) {
      try {
        await window.storage.set(k, JSON.stringify(v));
      } catch {}
    } else {
      LS.set(k, v);
    }
  },

  async del(k) {
    if (useArtifact) {
      try {
        await window.storage.delete(k);
      } catch {}
    } else {
      LS.del(k);
    }
  },
};

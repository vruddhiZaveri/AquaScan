import { useState, useEffect, useCallback } from 'react';
import { reportService } from '../services/reportService.js';

export function useReports(userId) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const all = userId ? await reportService.getByUser(userId) : await reportService.getAll();
    setReports([...all].reverse());
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
    const onChange = () => load();
    window.addEventListener(reportService.events.DATA_EVENT, onChange);
    window.addEventListener('storage', onChange);
    const t = setInterval(load, 4000);
    return () => {
      window.removeEventListener(reportService.events.DATA_EVENT, onChange);
      window.removeEventListener('storage', onChange);
      clearInterval(t);
    };
  }, [load]);

  return { reports, loading, reload: load };
}

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { EmotionRecord } from '../types';

interface RecordsContextType {
  records: EmotionRecord[];
  addRecord: (r: Omit<EmotionRecord, 'id'>) => EmotionRecord;
  updateRecord: (id: string, updates: Partial<EmotionRecord>) => void;
  deleteRecord: (id: string) => void;
  importRecords: (newRecords: EmotionRecord[]) => void;
}

const RecordsContext = React.createContext<RecordsContextType | null>(null);

export function useRecords() {
  const ctx = React.useContext(RecordsContext);
  if (!ctx) throw new Error('useRecords must be used within RecordsProvider');
  return ctx;
}

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const STORAGE_KEY = 'mood_timeline_records';

  const loadRecords = (): EmotionRecord[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as EmotionRecord[];
    } catch {
      return [];
    }
  };

  const [records, setRecords] = useState<EmotionRecord[]>(loadRecords);
  const prevRecords = useRef<EmotionRecord[]>(records);

  // Persist to localStorage whenever records change
  useEffect(() => {
    if (prevRecords.current !== records) {
      prevRecords.current = records;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      } catch {
        // Storage full
      }
    }
  }, [records]);

  const addRecord = useCallback((record: Omit<EmotionRecord, 'id'>) => {
    const newRecord = { ...record, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) };
    setRecords(prev => [newRecord, ...prev]);
    return newRecord;
  }, []);

  const updateRecord = useCallback((id: string, updates: Partial<EmotionRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  const importRecords = useCallback((newRecords: EmotionRecord[]) => {
    setRecords(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      return [...prev, ...newRecords.filter(r => !existingIds.has(r.id))];
    });
  }, []);

  const value = useMemo(() => ({ records, addRecord, updateRecord, deleteRecord, importRecords }), [records, addRecord, updateRecord, deleteRecord, importRecords]);

  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

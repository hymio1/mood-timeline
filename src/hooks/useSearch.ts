import { useState, useMemo, useCallback } from 'react';
import type { EmotionRecord } from '../types';

export function useSearch(records: EmotionRecord[]) {
  const [keyword, setKeyword] = useState('');
  const [moodFilter, setMoodFilter] = useState<number | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => r.tags.forEach((t: string) => set.add(t)));
    return Array.from(set).sort();
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter(r => {
      if (keyword && !r.content.includes(keyword) && !r.tags.some((t: string) => t.includes(keyword))) return false;
      if (moodFilter !== null && r.mood !== moodFilter) return false;
      if (tagFilter && !r.tags.includes(tagFilter)) return false;
      return true;
    });
  }, [records, keyword, moodFilter, tagFilter]);

  const clearFilters = useCallback(() => {
    setKeyword('');
    setMoodFilter(null);
    setTagFilter(null);
  }, []);

  return { keyword, setKeyword, moodFilter, setMoodFilter, tagFilter, setTagFilter, allTags, filtered, clearFilters };
}

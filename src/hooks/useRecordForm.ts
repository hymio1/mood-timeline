import { useState, useCallback } from 'react';
import type { EmotionRecord } from '../types';
import { validateDate, validateMood } from '../utils/helpers';

export function useRecordForm(initial?: Partial<EmotionRecord>) {
  const [date, setDate] = useState(initial?.date ?? '');
  const [mood, setMood] = useState<number>(initial?.mood ?? 3);
  const [sleepHours, setSleepHours] = useState<number | null>(initial?.sleepHours ?? null);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [content, setContent] = useState(initial?.content ?? '');
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  }, []);

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (!date) errs.date = '请选择日期';
    else if (!validateDate(date)) errs.date = '日期格式无效';
    if (!validateMood(mood)) errs.mood = '请选择情绪等级';
    if (!content.trim()) errs.content = '请输入随笔内容';
    else if (content.length > 2000) errs.content = '随笔内容最多2000字';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [date, mood, content]);

  return { date, setDate, mood, setMood, sleepHours, setSleepHours, tags, setTags, content, setContent, tagInput, setTagInput, addTag, removeTag, validate, errors };
}

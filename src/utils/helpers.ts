import dayjs from 'dayjs';
import type { EmotionRecord, MoodLevel } from '../types';

// ─── ID & Date ────────────────────────────────────────────
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function formatDate(dateStr: string): string {
  return dayjs(dateStr).format('YYYY年M月D日');
}

export function formatDateShort(dateStr: string): string {
  return dayjs(dateStr).format('MM-DD');
}

export function formatTimeAgo(dateStr: string): string {
  const diff = dayjs().diff(dayjs(dateStr), 'day');
  if (diff === 0) return '今天';
  if (diff === 1) return '昨天';
  if (diff < 7) return `${diff}天前`;
  if (diff < 30) return `${Math.floor(diff / 7)}周前`;
  return `${Math.floor(diff / 30)}个月前`;
}

export function getToday(): string {
  return dayjs().format('YYYY-MM-DD');
}

export function getGreeting(): string {
  const h = dayjs().hour();
  if (h < 6)  return '夜深了';
  if (h < 12) return '早上好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

// ─── Mood helpers ─────────────────────────────────────────
export function getMoodOption(mood: number) {
  return [
    { value: 1, label: '很差', emoji: '😞', color: '#B8605A', bg: '#FDF0EF', bar: '#B8605A', badge: '#FDF0EF' },
    { value: 2, label: '低落', emoji: '😟', color: '#C4884A', bg: '#FDF5E8', bar: '#C4884A', badge: '#FDF5E8' },
    { value: 3, label: '普通', emoji: '😐', color: '#9E8A5C', bg: '#FAF8F0', bar: '#9E8A5C', badge: '#FAF8F0' },
    { value: 4, label: '开心', emoji: '😊', color: '#5A8A6E', bg: '#EFF7F3', bar: '#5A8A6E', badge: '#EFF7F3' },
    { value: 5, label: '很棒', emoji: '😍', color: '#5A7FA8', bg: '#EEF3FA', bar: '#5A7FA8', badge: '#EEF3FA' },
  ].find(o => o.value === mood);
}

export function getMoodEmoji(mood: number): string {
  return getMoodOption(mood)?.emoji ?? '😐';
}

export function getMoodColor(mood: number): string {
  return getMoodOption(mood)?.color ?? '#9E8A5C';
}

export function validateDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = dayjs(dateStr);
  return d.isValid() && d.isSame(d, 'day');
}

export function validateMood(mood: number): boolean {
  return [1, 2, 3, 4, 5].includes(mood);
}

export function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '…';
}

// ─── Storage ──────────────────────────────────────────────
export function getStorageUsageBytes(): number {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) total += key.length + (localStorage.getItem(key) ?? '').length * 2;
  }
  return total;
}

// ─── Statistics helpers ───────────────────────────────────
export interface MoodStat {
  mood: number; count: number; label: string; color: string; pct: number;
}

export function calcMoodDistribution(records: EmotionRecord[]): MoodStat[] {
  const counts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  records.forEach(r => counts[String(r.mood)]++);
  const total = records.length || 1;
  return [1, 2, 3, 4, 5].map(m => ({
    mood: m, count: counts[String(m)],
    label: getMoodOption(m)?.label ?? '',
    color: getMoodOption(m)?.color ?? '',
    pct: Math.round(counts[String(m)] / total * 100),
  }));
}

export interface TagStat { tag: string; count: number; }

export function calcTagFrequency(records: EmotionRecord[]): TagStat[] {
  const counts: Record<string, number> = {};
  records.forEach(r => r.tags.forEach(t => { counts[t] = (counts[t] ?? 0) + 1; }));
  return Object.entries(counts).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
}

export function calcAvgMood(records: EmotionRecord[]): number {
  if (!records.length) return 0;
  return records.reduce((s, r) => s + r.mood, 0) / records.length;
}

export function calcAvgSleep(records: EmotionRecord[]): number | null {
  const withSleep = records.filter(r => r.sleepHours !== null);
  if (!withSleep.length) return null;
  return withSleep.reduce((s, r) => s + r.sleepHours!, 0) / withSleep.length;
}

export function calcAvgEnergy(records: EmotionRecord[]): number | null {
  const withEnergy = records.filter(r => r.energy !== null);
  if (!withEnergy.length) return null;
  return withEnergy.reduce((s, r) => s + r.energy!, 0) / withEnergy.length;
}

export function calcAvgStress(records: EmotionRecord[]): number | null {
  const withStress = records.filter(r => r.stress !== null);
  if (!withStress.length) return null;
  return withStress.reduce((s, r) => s + r.stress!, 0) / withStress.length;
}

export function calcStreak(records: EmotionRecord[]): number {
  if (!records.length) return 0;
  const dates = [...new Set(records.map(r => r.date))].sort().reverse();
  let streak = 0;
  let check = dayjs();
  // If no record today, start from yesterday
  if (!dates.includes(check.format('YYYY-MM-DD'))) {
    check = check.subtract(1, 'day');
  }
  for (let i = 0; i < dates.length; i++) {
    const expected = check.format('YYYY-MM-DD');
    if (dates.includes(expected)) {
      streak++;
      check = check.subtract(1, 'day');
    } else {
      break;
    }
  }
  return streak;
}

export function calcLongestStreak(records: EmotionRecord[]): number {
  if (!records.length) return 0;
  const dates = [...new Set(records.map(r => r.date))].sort();
  let maxStreak = 1, currentStreak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = dayjs(dates[i]).diff(dayjs(dates[i - 1]), 'day');
    if (diff === 1) { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak); }
    else currentStreak = 1;
  }
  return maxStreak;
}

export function calcUniqueTags(records: EmotionRecord[]): string[] {
  const set = new Set<string>();
  records.forEach(r => r.tags.forEach(t => set.add(t)));
  return Array.from(set).sort();
}

export function calcDaysSinceFirst(records: EmotionRecord[]): number {
  if (!records.length) return 0;
  const firstDate = records.map(r => r.date).sort()[0];
  return dayjs().diff(dayjs(firstDate), 'day');
}

export function calcSeenMoods(records: EmotionRecord[]): number {
  return new Set(records.map(r => r.mood)).size;
}

// ─── Activity correlation ────────────────────────────────
export interface ActivityInsight {
  activity: string;
  avgMood: number;
  count: number;
  color: string;
}

export function calcActivityCorrelation(records: EmotionRecord[]): ActivityInsight[] {
  const activityMap: Record<string, { totalMood: number; count: number }> = {};
  records.forEach(r => {
    r.activities.forEach(a => {
      if (!activityMap[a]) activityMap[a] = { totalMood: 0, count: 0 };
      activityMap[a].totalMood += r.mood;
      activityMap[a].count++;
    });
  });
  return Object.entries(activityMap)
    .filter(([, v]) => v.count >= 2)
    .map(([activity, v]) => {
      const preset = [
        { key: 'coffee',    label: '☕ 咖啡',    color: '#C4884A' },
        { key: 'meal',      label: '🍜 吃饭',    color: '#5A8A6E' },
        { key: 'movie',     label: '🎬 电影',    color: '#8B7EC8' },
        { key: 'game',      label: '🎮 游戏',    color: '#B8605A' },
        { key: 'work',      label: '💻 工作',    color: '#5A7FA8' },
        { key: 'study',     label: '📚 学习',    color: '#9E8A5C' },
        { key: 'exercise',  label: '🏃 运动',    color: '#5A8A6E' },
        { key: 'social',    label: '👭 社交',    color: '#C4884A' },
        { key: 'alone',     label: '🏠 独处',    color: '#9E8A5C' },
        { key: 'shop',      label: '🛍 购物',    color: '#8B7EC8' },
        { key: 'sleep',     label: '😴 睡觉',    color: '#5A7FA8' },
      ].find(p => p.key === activity);
      return {
        activity: preset?.label ?? activity,
        avgMood: v.totalMood / v.count,
        count: v.count,
        color: preset?.color ?? '#8B7EC8',
      };
    })
    .sort((a, b) => b.avgMood - a.avgMood)
    .slice(0, 6);
}

// ─── Insight generation (real data only) ────────────────
export function generateInsights(records: EmotionRecord[]): string[] {
  if (records.length < 1) return [];

  const insights: string[] = [];
  const today = dayjs();
  const last7 = records.filter(r => today.diff(dayjs(r.date), 'day') <= 7);
  const prev7 = records.filter(r => {
    const d = dayjs(r.date);
    const diff = today.diff(d, 'day');
    return diff > 7 && diff <= 14;
  });
  const avgLast7 = calcAvgMood(last7);
  const avgPrev7 = calcAvgMood(prev7);
  const overallAvg = calcAvgMood(records);
  const dates = [...new Set(records.map(r => r.date))];

  // Trend — 宽松：只要近7天有2条以上即可
  if (last7.length >= 2) {
    if (prev7.length >= 2 && avgPrev7 > 0) {
      const diff = avgLast7 - avgPrev7;
      if (diff > 0.3) insights.push(`最近一周你的情绪比前一周平均高出 ${diff.toFixed(1)} 分，状态在慢慢变好。`);
      else if (diff < -0.3) insights.push(`最近一周你的情绪比前一周平均低 ${Math.abs(diff).toFixed(1)} 分，注意休息和放松。`);
    } else if (avgLast7 >= 4) {
      insights.push('最近几天你的情绪整体不错，保持这种状态吧！');
    } else if (avgLast7 <= 2) {
      insights.push('最近心情有些低落，试着做点让自己放松的事吧。');
    } else {
      insights.push(`最近${last7.length}天的平均情绪为 ${avgLast7.toFixed(1)} 分，属于一般水平。`);
    }
  } else if (last7.length === 1) {
    const m = last7[0].mood;
    const opt = getMoodOption(m);
    insights.push(`今天你选择了"${opt?.label ?? '普通'}"，记得每天记录来追踪情绪变化哦。`);
  }

  // Consistency — 降低门槛
  if (dates.length >= 3) {
    const recentMoods = records.filter(r => today.diff(dayjs(r.date), 'day') <= 7).map(r => r.mood);
    const variance = recentMoods.length > 1
      ? recentMoods.reduce((s, m) => s + Math.pow(m - avgLast7, 2), 0) / recentMoods.length : 0;
    if (variance < 0.8 && recentMoods.length >= 2) {
      insights.push('最近几天你的情绪比较稳定，这是一个好信号。');
    }
  }

  // Activity correlation — 只要有数据就提示
  const activityInsights = calcActivityCorrelation(records);
  if (activityInsights.length > 0) {
    const top = activityInsights[0];
    insights.push(`记录显示${top.activity}的日子，你心情普遍较好（均分 ${top.avgMood.toFixed(1)}，共${top.count}次）。`);
  }

  // Sleep — 降低到2条
  const sleepRecords = records.filter(r => r.sleepHours !== null);
  if (sleepRecords.length >= 2) {
    const highSleep = sleepRecords.filter(r => r.sleepHours! >= 7);
    const lowSleep = sleepRecords.filter(r => r.sleepHours! < 6);
    if (highSleep.length > 0 && highSleep.length >= lowSleep.length) {
      insights.push('睡眠充足的日子，你的情绪普遍更好。继续保持规律作息。');
    } else if (lowSleep.length > 0 && lowSleep.length >= highSleep.length) {
      insights.push('睡眠不足可能会影响情绪，试着早点休息吧。');
    }
  }

  // Weekend pattern — 降低到5条
  if (records.length >= 5) {
    const weekend = records.filter(r => {
      const d = dayjs(r.date);
      return d.day() === 0 || d.day() === 6;
    });
    const weekday = records.filter(r => {
      const d = dayjs(r.date);
      return d.day() !== 0 && d.day() !== 6;
    });
    if (weekend.length >= 1 && weekday.length >= 2) {
      const avgWknd = weekend.reduce((s, r) => s + r.mood, 0) / weekend.length;
      const avgWkdy = weekday.reduce((s, r) => s + r.mood, 0) / weekday.length;
      if (avgWknd > avgWkdy + 0.3) insights.push('周末的日子里，你的情绪普遍比工作日更高一些。');
      else if (avgWkdy > avgWknd + 0.3) insights.push('工作日的情绪反而比周末更好，可能是因为你专注于事情时会更投入。');
    }
  }

  // Streak encouragement
  const streak = calcStreak(records);
  if (streak >= 1) {
    insights.push(`你已经连续记录 ${streak} 天了，坚持就是胜利！`);
  }

  // Fallback: 如果所有条件都没触发，给一条基础鼓励
  if (insights.length === 0) {
    if (overallAvg >= 4) {
      insights.push('你的整体情绪偏积极，继续保持乐观的心态！');
    } else if (overallAvg <= 2) {
      insights.push('平均情绪偏低，试着多做一些让自己开心的小事。');
    } else {
      insights.push(`你目前记录了 ${records.length} 条心情，继续积累数据可以生成更丰富的分析。`);
    }
  }

  return insights.slice(0, 4);
}

// ─── Heatmap ─────────────────────────────────────────────
export interface HeatmapDay {
  date: string; mood: number | null; content: string;
  sleepHours: number | null; stress: number | null; energy: number | null;
}

export function buildHeatmapData(records: EmotionRecord[]): Map<string, HeatmapDay> {
  const map = new Map<string, HeatmapDay>();
  records.forEach(r => map.set(r.date, { date: r.date, mood: r.mood, content: r.content, sleepHours: r.sleepHours, stress: r.stress, energy: r.energy }));
  return map;
}

// ─── Timeline series ─────────────────────────────────────
export interface DailyMoodPoint {
  date: string; mood: number; sleepHours: number | null;
}

export function buildDailyMoodSeries(records: EmotionRecord[]): DailyMoodPoint[] {
  const map = new Map<string, EmotionRecord>();
  records.forEach(r => {
    const existing = map.get(r.date);
    if (!existing || r.id > existing.id) map.set(r.date, r);
  });
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, r]) => ({ date, mood: r.mood, sleepHours: r.sleepHours }));
}

export function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) days.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
  return days;
}

export function getWeeksOfMonth(year: number, month: number): string[][] {
  const firstDay = dayjs(`${year}-${String(month + 1).padStart(2, '0')}-01`);
  const startOfWeek = firstDay.startOf('week');
  const result: string[][] = [];
  for (let i = 0; i < 6; i++) {
    const weekStart = startOfWeek.add(i, 'week');
    const week: string[] = [];
    for (let d = 0; d < 7; d++) week.push(weekStart.add(d, 'day').format('YYYY-MM-DD'));
    result.push(week);
    if (weekStart.add(6, 'day').month() === month && weekStart.add(6, 'day').year() === year) break;
  }
  return result;
}

export function getDaysInMonth(year: number, month: number): number {
  return dayjs(`${year}-${String(month + 1).padStart(2, '0')}-01`).daysInMonth();
}

// ─── Memory / Recall ─────────────────────────────────────
export interface YearAgoRecord {
  date: string;
  record: EmotionRecord;
  daysAgo: number;
}

export function findYearAgoRecord(records: EmotionRecord[], today: string): YearAgoRecord | null {
  const yearAgo = dayjs(today).subtract(1, 'year').format('YYYY-MM-DD');
  const exact = records.find(r => r.date === yearAgo);
  if (exact) return { date: yearAgo, record: exact, daysAgo: 365 };
  // Fuzzy: find closest record on same month/day
  const targetMD = dayjs(yearAgo).format('MM-DD');
  const candidates = records.filter(r => dayjs(r.date).format('MM-DD') === targetMD)
    .sort((a, b) => Math.abs(dayjs(a.date).diff(dayjs(yearAgo), 'day')) - Math.abs(dayjs(b.date).diff(dayjs(yearAgo), 'day')));
  if (candidates.length > 0) {
    const r = candidates[0];
    return { date: r.date, record: r, daysAgo: Math.round(dayjs(today).diff(dayjs(r.date), 'day') / 365) };
  }
  return null;
}

// ─── Export / Import ──────────────────────────────────────
export function exportRecords(records: EmotionRecord[]): void {
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `心迹-backup-${getToday()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(records: EmotionRecord[]): void {
  const headers = ['日期', '情绪', '睡眠(h)', '精力', '压力', '标签', '内容'];
  const rows = records.map(r => [
    r.date,
    getMoodOption(r.mood)?.label ?? '',
    r.sleepHours ?? '',
    r.energy ?? '',
    r.stress ?? '',
    r.tags.join('、'),
    `"${r.content.replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `心迹-backup-${getToday()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseRecordsFromFile(file: File): Promise<EmotionRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!Array.isArray(parsed)) throw new Error('根节点不是数组');
        const validated: EmotionRecord[] = parsed.map((item: any) => ({
          id: typeof item.id === 'string' ? item.id : generateId(),
          date: item.date,
          mood: item.mood as MoodLevel,
          sleepHours: typeof item.sleepHours === 'number' ? item.sleepHours : null,
          energy: typeof item.energy === 'number' ? item.energy : null,
          stress: typeof item.stress === 'number' ? item.stress : null,
          tags: Array.isArray(item.tags) ? item.tags.filter((t: any) => typeof t === 'string') : [],
          activities: Array.isArray(item.activities) ? item.activities.filter((t: any) => typeof t === 'string') : [],
          content: typeof item.content === 'string' ? item.content : '',
          photo: item.photo ?? null,
        }));
        resolve(validated);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file, 'UTF-8');
  });
}

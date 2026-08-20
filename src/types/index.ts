export type EmotionRecord = {
  id: string;
  date: string;                       // YYYY-MM-DD
  mood: number;                       // 1很差 2低落 3普通 4开心 5很棒
  sleepHours: number | null;          // 睡眠时长（小时，支持0.5小数）
  energy: number | null;              // 精力 1-10
  stress: number | null;              // 压力 1-10
  tags: string[];
  activities: string[];               // 活动标签
  content: string;
  photo?: string | null;              // base64 照片（可选）
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export const MOOD_OPTIONS: { value: number; label: string; emoji: string; color: string; bg: string; bar: string; badge: string }[] = [
  { value: 1, label: '很差', emoji: '😞', color: '#B8605A', bg: '#FDF0EF', bar: '#B8605A', badge: '#FDF0EF' },
  { value: 2, label: '低落', emoji: '😟', color: '#C4884A', bg: '#FDF5E8', bar: '#C4884A', badge: '#FDF5E8' },
  { value: 3, label: '普通', emoji: '😐', color: '#9E8A5C', bg: '#FAF8F0', bar: '#9E8A5C', badge: '#FAF8F0' },
  { value: 4, label: '开心', emoji: '😊', color: '#5A8A6E', bg: '#EFF7F3', bar: '#5A8A6E', badge: '#EFF7F3' },
  { value: 5, label: '很棒', emoji: '😍', color: '#5A7FA8', bg: '#EEF3FA', bar: '#5A7FA8', badge: '#EEF3FA' },
];

export const MOOD_HEATMAP: Record<number, string> = {
  1: '#F5D5D0', 2: '#F0DDB8', 3: '#E8E0C4', 4: '#C8DFD0', 5: '#B8CDE8',
};

export const MOOD_HEATMAP_TEXT: Record<number, string> = {
  1: '#B8605A', 2: '#C4884A', 3: '#9E8A5C', 4: '#5A8A6E', 5: '#5A7FA8',
};

// 常用活动预设
export const PRESET_ACTIVITIES = [
  { key: 'coffee',   label: '☕ 咖啡',   color: '#C4884A' },
  { key: 'meal',     label: '🍜 吃饭',   color: '#5A8A6E' },
  { key: 'movie',    label: '🎬 电影',   color: '#8B7EC8' },
  { key: 'game',     label: '🎮 游戏',   color: '#B8605A' },
  { key: 'work',     label: '💻 工作',   color: '#5A7FA8' },
  { key: 'study',    label: '📚 学习',   color: '#9E8A5C' },
  { key: 'exercise', label: '🏃 运动',   color: '#5A8A6E' },
  { key: 'social',   label: '👭 社交',   color: '#C4884A' },
  { key: 'alone',    label: '🏠 独处',   color: '#9E8A5C' },
  { key: 'shop',     label: '🛍 购物',   color: '#8B7EC8' },
  { key: 'sleep',    label: '😴 睡觉',   color: '#5A7FA8' },
];

// 成就定义
export const ACHIEVEMENTS = [
  { id: 'first_record',      icon: '🌱', title: '第一次记录',    desc: '写下第一条心情',       check: (r: number) => r >= 1 },
  { id: 'streak_3',          icon: '🔥', title: '连续3天',        desc: '连续记录3天',          check: (r: number) => r >= 3 },
  { id: 'streak_7',          icon: '🔥', title: '连续7天',        desc: '连续记录7天',          check: (r: number) => r >= 7 },
  { id: 'streak_30',         icon: '💜', title: '连续30天',       desc: '连续记录一个月',       check: (r: number) => r >= 30 },
  { id: 'records_10',        icon: '📝', title: '记录10条',       desc: '累计记录10条心情',     check: (r: number) => r >= 10 },
  { id: 'records_30',        icon: '📖', title: '记录30条',       desc: '累计记录30条心情',     check: (r: number) => r >= 30 },
  { id: 'records_100',       icon: '📚', title: '记录100条',      desc: '累计记录100条心情',    check: (r: number) => r >= 100 },
  { id: 'all_moods',         icon: '🌈', title: '五味杂陈',       desc: '体验全部5种情绪',      check: (_r: number, opts: any) => opts.seenMoods >= 5 },
  { id: 'tag_5',             icon: '🏷️', title: '标签达人',      desc: '累计使用5个不同标签',  check: (_r: number, opts: any) => opts.uniqueTags >= 5 },
  { id: 'first_year',        icon: '⭐', title: '一周年纪念',     desc: '使用满一年',           check: (_r: number, opts: any) => opts.daysSinceFirst >= 365 },
];

export const STORAGE_KEY = 'mood_timeline_records';
export const MAX_STORAGE_BYTES = 5 * 1024 * 1024;
export const STORAGE_WARN_KEY = 'mood_timeline_storage_warn_shown';

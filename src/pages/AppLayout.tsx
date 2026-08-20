import { useState, useCallback } from 'react';
import type { EmotionRecord } from '../types';
import { useRecords } from '../hooks/useRecords';
import { useSearch } from '../hooks/useSearch';
import { getMoodOption } from '../utils/helpers';
import TodayPage from './TodayPage';
import LogPage from './LogPage';
import TimelinePage from './TimelinePage';
import CalendarPage from './CalendarPage';
import StatsPage from './StatsPage';
import AIInsightPage from './AIInsightPage';
import MemoryPage from './MemoryPage';
import AchievementsPage from './AchievementsPage';
import BackupPage from './BackupPage';
import SettingsPage from './SettingsPage';

type Page = 'today' | 'log' | 'timeline' | 'calendar' | 'stats' | 'insight' | 'memory' | 'achievements' | 'settings';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  records: EmotionRecord[];
}

const NAV_ITEMS: { key: Page; label: string; icon: string }[] = [
  { key: 'today',       label: '今日',      icon: '◉' },
  { key: 'log',         label: '记录',      icon: '✏' },
  { key: 'timeline',    label: '时间线',    icon: '◷' },
  { key: 'calendar',    label: '情绪日历',  icon: '▦' },
  { key: 'stats',       label: '统计',      icon: '◈' },
  { key: 'insight',     label: '洞察',      icon: '✦' },
  { key: 'memory',      label: '回忆',      icon: '◐' },
  { key: 'achievements',label: '成就',      icon: '★' },
  { key: 'settings',    label: '设置',      icon: '⚙' },
];

export default function AppLayout({ currentPage, onNavigate, records }: Props) {
  const { keyword, setKeyword, moodFilter, setMoodFilter, tagFilter, setTagFilter, allTags, filtered, clearFilters } = useSearch(records);
  const [searchOpen, setSearchOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'today':       return <TodayPage records={records} />;
      case 'log':         return <LogPage />;
      case 'timeline':    return <TimelinePage records={filtered} />;
      case 'calendar':    return <CalendarPage records={records} onNavigate={onNavigate} />;
      case 'stats':       return <StatsPage records={records} />;
      case 'insight':     return <AIInsightPage records={records} />;
      case 'memory':      return <MemoryPage records={records} />;
      case 'achievements':return <AchievementsPage records={records} />;
      case 'settings':    return <SettingsPage records={records} />;
      default:            return null;
    }
  };

  const activeItem = NAV_ITEMS.find(n => n.key === currentPage);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAF6F1' }}>

      {/* Desktop sidebar */}
      <aside style={{
        position: 'sticky', top: 0, height: '100vh', width: 200, flexShrink: 0,
        background: '#FFFFFF', borderRight: '1px solid #EDE8E0',
        display: 'flex', flexDirection: 'column', padding: '20px 0', zIndex: 40,
      }}>
        <div style={{ padding: '0 16px 16px', borderBottom: '1px solid #F0ECE4', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: 'linear-gradient(135deg, #8B7EC8 0%, #A898D8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: '#fff', fontWeight: 600, fontFamily: "'Playfair Display', serif",
            }}>心</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#3D3935', margin: 0, fontFamily: "'Playfair Display', serif", letterSpacing: '-0.01em', lineHeight: 1.2 }}>心迹</p>
              <p style={{ fontSize: 8, color: '#B8B0A8', margin: '1px 0 0 0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Mood Timeline</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {NAV_ITEMS.map(item => {
            const active = currentPage === item.key;
            return (
              <button key={item.key} onClick={() => onNavigate(item.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: active ? '#F5F0FA' : 'transparent',
                  color: active ? '#7C5CBF' : '#9E9890',
                  fontSize: 12, fontWeight: active ? 600 : 400,
                  fontFamily: 'inherit', textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: active ? 'inset 3px 0 0 #8B7EC8' : 'none',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#FAFAF8'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 13, width: 16, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #F0ECE4' }}>
          <p style={{ fontSize: 9, color: '#B8B0A8', margin: 0, lineHeight: 1.5 }}>
            共 <span style={{ color: '#8B7EC8', fontWeight: 600 }}>{records.length}</span> 条记录
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          padding: '14px 28px',
          borderBottom: '1px solid #F0ECE4',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 500, color: '#3D3935', margin: 0, fontFamily: "'Playfair Display', serif", letterSpacing: '-0.01em' }}>
              {activeItem?.label}
            </p>
            <p className="page-subtitle" style={{ marginTop: 1 }}>
              {currentPage === 'today' && '今日概览'}
              {currentPage === 'log' && '创建新记录'}
              {currentPage === 'timeline' && '浏览历史记录'}
              {currentPage === 'calendar' && '按月查看情绪分布'}
              {currentPage === 'stats' && '数据洞察与趋势'}
              {currentPage === 'insight' && 'AI 情绪分析'}
              {currentPage === 'memory' && '回顾过去的轨迹'}
              {currentPage === 'achievements' && '你的里程碑'}
              {currentPage === 'settings' && '数据与隐私'}
            </p>
          </div>
          {(currentPage === 'timeline' || currentPage === 'log') && records.length > 0 && (
            <button onClick={() => setSearchOpen(true)} style={{
              padding: '6px 12px', borderRadius: 8, border: '1px solid #E8E2D8', background: '#fff',
              color: '#7A756D', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>⊙ 筛选</button>
          )}
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '20px 28px', overflowY: 'auto' }}>
          {renderPage()}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
        borderTop: '1px solid #EDE8E0',
        display: 'none', alignItems: 'center', justifyContent: 'space-around',
        padding: '6px 0 env(safe-area-inset-bottom, 6px)',
        zIndex: 40,
      }}>
        {NAV_ITEMS.map(item => {
          const active = currentPage === item.key;
          return (
            <button key={item.key} onClick={() => onNavigate(item.key)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                padding: '4px 8px', border: 'none', background: 'transparent',
                cursor: 'pointer', color: active ? '#7C5CBF' : '#B8B0A8',
                fontSize: 9, fontWeight: active ? 600 : 400, fontFamily: 'inherit',
                transition: 'color 0.15s',
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: 9 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#FAF6F1', animation: 'fadeInUp 0.2s ease', overflowY: 'auto' }}>
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#3D3935', margin: 0 }}>筛选与搜索</p>
              <button onClick={() => setSearchOpen(false)} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #E8E2D8', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9E9890', fontSize: 12 }}>✕</button>
            </div>
            <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="搜索随笔内容…"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #E8E2D8', background: '#fff', fontSize: 13, color: '#3D3935', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 16 }}
              onFocus={e => { e.currentTarget.style.borderColor = '#8B7EC8'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,126,200,0.1)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E8E2D8'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 500, color: '#9E9890', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>情绪</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => setMoodFilter(null)} style={{ padding: '5px 12px', borderRadius: 20, border: moodFilter === null ? '1.5px solid #8B7EC8' : '1.5px solid #E8E2D8', background: moodFilter === null ? '#F5F0FA' : '#fff', color: moodFilter === null ? '#8B7EC8' : '#9E9890', fontSize: 11, fontWeight: moodFilter === null ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>全部</button>
                {[1,2,3,4,5].map(m => {
                  const opt = getMoodOption(m);
                  return (
                    <button key={m} onClick={() => setMoodFilter(moodFilter === m ? null : m)} style={{ padding: '5px 10px', borderRadius: 20, border: moodFilter === m ? `1.5px solid ${opt?.color}` : '1.5px solid #E8E2D8', background: moodFilter === m ? (opt?.bg ?? '#fff') : '#fff', color: moodFilter === m ? (opt?.color ?? '#7A756D') : '#9E9890', fontSize: 11, fontWeight: moodFilter === m ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>{opt?.emoji}</span>{opt?.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {allTags.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 10, fontWeight: 500, color: '#9E9890', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>标签</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <button onClick={() => setTagFilter(null)} style={{ padding: '4px 10px', borderRadius: 20, border: '1px solid #E8E2D8', background: '#fff', color: '#7A756D', fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>全部</button>
                  {allTags.map(t => (
                    <button key={t} onClick={() => setTagFilter(tagFilter === t ? null : t)} style={{ padding: '4px 10px', borderRadius: 20, border: tagFilter === t ? '1.5px solid #8B7EC8' : '1px solid #E8E2D8', background: tagFilter === t ? '#F5F0FA' : '#fff', color: tagFilter === t ? '#8B7EC8' : '#7A756D', fontSize: 10, fontWeight: tagFilter === t ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>{t}</button>
                  ))}
                </div>
              </div>
            )}
            {(keyword || moodFilter !== null || tagFilter) && (
              <button onClick={clearFilters} style={{ fontSize: 11, color: '#B8B0A8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}>清除筛选</button>
            )}
            <p style={{ fontSize: 11, color: '#C8C0B8', marginTop: 8 }}>筛选结果：{filtered.length} 条</p>
          </div>
        </div>
      )}
    </div>
  );
}

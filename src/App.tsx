import React from 'react';
import { useState } from 'react';
import { RecordsProvider, useRecords } from './hooks/useRecords';
import AppLayout from './pages/AppLayout';
import type { EmotionRecord } from './types';

export default function App() {
  return (
    <RecordsProvider>
      <AppContent />
    </RecordsProvider>
  );
}

function AppContent() {
  const { records } = useRecords();
  const [currentPage, setCurrentPage] = useState<'today' | 'log' | 'timeline' | 'calendar' | 'stats' | 'insight' | 'memory' | 'achievements' | 'settings'>('today');

  return (
    <AppLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      records={records as EmotionRecord[]}
    />
  );
}

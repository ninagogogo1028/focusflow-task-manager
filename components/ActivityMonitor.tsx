import React from 'react';
import { useI18n } from '../i18n';

const ActivityMonitor: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const { t } = useI18n();
  return <button onClick={onOpen} className="flex items-center gap-2 bg-indigo-600 text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold hover:bg-indigo-700 transition-colors"><span>✦</span><span className="hidden md:inline">{t('capture')}</span></button>;
};

export default ActivityMonitor;

import React from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      aria-label="حالة الاتصال"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl border border-amber-400/40 animate-fade-in"
    >
      <WifiOff className="w-4 h-4 animate-pulse text-amber-200" />
      <div>
        <span>وضع عدم الاتصال (Offline)</span>
        <span className="block text-[11px] font-normal text-amber-100">
          قاعدة القرآن الكاملة والبحث الصرفي تعمل دون الحاجة لشبكة الإنترنت
        </span>
      </div>
    </aside>
  );
};

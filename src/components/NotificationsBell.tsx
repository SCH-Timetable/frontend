import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '../theme';
import { notifications as notifApi, type Notification } from '../api/client';

interface Props {
  email: string | null;
  role: string | null;
}

const TYPE_COLOR: Record<string, string> = {
  publish: '#10b981',
  timetable_change: '#f59e0b',
  conflict: '#ef4444',
  info: '#38bdf8',
};

export default function NotificationsBell({ email, role }: Props) {
  const { tokens: C } = useTheme();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const list = await notifApi.list({ email: email ?? undefined, role: role ?? undefined });
      setItems(Array.isArray(list) ? list : []);
    } catch { /* offline — keep last state */ }
  }, [email, role]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open ]);

  const unread = items.filter(n => !n.read).length;

  const markRead = async (id: string) => {
    setItems(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    try { await notifApi.markRead(id); } catch { /* offline */ }
  };

  const markAll = async () => {
    const ids = items.filter(n => !n.read).map(n => n.id);
    setItems(prev => prev.map(n => ({ ...n, read: true })));
    try { await Promise.all(ids.map(id => notifApi.markRead(id))); } catch { /* offline */ }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(o => !o); if (!open) void load(); }}
        className="relative flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:opacity-70"
        style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textMuted }}
        title="Notifications"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path d="M8 1.5a4.5 4.5 0 00-4.5 4.5c0 4-1.5 5-1.5 5h12s-1.5-1-1.5-5A4.5 4.5 0 008 1.5zM6.5 13.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center"
            style={{ background: '#ef4444', color: '#fff', fontFamily: 'DM Mono, monospace' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden z-50 flex flex-col"
          style={{ background: C.surfaceRaised, border: `1px solid ${C.border}`, width: 320, maxHeight: 380, boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
          <div className="flex items-center justify-between px-3 py-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
            <span className="text-[11px] font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>
              Notifications {unread > 0 && <span style={{ color: C.textMuted }}>({unread} unread)</span>}
            </span>
            {unread > 0 && (
              <button onClick={markAll} className="text-[10px] hover:opacity-70" style={{ color: C.accent }}>
                Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto">
            {items.length === 0 && (
              <div className="text-center py-8 text-xs" style={{ color: C.textMuted }}>No notifications yet.</div>
            )}
            {items.map(n => (
              <button key={n.id} onClick={() => { if (!n.read) void markRead(n.id); }}
                className="w-full text-left px-3 py-2.5 transition-all hover:opacity-80"
                style={{ borderBottom: `1px solid ${C.borderSub}`, background: n.read ? 'transparent' : C.accentBg }}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLOR[n.type] ?? C.accent }} />
                  <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: TYPE_COLOR[n.type] ?? C.accent, fontFamily: 'DM Mono, monospace' }}>
                    {n.type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[8px] ml-auto flex-shrink-0" style={{ color: C.textMuted }}>
                    {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                  </span>
                </div>
                <div className="text-[11px] leading-snug" style={{ color: C.textSub }}>{n.message}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

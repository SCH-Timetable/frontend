import { useState, useMemo } from 'react';
import { useTheme } from './theme';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';

// ─── Data ──────────────────────────────────────────────────────────────────────
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAYS_FULL  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const HOURS      = Array.from({ length: 11 }, (_, i) => i + 8); // 08–18

interface CourseEvent {
  id: string;
  code: string;
  name: string;
  type: 'Lecture' | 'Lab' | 'Seminar' | 'Tutorial';
  day: number;
  startHour: number;
  duration: number;
  room: string;
  building: string;
  staff: string;
  group: string;
  color: string;
  colorDim: string;
}

const STUDENT_EVENTS: CourseEvent[] = [
  { id:'e1', code:'CS301',   name:'Algorithms & Complexity', type:'Lecture',  day:0, startHour:9,  duration:1, room:'LT-101',  building:'Alan Turing Building',   staff:'Dr. Chen Wei',         group:'CS-3A',   color:'#3b82f6', colorDim:'rgba(59,130,246,0.14)'  },
  { id:'e2', code:'CS301',   name:'Algorithms & Complexity', type:'Tutorial', day:2, startHour:11, duration:1, room:'SEM-A',   building:'Alan Turing Building',   staff:'Dr. Chen Wei',         group:'CS-3A',   color:'#3b82f6', colorDim:'rgba(59,130,246,0.14)'  },
  { id:'e3', code:'MATH201', name:'Linear Algebra',          type:'Lecture',  day:1, startHour:9,  duration:2, room:'LT-201',  building:'Alan Turing Building',   staff:'Prof. Sara Johansson', group:'CS-3A',   color:'#8b5cf6', colorDim:'rgba(139,92,246,0.14)'  },
  { id:'e4', code:'CS401',   name:'ML Foundations',          type:'Lecture',  day:3, startHour:10, duration:2, room:'LT-101',  building:'Alan Turing Building',   staff:'Dr. Lena Kovač',       group:'CS-3A',   color:'#06b6d4', colorDim:'rgba(6,182,212,0.14)'   },
  { id:'e5', code:'CS401',   name:'ML Foundations',          type:'Lab',      day:4, startHour:14, duration:3, room:'CS-Lab1', building:'Lovelace Computing Hub', staff:'Dr. Lena Kovač',       group:'CS-3A',   color:'#06b6d4', colorDim:'rgba(6,182,212,0.14)'   },
  { id:'e6', code:'CS501',   name:'Distributed Systems',     type:'Seminar',  day:1, startHour:14, duration:2, room:'SEM-A',   building:'Alan Turing Building',   staff:'Dr. Lena Kovač',       group:'CS-3A',   color:'#10b981', colorDim:'rgba(16,185,129,0.14)'  },
  { id:'e7', code:'MATH201', name:'Linear Algebra',          type:'Tutorial', day:4, startHour:10, duration:1, room:'SEM-B',   building:'Alan Turing Building',   staff:'Prof. Sara Johansson', group:'CS-3A',   color:'#8b5cf6', colorDim:'rgba(139,92,246,0.14)'  },
];

const LECTURER_EVENTS: CourseEvent[] = [
  { id:'l1', code:'CS301',  name:'Algorithms & Complexity',  type:'Lecture',  day:0, startHour:9,  duration:1, room:'LT-101', building:'Alan Turing Building', staff:'Dr. Chen Wei', group:'CS-3A',   color:'#3b82f6', colorDim:'rgba(59,130,246,0.14)'  },
  { id:'l2', code:'CS201',  name:'Data Structures',          type:'Lecture',  day:1, startHour:10, duration:2, room:'LT-102', building:'Alan Turing Building', staff:'Dr. Chen Wei', group:'CS-2A',   color:'#f59e0b', colorDim:'rgba(245,158,11,0.14)'   },
  { id:'l3', code:'CS301',  name:'Algorithms & Complexity',  type:'Tutorial', day:2, startHour:11, duration:1, room:'SEM-A',  building:'Alan Turing Building', staff:'Dr. Chen Wei', group:'CS-3A',   color:'#3b82f6', colorDim:'rgba(59,130,246,0.14)'  },
  { id:'l4', code:'CS601',  name:'Research Methods',         type:'Seminar',  day:0, startHour:14, duration:2, room:'SEM-B',  building:'Alan Turing Building', staff:'Dr. Chen Wei', group:'PhD-1',   color:'#ec4899', colorDim:'rgba(236,72,153,0.14)'   },
  { id:'l5', code:'CS201',  name:'Data Structures',          type:'Tutorial', day:3, startHour:9,  duration:1, room:'SEM-C',  building:'Alan Turing Building', staff:'Dr. Chen Wei', group:'CS-2B',   color:'#f59e0b', colorDim:'rgba(245,158,11,0.14)'   },
  { id:'l6', code:'CS601',  name:'Research Methods',         type:'Seminar',  day:4, startHour:10, duration:2, room:'SEM-B',  building:'Alan Turing Building', staff:'Dr. Chen Wei', group:'PhD-1',   color:'#ec4899', colorDim:'rgba(236,72,153,0.14)'   },
  { id:'l7', code:'CS301',  name:'Algorithms — Q&A Drop-in', type:'Tutorial', day:4, startHour:13, duration:1, room:'LT-102', building:'Alan Turing Building', staff:'Dr. Chen Wei', group:'CS-3A/B', color:'#3b82f6', colorDim:'rgba(59,130,246,0.14)'  },
];

const TYPE_CFG: Record<string, { bg: string; text: string }> = {
  Lecture:  { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa' },
  Lab:      { bg: 'rgba(6,182,212,0.15)',   text: '#22d3ee' },
  Seminar:  { bg: 'rgba(16,185,129,0.15)',  text: '#34d399' },
  Tutorial: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
};

// ─── Analytics data ───────────────────────────────────────────────────────────
const UTILISATION_DATA = [
  { day: 'Mon', utilisation: 78, capacity: 91 },
  { day: 'Tue', utilisation: 85, capacity: 95 },
  { day: 'Wed', utilisation: 62, capacity: 80 },
  { day: 'Thu', utilisation: 91, capacity: 98 },
  { day: 'Fri', utilisation: 54, capacity: 70 },
];

const PEAK_HOURS_DATA = [
  { hour: '08:00', sessions: 4  },
  { hour: '09:00', sessions: 18 },
  { hour: '10:00', sessions: 24 },
  { hour: '11:00', sessions: 22 },
  { hour: '12:00', sessions: 8  },
  { hour: '13:00', sessions: 10 },
  { hour: '14:00', sessions: 21 },
  { hour: '15:00', sessions: 19 },
  { hour: '16:00', sessions: 13 },
  { hour: '17:00', sessions: 5  },
];

const CAPACITY_WASTE_DATA = [
  { room: 'LT-101',  capacity: 240, enrolled: 198, waste: 17 },
  { room: 'LT-201',  capacity: 300, enrolled: 276, waste: 8  },
  { room: 'CS-Lab1', capacity: 60,  enrolled: 57,  waste: 5  },
  { room: 'SEM-A',   capacity: 30,  enrolled: 22,  waste: 27 },
  { room: 'LT-102',  capacity: 120, enrolled: 89,  waste: 26 },
  { room: 'Phys-Lab',capacity: 48,  enrolled: 31,  waste: 35 },
];

// ─── Notification banners ─────────────────────────────────────────────────────
interface Notification {
  id: string;
  type: 'schedule_change' | 'room_swap' | 'cancellation' | 'info';
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

const INITIAL_NOTIFS: Notification[] = [
  { id:'n1', type:'schedule_change', title:'Timetable Updated',        body:'CS401 ML Foundations Lab moved from CS-Lab2 to CS-Lab1. Check new room.',                    time:'Today, 09:14',     unread: true  },
  { id:'n2', type:'room_swap',       title:'Room Change — Wed 11:00',  body:'SEM-B under maintenance. Tutorial CS301 relocated to SEM-C, Alan Turing Building, Floor 2.', time:'Yesterday, 16:32', unread: true  },
  { id:'n3', type:'cancellation',    title:'Session Cancelled',         body:'MATH201 Tutorial on Fri 10:00 cancelled by Prof. Johansson. No replacement scheduled.',       time:'2 days ago',       unread: false },
  { id:'n4', type:'info',            title:'Semester 2 Published',      body:'The Semester 2 timetable is now live. Download ICS or view in-app.',                         time:'3 days ago',       unread: false },
];

const NOTIF_CFG = {
  schedule_change: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  icon: '📅' },
  room_swap:       { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  icon: '🏛️' },
  cancellation:    { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   icon: '⚠️' },
  info:            { color: '#10b981', bg: 'rgba(16,185,129,0.08)',  icon: 'ℹ️' },
};

// ─── Availability grid (lecturer only) ───────────────────────────────────────
type SlotState = 'available' | 'preferred' | 'unavailable';

const SLOT_CFG: Record<SlotState, { label: string; color: string; bg: string }> = {
  available:   { label: 'Available',   color: '#64748b', bg: 'transparent'            },
  preferred:   { label: 'Preferred',   color: '#10b981', bg: 'rgba(16,185,129,0.18)' },
  unavailable: { label: 'Unavailable', color: '#ef4444', bg: 'rgba(239,68,68,0.15)'  },
};

function initSlots(): Record<string, SlotState> {
  const slots: Record<string, SlotState> = {};
  DAYS_SHORT.forEach((_, di) => {
    HOURS.forEach(h => {
      // Pre-seed some unavailabilities for realism
      if (di === 0 && h >= 8 && h <= 9)  slots[`${di}-${h}`] = 'unavailable';
      else if (di === 4 && h >= 16)       slots[`${di}-${h}`] = 'unavailable';
      else if (h === 9 || h === 10)       slots[`${di}-${h}`] = 'preferred';
      else                                 slots[`${di}-${h}`] = 'available';
    });
  });
  return slots;
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function TypePill({ type }: { type: string }) {
  const { tokens: C } = useTheme();
  const s = TYPE_CFG[type] ?? { bg: C.accentBg, text: C.textSub };
  return (
    <span
      className="inline-flex items-center px-1.5 py-px rounded text-[9px] font-semibold uppercase tracking-wider"
      style={{ background: s.bg, color: s.text }}
    >
      {type}
    </span>
  );
}

// ─── Notification banner ──────────────────────────────────────────────────────
function NotificationBanner({ notif, onDismiss }: { notif: Notification; onDismiss: (id: string) => void }) {
  const { tokens: C } = useTheme();
  const cfg = NOTIF_CFG[notif.type];
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-xl"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.color}35`,
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.4 }}>{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>{notif.title}</span>
          {notif.unread && (
            <span
              className="mono text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase"
              style={{ background: cfg.color, color: '#fff' }}
            >
              NEW
            </span>
          )}
          <span className="mono text-[9px] ml-auto" style={{ color: C.textMuted }}>{notif.time}</span>
        </div>
        <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: C.textMuted, fontFamily: 'Inter, sans-serif' }}>
          {notif.body}
        </p>
      </div>
      <button
        onClick={() => onDismiss(notif.id)}
        className="mono text-[10px] flex-shrink-0 hover:opacity-60 transition-opacity mt-0.5"
        style={{ color: C.textMuted }}
      >
        ✕
      </button>
    </div>
  );
}

// ─── Event detail modal ───────────────────────────────────────────────────────
function EventDetailModal({ ev, onClose }: { ev: CourseEvent; onClose: () => void }) {
  const { tokens: C } = useTheme();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7,10,18,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="px-5 py-4 relative" style={{ background: ev.colorDim, borderBottom: `1px solid ${ev.color}30` }}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-6 h-6 rounded flex items-center justify-center text-xs hover:opacity-60 transition-opacity"
            style={{ color: C.textMuted }}
          >
            ✕
          </button>
          <TypePill type={ev.type} />
          <h3 className="text-base font-bold mt-2" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>{ev.name}</h3>
          <div className="mono text-xs mt-0.5" style={{ color: ev.color }}>{ev.code} · {ev.group}</div>
        </div>
        <div className="px-5 py-4 space-y-2.5">
          {[
            { label: 'Day & Time', value: `${DAYS_FULL[ev.day]} · ${String(ev.startHour).padStart(2,'0')}:00 – ${String(ev.startHour + ev.duration).padStart(2,'0')}:00` },
            { label: 'Room',      value: ev.room      },
            { label: 'Building',  value: ev.building  },
            { label: 'Staff',     value: ev.staff     },
            { label: 'Group',     value: ev.group     },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <span className="mono text-[9px] uppercase tracking-widest flex-shrink-0" style={{ color: C.textMuted }}>{label}</span>
              <span className="text-xs text-right" style={{ color: C.textSub, fontFamily: 'Inter, sans-serif' }}>{value}</span>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 flex gap-2">
          <button
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: C.accentBg, color: C.accent, border: `1px solid ${C.accent}30`, fontFamily: 'Outfit, sans-serif' }}
          >
            📍 Directions
          </button>
          <button
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: C.surface, color: C.textSub, border: `1px solid ${C.border}`, fontFamily: 'Outfit, sans-serif' }}
          >
            📆 Add to Cal
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar event card ──────────────────────────────────────────────────────
function EventCard({ ev, onClick }: { ev: CourseEvent; onClick: (ev: CourseEvent) => void }) {
  const { tokens: C } = useTheme();
  const topPct    = ((ev.startHour - 8) / 10) * 100;
  const heightPct = (ev.duration / 10) * 100;
  return (
    <button
      onClick={() => onClick(ev)}
      className="absolute left-1 right-1 rounded-lg overflow-hidden text-left transition-all hover:brightness-110 hover:z-20 group"
      style={{
        top: `${topPct}%`,
        height: `${heightPct}%`,
        background: ev.colorDim,
        border: `1px solid ${ev.color}44`,
        borderLeft: `3px solid ${ev.color}`,
        zIndex: 5,
        minHeight: 28,
      }}
    >
      <div className="px-2 py-1.5 h-full flex flex-col justify-between">
        <div>
          <div className="mono text-[9px] font-semibold" style={{ color: ev.color }}>{ev.code}</div>
          {ev.duration >= 1 && (
            <div className="text-[11px] font-semibold leading-tight mt-0.5 truncate" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>
              {ev.name}
            </div>
          )}
          {ev.duration >= 1.5 && <TypePill type={ev.type} />}
        </div>
        {ev.duration >= 1 && (
          <div className="mono text-[9px] mt-1" style={{ color: C.textMuted }}>{ev.room}</div>
        )}
      </div>
    </button>
  );
}

// ─── Weekly calendar view ─────────────────────────────────────────────────────
function WeeklyCalendar({ events, role }: { events: CourseEvent[]; role: 'student' | 'staff' }) {
  const { tokens: C } = useTheme();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CourseEvent | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekLabel = weekOffset === 0 ? 'Week 3 (current)' : weekOffset > 0 ? `Week ${3 + weekOffset}` : `Week ${3 + weekOffset}`;

  const visibleDays = selectedDay !== null ? [selectedDay] : [0, 1, 2, 3, 4];

  const generateICS = () => {
    const dayDates = ['20260119', '20260120', '20260121', '20260122', '20260123'];
    const hh = (h: number) => String(h).padStart(2, '0');
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bua University//EN', 'CALSCALE:GREGORIAN',
      ...events.flatMap(ev => [
        'BEGIN:VEVENT',
        `UID:${ev.id}@bua.edu.eg`,
        'DTSTAMP:20260115T080000Z',
        `DTSTART:${dayDates[ev.day]}T${hh(ev.startHour)}0000`,
        `DTEND:${dayDates[ev.day]}T${hh(ev.startHour + ev.duration)}0000`,
        `SUMMARY:${ev.code} ${ev.name}`,
        `LOCATION:${ev.room}\\, ${ev.building}`,
        `DESCRIPTION:${ev.type} · ${ev.staff} · ${ev.group}`,
        'END:VEVENT',
      ]),
      'END:VCALENDAR',
    ];
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'timetable.ics'; a.click();
    URL.revokeObjectURL(url);
  };

  const totalHours = events.reduce((n, e) => n + e.duration, 0);

  return (
    <>
      {selectedEvent && <EventDetailModal ev={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      {/* Calendar toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(o => o - 1)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textMuted }}
          >
            ‹
          </button>
          <span className="mono text-xs font-semibold" style={{ color: C.textSub }}>{weekLabel}</span>
          <button
            onClick={() => setWeekOffset(o => o + 1)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textMuted }}
          >
            ›
          </button>
        </div>

        {/* Day filter pills */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedDay(null)}
            className="mono text-[9px] px-2.5 py-1 rounded-full transition-all"
            style={{
              background: selectedDay === null ? C.accent : C.surface,
              color: selectedDay === null ? '#fff' : C.textMuted,
              border: `1px solid ${selectedDay === null ? C.accent : C.border}`,
            }}
          >
            All
          </button>
          {DAYS_SHORT.map((d, i) => (
            <button
              key={d}
              onClick={() => setSelectedDay(selectedDay === i ? null : i)}
              className="mono text-[9px] px-2.5 py-1 rounded-full transition-all"
              style={{
                background: selectedDay === i ? C.accent : C.surface,
                color: selectedDay === i ? '#fff' : C.textMuted,
                border: `1px solid ${selectedDay === i ? C.accent : C.border}`,
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Export actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textSub, fontFamily: 'Inter, sans-serif' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="2" y="1" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.1" />
              <path d="M2 5h8v5a1 1 0 01-1 1H3a1 1 0 01-1-1V5z" stroke="currentColor" strokeWidth="1.1" />
              <path d="M4 8h4M4 10h2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
            Print
          </button>
          <button
            onClick={generateICS}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
            style={{ background: C.accent, color: '#fff', fontFamily: 'Inter, sans-serif' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v7M3 6l3 3 3-3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1 10h10" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Export ICS
          </button>
        </div>
      </div>

      {/* Week stats strip */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Sessions',    value: events.length           },
          { label: 'Hours / wk',  value: totalHours              },
          { label: 'Modules',     value: new Set(events.map(e => e.code)).size },
          { label: 'Rooms',       value: new Set(events.map(e => e.room)).size },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl px-3 py-2.5 text-center"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          >
            <div className="mono text-lg font-bold leading-none" style={{ color: C.text }}>{value}</div>
            <div className="mono text-[9px] mt-1 uppercase tracking-wider" style={{ color: C.textMuted }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div
        className="rounded-2xl overflow-hidden flex-1"
        style={{ border: `1px solid ${C.border}`, background: C.surface }}
      >
        {/* Day headers */}
        <div className="flex" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="w-14 flex-shrink-0" />
          {visibleDays.map(di => (
            <div
              key={di}
              className="flex-1 text-center py-2.5"
              style={{ borderLeft: `1px solid ${C.border}` }}
            >
              <div className="mono text-[9px] uppercase tracking-widest" style={{ color: C.textMuted }}>{DAYS_SHORT[di]}</div>
              <div className="text-xs font-bold mt-0.5" style={{ fontFamily: 'Outfit, sans-serif', color: C.textSub }}>
                {['22', '23', '24', '25', '26'][di]} Sep
              </div>
            </div>
          ))}
        </div>

        {/* Grid body */}
        <div className="flex overflow-y-auto" style={{ maxHeight: 480 }}>
          {/* Hour labels */}
          <div className="flex-shrink-0 w-14" style={{ borderRight: `1px solid ${C.border}` }}>
            {HOURS.map(h => (
              <div
                key={h}
                className="mono text-[9px] text-right pr-2 flex items-start justify-end"
                style={{ height: 56, color: C.textMuted, paddingTop: 4, borderBottom: `1px solid ${C.borderSub}` }}
              >
                {String(h).padStart(2,'0')}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {visibleDays.map(di => {
            const dayEvents = events.filter(e => e.day === di);
            return (
              <div
                key={di}
                className="flex-1 relative"
                style={{ borderLeft: `1px solid ${C.border}` }}
              >
                {HOURS.map(h => (
                  <div
                    key={h}
                    style={{
                      height: 56,
                      borderBottom: `1px solid ${C.borderSub}`,
                    }}
                  />
                ))}
                {/* Events positioned absolutely */}
                <div className="absolute inset-0">
                  {dayEvents.map(ev => (
                    <EventCard key={ev.id} ev={ev} onClick={setSelectedEvent} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Availability constraints (staff only) ────────────────────────────────────
function AvailabilityView() {
  const { tokens: C } = useTheme();
  const [slots, setSlots] = useState<Record<string, SlotState>>(initSlots);
  const [activeBrush, setActiveBrush] = useState<SlotState>('unavailable');
  const [isDragging, setIsDragging] = useState(false);
  const [saved, setSaved] = useState(false);

  const cycle = (key: string) => {
    setSlots(s => {
      const cur = s[key] ?? 'available';
      const next: SlotState = cur === 'available' ? activeBrush : cur === activeBrush ? 'available' : activeBrush;
      return { ...s, [key]: next };
    });
  };

  const paint = (key: string) => {
    if (!isDragging) return;
    setSlots(s => ({ ...s, [key]: activeBrush }));
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const counts = useMemo(() => ({
    preferred:   Object.values(slots).filter(s => s === 'preferred').length,
    unavailable: Object.values(slots).filter(s => s === 'unavailable').length,
  }), [slots]);

  const clearAll = () => {
    setSlots(s => Object.fromEntries(Object.keys(s).map(k => [k, 'available'])));
  };

  return (
    <div>
      {/* Info banner */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5"
        style={{ background: C.accentBg, border: `1px solid ${C.accent}40` }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="8" cy="8" r="6.5" stroke={C.accent} strokeWidth="1.2" />
          <path d="M8 5v.5M8 7.5v4" stroke={C.accent} strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <p className="text-xs leading-relaxed" style={{ color: C.textSub, fontFamily: 'Inter, sans-serif' }}>
          Set your <strong style={{ color: C.text }}>preferred</strong> and <strong style={{ color: C.text }}>unavailable</strong> slots for the scheduler engine. These act as soft constraints — the engine will respect them unless no other option exists. Changes apply from next draft onwards.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="mono text-[9px] uppercase tracking-widest" style={{ color: C.textMuted }}>Brush:</span>
          {(['preferred', 'unavailable'] as SlotState[]).map(s => {
            const cfg = SLOT_CFG[s];
            return (
              <button
                key={s}
                onClick={() => setActiveBrush(s)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: activeBrush === s ? cfg.bg : 'transparent',
                  color: activeBrush === s ? cfg.color : C.textMuted,
                  border: `1px solid ${activeBrush === s ? cfg.color + '60' : C.border}`,
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                <span className="w-2 h-2 rounded-sm" style={{ background: cfg.color }} />
                {cfg.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="mono text-[10px]" style={{ color: C.textMuted }}>
            {counts.preferred} preferred · {counts.unavailable} unavailable
          </span>
          <button
            onClick={clearAll}
            className="mono text-[10px] px-2.5 py-1 rounded-lg transition-all hover:opacity-70"
            style={{ background: C.surface, color: C.textMuted, border: `1px solid ${C.border}` }}
          >
            Clear all
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: saved ? C.success : C.accent, color: '#fff', fontFamily: 'Outfit, sans-serif' }}
          >
            {saved ? '✓ Saved' : 'Save Constraints'}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div
        className="rounded-2xl overflow-hidden select-none"
        style={{ border: `1px solid ${C.border}` }}
        onMouseLeave={() => setIsDragging(false)}
        onMouseUp={() => setIsDragging(false)}
      >
        {/* Day headers */}
        <div className="flex" style={{ borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt }}>
          <div className="w-16 flex-shrink-0 py-2.5 px-3 mono text-[9px] uppercase tracking-widest" style={{ color: C.textMuted }}>Time</div>
          {DAYS_FULL.map(d => (
            <div
              key={d}
              className="flex-1 text-center py-2.5 text-xs font-semibold"
              style={{ color: C.textSub, fontFamily: 'Outfit, sans-serif', borderLeft: `1px solid ${C.border}` }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Hour rows */}
        {HOURS.map(h => (
          <div key={h} className="flex" style={{ borderBottom: `1px solid ${C.borderSub}` }}>
            <div
              className="w-16 flex-shrink-0 flex items-center px-3 mono text-[9px]"
              style={{ color: C.textMuted, borderRight: `1px solid ${C.border}`, height: 40 }}
            >
              {String(h).padStart(2,'0')}:00
            </div>
            {DAYS_SHORT.map((_, di) => {
              const key = `${di}-${h}`;
              const state = slots[key] ?? 'available';
              const cfg = SLOT_CFG[state];
              return (
                <div
                  key={di}
                  className="flex-1 flex items-center justify-center cursor-pointer transition-all hover:brightness-95"
                  style={{
                    height: 40,
                    background: cfg.bg,
                    borderLeft: `1px solid ${C.border}`,
                    borderRight: state !== 'available' ? `2px solid ${cfg.color}60` : undefined,
                  }}
                  onMouseDown={() => { setIsDragging(true); cycle(key); }}
                  onMouseEnter={() => paint(key)}
                >
                  {state !== 'available' && (
                    <span className="mono text-[8px] font-bold uppercase" style={{ color: cfg.color }}>
                      {state === 'preferred' ? '★' : '✕'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        {Object.entries(SLOT_CFG).map(([state, cfg]) => (
          <div key={state} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: cfg.bg || C.surfaceAlt, border: `1px solid ${cfg.color}60` }} />
            <span className="mono text-[9px]" style={{ color: C.textMuted }}>{cfg.label}</span>
          </div>
        ))}
        <span className="mono text-[9px] ml-2" style={{ color: C.textMuted }}>Click or drag to paint slots</span>
      </div>
    </div>
  );
}

// ─── Analytics dashboard ──────────────────────────────────────────────────────
function AnalyticsView({ role }: { role: 'student' | 'staff' }) {
  const { tokens: C } = useTheme();

  const tooltipStyle = {
    contentStyle: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, color: C.text },
    labelStyle:   { color: C.textMuted, fontFamily: 'DM Mono, monospace', fontSize: 10 },
    cursor:       { fill: C.accentBg },
  };

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Avg Room Utilisation', value: '74%',  sub: '+3% vs last week', color: C.success  },
          { label: 'Capacity Waste',        value: '19%',  sub: '~41 seats wasted',  color: C.warning  },
          { label: 'Peak Hour',             value: '10:00',sub: 'Highest demand',     color: C.accent   },
          { label: 'Total Sessions / wk',   value: '142',  sub: 'Across 18 rooms',   color: C.text     },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="rounded-xl px-4 py-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="mono text-[9px] uppercase tracking-widest mb-2" style={{ color: C.textMuted }}>{label}</div>
            <div className="text-2xl font-bold leading-none" style={{ fontFamily: 'Outfit, sans-serif', color }}>{value}</div>
            <div className="mono text-[9px] mt-2" style={{ color: C.textMuted }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Weekly utilisation chart */}
      <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>
              Weekly Room Utilisation vs Capacity
            </h3>
            <p className="mono text-[9px] mt-0.5" style={{ color: C.textMuted }}>% of sessions filled · Week 3</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: C.accent }} /><span className="mono text-[9px]" style={{ color: C.textMuted }}>Utilisation</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: C.cyan }} /><span className="mono text-[9px]" style={{ color: C.textMuted }}>Capacity</span></div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={UTILISATION_DATA} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="util" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.accent} stopOpacity={0.25} />
                <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.cyan} stopOpacity={0.15} />
                <stop offset="95%" stopColor={C.cyan} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.borderSub} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: C.textMuted, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: C.textMuted, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`]} />
            <Area type="monotone" dataKey="capacity"    stroke={C.cyan}   strokeWidth={1.5} fill="url(#cap)"  dot={false} />
            <Area type="monotone" dataKey="utilisation" stroke={C.accent} strokeWidth={2}   fill="url(#util)" dot={{ fill: C.accent, r: 3, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Peak hours + Capacity waste — 2 col */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Peak demand hours */}
        <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <h3 className="text-sm font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>Peak Demand Hours</h3>
          <p className="mono text-[9px] mb-4" style={{ color: C.textMuted }}>Sessions scheduled per time slot · this week</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={PEAK_HOURS_DATA} margin={{ top: 4, right: 0, left: -24, bottom: 0 }} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderSub} vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: C.textMuted, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: C.textMuted, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="sessions" radius={[3, 3, 0, 0]}>
                {PEAK_HOURS_DATA.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.sessions >= 20 ? C.danger : entry.sessions >= 14 ? C.warning : C.accent}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Capacity waste per room */}
        <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <h3 className="text-sm font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>Capacity Waste by Room</h3>
          <p className="mono text-[9px] mb-4" style={{ color: C.textMuted }}>Empty seats as % of room capacity · avg per session</p>
          <div className="space-y-2.5">
            {CAPACITY_WASTE_DATA.map(({ room, capacity, enrolled, waste }) => {
              const color = waste >= 30 ? C.danger : waste >= 20 ? C.warning : C.success;
              return (
                <div key={room} className="flex items-center gap-3">
                  <span className="mono text-[10px] w-16 flex-shrink-0" style={{ color: C.textSub }}>{room}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: C.border }}>
                    <div className="h-full rounded-full" style={{ width: `${(enrolled / capacity) * 100}%`, background: C.accent }} />
                  </div>
                  <span className="mono text-[9px] w-12 text-right flex-shrink-0" style={{ color: C.textMuted }}>
                    {enrolled}/{capacity}
                  </span>
                  <span
                    className="mono text-[9px] font-bold w-12 text-right flex-shrink-0"
                    style={{ color }}
                  >
                    {waste}% waste
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Personal load (staff only) */}
      {role === 'staff' && (
        <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <h3 className="text-sm font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>Your Teaching Load — Semester 2</h3>
          <p className="mono text-[9px] mb-4" style={{ color: C.textMuted }}>Contact hours by module</p>
          <div className="space-y-3">
            {[
              { module: 'CS301 · Algorithms & Complexity', hours: 4, total: 12, color: '#3b82f6' },
              { module: 'CS201 · Data Structures',          hours: 3, total: 12, color: '#f59e0b' },
              { module: 'CS601 · Research Methods',         hours: 4, total: 12, color: '#ec4899' },
            ].map(({ module, hours, total, color }) => (
              <div key={module}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: C.textSub }}>{module}</span>
                  <span className="mono text-[10px]" style={{ color: C.textMuted }}>{hours}h / wk · {total}h total</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.border }}>
                  <div className="h-full rounded-full" style={{ width: `${(hours / 6) * 100}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Portal screen ────────────────────────────────────────────────────────────
type PortalTab = 'calendar' | 'availability' | 'analytics';

export default function PortalScreen() {
  const { tokens: C } = useTheme();
  const [role, setRole] = useState<'student' | 'staff'>('student');
  const [tab, setTab] = useState<PortalTab>('calendar');
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFS);
  const [showAllNotifs, setShowAllNotifs] = useState(false);

  const events = role === 'student' ? STUDENT_EVENTS : LECTURER_EVENTS;
  const unreadCount = notifications.filter(n => n.unread).length;

  const dismissNotif = (id: string) =>
    setNotifications(ns => ns.filter(n => n.id !== id));

  const markAllRead = () =>
    setNotifications(ns => ns.map(n => ({ ...n, unread: false })));

  const visibleNotifs = showAllNotifs ? notifications : notifications.filter(n => n.unread);

  const tabs: { key: PortalTab; label: string; staffOnly?: boolean }[] = [
    { key: 'calendar',     label: 'My Calendar'             },
    { key: 'availability', label: 'Availability',  staffOnly: true },
    { key: 'analytics',    label: 'Analytics'               },
  ];

  return (
    <div className="flex flex-1 overflow-hidden" style={{ background: C.bg }}>
      {/* ── Left sidebar ─────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col flex-shrink-0 overflow-y-auto"
        style={{ width: 272, background: C.surface, borderRight: `1px solid ${C.border}` }}
      >
        {/* Profile card */}
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold flex-shrink-0"
              style={{
                background: role === 'student' ? C.accentBg : 'rgba(16,185,129,0.12)',
                color: role === 'student' ? C.accent : C.success,
                border: `1px solid ${role === 'student' ? C.accent + '40' : C.success + '40'}`,
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              {role === 'student' ? 'AO' : 'CW'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>
                {role === 'student' ? 'Amara Osei' : 'Dr. Chen Wei'}
              </div>
              <div className="mono text-[9px] mt-0.5" style={{ color: C.textMuted }}>
                {role === 'student' ? 'CS-3A · BSc Computer Science' : 'Lecturer · CS Dept.'}
              </div>
            </div>
          </div>

          {/* Role toggle */}
          <div
            className="flex p-1 rounded-xl"
            style={{ background: C.bg }}
          >
            {(['student', 'staff'] as const).map(r => (
              <button
                key={r}
                onClick={() => { setRole(r); if (r === 'student' && tab === 'availability') setTab('calendar'); }}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                style={{
                  background: role === r ? C.surface : 'transparent',
                  color: role === r ? C.text : C.textMuted,
                  fontFamily: 'Outfit, sans-serif',
                  boxShadow: role === r ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                  border: role === r ? `1px solid ${C.border}` : '1px solid transparent',
                }}
              >
                {r === 'student' ? 'Student' : 'Staff'}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications section */}
        <div className="px-5 pt-4 pb-3" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>Notifications</span>
              {unreadCount > 0 && (
                <span
                  className="mono text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: C.danger, color: '#fff' }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="mono text-[9px] hover:opacity-70 transition-opacity"
                  style={{ color: C.accent }}
                >
                  Mark read
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {visibleNotifs.length === 0 ? (
              <p className="mono text-[10px] text-center py-4" style={{ color: C.textMuted }}>All caught up ✓</p>
            ) : (
              visibleNotifs.map(n => (
                <NotificationBanner key={n.id} notif={n} onDismiss={dismissNotif} />
              ))
            )}
          </div>

          {notifications.length > visibleNotifs.length && (
            <button
              onClick={() => setShowAllNotifs(v => !v)}
              className="w-full mono text-[9px] text-center mt-2 hover:opacity-70 transition-opacity"
              style={{ color: C.textMuted }}
            >
              {showAllNotifs ? 'Show unread only' : `Show all (${notifications.length})`}
            </button>
          )}
        </div>

        {/* Module legend */}
        <div className="px-5 pt-4 pb-5">
          <div className="mono text-[9px] uppercase tracking-widest mb-3" style={{ color: C.textMuted }}>
            {role === 'student' ? 'My Modules' : 'Teaching Modules'}
          </div>
          <div className="space-y-1.5">
            {[...new Map(events.map(e => [e.code, e])).values()].map(e => (
              <div key={e.code} className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: e.color }} />
                <div className="flex-1 min-w-0">
                  <span className="mono text-[9px] font-semibold" style={{ color: e.color }}>{e.code}</span>
                  <span className="text-[10px] ml-1.5 truncate" style={{ color: C.textMuted, fontFamily: 'Inter, sans-serif' }}>{e.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content header + tabs */}
        <div
          className="flex items-center justify-between px-6 pt-5 pb-0 flex-shrink-0"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="flex items-end gap-0">
            {tabs
              .filter(t => !t.staffOnly || role === 'staff')
              .map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className="px-4 py-3 text-xs font-semibold transition-all"
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    color: tab === key ? C.text : C.textMuted,
                    borderBottom: tab === key ? `2px solid ${C.accent}` : '2px solid transparent',
                    letterSpacing: '0.02em',
                  }}
                >
                  {label}
                  {key === 'availability' && role === 'staff' && (
                    <span
                      className="mono text-[8px] ml-1.5 px-1 py-0.5 rounded uppercase"
                      style={{ background: C.accentBg, color: C.accent }}
                    >
                      Staff
                    </span>
                  )}
                </button>
              ))}
          </div>

          {/* Semester badge */}
          <div className="pb-2">
            <span
              className="mono text-[9px] px-2.5 py-1 rounded-full"
              style={{ background: C.accentBg, color: C.accent, border: `1px solid ${C.accent}40` }}
            >
              Sem 2 · AY 2025/26 · Published v1.2
            </span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'calendar' && (
            <WeeklyCalendar events={events} role={role} />
          )}
          {tab === 'availability' && role === 'staff' && (
            <AvailabilityView />
          )}
          {tab === 'analytics' && (
            <AnalyticsView role={role} />
          )}
        </div>
      </div>
    </div>
  );
}

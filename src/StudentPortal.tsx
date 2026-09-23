import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from './theme';
import { DAYS, TIME_SLOTS } from './data';
import type { StudentSession } from './api/client';
import { sections as sectionsApi, students as studentsApi } from './api/client';
import type { Section } from './api/client';

// ── Course catalog types ──────────────────────────────────────────────────────
interface CourseSection {
  day: number;
  slot: number;
  room: string;
  building: string;
  type: 'Lecture' | 'Lab' | 'Tutorial';
}

type AcademicYear = 'Year 1' | 'Year 2' | 'Year 3' | 'Year 4';
type Term = 'Fall' | 'Spring' | 'Summer';

interface CatalogCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  dept: string;
  lecturer: string;
  color: string;
  seats: number;
  enrolled: number;
  description: string;
  prereqs: string[];
  sections: CourseSection[];
  year: AcademicYear;
  term: Term;
}

const ACADEMIC_YEARS: Array<'All Years' | AcademicYear> = ['All Years', 'Year 1', 'Year 2', 'Year 3', 'Year 4'];
const TERMS: Array<'All Terms' | Term> = ['All Terms', 'Fall', 'Spring', 'Summer'];

// ── Course catalog data ───────────────────────────────────────────────────────
const CATALOG: CatalogCourse[] = [
  {
    id: 'cs201', code: 'CS201', name: 'Data Structures', credits: 3,
    dept: 'Computer Science', lecturer: 'Dr. Chen Wei', color: '#2563eb',
    seats: 80, enrolled: 78, prereqs: [], year: 'Year 1', term: 'Fall',
    description: 'Fundamental data structures: linked lists, trees, graphs, heaps, hash tables, and their applications.',
    sections: [{ day: 3, slot: 2, room: 'LT-102', building: 'Block A', type: 'Lecture' }],
  },
  {
    id: 'phys101', code: 'PHYS101', name: 'Classical Mechanics', credits: 3,
    dept: 'Physics', lecturer: 'Dr. Raj Patel', color: '#0891b2',
    seats: 120, enrolled: 120, prereqs: [], year: 'Year 1', term: 'Fall',
    description: 'Newtonian mechanics, kinematics, dynamics, energy, momentum, rotational motion, and oscillations.',
    sections: [{ day: 4, slot: 4, room: 'LT-101', building: 'Block A', type: 'Lecture' }],
  },
  {
    id: 'bio101', code: 'BIO101', name: 'Cell Biology', credits: 3,
    dept: 'Biology', lecturer: 'Dr. Marcus Bell', color: '#be185d',
    seats: 200, enrolled: 187, prereqs: [], year: 'Year 1', term: 'Spring',
    description: 'Cell structure, organelles, membrane transport, cell division, molecular genetics, and signal transduction.',
    sections: [{ day: 0, slot: 0, room: 'LT-201', building: 'Block B', type: 'Lecture' }],
  },
  {
    id: 'chem201', code: 'CHEM201', name: 'Organic Chemistry', credits: 3,
    dept: 'Chemistry', lecturer: 'Dr. Raj Patel', color: '#d97706',
    seats: 200, enrolled: 143, prereqs: [], year: 'Year 1', term: 'Spring',
    description: 'Functional groups, reaction mechanisms, stereochemistry, spectroscopic identification, and synthesis.',
    sections: [{ day: 2, slot: 2, room: 'LT-201', building: 'Block B', type: 'Lecture' }],
  },
  {
    id: 'math201', code: 'MATH201', name: 'Linear Algebra', credits: 3,
    dept: 'Mathematics', lecturer: 'Prof. Sara Johansson', color: '#7c3aed',
    seats: 120, enrolled: 115, prereqs: [], year: 'Year 2', term: 'Fall',
    description: 'Vector spaces, matrix operations, eigenvalues, linear transformations, and applications in data science.',
    sections: [{ day: 1, slot: 1, room: 'LT-101', building: 'Block A', type: 'Lecture' }],
  },
  {
    id: 'eng201', code: 'ENG201', name: 'Circuit Analysis', credits: 3,
    dept: 'Electrical Engineering', lecturer: 'Prof. Amara Nwosu', color: '#059669',
    seats: 80, enrolled: 72, prereqs: ['PHYS101'], year: 'Year 2', term: 'Fall',
    description: 'DC/AC circuits, Kirchhoff\'s laws, Thevenin/Norton equivalents, phasors, and frequency response.',
    sections: [{ day: 1, slot: 1, room: 'LT-102', building: 'Block A', type: 'Lecture' }],
  },
  {
    id: 'cs301', code: 'CS301', name: 'Algorithms & Complexity', credits: 3,
    dept: 'Computer Science', lecturer: 'Dr. Chen Wei', color: '#2563eb',
    seats: 120, enrolled: 108, prereqs: ['CS201'], year: 'Year 2', term: 'Spring',
    description: 'Analysis and design of algorithms. Time/space complexity, divide & conquer, dynamic programming, NP-completeness.',
    sections: [{ day: 0, slot: 0, room: 'LT-101', building: 'Block A', type: 'Lecture' }],
  },
  {
    id: 'math301', code: 'MATH301', name: 'Calculus III', credits: 3,
    dept: 'Mathematics', lecturer: 'Prof. Sara Johansson', color: '#7c3aed',
    seats: 80, enrolled: 68, prereqs: ['MATH201'], year: 'Year 2', term: 'Spring',
    description: 'Multivariable calculus, partial derivatives, multiple integrals, vector calculus, and Stokes\' theorem.',
    sections: [{ day: 3, slot: 7, room: 'LT-102', building: 'Block A', type: 'Lecture' }],
  },
  {
    id: 'cs401', code: 'CS401', name: 'Machine Learning Foundations', credits: 4,
    dept: 'Computer Science', lecturer: 'Dr. Lena Kovač', color: '#7c3aed',
    seats: 120, enrolled: 94, prereqs: ['MATH201', 'CS301'], year: 'Year 3', term: 'Fall',
    description: 'Supervised/unsupervised learning, neural networks, model evaluation, feature engineering, and ethics in AI.',
    sections: [{ day: 2, slot: 3, room: 'LT-101', building: 'Block A', type: 'Lecture' }],
  },
  {
    id: 'eng401', code: 'ENG401', name: 'Control Systems', credits: 3,
    dept: 'Electrical Engineering', lecturer: 'Prof. Amara Nwosu', color: '#059669',
    seats: 30, enrolled: 28, prereqs: ['ENG201', 'MATH201'], year: 'Year 3', term: 'Fall',
    description: 'Feedback control, Laplace transforms, root locus, Bode plots, PID controllers, and state-space analysis.',
    sections: [{ day: 2, slot: 2, room: 'SEM-A', building: 'Block A', type: 'Lecture' }],
  },
  {
    id: 'cs501', code: 'CS501', name: 'Distributed Systems', credits: 3,
    dept: 'Computer Science', lecturer: 'Dr. Lena Kovač', color: '#7c3aed',
    seats: 30, enrolled: 24, prereqs: ['CS301', 'CS201'], year: 'Year 3', term: 'Spring',
    description: 'Consensus algorithms, replication, fault tolerance, distributed transactions, and cloud-native architectures.',
    sections: [{ day: 1, slot: 1, room: 'SEM-A', building: 'Block A', type: 'Lecture' }],
  },
  {
    id: 'cs601', code: 'CS601', name: 'Research Methods in CS', credits: 2,
    dept: 'Computer Science', lecturer: 'Dr. Chen Wei', color: '#2563eb',
    seats: 20, enrolled: 12, prereqs: ['CS401'], year: 'Year 4', term: 'Spring',
    description: 'Scientific writing, experimental design, literature review, ethical research practices, and publication standards.',
    sections: [{ day: 0, slot: 0, room: 'SEM-B', building: 'Block C', type: 'Lecture' }],
  },
];

// Student's default registered courses (matches initial personal events)
const DEFAULT_REGISTERED = new Set(['cs301', 'math201', 'cs401', 'cs201', 'phys101']);

const MAX_CREDITS = 21;
const DEPT_COLORS: Record<string, string> = {
  'Computer Science': '#2563eb',
  'Mathematics': '#7c3aed',
  'Physics': '#0891b2',
  'Electrical Engineering': '#059669',
  'Biology': '#be185d',
  'Chemistry': '#d97706',
};

const ALL_DEPTS = ['All', ...Array.from(new Set(CATALOG.map(c => c.dept)))];

// ── Derive personal events from registered course IDs ─────────────────────────
interface CalEvent { id: string; code: string; name: string; room: string; building: string; day: number; slot: number; color: string; lecturer: string; section: CourseSection; }

function buildEvents(registeredIds: Set<string>): CalEvent[] {
  const events: CalEvent[] = [];
  CATALOG.forEach(course => {
    if (!registeredIds.has(course.id)) return;
    course.sections.forEach((sec, i) => {
      events.push({
        id: `${course.id}-${i}`,
        code: course.code, name: course.name, room: sec.room, building: sec.building,
        day: sec.day, slot: sec.slot, color: course.color, lecturer: course.lecturer, section: sec,
      });
    });
  });
  return events;
}

// ── Shared UI primitives ──────────────────────────────────────────────────────
function SeatBar({ enrolled, seats, color }: { enrolled: number; seats: number; color: string }) {
  const { tokens: C } = useTheme();
  const pct = Math.round((enrolled / seats) * 100);
  const barColor = pct >= 95 ? '#ef4444' : pct >= 80 ? '#f59e0b' : color;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[9px]" style={{ color: C.textMuted }}>{enrolled} / {seats} seats</span>
        <span className="text-[9px] font-bold" style={{ fontFamily: 'DM Mono, monospace', color: barColor }}>{pct}%</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: C.surfaceAlt }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
      </div>
    </div>
  );
}

// ── Course card ───────────────────────────────────────────────────────────────
function CourseCard({ course, inWishlist, onToggle }: { course: CatalogCourse; inWishlist: boolean; onToggle: () => void; }) {
  const { tokens: C } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const isFull = course.enrolled >= course.seats;

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        background: C.surface,
        border: `1px solid ${inWishlist ? course.color + '50' : C.border}`,
        outline: inWishlist ? `1px solid ${course.color}20` : 'none',
        outlineOffset: 1,
      }}
    >
      {/* Main row */}
      <div className="flex items-start gap-3 p-3.5">
        {/* Color indicator */}
        <div className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5" style={{ background: course.color, minHeight: 32 }} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold" style={{ fontFamily: 'DM Mono, monospace', color: course.color }}>{course.code}</span>
                {course.prereqs.length > 0 && (
                  <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: C.surfaceAlt, color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>
                    Prereq: {course.prereqs.join(', ')}
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold mt-0.5 leading-tight" style={{ color: C.text, fontFamily: 'Outfit, sans-serif' }}>{course.name}</div>
            </div>
            {/* Credits badge */}
            <div className="flex-shrink-0 text-center px-2 py-1 rounded-lg" style={{ background: inWishlist ? course.color + '18' : C.surfaceAlt, border: `1px solid ${inWishlist ? course.color + '40' : C.border}`, minWidth: 44 }}>
              <div className="text-sm font-bold leading-tight" style={{ fontFamily: 'Outfit, sans-serif', color: inWishlist ? course.color : C.text }}>{course.credits}</div>
              <div className="text-[7px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>cr</div>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[9px]" style={{ color: C.textMuted }}>👤 {course.lecturer}</span>
            <span className="text-[9px]" style={{ color: C.textMuted }}>·</span>
            <span
              className="text-[8px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: (DEPT_COLORS[course.dept] ?? C.accent) + '18', color: DEPT_COLORS[course.dept] ?? C.accent }}
            >
              {course.dept}
            </span>
          </div>

          {/* Section preview */}
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[9px]" style={{ color: C.textSub }}>
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.1"/><path d="M1 5h10M4 1v2M8 1v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
              {course.sections.map((s, i) => (
                <span key={i}>{DAYS[s.day]} {TIME_SLOTS[s.slot]} · {s.room}</span>
              ))}
            </div>
            <button
              onClick={() => setExpanded(v => !v)}
              className="text-[9px] hover:opacity-60 transition-opacity flex-shrink-0"
              style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}
            >
              {expanded ? 'less ↑' : 'more ↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3" style={{ borderTop: `1px solid ${C.borderSub}` }}>
          <p className="text-[10px] leading-relaxed" style={{ color: C.textMuted }}>{course.description}</p>

          <SeatBar enrolled={course.enrolled} seats={course.seats} color={course.color} />

          <div className="flex items-center gap-2 pt-1">
            {course.sections.map((s, i) => (
              <div key={i} className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg" style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
                <div className="text-[8px] px-1.5 py-0.5 rounded font-bold" style={{ background: course.color + '20', color: course.color, fontFamily: 'DM Mono, monospace' }}>{s.type}</div>
                <div className="text-[9px]" style={{ color: C.textSub }}>{DAYS[s.day]} · {TIME_SLOTS[s.slot]}</div>
                <div className="text-[9px] ml-auto" style={{ color: C.textMuted }}>{s.room}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action footer */}
      <div className="px-3.5 pb-3.5 flex items-center justify-between gap-2">
        {isFull && !inWishlist ? (
          <span className="text-[9px] px-2 py-1 rounded-lg font-semibold" style={{ background: '#ef444415', color: '#ef4444', border: '1px solid #ef444430', fontFamily: 'DM Mono, monospace' }}>FULL</span>
        ) : (
          <button
            onClick={onToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-[0.97]"
            style={{
              background: inWishlist ? course.color : C.accentBg,
              color: inWishlist ? '#fff' : C.accent,
              border: `1px solid ${inWishlist ? 'transparent' : C.accent + '40'}`,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {inWishlist ? (
              <>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Added
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Add to wishlist
              </>
            )}
          </button>
        )}
        <span className="text-[8px]" style={{ color: course.enrolled >= course.seats * 0.95 ? '#ef4444' : C.textMuted, fontFamily: 'DM Mono, monospace' }}>
          {course.seats - course.enrolled} seats left
        </span>
      </div>
    </div>
  );
}

// ── Credit summary bar (sticky footer) ────────────────────────────────────────
function CreditSummaryBar({ wishlist, applied, onApply }: {
  wishlist: Set<string>; applied: Set<string>; onApply: () => void;
}) {
  const { tokens: C } = useTheme();
  const courses = CATALOG.filter(c => wishlist.has(c.id));
  const totalCredits = courses.reduce((s, c) => s + c.credits, 0);
  const pct = Math.min((totalCredits / MAX_CREDITS) * 100, 100);
  const creditColor = totalCredits > MAX_CREDITS ? C.danger : totalCredits >= 18 ? C.warning : C.success;
  const hasChanges = [...wishlist].sort().join() !== [...applied].sort().join();

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 flex-shrink-0"
      style={{ background: C.surfaceAlt, borderTop: `1px solid ${C.border}` }}
    >
      {/* Counter */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>{wishlist.size}</span>
            <span className="text-[10px]" style={{ color: C.textMuted }}>courses</span>
            <span className="text-base font-bold ml-2" style={{ fontFamily: 'Outfit, sans-serif', color: creditColor }}>{totalCredits}</span>
            <span className="text-[10px]" style={{ color: C.textMuted }}>/ {MAX_CREDITS} cr</span>
          </div>
        </div>

        {/* Credit bar */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: C.surface }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: creditColor }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-[8px]" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>
              {totalCredits > MAX_CREDITS ? `${totalCredits - MAX_CREDITS} cr over limit` : `${MAX_CREDITS - totalCredits} cr remaining`}
            </span>
            <span className="text-[8px]" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>
              min 12 · rec 15–18 · max {MAX_CREDITS}
            </span>
          </div>
        </div>
      </div>

      {/* Apply CTA */}
      <button
        onClick={onApply}
        disabled={!hasChanges || totalCredits > MAX_CREDITS || wishlist.size === 0}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-40 flex-shrink-0"
        style={{
          background: hasChanges && totalCredits <= MAX_CREDITS ? C.accent : C.accentBg,
          color: hasChanges && totalCredits <= MAX_CREDITS ? '#fff' : C.accent,
          fontFamily: 'Outfit, sans-serif',
          position: 'relative',
        }}
      >
        {hasChanges && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: C.warning }} />
        )}
        Apply to My Schedule
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
}

// ── Weekly calendar (filtered by registration) ────────────────────────────────
function RegisteredCalendar({ events }: { events: CalEvent[] }) {
  const { tokens: C } = useTheme();
  const [selected, setSelected] = useState<CalEvent | null>(null);
  const HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

  const exportICS = () => {
    const dayDates = ['20260119', '20260120', '20260121', '20260122', '20260123'];
    const slotHour = (s: number) => String(8 + s).padStart(2, '0');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bua University//EN', 'CALSCALE:GREGORIAN',
      ...events.flatMap(ev => [
        'BEGIN:VEVENT',
        `UID:${ev.id}@bua.edu.eg`,
        'DTSTAMP:20260115T080000Z',
        `DTSTART:${dayDates[ev.day]}T${slotHour(ev.slot)}0000`,
        `DTEND:${dayDates[ev.day]}T${slotHour(ev.slot + 1)}0000`,
        `SUMMARY:${ev.code} — ${ev.name}`,
        `LOCATION:${ev.room}\\, ${ev.building}`,
        `DESCRIPTION:Lecturer ${ev.lecturer}`,
        'END:VEVENT',
      ]),
      'END:VCALENDAR'];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
    a.download = 'my-timetable.ics'; a.click();
  };

  const lookup: Record<number, Record<number, CalEvent>> = {};
  events.forEach(ev => { if (!lookup[ev.day]) lookup[ev.day] = {}; lookup[ev.day][ev.slot] = ev; });

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center" style={{ color: C.textMuted }}>
        <div className="text-4xl mb-3">📅</div>
        <div className="text-sm font-semibold mb-1" style={{ color: C.textSub }}>No courses registered yet</div>
        <div className="text-xs">Go to the Registration tab to add courses to your schedule.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt }}>
        <div>
          <span className="text-[11px] font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>My Schedule</span>
          <span className="ml-2 text-[9px]" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>W03 · Mon 19 – Fri 23 Jan 2026 · {events.length} session{events.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all hover:opacity-80"
            style={{ background: 'transparent', color: C.textMuted, border: `1px solid ${C.border}` }}>
            Print
          </button>
          <button onClick={exportICS}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all hover:opacity-80"
            style={{ background: 'transparent', color: C.textMuted, border: `1px solid ${C.border}` }}>
            Export ICS
          </button>
        </div>
      </div>

      {/* Course legend */}
      <div className="flex items-center gap-3 px-4 py-2 flex-shrink-0 overflow-x-auto" style={{ borderBottom: `1px solid ${C.borderSub}`, background: C.bg }}>
        {events.map(ev => (
          <div key={ev.id} className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-2 h-2 rounded-full" style={{ background: ev.color }} />
            <span className="text-[9px] font-semibold" style={{ fontFamily: 'DM Mono, monospace', color: ev.color }}>{ev.code}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto" style={{ background: C.surface }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 52 }} />
            {DAYS.map(d => <col key={d} />)}
          </colgroup>
          <thead>
            <tr>
              <th className="sticky top-0 left-0 z-20 py-2.5 text-[9px] text-center"
                style={{ background: C.surfaceAlt, color: C.textMuted, borderBottom: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, fontFamily: 'DM Mono, monospace' }} />
              {DAYS.map((d, di) => (
                <th key={d} className="sticky top-0 z-10 py-2.5 text-[9px] font-semibold text-center tracking-widest uppercase"
                  style={{ background: C.surfaceAlt, color: C.textSub, fontFamily: 'DM Mono, monospace', borderBottom: `1px solid ${C.border}`, borderRight: di < 4 ? `1px solid ${C.borderSub}` : 'none' }}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hr, si) => (
              <tr key={hr}>
                <td className="sticky left-0 z-10 text-right pr-2 text-[9px]"
                  style={{ background: C.surfaceAlt, color: C.textMuted, fontFamily: 'DM Mono, monospace', borderBottom: `1px solid ${C.borderSub}`, borderRight: `1px solid ${C.border}`, padding: '4px 8px', verticalAlign: 'top', paddingTop: 6 }}>
                  {hr}
                </td>
                {DAYS.map((_, di) => {
                  const ev = lookup[di]?.[si];
                  return (
                    <td key={di}
                      onClick={() => ev && setSelected(ev)}
                      style={{
                        borderBottom: `1px solid ${C.borderSub}`,
                        borderRight: di < 4 ? `1px solid ${C.borderSub}` : 'none',
                        height: 60, padding: ev ? 4 : 0,
                        background: 'transparent',
                        cursor: ev ? 'pointer' : 'default',
                        verticalAlign: 'top',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => { if (ev) e.currentTarget.style.background = ev.color + '33'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {ev && (
                        <div
                          className="h-full rounded-md px-2 py-1.5 overflow-hidden"
                          style={{ background: ev.color + 'E6', border: `2px solid ${ev.color}CC`, boxShadow: `0 2px 8px ${ev.color}40` }}
                        >
                          <div className="text-[9px] font-bold leading-tight truncate" style={{ fontFamily: 'DM Mono, monospace', color: '#fff' }}>{ev.code}</div>
                          <div className="text-[8px] truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.9)' }}>{ev.section.type}</div>
                          <div className="text-[8px] truncate" style={{ color: 'rgba(255,255,255,0.8)' }}>{ev.room}</div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Event detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.55)' }} onClick={() => setSelected(null)}>
          <div onClick={e => e.stopPropagation()}
            className="rounded-2xl p-5 w-full max-w-xs"
            style={{ background: C.surfaceRaised, border: `1px solid ${C.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: selected.color }} />
              <div className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>{selected.code}</div>
              <span className="text-[8px] px-1.5 py-0.5 rounded font-bold ml-auto" style={{ background: selected.color + '20', color: selected.color, fontFamily: 'DM Mono, monospace' }}>{selected.section.type}</span>
            </div>
            <div className="text-xs font-semibold mb-4" style={{ color: C.textSub }}>{selected.name}</div>
            <div className="space-y-2 text-[10px]" style={{ color: C.textMuted }}>
              <div className="flex items-center gap-2"><span>📅</span><span>{DAYS[selected.day]}, {TIME_SLOTS[selected.slot]}</span></div>
              <div className="flex items-center gap-2"><span>📍</span><span>{selected.room}, {selected.building}</span></div>
              <div className="flex items-center gap-2"><span>👤</span><span>{selected.lecturer}</span></div>
            </div>
            <button onClick={() => setSelected(null)}
              className="w-full mt-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: C.surface, color: C.textSub, border: `1px solid ${C.border}` }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Course Registration tab ───────────────────────────────────────────────────
// Shared select style helper
function FilterSelect({ value, onChange, children, style }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode; style?: React.CSSProperties;
}) {
  const { tokens: C } = useTheme();
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '5px 8px',
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        color: C.textSub,
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
        outline: 'none',
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </select>
  );
}

function RegistrationTab({ wishlist, onToggle, applied, onApply }: {
  wishlist: Set<string>; onToggle: (id: string) => void;
  applied: Set<string>; onApply: () => void;
}) {
  const { tokens: C } = useTheme();
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [yearFilter, setYearFilter] = useState<'All Years' | AcademicYear>('All Years');
  const [termFilter, setTermFilter] = useState<'All Terms' | Term>('All Terms');
  const [listMode, setListMode] = useState<'all' | 'wishlist'>('all');
  const [justApplied, setJustApplied] = useState(false);
  const [serverSections, setServerSections] = useState<Section[]>([]);
  const [serverState, setServerState] = useState<'idle' | 'saving' | 'saved' | 'offline'>('idle');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await sectionsApi.list();
        if (!cancelled) setServerSections(Array.isArray(s) ? s : []);
      } catch { /* offline */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleApply = () => {
    onApply();
    setJustApplied(true);
    setTimeout(() => setJustApplied(false), 2500);
    // Best-effort server sync: match wishlist courses to backend sections by code.
    const codes = CATALOG.filter(c => wishlist.has(c.id)).map(c => c.code);
    const ids = codes.map(code => serverSections.find(s => s.code === code)?.id).filter((x): x is string => !!x);
    if (ids.length === 0) return;
    setServerState('saving');
    studentsApi.registerMine(
      ids,
      yearFilter === 'All Years' ? 'Year 2' : yearFilter,
      termFilter === 'All Terms' ? 'Fall' : termFilter,
    ).then(() => setServerState('saved'))
      .catch(() => setServerState('offline'));
  };

  const filtered = useMemo(() => {
    return CATALOG.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.lecturer.toLowerCase().includes(q);
      const matchDept = dept === 'All' || c.dept === dept;
      const matchYear = yearFilter === 'All Years' || c.year === yearFilter;
      const matchTerm = termFilter === 'All Terms' || c.term === termFilter;
      const matchList = listMode === 'all' || wishlist.has(c.id);
      return matchSearch && matchDept && matchYear && matchTerm && matchList;
    });
  }, [search, dept, yearFilter, termFilter, listMode, wishlist]);

  const totalCredits = CATALOG.filter(c => wishlist.has(c.id)).reduce((s, c) => s + c.credits, 0);

  // Year pill color map
  const YEAR_COLORS: Record<string, string> = {
    'Year 1': '#0891b2', 'Year 2': '#2563eb', 'Year 3': '#7c3aed', 'Year 4': '#be185d',
  };
  const TERM_COLORS: Record<string, string> = {
    'Fall': '#d97706', 'Spring': '#059669', 'Summer': '#0891b2',
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[11px] font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>Course Registration</div>
            <div className="text-[9px] mt-0.5" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>AY 2025 / 26 · Faculty of Computer Science</div>
          </div>
          {justApplied && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold" style={{ background: C.successBg, color: C.success, border: `1px solid ${C.success}30` }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Schedule updated{serverState === 'saved' ? ' · saved to server ✓' : serverState === 'saving' ? ' · saving…' : serverState === 'offline' ? ' · server offline' : ''}
            </div>
          )}
        </div>

        {/* Academic filters row: Year · Term | Search | Dept */}
        <div className="flex gap-2 items-center mb-2.5 flex-wrap">
          {/* Year filter */}
          <div className="flex items-center gap-1.5 flex-shrink-0 px-2.5 py-1 rounded-lg"
            style={{ background: yearFilter !== 'All Years' ? (YEAR_COLORS[yearFilter] + '14') : C.surface, border: `1px solid ${yearFilter !== 'All Years' ? YEAR_COLORS[yearFilter] + '40' : C.border}` }}>
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
              <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm0 0v5l3 1.5" stroke={yearFilter !== 'All Years' ? YEAR_COLORS[yearFilter] : C.textMuted} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value as typeof yearFilter)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: yearFilter !== 'All Years' ? YEAR_COLORS[yearFilter] : C.textSub,
                fontFamily: yearFilter !== 'All Years' ? 'DM Mono, monospace' : 'Inter, sans-serif',
                fontSize: 11, fontWeight: yearFilter !== 'All Years' ? 700 : 400, cursor: 'pointer',
              }}
            >
              {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Term filter */}
          <div className="flex items-center gap-1.5 flex-shrink-0 px-2.5 py-1 rounded-lg"
            style={{ background: termFilter !== 'All Terms' ? (TERM_COLORS[termFilter] + '14') : C.surface, border: `1px solid ${termFilter !== 'All Terms' ? TERM_COLORS[termFilter] + '40' : C.border}` }}>
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="2" width="10" height="9" rx="1" stroke={termFilter !== 'All Terms' ? TERM_COLORS[termFilter] : C.textMuted} strokeWidth="1.2"/>
              <path d="M1 5h10M4 1v2M8 1v2" stroke={termFilter !== 'All Terms' ? TERM_COLORS[termFilter] : C.textMuted} strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <select
              value={termFilter}
              onChange={e => setTermFilter(e.target.value as typeof termFilter)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: termFilter !== 'All Terms' ? TERM_COLORS[termFilter] : C.textSub,
                fontFamily: termFilter !== 'All Terms' ? 'DM Mono, monospace' : 'Inter, sans-serif',
                fontSize: 11, fontWeight: termFilter !== 'All Terms' ? 700 : 400, cursor: 'pointer',
              }}
            >
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Divider */}
          <div className="w-px h-4 flex-shrink-0" style={{ background: C.border }} />

          {/* Search */}
          <div className="relative flex-1" style={{ minWidth: 160 }}>
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2" width="11" height="11" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4" stroke={C.textMuted} strokeWidth="1.3"/>
              <path d="M9.5 9.5l2.5 2.5" stroke={C.textMuted} strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search courses, codes, lecturers…"
              style={{ width: '100%', paddingLeft: 28, paddingRight: 10, paddingTop: 5, paddingBottom: 5, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontFamily: 'Inter, sans-serif', fontSize: 11, outline: 'none' }}
            />
          </div>

          {/* Dept */}
          <FilterSelect value={dept} onChange={setDept}>
            {ALL_DEPTS.map(d => <option key={d}>{d}</option>)}
          </FilterSelect>
        </div>

        {/* Active filter chips + result count */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Result count */}
          <span className="text-[9px] font-semibold mr-1" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>
            {filtered.length} course{filtered.length !== 1 ? 's' : ''}
          </span>

          {/* Active filter chips */}
          {yearFilter !== 'All Years' && (
            <button
              onClick={() => setYearFilter('All Years')}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold transition-opacity hover:opacity-70"
              style={{ background: YEAR_COLORS[yearFilter] + '20', color: YEAR_COLORS[yearFilter], fontFamily: 'DM Mono, monospace' }}
            >
              {yearFilter}
              <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </button>
          )}
          {termFilter !== 'All Terms' && (
            <button
              onClick={() => setTermFilter('All Terms')}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold transition-opacity hover:opacity-70"
              style={{ background: TERM_COLORS[termFilter] + '20', color: TERM_COLORS[termFilter], fontFamily: 'DM Mono, monospace' }}
            >
              {termFilter}
              <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </button>
          )}

          {/* List mode toggle */}
          <div className="flex items-center gap-1 ml-auto">
            {([['all', `All`], ['wishlist', `Wishlist (${wishlist.size})`]] as const).map(([mode, label]) => (
              <button key={mode} onClick={() => setListMode(mode)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                style={{
                  background: listMode === mode ? C.accent : 'transparent',
                  color: listMode === mode ? '#fff' : C.textMuted,
                  border: `1px solid ${listMode === mode ? 'transparent' : C.border}`,
                  fontFamily: 'Inter, sans-serif',
                }}>
                {label}
              </button>
            ))}
            {totalCredits > MAX_CREDITS && (
              <span className="ml-1 text-[9px] px-2 py-1 rounded-lg font-bold" style={{ background: C.dangerBg, color: C.danger, border: `1px solid ${C.danger}30`, fontFamily: 'DM Mono, monospace' }}>
                ⚠ {totalCredits - MAX_CREDITS} cr over limit
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Course list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center" style={{ color: C.textMuted }}>
            <div className="text-3xl mb-3">🔍</div>
            <div className="text-sm font-semibold mb-1" style={{ color: C.textSub }}>
              {listMode === 'wishlist' ? 'No courses in wishlist yet' : 'No courses match your search'}
            </div>
            <div className="text-xs">
              {listMode === 'wishlist' ? 'Browse All Courses and click "Add to wishlist"' : 'Try a different keyword or department'}
            </div>
          </div>
        ) : filtered.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            inWishlist={wishlist.has(course.id)}
            onToggle={() => onToggle(course.id)}
          />
        ))}
      </div>

      {/* Sticky summary bar */}
      <CreditSummaryBar wishlist={wishlist} applied={applied} onApply={handleApply} />
    </div>
  );
}

// ── Student Portal root ───────────────────────────────────────────────────────
export default function StudentPortal({ backendSessions = [] }: { backendSessions?: StudentSession[] }) {
  const { tokens: C } = useTheme();
  const [tab,     setTab]     = useState<'schedule' | 'register'>('schedule');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set(DEFAULT_REGISTERED));
  const [applied,  setApplied]  = useState<Set<string>>(new Set(DEFAULT_REGISTERED));
  const [level, setLevel] = useState<'All Years' | AcademicYear>('All Years');

  const toggleCourse = (id: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const applyToSchedule = () => {
    setApplied(new Set(wishlist));
    setTab('schedule');
  };

  const filteredCatalog = useMemo(() => {
    return CATALOG.filter(c => level === 'All Years' || c.year === level);
  }, [level]);

  const events = useMemo(() => {
    if (backendSessions.length > 0) {
      return backendSessions.map(session => ({
        id: session.id,
        code: session.code,
        name: session.name,
        room: session.room,
        building: 'Bua University',
        day: session.day,
        slot: session.slot,
        color: session.color,
        lecturer: session.staff,
        section: { day: session.day, slot: session.slot, room: session.room, building: 'Bua University', type: 'Lecture' as const },
      }));
    }
    const filtered = filteredCatalog.filter(c => applied.has(c.id));
    return buildEvents(new Set(filtered.map(c => c.id)));
  }, [applied, level, filteredCatalog, backendSessions]);

  const wishlistSize = wishlist.size;
  const hasChanges = [...wishlist].sort().join() !== [...applied].sort().join();

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: C.bg }}>
      {/* Portal tab bar */}
      <div
        className="flex items-center flex-shrink-0"
        style={{ background: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}
      >
        {/* Level selector */}
        <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0" style={{ borderRight: `1px solid ${C.border}` }}>
          <span className="text-[10px] font-semibold" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>Level:</span>
          <select
            value={level}
            onChange={e => setLevel(e.target.value as typeof level)}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              color: C.text,
              fontFamily: 'DM Mono, monospace',
              cursor: 'pointer',
              minWidth: 140,
            }}
          >
            {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex items-center flex-1">
          {([
            ['schedule', 'My Schedule', null],
            ['register', 'Registration', wishlistSize],
          ] as [string, string, number | null][]).map(([id, label, badge]) => (
            <button
              key={id}
              onClick={() => setTab(id as 'schedule' | 'register')}
              className="flex items-center gap-2 px-5 py-3 text-xs font-semibold transition-all relative"
              style={{
                color: tab === id ? C.accent : C.textMuted,
                borderBottom: tab === id ? `2px solid ${C.accent}` : '2px solid transparent',
                fontFamily: 'Inter, sans-serif',
                background: 'transparent',
              }}
            >
              {label}
              {badge !== null && (
                <span
                  className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: hasChanges ? C.warning + '25' : C.accentBg, color: hasChanges ? C.warning : C.accent, fontFamily: 'DM Mono, monospace' }}
                >
                  {badge}
                </span>
              )}
              {hasChanges && id === 'register' && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: C.warning }} />
              )}
            </button>
          ))}
        </div>

        {/* Right: registered credits pill */}
        <div className="ml-auto px-4 flex items-center gap-2">
          {hasChanges && (
            <span className="text-[9px] px-2 py-1 rounded-lg font-semibold" style={{ background: C.warningBg, color: C.warning, border: `1px solid ${C.warning}30`, fontFamily: 'DM Mono, monospace' }}>
              Unsaved changes
            </span>
          )}
          <div className="flex items-center gap-1.5 text-[9px]" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>
            <span>{applied.size} courses</span>
            <span style={{ color: C.border }}>·</span>
            <span style={{ color: C.accent, fontWeight: 700 }}>
              {CATALOG.filter(c => applied.has(c.id)).reduce((s, c) => s + c.credits, 0)} cr registered
            </span>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'schedule'
          ? <RegisteredCalendar events={events} />
          : <RegistrationTab wishlist={wishlist} onToggle={toggleCourse} applied={applied} onApply={applyToSchedule} />
        }
      </div>
    </div>
  );
}

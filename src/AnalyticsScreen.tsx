import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import { useTheme } from './theme';

// ─── Dataset ──────────────────────────────────────────────────────────────────
const ROOM_UTIL = [
  { room: 'LT-101',   util: 87, waste: 13, capacity: 240, type: 'Lecture Theatre' },
  { room: 'LT-102',   util: 74, waste: 26, capacity: 120, type: 'Lecture Theatre' },
  { room: 'LT-201',   util: 92, waste: 8,  capacity: 300, type: 'Lecture Theatre' },
  { room: 'LT-202',   util: 76, waste: 24, capacity: 180, type: 'Lecture Theatre' },
  { room: 'CS-Lab1',  util: 95, waste: 5,  capacity: 60,  type: 'Computer Lab'   },
  { room: 'CS-Lab2',  util: 78, waste: 22, capacity: 40,  type: 'Computer Lab'   },
  { room: 'CS-Lab3',  util: 71, waste: 29, capacity: 50,  type: 'Computer Lab'   },
  { room: 'SEM-A',    util: 61, waste: 39, capacity: 30,  type: 'Seminar Room'   },
  { room: 'SEM-B',    util: 48, waste: 52, capacity: 20,  type: 'Seminar Room'   },
  { room: 'SEM-D',    util: 58, waste: 42, capacity: 25,  type: 'Seminar Room'   },
  { room: 'SEM-E',    util: 52, waste: 48, capacity: 25,  type: 'Seminar Room'   },
  { room: 'Phys-Lab', util: 69, waste: 31, capacity: 48,  type: 'Science Lab'    },
  { room: 'Phys-Lab2',util: 63, waste: 37, capacity: 40,  type: 'Science Lab'    },
  { room: 'Chem-Lab', util: 60, waste: 40, capacity: 30,  type: 'Science Lab'    },
  { room: 'Chem-Lab B',util: 57, waste: 43, capacity: 30, type: 'Science Lab'    },
  { room: 'BioLab',   util: 81, waste: 19, capacity: 28,  type: 'Science Lab'    },
  { room: 'BioLab2',  util: 66, waste: 34, capacity: 24,  type: 'Science Lab'    },
  { room: 'Fab-Studio',util:43, waste: 57, capacity: 24,  type: 'Workshop'       },
  { room: 'Eng-Workshop',util:49, waste: 51, capacity: 30, type: 'Workshop'      },
  { room: 'Studio-A', util: 47, waste: 53, capacity: 22,  type: 'Studio'         },
  { room: 'SEM-C',    util: 0,  waste: 100,capacity: 20,  type: 'Seminar Room'   },
];

const PEAK_HOURS = [
  { hour: '08:00', sessions: 2,  occupancy: 18 },
  { hour: '09:00', sessions: 8,  occupancy: 72 },
  { hour: '10:00', sessions: 11, occupancy: 89 },
  { hour: '11:00', sessions: 10, occupancy: 84 },
  { hour: '12:00', sessions: 6,  occupancy: 51 },
  { hour: '13:00', sessions: 4,  occupancy: 33 },
  { hour: '14:00', sessions: 9,  occupancy: 76 },
  { hour: '15:00', sessions: 7,  occupancy: 62 },
  { hour: '16:00', sessions: 5,  occupancy: 44 },
  { hour: '17:00', sessions: 2,  occupancy: 17 },
];

const WEEKLY_TREND = [
  { week: 'W01', util: 68, sessions: 118 },
  { week: 'W02', util: 73, sessions: 127 },
  { week: 'W03', util: 82, sessions: 142 },
  { week: 'W04', util: 79, sessions: 138 },
  { week: 'W05', util: 84, sessions: 147 },
  { week: 'W06', util: 81, sessions: 143 },
  { week: 'W07', util: 76, sessions: 131 },
  { week: 'W08', util: 71, sessions: 124 },
];

const DEPT_DEMAND = [
  { subject: 'CS',      demand: 92, supply: 78 },
  { subject: 'Maths',   demand: 74, supply: 81 },
  { subject: 'Physics', demand: 68, supply: 71 },
  { subject: 'Eng',     demand: 85, supply: 74 },
  { subject: 'Chem',    demand: 52, supply: 64 },
  { subject: 'Biology', demand: 61, supply: 68 },
];

const TYPE_BREAKDOWN = [
  { name: 'Lecture Theatres', booked: 74, empty: 26 },
  { name: 'Seminar Rooms',    booked: 52, empty: 48 },
  { name: 'Computer Labs',    booked: 87, empty: 13 },
  { name: 'Science Labs',     booked: 68, empty: 32 },
  { name: 'Workshops',        booked: 43, empty: 57 },
];

const CAPACITY_WASTE = [
  { range: '0–20%',  rooms: 2  },
  { range: '21–40%', rooms: 4  },
  { range: '41–60%', rooms: 5  },
  { range: '61–80%', rooms: 7  },
  { range: '81–100%',rooms: 6  },
];

// ─── Helper atoms ──────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent, delta }: {
  label: string; value: string | number; sub?: string; accent?: string; delta?: { val: string; dir: 'up' | 'down' | 'neutral' };
}) {
  const { tokens: C } = useTheme();
  const deltaColor = !delta ? undefined : delta.dir === 'up' ? C.success : delta.dir === 'down' ? C.danger : C.textMuted;
  return (
    <div className="rounded-xl px-5 py-4 flex flex-col justify-between"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <div className="mono text-[10px] uppercase tracking-widest mb-2" style={{ color: C.textMuted }}>{label}</div>
      <div>
        <div className="text-3xl font-bold leading-none" style={{ fontFamily: 'Outfit, sans-serif', color: accent ?? C.text }}>{value}</div>
        {sub && <div className="text-[10px] mt-1.5" style={{ color: C.textMuted }}>{sub}</div>}
        {delta && (
          <div className="mono text-[10px] mt-1.5 flex items-center gap-1" style={{ color: deltaColor }}>
            {delta.dir === 'up' ? '↑' : delta.dir === 'down' ? '↓' : '→'} {delta.val} vs last week
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  const { tokens: C } = useTheme();
  return (
    <div className="mb-4">
      <h2 className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>{title}</h2>
      {sub && <p className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>{sub}</p>}
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { tokens: C } = useTheme();
  return (
    <div className={`rounded-xl p-5 ${className}`} style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      {children}
    </div>
  );
}

function UtilBar({ room, util, type }: { room: string; util: number; type: string; }) {
  const { tokens: C } = useTheme();
  const color = util >= 85 ? C.danger : util >= 70 ? C.accent : util >= 50 ? C.warning : C.textMuted;
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 flex-shrink-0">
        <div className="mono text-[11px] font-medium" style={{ color: C.textSub }}>{room}</div>
        <div className="text-[9px]" style={{ color: C.textMuted }}>{type.split(' ')[0]}</div>
      </div>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: C.border }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${util}%`, background: color }} />
      </div>
      <div className="mono text-[11px] w-8 text-right" style={{ color }}>{util}%</div>
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function AnalyticsScreen() {
  const { tokens: C } = useTheme();
  const TOOLTIP_STYLE = {
    contentStyle: { background: C.tooltipBg, border: `1px solid ${C.tooltipBorder}`, borderRadius: 8, fontSize: 11, fontFamily: 'DM Mono, monospace', color: C.tooltipText },
    cursor: { fill: 'rgba(128,128,128,0.05)' },
  };
  const avgUtil = Math.round(ROOM_UTIL.reduce((s, r) => s + r.util, 0) / ROOM_UTIL.length);
  const avgWaste = 100 - avgUtil;
  const overloaded = ROOM_UTIL.filter((r) => r.util >= 90).length;
  const underused  = ROOM_UTIL.filter((r) => r.util < 50).length;

  const exportCSV = () => {
    const rows = ['Room,Type,Capacity,Util%,Waste%,Flag',
      ...ROOM_UTIL.map(r => `${r.room},${r.type},${r.capacity},${r.util},${r.waste},${r.util >= 90 ? 'Critical' : r.util < 50 ? 'Underused' : 'Normal'}`)];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'room-utilization.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5" style={{ background: C.bg }}>
      {/* Page title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: C.text, letterSpacing: '-0.01em', fontSize: 22 }}>
            Utilisation &amp; Analytics
          </h1>
          <p className="mt-0.5" style={{ color: C.textMuted, fontSize: 14 }}>Semester 2 · AY 2025/26 · Weeks W01–W08 · 22 rooms · reconciled with published slots</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-md px-3 py-1.5 outline-none"
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textSub, fontFamily: 'DM Mono, monospace', fontSize: 13 }}>
            <option>All Buildings</option>
            <option>Alan Turing Building</option>
            <option>Lovelace Computing Hub</option>
          </select>
          <button onClick={exportCSV} className="mono px-3 py-1.5 rounded-md transition-all hover:opacity-90"
            style={{ background: C.accentBg, color: C.accent, border: `1px solid ${C.accent}40`, fontSize: 13 }}>
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <KpiCard label="Avg Utilisation"  value={`${avgUtil}%`}    sub="Across all spaces"        accent={avgUtil > 80 ? C.danger : C.accent} delta={{ val: '+4%', dir: 'up' }} />
        <KpiCard label="Capacity Waste"   value={`${avgWaste}%`}   sub="Avg empty seat-hrs"       accent={C.warning}  delta={{ val: '−2%', dir: 'up' }} />
        <KpiCard label="Peak Occupancy"   value="10:00"            sub="Highest demand slot"                          delta={{ val: 'Same', dir: 'neutral' }} />
        <KpiCard label="Overloaded Rooms" value={overloaded}       sub="≥ 90% utilisation"        accent={C.danger}   delta={{ val: '+1', dir: 'down' }} />
        <KpiCard label="Underused Rooms"  value={underused}        sub="< 50% utilisation"        accent={C.textMuted} delta={{ val: '−1', dir: 'up' }} />
      </div>

      {/* Row 1: Weekly trend + Peak hours */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="col-span-2">
          <SectionHeader title="Weekly Utilisation Trend" sub="Average room utilisation % and session count across W01–W08" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={WEEKLY_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="areaUtil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.accent} stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="areaSess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.cyan} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={C.cyan} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: C.textMuted, fontSize: 9, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.textMuted, fontSize: 9, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="util"     stroke={C.accent} strokeWidth={2} fill="url(#areaUtil)" dot={false} name="Utilisation %" />
              <Area type="monotone" dataKey="sessions" stroke={C.cyan}   strokeWidth={1.5} fill="url(#areaSess)" dot={false} name="Sessions" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3">
            {[{ color: C.accent, label: 'Utilisation %' }, { color: C.cyan, label: 'Session count' }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded" style={{ background: l.color }} />
                <span className="mono text-[9px]" style={{ color: C.textMuted }}>{l.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Peak Hours" sub="Session occupancy % by hour slot" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PEAK_HOURS} margin={{ top: 4, right: 0, bottom: 0, left: -28 }} barSize={12}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: C.textMuted, fontSize: 8, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.textMuted, fontSize: 9, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="occupancy" name="Occupancy %" radius={[3, 3, 0, 0]}>
                {PEAK_HOURS.map((entry) => (
                  <Cell key={entry.hour}
                    fill={entry.occupancy >= 80 ? C.danger : entry.occupancy >= 60 ? C.accent : entry.occupancy >= 40 ? C.cyan : C.textMuted} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {[
              { color: C.danger,    label: '≥ 80% — Critical'  },
              { color: C.accent,    label: '60–79% — High'      },
              { color: C.cyan,      label: '40–59% — Moderate'  },
              { color: C.textMuted, label: '< 40% — Low'        },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ background: l.color }} />
                <span className="mono text-[8px]" style={{ color: C.textMuted }}>{l.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 2: Per-room utilisation bars + Type breakdown + Capacity waste histogram */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="col-span-1">
          <SectionHeader title="Room Utilisation" sub="Per-room booking rate this semester" />
          <div className="space-y-3">
            {[...ROOM_UTIL].sort((a, b) => b.util - a.util).map((r) => (
              <UtilBar key={r.room} room={r.room} util={r.util} type={r.type} />
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="By Room Type" sub="Booked vs empty seat-hours" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={TYPE_BREAKDOWN} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 0 }} barSize={10}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: C.textMuted, fontSize: 8, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="name" width={110} tick={{ fill: C.textSub, fontSize: 9, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
              <Bar dataKey="booked" name="Booked" stackId="a" fill={C.accent} radius={[0,0,0,0]} />
              <Bar dataKey="empty"  name="Empty"  stackId="a" fill={C.border}  radius={[3,3,3,3]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            {[{ color: C.accent, label: 'Booked' }, { color: C.border, label: 'Empty' }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded-sm" style={{ background: l.color }} />
                <span className="mono text-[9px]" style={{ color: C.textMuted }}>{l.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Capacity Waste Distribution" sub="How many rooms fall in each fill-rate band" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={CAPACITY_WASTE} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barSize={28}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" tick={{ fill: C.textMuted, fontSize: 8, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.textMuted, fontSize: 9, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => `${v} rooms`} />
              <Bar dataKey="rooms" name="Rooms" radius={[4, 4, 0, 0]}>
                {CAPACITY_WASTE.map((entry, i) => (
                  <Cell key={entry.range}
                    fill={['#334155','#475569', C.textMuted, C.cyan, C.accent][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Insight callout */}
          <div className="mt-4 rounded-lg px-3 py-2.5"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="mono text-[9px] uppercase tracking-widest mb-1" style={{ color: C.warning }}>Insight</div>
            <p className="text-[10px] leading-relaxed" style={{ color: C.textMuted }}>
              3 seminar rooms operate below 50% fill. Consolidating SEM-B &amp; SEM-C sessions into SEM-A could free 2 rooms for repurposing.
            </p>
          </div>
        </Card>
      </div>

      {/* Row 3: Department demand vs supply radar + Detailed table */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <SectionHeader title="Dept. Demand vs Supply" sub="Session hours requested vs available slots by department" />
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={DEPT_DEMAND} margin={{ top: 4, right: 20, bottom: 4, left: 20 }}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: C.textMuted, fontSize: 9, fontFamily: 'DM Mono, monospace' }} />
              <Radar name="Demand" dataKey="demand" stroke={C.danger}  fill={C.danger}  fillOpacity={0.12} strokeWidth={1.5} />
              <Radar name="Supply" dataKey="supply" stroke={C.success} fill={C.success} fillOpacity={0.08} strokeWidth={1.5} />
              <Tooltip {...TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-1">
            {[{ color: C.danger, label: 'Demand' }, { color: C.success, label: 'Supply' }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded" style={{ background: l.color }} />
                <span className="mono text-[9px]" style={{ color: C.textMuted }}>{l.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="col-span-2">
          <SectionHeader title="Detailed Room Metrics" sub="Per-room breakdown with waste flags" />
          <div className="overflow-auto" style={{ maxHeight: 270 }}>
            <table className="w-full border-collapse">
              <thead className="sticky top-0" style={{ background: C.surface }}>
                <tr>
                  {['Room', 'Type', 'Capacity', 'Util %', 'Waste %', 'Seat-hrs wasted/wk', 'Flag'].map((h) => (
                    <th key={h} className="text-left px-3 py-2"
                      style={{ color: C.textMuted, fontSize: 9, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...ROOM_UTIL].sort((a, b) => a.util - b.util).map((r, i) => {
                  const wastedHrs = Math.round(r.capacity * (r.waste / 100) * 30 / 5); // rough weekly seat-hrs
                  const flag = r.util >= 90 ? { label: 'Critical', color: C.danger } :
                               r.util >= 80 ? { label: 'High',     color: C.warning } :
                               r.util < 50  ? { label: 'Underused',color: C.textMuted } :
                                              { label: 'Normal',   color: C.success };
                  return (
                    <tr key={r.room}
                      style={{ background: i % 2 === 0 ? 'transparent' : C.surfaceAlt, borderBottom: `1px solid ${C.borderSub}` }}>
                      <td className="px-3 py-2 mono text-[11px]" style={{ color: C.textSub }}>{r.room}</td>
                      <td className="px-3 py-2 text-[10px]" style={{ color: C.textMuted }}>{r.type}</td>
                      <td className="px-3 py-2 mono text-[11px]" style={{ color: C.textSub }}>{r.capacity}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: C.border }}>
                            <div className="h-full rounded-full" style={{ width: `${r.util}%`, background: r.util >= 90 ? C.danger : r.util >= 70 ? C.accent : C.textMuted }} />
                          </div>
                          <span className="mono text-[10px]" style={{ color: C.textSub }}>{r.util}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 mono text-[11px]" style={{ color: r.waste > 40 ? C.warning : C.textMuted }}>{r.waste}%</td>
                      <td className="px-3 py-2 mono text-[11px]" style={{ color: C.textMuted }}>{wastedHrs.toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <span className="mono text-[9px] px-1.5 py-0.5 rounded"
                          style={{ background: `${flag.color}18`, color: flag.color, border: `1px solid ${flag.color}30` }}>
                          {flag.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Bottom padding */}
      <div className="h-6" />
    </div>
  );
}

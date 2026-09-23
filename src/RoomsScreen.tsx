import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from './theme';
import { ALL_ROOMS, BUILDINGS, ROOM_TYPES, ALL_EQUIPMENT, type Room } from './roomsData';
import { rooms as roomsApi } from './api/client';

type StatusFilter = 'All' | Room['status'];

const STATUS_COLORS: Record<Room['status'], { bg: string; text: string }> = {
  Available:   { bg: 'rgba(16,185,129,0.12)',  text: '#10b981' },
  Maintenance: { bg: 'rgba(245,158,11,0.12)',  text: '#f59e0b' },
  Closed:      { bg: 'rgba(239,68,68,0.12)',   text: '#ef4444' },
};

interface ClosureEntry { id: string; from: string; to: string; reason: string; }

interface RoomFormState {
  name: string; building: string; type: string;
  capacity: string; status: Room['status'];
  notes: string; closures: ClosureEntry[];
}

const BLANK_FORM: RoomFormState = {
  name: '', building: BUILDINGS[0], type: ROOM_TYPES[0], capacity: '',
  status: 'Available', notes: '', closures: [],
};

function newClosure(): ClosureEntry {
  return { id: Math.random().toString(36).slice(2), from: '', to: '', reason: '' };
}

export default function RoomsScreen() {
  const { tokens: C } = useTheme();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [equipFilter, setEquipFilter] = useState<string>('All');
  const [minCap, setMinCap] = useState<string>('');
  const [rooms, setRooms] = useState<Room[]>(ALL_ROOMS);
  const [apiLive, setApiLive] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; editId: string | null; form: RoomFormState }>({
    open: false, editId: null, form: BLANK_FORM,
  });

  // Load rooms from backend (fallback to static mock offline)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await roomsApi.list();
        if (!cancelled && Array.isArray(list) && list.length) {
          setRooms(list as unknown as Room[]);
          setApiLive(true);
        }
      } catch { /* offline — keep mock */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => rooms.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.name.toLowerCase().includes(q) || r.building.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || (r.equipment ?? []).join(' ').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchType = typeFilter === 'All' || r.type === typeFilter;
    const matchEquip = equipFilter === 'All' || (r.equipment ?? []).includes(equipFilter as never);
    const matchCap = !minCap || r.capacity >= (parseInt(minCap, 10) || 0);
    return matchSearch && matchStatus && matchType && matchEquip && matchCap;
  }), [rooms, search, statusFilter, typeFilter, equipFilter, minCap]);

  const openAdd = () => setModal({ open: true, editId: null, form: { ...BLANK_FORM } });
  const openEdit = (room: Room) => setModal({
    open: true, editId: room.id,
    form: {
      name: room.name, building: room.building, type: room.type,
      capacity: String(room.capacity), status: room.status,
      notes: room.notes ?? '',
      closures: (room.closures ?? []).map(c => ({ id: Math.random().toString(36).slice(2), from: c.from, to: c.to, reason: c.reason })),
    },
  });
  const closeModal = () => setModal(m => ({ ...m, open: false }));

  const handleSave = async () => {
    const { form, editId } = modal;
    if (!form.name.trim() || !form.capacity.trim()) return;
    const existing = editId ? rooms.find(r => r.id === editId) : undefined;
    const base = {
      name: form.name.trim(), building: form.building, type: form.type as Room['type'],
      capacity: parseInt(form.capacity, 10) || 0, status: form.status,
      notes: form.notes.trim(),
      closures: form.closures.filter(c => c.from && c.to).map(c => ({ label: c.reason || 'Closure', from: c.from, to: c.to, reason: c.reason })),
      accessibility: existing?.accessibility ?? [],
      equipment: existing?.equipment ?? [],
      floor: existing?.floor ?? 1,
      examCapacity: existing?.examCapacity ?? Math.max(0, (parseInt(form.capacity, 10) || 0) - 10),
      bookingRate: existing?.bookingRate ?? 0,
    };
    if (editId) {
      setRooms(prev => prev.map(r => r.id === editId ? { ...r, ...base } : r));
      try { void roomsApi.update(editId, base); } catch { /* offline */ }
    } else {
      const payload = { ...base, id: `r${Date.now()}` };
      setRooms(prev => [...prev, payload]);
      try { await roomsApi.create(payload); } catch { /* offline */ }
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this room?')) return;
    setRooms(prev => prev.filter(r => r.id !== id));
    try { void roomsApi.remove(id).catch(() => roomsApi.update(id, { status: 'Closed' } as Partial<Room>).catch(() => {})); } catch { /* offline */ }
  };

  const updateForm = (patch: Partial<RoomFormState>) => setModal(m => ({ ...m, form: { ...m.form, ...patch } }));

  const input: React.CSSProperties = {
    background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.text,
    borderRadius: 8, outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: 12,
    padding: '7px 10px', width: '100%',
  };

  const counts: Record<string, number> = { Available: 0, Maintenance: 0, Closed: 0 };
  rooms.forEach(r => counts[r.status] = (counts[r.status] ?? 0) + 1);

  return (
    <div className="h-full overflow-y-auto" style={{ background: C.bg }}>
      <div className="max-w-5xl mx-auto px-5 py-5">

        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>Rooms & Facilities {apiLive && <span style={{ color: C.success, fontSize: 11 }}>· API live</span>}</div>
            <div className="text-[9px] mt-0.5" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>{rooms.length} rooms across {BUILDINGS.length} buildings</div>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ background: C.accent, color: '#fff', fontFamily: 'Inter, sans-serif' }}
          >
            + Add Room
          </button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {(['Available', 'Maintenance', 'Closed'] as const).map(s => (
            <div key={s} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s].text }} />
              <div>
                <div className="text-base font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>{counts[s] ?? 0}</div>
                <div className="text-[9px]" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>{s.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search + filter bar */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <div className="relative flex-1" style={{ maxWidth: 300, minWidth: 200 }}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4" stroke={C.textMuted} strokeWidth="1.3"/>
              <path d="M9.5 9.5l2.5 2.5" stroke={C.textMuted} strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search room, building, type, equipment…"
              style={{ ...input, paddingLeft: 30, fontSize: 14 }}
            />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ ...input, width: 150, fontSize: 13 }}>
            <option value="All">All types</option>
            {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={equipFilter} onChange={e => setEquipFilter(e.target.value)} style={{ ...input, width: 170, fontSize: 13 }}>
            <option value="All">All equipment</option>
            {ALL_EQUIPMENT.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input value={minCap} onChange={e => setMinCap(e.target.value)} type="number" placeholder="Min cap." style={{ ...input, width: 100, fontSize: 13 }} />
          <div className="flex gap-1">
            {(['All', 'Available', 'Maintenance', 'Closed'] as StatusFilter[]).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: statusFilter === s ? (s === 'All' ? C.accentBg : STATUS_COLORS[s as Room['status']]?.bg ?? C.accentBg) : C.surface,
                  color: statusFilter === s ? (s === 'All' ? C.accent : STATUS_COLORS[s as Room['status']]?.text ?? C.accent) : C.textMuted,
                  border: `1px solid ${statusFilter === s ? 'transparent' : C.border}`,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.surfaceAlt }}>
                {['Room Code', 'Building', 'Type', 'Capacity', 'Status', ''].map(h => (
                  <th key={h} className="text-[9px] font-semibold text-left px-4 py-2.5" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace', borderBottom: `1px solid ${C.border}`, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-xs" style={{ color: C.textMuted }}>
                    No rooms match your filter.
                  </td>
                </tr>
              )}
              {filtered.map((room, i) => (
                <tr
                  key={room.id}
                  style={{ background: i % 2 === 0 ? C.surface : C.surfaceAlt, borderBottom: `1px solid ${C.borderSub}` }}
                >
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-bold" style={{ fontFamily: 'DM Mono, monospace', color: C.text }}>{room.name}</span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: C.textSub }}>{room.building}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: C.textSub }}>{room.type}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold" style={{ fontFamily: 'DM Mono, monospace', color: C.text }}>{room.capacity}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[9px] font-bold px-2 py-1 rounded-full"
                      style={{ background: STATUS_COLORS[room.status].bg, color: STATUS_COLORS[room.status].text, fontFamily: 'DM Mono, monospace' }}
                    >
                      {room.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEdit(room)}
                        className="text-[10px] px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
                        style={{ background: C.accentBg, color: C.accent, border: `1px solid ${C.accent}30`, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="text-[10px] px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
                        style={{ background: C.dangerBg, color: C.danger, border: `1px solid ${C.danger}30`, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-[9px] mt-2 text-right" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>
          {filtered.length} of {rooms.length} rooms
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={closeModal}>
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{ background: C.surfaceRaised, border: `1px solid ${C.border}`, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
              <div className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>
                {modal.editId ? 'Edit Room' : 'Add Room'}
              </div>
              <button onClick={closeModal} className="text-sm hover:opacity-50 transition-opacity" style={{ color: C.textMuted }}>✕</button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {/* Row 1: Code + Building */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>Room Code *</label>
                  <input
                    value={modal.form.name}
                    onChange={e => updateForm({ name: e.target.value })}
                    placeholder="e.g. LT-105"
                    style={input}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>Building *</label>
                  <select value={modal.form.building} onChange={e => updateForm({ building: e.target.value })} style={{ ...input, appearance: 'auto' }}>
                    {BUILDINGS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2: Type + Capacity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>Type *</label>
                  <select value={modal.form.type} onChange={e => updateForm({ type: e.target.value })} style={{ ...input, appearance: 'auto' }}>
                    {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>Capacity *</label>
                  <input
                    type="number"
                    value={modal.form.capacity}
                    onChange={e => updateForm({ capacity: e.target.value })}
                    placeholder="e.g. 120"
                    style={input}
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[9px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>Status</label>
                <div className="flex gap-2">
                  {(['Available', 'Maintenance', 'Closed'] as Room['status'][]).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateForm({ status: s })}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: modal.form.status === s ? STATUS_COLORS[s].bg : C.surface,
                        color: modal.form.status === s ? STATUS_COLORS[s].text : C.textMuted,
                        border: `1px solid ${modal.form.status === s ? STATUS_COLORS[s].text + '40' : C.border}`,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[9px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>Notes</label>
                <textarea
                  value={modal.form.notes}
                  onChange={e => updateForm({ notes: e.target.value })}
                  placeholder="Optional notes about this room…"
                  rows={2}
                  style={{ ...input, resize: 'vertical' }}
                />
              </div>

              {/* Closure windows */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>Closure Windows</label>
                  <button
                    type="button"
                    onClick={() => updateForm({ closures: [...modal.form.closures, newClosure()] })}
                    className="text-[10px] px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
                    style={{ background: C.accentBg, color: C.accent, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                  >
                    + Add
                  </button>
                </div>
                {modal.form.closures.length === 0 && (
                  <div className="text-xs py-3 text-center rounded-lg" style={{ background: C.surfaceAlt, color: C.textMuted, border: `1px dashed ${C.border}` }}>
                    No closure windows defined
                  </div>
                )}
                {modal.form.closures.map((cl, idx) => (
                  <div key={cl.id} className="flex items-start gap-2 mb-2 p-3 rounded-xl" style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-[8px] mb-1" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>START</div>
                        <input type="datetime-local" value={cl.from}
                          onChange={e => updateForm({ closures: modal.form.closures.map((c, i) => i === idx ? { ...c, from: e.target.value } : c) })}
                          style={{ ...input, fontSize: 11 }} />
                      </div>
                      <div>
                        <div className="text-[8px] mb-1" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>END</div>
                        <input type="datetime-local" value={cl.to}
                          onChange={e => updateForm({ closures: modal.form.closures.map((c, i) => i === idx ? { ...c, to: e.target.value } : c) })}
                          style={{ ...input, fontSize: 11 }} />
                      </div>
                      <div className="col-span-2">
                        <input placeholder="Reason (optional)" value={cl.reason}
                          onChange={e => updateForm({ closures: modal.form.closures.map((c, i) => i === idx ? { ...c, reason: e.target.value } : c) })}
                          style={{ ...input, fontSize: 11 }} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateForm({ closures: modal.form.closures.filter((_, i) => i !== idx) })}
                      className="mt-5 text-sm hover:opacity-50 transition-opacity flex-shrink-0"
                      style={{ color: C.danger }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-2 justify-end px-5 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${C.border}` }}>
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: C.surface, color: C.textSub, border: `1px solid ${C.border}`, fontFamily: 'Inter, sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!modal.form.name.trim() || !modal.form.capacity.trim()}
                className="px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-40"
                style={{ background: C.accent, color: '#fff', fontFamily: 'Inter, sans-serif' }}
              >
                {modal.editId ? 'Save Changes' : 'Add Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

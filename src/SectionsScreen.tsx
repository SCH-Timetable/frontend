import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from './theme';
import { sections as sectionsApi, students as studentsApi } from './api/client';
import type { Section, ManagedStudent, CourseRegistration } from './api/client';

const YEARS = ['All Years', 'Year 1', 'Year 2', 'Year 3', 'Year 4'];
const TERMS = ['All Terms', 'Fall', 'Spring', 'Summer'];
const MAJORS = ['CS', 'IT', 'AI', 'DS'];

interface FormState {
  code: string; name: string; staff: string; group: string;
  capacity: string; year: string; term: string;
  academic_year?: number;
  major?: 'CS' | 'IT' | 'AI' | 'DS';
}

const BLANK: FormState = { code: '', name: '', staff: '', group: '', capacity: '30', year: 'Year 2', term: 'Fall', academic_year: undefined, major: undefined };

export default function SectionsScreen() {
  const { tokens: C } = useTheme();
  const [list, setList] = useState<Section[]>([]);
  const [students, setStudents] = useState<ManagedStudent[]>([]);
  const [live, setLive] = useState(false);
  const [q, setQ] = useState('');
  const [year, setYear] = useState('All Years');
  const [term, setTerm] = useState('All Terms');
  const [modal, setModal] = useState<{ open: boolean; editId: string | null; form: FormState }>({ open: false, editId: null, form: BLANK });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [regs, setRegs] = useState<Record<string, CourseRegistration[]>>({});
  const [assignStudent, setAssignStudent] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, st] = await Promise.all([sectionsApi.list(), studentsApi.list()]);
        if (!cancelled) { setList(s); setStudents(st); setLive(true); }
      } catch { /* offline */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => list.filter(s => {
    const query = q.toLowerCase();
    return (!query || s.code.toLowerCase().includes(query) || s.name.toLowerCase().includes(query) || s.staff.toLowerCase().includes(query))
      && (year === 'All Years' || s.year === year)
      && (term === 'All Terms' || s.term === term);
  }), [list, q, year, term]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 3000); };

  const save = async () => {
    const { form, editId } = modal;
    if (!form.code.trim() || !form.name.trim() || !form.staff.trim() || !form.group.trim()) return;
    try {
      if (editId) {
        const updated = await sectionsApi.update(editId, {
          name: form.name.trim(), staff: form.staff.trim(), group: form.group.trim(),
          capacity: parseInt(form.capacity, 10) || 30, year: form.year, term: form.term,
        });
        setList(prev => prev.map(s => (s.id === editId ? updated : s)));
        flash('Section updated');
      } else {
        const created = await sectionsApi.create({
          code: form.code.trim(), name: form.name.trim(), staff: form.staff.trim(),
          group: form.group.trim(), capacity: parseInt(form.capacity, 10) || 30,
          year: form.year, term: form.term,
        });
        setList(prev => [...prev, created]);
        flash('Section created');
      }
      setModal({ open: false, editId: null, form: BLANK });
    } catch (e) { flash(e instanceof Error ? e.message : 'Save failed'); }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this section?')) return;
    try {
      await sectionsApi.remove(id);
      setList(prev => prev.filter(s => s.id !== id));
    } catch (e) { flash(e instanceof Error ? e.message : 'Delete failed'); }
  };

  const openRegs = async (sectionId: string) => {
    if (expanded === sectionId) { setExpanded(null); return; }
    setExpanded(sectionId);
    if (!regs[sectionId]) {
      try {
        const all: CourseRegistration[] = [];
        for (const st of students) {
          const r = await studentsApi.registrationsOf(st.id);
          all.push(...r.filter(x => x.section_id === sectionId));
        }
        setRegs(prev => ({ ...prev, [sectionId]: all }));
      } catch { /* offline */ }
    }
  };

  const assign = async (section: Section) => {
    if (!assignStudent) return;
    try {
      const created = await studentsApi.register(assignStudent, [section.id], section.year, section.term);
      setRegs(prev => ({ ...prev, [section.id]: [...(prev[section.id] ?? []), ...created] }));
      setList(prev => prev.map(s => (s.id === section.id ? { ...s, enrolled: s.enrolled + created.length } : s)));
      setAssignStudent('');
      flash(`${created.length} registration(s) saved`);
    } catch (e) { flash(e instanceof Error ? e.message : 'Registration failed'); }
  };

  const input: React.CSSProperties = {
    background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.text,
    borderRadius: 8, outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: 12,
    padding: '7px 10px', width: '100%',
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: C.bg }}>
      <div className="max-w-5xl mx-auto px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>
              Sections & Registration {live && <span style={{ color: C.success, fontSize: 11 }}>· API live</span>}
            </div>
            <div className="text-[9px] mt-0.5" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>
              {filtered.length} sections · course registration by year & term
            </div>
          </div>
          <button onClick={() => setModal({ open: true, editId: null, form: { ...BLANK } })}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90"
            style={{ background: C.accent, color: '#fff' }}>
            + Add Section
          </button>
        </div>

        {msg && (
          <div className="px-3 py-2 rounded-lg text-xs mb-3" style={{ background: C.accentBg, color: C.accent, border: `1px solid ${C.accent}30` }}>
            {msg}
          </div>
        )}

        <div className="flex gap-2 mb-4 flex-wrap">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search code / name / staff…" style={{ ...input, maxWidth: 260 }} />
          <select value={year} onChange={e => setYear(e.target.value)} style={{ ...input, maxWidth: 130 }}>
            {YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
          <select value={term} onChange={e => setTerm(e.target.value)} style={{ ...input, maxWidth: 130 }}>
            {TERMS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          {filtered.map(s => {
            const full = s.enrolled >= s.capacity;
            const sectionRegs = regs[s.id] ?? [];
            return (
              <div key={s.id} className="rounded-xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold" style={{ fontFamily: 'DM Mono, monospace', color: C.accent }}>{s.code}</span>
                      <span className="text-xs font-semibold" style={{ color: C.text }}>{s.name}</span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: C.surfaceAlt, color: C.textMuted }}>{s.year} · {s.term}</span>
                      {full && <span className="text-[8px] px-1.5 py-0.5 rounded font-bold" style={{ background: '#ef444415', color: '#ef4444' }}>FULL</span>}
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>
                      👤 {s.staff} · 👥 {s.group} · {s.enrolled}/{s.capacity} seats
                    </div>
                    {s.academic_year && <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: '#e0e7ff', color: '#3730a3', fontFamily: 'DM Mono, monospace' }}>AY{s.academic_year}</span>}
                    {s.major && <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: '#fef3c7', color: '#92400e', fontFamily: 'DM Mono, monospace' }}>{s.major}</span>}
                  </div>
                  <button onClick={() => openRegs(s.id)} className="text-[11px] px-2.5 py-1 rounded-lg" style={{ background: C.surfaceAlt, color: C.textSub, border: `1px solid ${C.border}` }}>
                    {expanded === s.id ? 'Hide' : `Registrations${sectionRegs.length ? ` (${sectionRegs.length})` : ''}`}
                  </button>
                  <button onClick={() => setModal({ open: true, editId: s.id, form: { code: s.code, name: s.name, staff: s.staff, group: s.group, capacity: String(s.capacity), year: s.year, term: s.term, academic_year: s.academic_year, major: s.major } })}
                    className="text-[11px] px-2.5 py-1 rounded-lg" style={{ background: C.accentBg, color: C.accent, border: `1px solid ${C.accent}40` }}>
                    Edit
                  </button>
                  <button onClick={() => remove(s.id)} className="text-[11px] px-2.5 py-1 rounded-lg" style={{ background: C.dangerBg, color: C.danger, border: `1px solid ${C.danger}30` }}>
                    Delete
                  </button>
                </div>

                {expanded === s.id && (
                  <div className="px-4 pb-3 pt-1 space-y-2" style={{ borderTop: `1px solid ${C.borderSub}` }}>
                    <div className="flex gap-2 items-center">
                      <select value={assignStudent} onChange={e => setAssignStudent(e.target.value)} style={{ ...input, maxWidth: 260 }}>
                        <option value="">Select student to register…</option>
                        {students.map(st => <option key={st.id} value={st.id}>{st.name} · {st.group}</option>)}
                      </select>
                      <button disabled={!assignStudent || full} onClick={() => assign(s)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40"
                        style={{ background: C.accent, color: '#fff' }}>
                        Register
                      </button>
                    </div>
                    {sectionRegs.length === 0
                      ? <div className="text-[11px]" style={{ color: C.textMuted }}>No registrations loaded yet.</div>
                      : sectionRegs.map(r => {
                        const st = students.find(x => x.id === r.student_id);
                        return (
                          <div key={r.id} className="flex items-center gap-2 text-[11px] px-2 py-1.5 rounded-lg" style={{ background: C.surfaceAlt, color: C.textSub }}>
                            <span className="font-semibold" style={{ color: C.text }}>{st?.name ?? r.student_id}</span>
                            <span style={{ color: C.textMuted }}>{st?.group} · {r.year} · {r.term} · {r.status}</span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-sm" style={{ color: C.textMuted }}>No sections match.</div>
          )}
        </div>
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setModal(m => ({ ...m, open: false }))}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl p-5 space-y-3" style={{ background: C.surfaceRaised, border: `1px solid ${C.border}` }}>
            <div className="text-sm font-bold" style={{ color: C.text }}>{modal.editId ? 'Edit section' : 'Add section'}</div>
            <div className="grid grid-cols-2 gap-2">
              <input value={modal.form.code} disabled={!!modal.editId} onChange={e => setModal(m => ({ ...m, form: { ...m.form, code: e.target.value } }))} placeholder="Code *" style={input} />
              <input value={modal.form.group} onChange={e => setModal(m => ({ ...m, form: { ...m.form, group: e.target.value } }))} placeholder="Group *" style={input} />
              <input value={modal.form.name} onChange={e => setModal(m => ({ ...m, form: { ...m.form, name: e.target.value } }))} placeholder="Name *" style={{ ...input, gridColumn: 'span 2' }} />
              <input value={modal.form.staff} onChange={e => setModal(m => ({ ...m, form: { ...m.form, staff: e.target.value } }))} placeholder="Staff *" style={{ ...input, gridColumn: 'span 2' }} />
              <input type="number" value={modal.form.capacity} onChange={e => setModal(m => ({ ...m, form: { ...m.form, capacity: e.target.value } }))} placeholder="Capacity" style={input} />
              <select value={modal.form.term} onChange={e => setModal(m => ({ ...m, form: { ...m.form, term: e.target.value } }))} style={input}>
                {['Fall', 'Spring', 'Summer'].map(t => <option key={t}>{t}</option>)}
              </select>
              <select value={modal.form.year} onChange={e => setModal(m => ({ ...m, form: { ...m.form, year: e.target.value } }))} style={{ ...input, gridColumn: 'span 2' }}>
                {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setModal(m => ({ ...m, open: false }))} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: C.textSub, border: `1px solid ${C.border}` }}>Cancel</button>
              <button onClick={save} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: C.accent, color: '#fff' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

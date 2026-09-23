import { useState } from 'react';
import { useTheme } from './theme';

export type AppRole = 'admin' | 'lecturer' | 'student';

export interface UserProfile {
  name: string;
  email: string;
  dept: string;
  phone: string;
}

const DEFAULTS: Record<AppRole, UserProfile> = {
  admin: { name: 'Scheduler Admin', email: 'scheduler@badr.edu.eg', dept: 'Academic Scheduling Office', phone: '+20 88 000 0000' },
  lecturer: { name: 'Dr. Chen Wei', email: 'dr.chen@staff.badr.edu.eg', dept: 'Computer Science', phone: '+20 88 000 0001' },
  student: { name: 'Amara Osei', email: 'amara@badr.edu.eg', dept: 'BSc Computer Science · CS-3A', phone: '+20 10 000 0000' },
};

const KEY = 'bua-profile-v1';

export function loadProfile(role: AppRole): UserProfile {
  try {
    const raw = localStorage.getItem(`${KEY}-${role}`);
    if (raw) return { ...DEFAULTS[role], ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULTS[role];
}

export default function ProfileModal({ role, onClose, onSave }: {
  role: AppRole; onClose: () => void; onSave: (p: UserProfile) => void;
}) {
  const { tokens: C } = useTheme();
  const [form, setForm] = useState<UserProfile>(() => loadProfile(role));
  const [saved, setSaved] = useState(false);

  const set = (k: keyof UserProfile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const input: React.CSSProperties = {
    width: '100%', padding: '10px 12px', background: C.surfaceAlt,
    border: `1px solid ${C.border}`, borderRadius: 10, color: C.text,
    fontFamily: 'Inter, sans-serif', fontSize: 14, outline: 'none',
  };

  const handleSave = () => {
    try { localStorage.setItem(`${KEY}-${role}`, JSON.stringify(form)); } catch { /* ignore */ }
    onSave(form);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: C.surfaceRaised, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', color: C.text, fontSize: 18, fontWeight: 700 }}>My Profile</div>
            <div style={{ color: C.textMuted, fontSize: 13 }}>Role: {role} · stored locally on this device</div>
          </div>
          <button onClick={onClose} style={{ color: C.textMuted, fontSize: 16 }}>✕</button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label style={{ color: C.textMuted, fontSize: 12 }}>Full name</label>
            <input value={form.name} onChange={set('name')} style={input} />
          </div>
          <div>
            <label style={{ color: C.textMuted, fontSize: 12 }}>University email</label>
            <input value={form.email} onChange={set('email')} style={input} />
          </div>
          <div>
            <label style={{ color: C.textMuted, fontSize: 12 }}>Department / group</label>
            <input value={form.dept} onChange={set('dept')} style={input} />
          </div>
          <div>
            <label style={{ color: C.textMuted, fontSize: 12 }}>Phone</label>
            <input value={form.phone} onChange={set('phone')} style={input} />
          </div>
        </div>
        <div className="flex gap-2 justify-end px-5 py-4" style={{ borderTop: `1px solid ${C.border}` }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg" style={{ background: C.surface, color: C.textSub, border: `1px solid ${C.border}`, fontSize: 14 }}>Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg" style={{ background: saved ? C.success : C.accent, color: '#fff', fontSize: 14, fontWeight: 700 }}>{saved ? 'Saved ✓' : 'Save changes'}</button>
        </div>
      </div>
    </div>
  );
}

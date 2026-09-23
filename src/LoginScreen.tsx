import { useState } from 'react';
import { useTheme } from './theme';
import { auth as authApi, setToken } from './api/client';

type Role = 'admin' | 'lecturer' | 'student';

interface Props { onLogin: (role: Role, displayName?: string, email?: string, token?: string) => void; }

export default function LoginScreen({ onLogin }: Props) {
  const { tokens: C, isDark, toggle } = useTheme();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [phase, setPhase]       = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhase('loading');
    setErrorMsg('');

    try {
      const res = await authApi.login(email.trim(), password);
      setToken(res.token);
      setPhase('idle');
      onLogin(res.role, res.display_name, email.trim(), res.token);
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setPhase('error');
      setErrorMsg(msg || 'Backend is unavailable. Please try again.');
      return;
    }
  };

  const requestReset = async () => {
    setForgotBusy(true); setForgotMessage('');
    try {
      const result = await authApi.forgotPassword(email.trim());
      setResetToken(result.reset_token);
      setForgotMessage(`Reset token created. It expires in ${result.expires_in_minutes} minutes.`);
    } catch (err) {
      setForgotMessage(err instanceof Error ? err.message : 'Unable to create reset token.');
    } finally { setForgotBusy(false); }
  };

  const submitReset = async () => {
    setForgotBusy(true); setForgotMessage('');
    try {
      await authApi.resetPassword(resetToken, newPassword);
      setForgotMessage('Password updated. You can sign in now.');
      setResetToken(''); setNewPassword('');
    } catch (err) {
      setForgotMessage(err instanceof Error ? err.message : 'Unable to reset password.');
    } finally { setForgotBusy(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    color: C.text,
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  const isLoading = phase === 'loading';

  return (
    <div
      className="flex h-screen"
      style={{ background: C.bg, fontFamily: 'Inter, sans-serif' }}
    >
      {/* ── Left brand panel ────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between px-12 py-12 relative overflow-hidden"
        style={{ width: '42%', background: C.primaryBg, borderRight: `1px solid ${C.headerBorder}` }}
      >
        {/* Background grid pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04]"
          style={{ pointerEvents: 'none' }}
          aria-hidden
        >
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Radial accent glow */}
        <div
          className="absolute"
          style={{ bottom: -120, left: -80, width: 420, height: 420, borderRadius: '50%', background: `radial-gradient(circle, ${C.accent}18 0%, transparent 70%)`, pointerEvents: 'none' }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: C.accent }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="3" width="20" height="18" rx="2" stroke="white" strokeWidth="1.5" />
              <path d="M2 7h20M2 11h20M2 15h20M2 19h20" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="4 4" />
              <path d="M6 3v18M10 3v18M14 3v18M18 3v18" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="4 4" />
              <rect x="6" y="7" width="4" height="4" rx="0.5" fill="white" fillOpacity="0.3" />
              <rect x="14" y="11" width="4" height="4" rx="0.5" fill="white" fillOpacity="0.5" />
              <rect x="10" y="15" width="4" height="4" rx="0.5" fill="white" fillOpacity="0.8" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#fff', letterSpacing: '-0.01em' }}>
              Bua University
            </div>
            <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Mono, monospace' }}>
              Assiut · Egypt
            </div>
          </div>
        </div>

        {/* Headline block */}
        <div className="relative">
          <div
            className="inline-block text-[9px] font-semibold px-2.5 py-1 rounded-full mb-5"
            style={{ background: 'rgba(59,111,212,0.2)', color: '#7ba4e0', fontFamily: 'DM Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            AY 2025 / 26 · Semester 2
          </div>

          <h1
            className="text-[2.1rem] font-bold leading-[1.15] mb-5"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#fff', letterSpacing: '-0.025em' }}
          >
            Timetable &<br />Room Allocation<br />
            <span style={{ color: '#7ba4e0' }}>System</span>
          </h1>

          <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 320, fontSize: 15 }}>
            Centralised scheduling across all faculties, departments, and facilities — powered by role-based access control.
          </p>

          {/* Feature bullets — no fake stats */}
          <div className="flex flex-col gap-3 mt-10">
            {['Conflict-free draft & publish workflow', 'Room / lab search by capacity & equipment', 'Personal timetables + ICS export'].map(t => (
              <div key={t} className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59,111,212,0.2)', color: '#7ba4e0', fontSize: 13 }}>✓</span>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative text-[9px]" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'DM Mono, monospace' }}>
          Authorised access only · IT Security Policy v4.2
        </div>
      </div>

      {/* ── Right: sign-in panel ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 relative overflow-y-auto">

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="absolute top-5 right-5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all hover:opacity-75"
          style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textMuted }}
        >
          {isDark
            ? <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.75 2.75l1.06 1.06M10.19 10.19l1.06 1.06M2.75 11.25l1.06-1.06M10.19 3.81l1.06-1.06" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            : <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M11.5 9.5A5 5 0 014.5 2.5a5.5 5.5 0 107 7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
          }
          {isDark ? 'Light' : 'Dark'}
        </button>

        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.accent }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="3" width="20" height="18" rx="2" stroke="white" strokeWidth="1.5" />
                <path d="M2 7h20M2 11h20M2 15h20M2 19h20" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="4 4" />
                <path d="M6 3v18M10 3v18M14 3v18M18 3v18" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="4 4" />
                <rect x="6" y="7" width="4" height="4" rx="0.5" fill="white" fillOpacity="0.3" />
                <rect x="14" y="11" width="4" height="4" rx="0.5" fill="white" fillOpacity="0.5" />
                <rect x="10" y="15" width="4" height="4" rx="0.5" fill="white" fillOpacity="0.8" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: C.text }}>Bua University</div>
              <div className="text-[9px]" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>Timetable & Room Allocation</div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2
              className="text-xl font-bold mb-1"
              style={{ fontFamily: 'Outfit, sans-serif', color: C.text, letterSpacing: '-0.02em' }}
            >
              Sign in
            </h2>
            <p className="text-xs" style={{ color: C.textMuted }}>
              Use your university credentials. Access level is assigned automatically.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Email */}
            <div>
              <label
                className="block text-[9px] font-semibold uppercase tracking-widest mb-2"
                style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}
              >
                University Email
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); if (phase === 'error') setPhase('idle'); }}
                placeholder="you@bua.edu.eg"
                required
                style={{
                  ...inputStyle,
                  borderColor: phase === 'error' ? C.danger + '70' : C.border,
                }}
                onFocus={e => (e.currentTarget.style.borderColor = C.accent)}
                onBlur={e => (e.currentTarget.style.borderColor = phase === 'error' ? C.danger + '70' : C.border)}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-[9px] font-semibold uppercase tracking-widest"
                  style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}
                >
                  Password
                </label>
                <button type="button" onClick={() => { setForgotOpen(true); setForgotMessage(''); }} className="text-[10px] hover:opacity-70 transition-opacity" style={{ color: C.accent }}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (phase === 'error') setPhase('idle'); }}
                  placeholder="••••••••••"
                  required
                  style={{
                    ...inputStyle,
                    paddingRight: 44,
                    borderColor: phase === 'error' ? C.danger + '70' : C.border,
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = C.accent)}
                  onBlur={e => (e.currentTarget.style.borderColor = phase === 'error' ? C.danger + '70' : C.border)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-60"
                  style={{ color: C.textMuted, lineHeight: 1 }}
                  tabIndex={-1}
                >
                  {showPass
                    ? <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M1 1l18 18M8.94 8.94A3 3 0 0011.06 11.06M10 4C5 4 2 10 2 10s1 2 3 3.5m5.5 1.3A9 9 0 0018 10s-3-6-8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><ellipse cx="10" cy="10" rx="8" ry="6" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Error banner */}
            {phase === 'error' && (
              <div
                className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-xs leading-snug"
                style={{ background: C.dangerBg, color: C.danger, border: `1px solid ${C.danger}25` }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-px">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                {errorMsg}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2.5"
              style={{
                background: C.accent,
                color: '#fff',
                fontFamily: 'Outfit, sans-serif',
                cursor: isLoading ? 'wait' : 'pointer',
                marginTop: 8,
              }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                    <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Authenticating…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {forgotOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
              <div className="w-full max-w-sm rounded-2xl p-5" style={{ background: C.surfaceRaised, border: `1px solid ${C.border}` }}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold" style={{ color: C.text, fontFamily: 'Outfit, sans-serif', fontSize: 18 }}>Reset password</h3>
                  <button type="button" onClick={() => setForgotOpen(false)} style={{ color: C.textMuted }}>✕</button>
                </div>
                <p className="text-xs mb-4" style={{ color: C.textMuted }}>Enter your university email to create a 15-minute reset token.</p>
                {!resetToken ? (
                  <button type="button" onClick={requestReset} disabled={forgotBusy || !email.trim()} className="w-full py-2.5 rounded-lg font-semibold disabled:opacity-40" style={{ background: C.accent, color: '#fff' }}>
                    {forgotBusy ? 'Creating token…' : 'Create reset token'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <input value={resetToken} onChange={e => setResetToken(e.target.value)} placeholder="Reset token" style={inputStyle} />
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (8+ characters)" style={inputStyle} />
                    <button type="button" onClick={submitReset} disabled={forgotBusy || newPassword.length < 8} className="w-full py-2.5 rounded-lg font-semibold disabled:opacity-40" style={{ background: C.accent, color: '#fff' }}>
                      {forgotBusy ? 'Updating…' : 'Update password'}
                    </button>
                  </div>
                )}
                {forgotMessage && <p className="text-xs mt-3 break-all" style={{ color: forgotMessage.includes('updated') || forgotMessage.includes('created') ? C.success : C.danger }}>{forgotMessage}</p>}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: C.border }} />
            <span className="text-[10px]" style={{ color: C.textMuted, fontFamily: 'DM Mono, monospace' }}>OR</span>
            <div className="flex-1 h-px" style={{ background: C.border }} />
          </div>

          {/* Policy note */}
          <p className="text-center mt-6 leading-relaxed" style={{ color: C.textMuted, fontSize: 13 }}>
            By signing in you accept the{' '}
            <span style={{ color: C.accent, cursor: 'pointer' }}>Acceptable Use Policy</span>
            {' '}and{' '}
            <span style={{ color: C.accent, cursor: 'pointer' }}>Privacy Notice</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

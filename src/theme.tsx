import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// ─── Design System Tokens ─────────────────────────────────────────────────────
// Bua University · Assiut
// Primary brand: deep slate-navy (#1a2d50)
// Interactive accent: university blue (#3b6fd4)
// ─────────────────────────────────────────────────────────────────────────────

export interface Tokens {
  // ── Surfaces ──────────────────────────────────────────────────────────────
  bg:             string; // page background
  surface:        string; // cards, panels
  surfaceAlt:     string; // zebra-stripe, sidebar
  surfaceHover:   string; // hover state bg
  surfaceRaised:  string; // elevated modals, dropdowns

  // ── Brand surfaces ────────────────────────────────────────────────────────
  primaryBg:      string; // deep-navy header / sidebar
  primaryHover:   string; // hover on primary bg

  // ── Borders ───────────────────────────────────────────────────────────────
  border:         string; // default rule
  borderSub:      string; // subtle row separator
  borderStrong:   string; // emphasized divider

  // ── Text ──────────────────────────────────────────────────────────────────
  text:           string; // primary body
  textSub:        string; // secondary labels
  textMuted:      string; // placeholder / metadata
  textOnPrimary:  string; // text on deep-navy surfaces

  // ── Brand ─────────────────────────────────────────────────────────────────
  primary:        string; // deep slate navy — brand identity
  accent:         string; // interactive blue — links, buttons, focus
  accentBg:       string; // 10-12% accent fill

  // ── Semantic ──────────────────────────────────────────────────────────────
  success:        string;
  successBg:      string;
  warning:        string;
  warningBg:      string;
  danger:         string;
  dangerBg:       string;
  info:           string;
  infoBg:         string;

  // ── Extended palette ──────────────────────────────────────────────────────
  cyan:           string;
  violet:         string;
  amber:          string;
  emerald:        string;

  // ── Nav / Header specifics ────────────────────────────────────────────────
  headerBg:       string;
  headerBorder:   string;
  navActiveBg:    string;
  navActiveBorder:string;
  navActiveText:  string;

  // ── Chart tooltip ─────────────────────────────────────────────────────────
  tooltipBg:      string;
  tooltipBorder:  string;
  tooltipText:    string;

  // ── Drag-drop ─────────────────────────────────────────────────────────────
  dropTargetBg:   string;
  dropTargetBorder:string;
  dragGhost:      string;
}

const DARK: Tokens = {
  bg:             '#0d1426',
  surface:        '#141d33',
  surfaceAlt:     '#10182c',
  surfaceHover:   '#1a2640',
  surfaceRaised:  '#18213a',

  primaryBg:      '#111b33',
  primaryHover:   '#182445',

  border:         '#2a3d5a',
  borderSub:      '#1a2638',
  borderStrong:   '#354a6a',

  text:           '#eef2f8',
  textSub:        '#a8b8d0',
  textMuted:      '#7a90b0',
  textOnPrimary:  '#dce6f5',

  primary:        '#1a2d50',
  accent:         '#4a86e8',
  accentBg:       'rgba(74,134,232,0.14)',

  success:        '#10b981',
  successBg:      'rgba(16,185,129,0.12)',
  warning:        '#f59e0b',
  warningBg:      'rgba(245,158,11,0.12)',
  danger:         '#ef4444',
  dangerBg:       'rgba(239,68,68,0.12)',
  info:           '#38bdf8',
  infoBg:         'rgba(56,189,248,0.12)',

  cyan:           '#06b6d4',
  violet:         '#8b5cf6',
  amber:          '#fbbf24',
  emerald:        '#34d399',

  headerBg:       '#0e1830',
  headerBorder:   '#223550',
  navActiveBg:    '#1d2d4a',
  navActiveBorder:'#304568',
  navActiveText:  '#9cc0e8',

  tooltipBg:      '#141d33',
  tooltipBorder:  '#2a3d5a',
  tooltipText:    '#a8b8d0',

  dropTargetBg:   'rgba(74,134,232,0.10)',
  dropTargetBorder:'#4a86e8',
  dragGhost:      'rgba(74,134,232,0.22)',
};

const LIGHT: Tokens = {
  bg:             '#f0f4f9',
  surface:        '#ffffff',
  surfaceAlt:     '#f7f9fc',
  surfaceHover:   '#eef3fa',
  surfaceRaised:  '#ffffff',

  primaryBg:      '#1a2d50',
  primaryHover:   '#243d6a',

  border:         '#dce4ef',
  borderSub:      '#eef2f7',
  borderStrong:   '#c4d0e3',

  text:           '#0d1829',
  textSub:        '#334e6e',
  textMuted:      '#6b87a8',
  textOnPrimary:  '#dce9f8',

  primary:        '#1a2d50',
  accent:         '#2155c4',
  accentBg:       'rgba(33,85,196,0.08)',

  success:        '#059669',
  successBg:      'rgba(5,150,105,0.08)',
  warning:        '#d97706',
  warningBg:      'rgba(217,119,6,0.08)',
  danger:         '#dc2626',
  dangerBg:       'rgba(220,38,38,0.08)',
  info:           '#0284c7',
  infoBg:         'rgba(2,132,199,0.08)',

  cyan:           '#0891b2',
  violet:         '#7c3aed',
  amber:          '#f59e0b',
  emerald:        '#059669',

  headerBg:       '#1a2d50',
  headerBorder:   '#243d6a',
  navActiveBg:    'rgba(255,255,255,0.10)',
  navActiveBorder:'rgba(255,255,255,0.20)',
  navActiveText:  '#ffffff',

  tooltipBg:      '#ffffff',
  tooltipBorder:  '#dce4ef',
  tooltipText:    '#334e6e',

  dropTargetBg:   'rgba(33,85,196,0.06)',
  dropTargetBorder:'#2155c4',
  dragGhost:      'rgba(33,85,196,0.15)',
};

interface ThemeCtx { tokens: Tokens; isDark: boolean; toggle: () => void; }
const Ctx = createContext<ThemeCtx>({ tokens: DARK, isDark: true, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const toggle = () => setIsDark(d => !d);
  const tokens = isDark ? DARK : LIGHT;

  useEffect(() => {
    document.documentElement.style.background = tokens.bg;
    document.documentElement.style.color = tokens.text;
  }, [isDark, tokens.bg, tokens.text]);

  return <Ctx.Provider value={{ tokens, isDark, toggle }}>{children}</Ctx.Provider>;
}

export function useTheme() { return useContext(Ctx); }

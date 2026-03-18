import React, { useState, useEffect, useReducer, useContext, useMemo } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";
import { useTheme as useMuiThemeV4 } from "@material-ui/core/styles";
import {
  Add,
  Announcement as AnnouncementIcon,
  AttachFile,
  CheckCircle,
  DeleteOutline,
  Edit,
  FiberManualRecord,
  MoreHoriz,
  PriorityHigh,
  Search,
  ToggleOn,
} from "@mui/icons-material";
import { isArray } from "lodash";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import AnnouncementModal from "../../components/AnnouncementModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

/* ─── Estilos globais (padrão Quickemessages) ────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .ann-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .ann-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .ann-root { max-width: 100%; overflow-x: hidden; }

    @keyframes annFadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes annKpiIconGlow {
      0%   { box-shadow: 0 0 0 0   var(--kpi-glow); }
      50%  { box-shadow: 0 0 0 7px var(--kpi-glow); }
      100% { box-shadow: 0 0 0 0   transparent; }
    }

    .ann-animate { animation: annFadeSlideUp 0.36s ease both; }

    .ann-kpi-card { position: relative; overflow: hidden; }
    .ann-kpi-card::after {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--kpi-color); border-radius: 14px 14px 0 0;
      transform: scaleX(0); transform-origin: left center;
      transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
    }
    .ann-kpi-card:hover::after { transform: scaleX(1); }
    .ann-kpi-icon-box {
      transition: transform 0.24s cubic-bezier(0.34,1.56,0.64,1) !important;
      will-change: transform;
    }
    .ann-kpi-card:hover .ann-kpi-icon-box {
      transform: scale(1.22) rotate(10deg) !important;
      animation: annKpiIconGlow 0.6s ease forwards;
    }

    .ann-row:hover td { background: var(--ann-hover-row) !important; }

    .ann-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .ann-root ::-webkit-scrollbar-track { background: transparent; }
    .ann-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  `}</style>
);

/* ─── usePalette (completo — padrão Quickemessages) ─────────────────────── */
const usePalette = () => {
  const themeV4 = useMuiThemeV4();
  const themeV5 = useMuiThemeV5();
  const isDark  = themeV4?.palette?.type === "dark" || themeV5?.palette?.mode === "dark";

  const BLUES   = ["#1976d2","#2196f3","#1565c0","#42a5f5","#1769aa","#2563eb","#1d4ed8"];
  const v4Raw   = themeV4?.palette?.primary?.main || "";
  const v5p     = themeV5?.palette?.primary?.main || "#0f6cbd";
  const isC4    = v4Raw && !BLUES.includes(v4Raw.toLowerCase().trim());
  const isC5    = v5p   && !BLUES.includes(v5p.toLowerCase().trim());
  const primary = isC4 ? v4Raw : isC5 ? v5p : (v4Raw || v5p);

  return useMemo(() => {
    const success = "#10b981", warning = "#f59e0b", danger = "#ef4444";
    const purple  = "#8b5cf6", teal = "#14b8a6";

    const t = isDark ? {
      pageBg:      "#080e1a",
      surfaceBg:   "#0f1929",
      surfaceBg2:  "#141f30",
      border:      "rgba(255,255,255,0.065)",
      divider:     "rgba(255,255,255,0.055)",
      textPrimary: "#f0f4f8",
      textSecond:  "#8fa4be",
      textMuted:   "#4d6478",
      hoverRow:    "rgba(255,255,255,0.03)",
      tagBg:       "rgba(255,255,255,0.07)",
      inputBg:     "rgba(255,255,255,0.04)",
      inputBorder: "rgba(255,255,255,0.12)",
      inputHover:  "rgba(255,255,255,0.22)",
      headBg:      "#0a1420",
      tableEven:   "rgba(255,255,255,0.015)",
    } : {
      pageBg:      "#f0f4f8",
      surfaceBg:   "#ffffff",
      surfaceBg2:  "#fafbfd",
      border:      "#e3eaf2",
      divider:     "#e8eef4",
      textPrimary: "#0d1b2a",
      textSecond:  "#3d5166",
      textMuted:   "#8fa0b0",
      hoverRow:    "#f5f8fc",
      tagBg:       "rgba(0,0,0,0.045)",
      inputBg:     "rgba(0,0,0,0.018)",
      inputBorder: "#dbe4ed",
      inputHover:  "#a8b8c8",
      headBg:      "#f7fafd",
      tableEven:   "#fbfdff",
    };

    return {
      primary, isDark, ...t,
      chipBg:     alpha(primary, isDark ? 0.18 : 0.10),
      chipColor:  primary,
      kpiPrimary: { color: primary, bg: alpha(primary, isDark ? 0.16 : 0.09) },
      kpiPurple:  { color: purple,  bg: alpha(purple,  isDark ? 0.16 : 0.09) },
      kpiSuccess: { color: success, bg: alpha(success, isDark ? 0.16 : 0.09) },
      kpiWarning: { color: warning, bg: alpha(warning, isDark ? 0.16 : 0.09) },
      kpiDanger:  { color: danger,  bg: alpha(danger,  isDark ? 0.16 : 0.09) },
      success, warning, danger, purple, teal,
    };
  }, [primary, isDark]);
};

/* ─── KpiCard (idêntico ao Quickemessages) ──────────────────────────────── */
const KpiCard = ({ title, value, hint, icon, colorCfg, p, delay = 0 }) => {
  const num = typeof value === "number" ? value : (parseInt(String(value).replace(/\D/g, ""), 10) || 0);
  const [disp, setDisp] = useState(0);

  useEffect(() => {
    if (num === 0) { setDisp(0); return; }
    const steps = 40, st = 900 / steps; let cur = 0;
    const t = setInterval(() => {
      cur += 1; setDisp(Math.round((num * cur) / steps));
      if (cur >= steps) { setDisp(num); clearInterval(t); }
    }, st);
    return () => clearInterval(t);
  }, [num]); // eslint-disable-line

  return (
    <Paper
      elevation={0}
      className="ann-animate ann-kpi-card"
      style={{ "--kpi-color": colorCfg.color, "--kpi-glow": alpha(colorCfg.color, 0.35) }}
      sx={{
        p: { xs: "12px 14px 10px", sm: "16px 18px 13px" },
        borderRadius: "14px", border: `1px solid ${p.border}`,
        minHeight: { xs: 105, sm: 122 }, backgroundColor: p.surfaceBg,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        animationDelay: `${delay}ms`, cursor: "default",
        transition: "box-shadow 0.22s, transform 0.22s, border-color 0.22s",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: alpha(colorCfg.color, p.isDark ? 0.35 : 0.22),
          boxShadow: `0 8px 28px ${alpha(colorCfg.color, p.isDark ? 0.18 : 0.12)}`,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{
            color: p.textMuted, fontSize: { xs: 9.5, sm: 11 }, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1,
          }}>
            {title}
          </Typography>
          <Typography className="mono" sx={{
            color: p.textPrimary, fontSize: { xs: 24, sm: 29, md: 32 },
            lineHeight: 1.1, mt: { xs: 0.5, sm: 0.75 }, fontWeight: 700, letterSpacing: "-0.025em",
          }}>
            {disp.toLocaleString("pt-BR")}
          </Typography>
        </Box>
        <Box className="ann-kpi-icon-box" sx={{
          width: { xs: 38, sm: 48 }, height: { xs: 38, sm: 48 }, borderRadius: "12px",
          backgroundColor: colorCfg.bg, color: colorCfg.color,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          border: `1.5px solid ${alpha(colorCfg.color, p.isDark ? 0.22 : 0.14)}`,
          boxShadow: `0 2px 10px ${alpha(colorCfg.color, p.isDark ? 0.18 : 0.10)}`,
        }}>
          {React.cloneElement(icon, { sx: { fontSize: { xs: 19, sm: 23 } } })}
        </Box>
      </Stack>
      <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mt: 0.7 }}>
        <Box sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: colorCfg.color, opacity: 0.65, flexShrink: 0 }} />
        <Typography sx={{
          color: p.textMuted, fontSize: { xs: 10, sm: 11.5 },
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {hint}
        </Typography>
      </Stack>
    </Paper>
  );
};

/* ─── SubPaper ───────────────────────────────────────────────────────────── */
const SubPaper = ({ children, sx = {}, p, onScroll }) => (
  <Paper elevation={0} onScroll={onScroll} sx={{
    borderRadius: "14px", border: `1px solid ${p.border}`,
    backgroundColor: p.surfaceBg, ...sx,
  }}>
    {children}
  </Paper>
);

/* ─── SectionLabel ───────────────────────────────────────────────────────── */
const SectionLabel = ({ children, p }) => (
  <Typography sx={{
    fontSize: { xs: 9.5, sm: 11 }, color: p.textMuted, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.09em",
  }}>
    {children}
  </Typography>
);

/* ─── inputSx — altura fixa 40px, texto centralizado, ícone primário no dark ── */
const inputSx = (p) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: 12.5,
    fontFamily: "'DM Sans', sans-serif",
    backgroundColor: p.inputBg,
    overflow: "hidden",
    height: 40,
    "& input": {
      padding: "0 8px",
      height: "100%",
      boxSizing: "border-box",
      fontSize: 12.5,
      fontFamily: "'DM Sans', sans-serif",
      lineHeight: "40px",
      color: p.isDark ? "#ffffff" : undefined,
    },
    "& fieldset": { borderColor: p.inputBorder },
    "&:hover fieldset": { borderColor: p.inputHover },
    "&.Mui-focused fieldset": { borderColor: p.primary, borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": {
    fontSize: 12.5,
    fontFamily: "'DM Sans', sans-serif",
    color: p.isDark ? "rgba(255,255,255,0.45)" : undefined,
    top: "50%",
    transform: "translate(14px, -50%) scale(1)",
  },
  "& .MuiInputLabel-root.MuiInputLabel-shrink": {
    top: 0,
    transform: "translate(12px, -8px) scale(0.78)",
    color: p.isDark ? "rgba(255,255,255,0.85) !important" : undefined,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: p.isDark ? "#ffffff !important" : p.primary,
  },
  "& .MuiInputAdornment-root .MuiSvgIcon-root": {
    fontSize: 18,
    color: p.isDark ? p.primary : undefined,
    transition: "color 0.18s",
  },
});

/* ─── PriorityBadge ──────────────────────────────────────────────────────── */
const PRIORITY_CFG = (p) => ({
  1: { label: "Alta",  color: p.danger  },
  2: { label: "Média", color: p.warning },
  3: { label: "Baixa", color: p.success },
});

const PriorityBadge = ({ priority, p }) => {
  const cfg = PRIORITY_CFG(p)[priority] || { label: "—", color: p.textMuted };
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.55,
      px: 1, py: 0.25, borderRadius: "6px",
      backgroundColor: alpha(cfg.color, p.isDark ? 0.14 : 0.08),
      border: `1px solid ${alpha(cfg.color, p.isDark ? 0.28 : 0.18)}`,
    }}>
      <Box sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: cfg.color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: cfg.color, lineHeight: 1 }}>
        {cfg.label}
      </Typography>
    </Box>
  );
};

/* ─── StatusBadge ────────────────────────────────────────────────────────── */
const StatusBadge = ({ active, p }) => (
  <Box sx={{
    display: "inline-flex", alignItems: "center", gap: 0.55,
    px: 1, py: 0.25, borderRadius: "6px",
    backgroundColor: active
      ? alpha(p.success, p.isDark ? 0.14 : 0.08)
      : alpha(p.textMuted, p.isDark ? 0.12 : 0.08),
    border: `1px solid ${alpha(active ? p.success : p.textMuted, p.isDark ? 0.28 : 0.18)}`,
  }}>
    <Box sx={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, backgroundColor: active ? p.success : p.textMuted }} />
    <Typography sx={{
      fontSize: 11, fontWeight: 700, lineHeight: 1,
      color: active ? (p.isDark ? "#34d399" : "#166534") : p.textMuted,
    }}>
      {active ? i18n.t("announcements.active") : i18n.t("announcements.inactive")}
    </Typography>
  </Box>
);

/* ─── ActionBtn ──────────────────────────────────────────────────────────── */
const ActionBtn = ({ title, onClick, icon, color, p }) => (
  <Tooltip title={title}>
    <IconButton
      size="small"
      onClick={onClick}
      sx={{
        borderRadius: "7px", p: 0.55,
        border: `1px solid ${alpha(color, p.isDark ? 0.22 : 0.14)}`,
        backgroundColor: alpha(color, p.isDark ? 0.12 : 0.07),
        color,
        transition: "all 0.16s",
        "&:hover": {
          backgroundColor: alpha(color, p.isDark ? 0.22 : 0.14),
          borderColor: alpha(color, p.isDark ? 0.45 : 0.35),
          transform: "translateY(-1px)",
          boxShadow: `0 3px 10px ${alpha(color, 0.22)}`,
        },
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 15 } })}
    </IconButton>
  </Tooltip>
);

/* ─── EmptyState — ilustração SVG + texto (padrão Quickemessages) ─────────*/
const EmptyState = ({ searchParam, p }) => {
  const isFiltered = searchParam && searchParam.length > 0;
  return (
    <Box sx={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", py: { xs: 5, sm: 7 }, px: 3,
    }}>
      <Box sx={{ mb: 3, opacity: p.isDark ? 0.88 : 1 }}>
        <svg width="180" height="148" viewBox="0 0 180 148" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="90" cy="136" rx="68" ry="7" fill={p.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} />
          <rect x="30" y="18" width="116" height="98" rx="12"
            fill={p.isDark ? "#141f30" : "#f0f6ff"}
            stroke={p.isDark ? "rgba(255,255,255,0.08)" : "#c7ddf7"} strokeWidth="1.5" />
          <rect x="46" y="32" width="84" height="8" rx="4"
            fill={p.isDark ? "rgba(255,255,255,0.09)" : "#d6e8fb"} />
          <rect x="46" y="50" width="55" height="6" rx="3"
            fill={p.isDark ? "rgba(255,255,255,0.06)" : "#e3eef8"} />
          <rect x="108" y="48" width="22" height="10" rx="5"
            fill={p.isDark ? "rgba(239,68,68,0.18)" : "#fee2e2"}
            stroke={p.isDark ? "rgba(239,68,68,0.3)" : "#fca5a5"} strokeWidth="1" />
          <rect x="112" y="51" width="14" height="4" rx="2"
            fill={p.isDark ? "rgba(239,68,68,0.45)" : "#fca5a5"} />
          <rect x="46" y="66" width="50" height="6" rx="3"
            fill={p.isDark ? "rgba(255,255,255,0.06)" : "#e3eef8"} />
          <rect x="103" y="64" width="25" height="10" rx="5"
            fill={p.isDark ? "rgba(245,158,11,0.16)" : "#fef9c3"}
            stroke={p.isDark ? "rgba(245,158,11,0.3)" : "#fde68a"} strokeWidth="1" />
          <rect x="107" y="67" width="17" height="4" rx="2"
            fill={p.isDark ? "rgba(245,158,11,0.4)" : "#fde68a"} />
          <rect x="46" y="82" width="58" height="6" rx="3"
            fill={p.isDark ? "rgba(255,255,255,0.05)" : "#eaf2fb"} />
          <rect x="111" y="80" width="20" height="10" rx="5"
            fill={p.isDark ? "rgba(16,185,129,0.14)" : "#dcfce7"}
            stroke={p.isDark ? "rgba(16,185,129,0.28)" : "#6ee7b7"} strokeWidth="1" />
          <rect x="115" y="83" width="12" height="4" rx="2"
            fill={p.isDark ? "rgba(16,185,129,0.4)" : "#6ee7b7"} />
          <circle cx="128" cy="104" r="22"
            fill={p.isDark ? "#0f1929" : "#ffffff"}
            stroke={p.isDark ? "rgba(255,255,255,0.09)" : "#d0e4f7"} strokeWidth="1.5" />
          <rect x="119" y="100" width="6" height="8" rx="2"
            fill={p.isDark ? "rgba(99,179,237,0.5)" : "#93c5fd"}
            stroke={p.isDark ? "rgba(99,179,237,0.8)" : "#3b82f6"} strokeWidth="0.8" />
          <path d="M125 97 L137 93 L137 115 L125 111 Z"
            fill={p.isDark ? "rgba(99,179,237,0.4)" : "#bfdbfe"}
            stroke={p.isDark ? "rgba(99,179,237,0.65)" : "#3b82f6"} strokeWidth="0.8" strokeLinejoin="round" />
          <path d="M139 97 Q142 104 139 111" stroke={p.isDark ? "rgba(99,179,237,0.5)" : "#60a5fa"} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M142 94 Q146 104 142 114" stroke={p.isDark ? "rgba(99,179,237,0.28)" : "#93c5fd"} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <circle cx="38" cy="20" r="4" fill={p.isDark ? "rgba(99,179,237,0.18)" : "#bfdbfe"} />
          <circle cx="148" cy="22" r="3" fill={p.isDark ? "rgba(99,179,237,0.12)" : "#dbeafe"} />
          <circle cx="154" cy="116" r="5" fill={p.isDark ? "rgba(99,179,237,0.08)" : "#eff6ff"} />
          <circle cx="32" cy="112" r="3" fill={p.isDark ? "rgba(99,179,237,0.1)" : "#e0f2fe"} />
        </svg>
      </Box>

      <Typography sx={{
        fontSize: { xs: 15, sm: 16.5 }, fontWeight: 700,
        color: p.textPrimary, mb: 0.8, textAlign: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {isFiltered ? "Nenhum informativo encontrado" : "Nenhum informativo cadastrado ainda"}
      </Typography>

      <Typography sx={{
        fontSize: 13, color: p.textMuted, textAlign: "center",
        maxWidth: 320, lineHeight: 1.6,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {isFiltered
          ? <>Sua busca por <Box component="span" sx={{ color: p.primary, fontWeight: 600 }}>"{searchParam}"</Box> não retornou resultados. Tente outro termo.</>
          : <>Clique em <Box component="span" sx={{ color: p.primary, fontWeight: 700 }}>+ Novo Informativo</Box> para publicar seu primeiro comunicado com prioridade e controle de status.</>
        }
      </Typography>

      {!isFiltered && (
        <Box sx={{
          mt: 2.5, display: "inline-flex", alignItems: "center", gap: 0.8,
          px: 1.8, py: 0.7, borderRadius: "10px",
          backgroundColor: alpha(p.primary, p.isDark ? 0.1 : 0.06),
          border: `1px solid ${alpha(p.primary, p.isDark ? 0.22 : 0.15)}`,
        }}>
          <AnnouncementIcon sx={{ fontSize: 14, color: p.primary }} />
          <Typography sx={{ fontSize: 12, color: p.primary, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
            Informativos mantêm a equipe alinhada e informada
          </Typography>
        </Box>
      )}
    </Box>
  );
};

/* ─── Reducer ────────────────────────────────────────────────────────────── */
const reducer = (state, action) => {
  if (action.type === "LOAD_ANNOUNCEMENTS") {
    const newAnnouncements = [];
    if (isArray(action.payload)) {
      action.payload.forEach((a) => {
        const idx = state.findIndex((u) => u.id === a.id);
        if (idx !== -1) state[idx] = a;
        else newAnnouncements.push(a);
      });
    }
    return [...state, ...newAnnouncements];
  }
  if (action.type === "UPDATE_ANNOUNCEMENTS") {
    const a = action.payload;
    const idx = state.findIndex((u) => u.id === a.id);
    if (idx !== -1) { state[idx] = a; return [...state]; }
    return [a, ...state];
  }
  if (action.type === "DELETE_ANNOUNCEMENT") {
    const idx = state.findIndex((u) => u.id === action.payload);
    if (idx !== -1) state.splice(idx, 1);
    return [...state];
  }
  if (action.type === "RESET") return [];
};

/* ─── Announcements ──────────────────────────────────────────────────────── */
const Announcements = () => {
  const p       = usePalette();
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading]                             = useState(false);
  const [pageNumber, setPageNumber]                       = useState(1);
  const [hasMore, setHasMore]                             = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement]   = useState(null);
  const [deletingAnnouncement, setDeletingAnnouncement]   = useState(null);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen]           = useState(false);
  const [searchParam, setSearchParam]                     = useState("");
  const [announcements, dispatch]                         = useReducer(reducer, []);

  useEffect(() => {
    if (!user.super) {
      toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
      setTimeout(() => history.push("/"), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { dispatch({ type: "RESET" }); setPageNumber(1); }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delay = setTimeout(() => { fetchAnnouncements(); }, 500);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (!user.companyId) return;
    const onCompanyAnnouncement = (data) => {
      if (data.action === "update" || data.action === "create")
        dispatch({ type: "UPDATE_ANNOUNCEMENTS", payload: data.record });
      if (data.action === "delete")
        dispatch({ type: "DELETE_ANNOUNCEMENT", payload: +data.id });
    };
    socket.on("company-announcement", onCompanyAnnouncement);
    return () => socket.off("company-announcement", onCompanyAnnouncement);
  }, [socket, user.companyId]);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get("/announcements/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_ANNOUNCEMENTS", payload: data.records });
      setHasMore(data.hasMore);
    } catch (err) { toastError(err); }
    finally { setLoading(false); }
  };

  const handleOpenAnnouncementModal  = () => { setSelectedAnnouncement(null); setAnnouncementModalOpen(true); };
  const handleCloseAnnouncementModal = () => { setSelectedAnnouncement(null); setAnnouncementModalOpen(false); };
  const handleSearch = (e) => setSearchParam(e.target.value.toLowerCase());
  const handleEditAnnouncement = (a) => { setSelectedAnnouncement(a); setAnnouncementModalOpen(true); };

  const handleDeleteAnnouncement = async (announcement) => {
    try {
      if (announcement.mediaName)
        await api.delete(`/announcements/${announcement.id}/media-upload`);
      await api.delete(`/announcements/${announcement.id}`);
      toast.success(i18n.t("announcements.toasts.deleted"));
    } catch (err) { toastError(err); }
    setDeletingAnnouncement(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight)
      setPageNumber((prev) => prev + 1);
  };

  const totalAnnouncements = announcements.length;
  const ativos             = announcements.filter((a) => a.status).length;
  const comMidia           = announcements.filter((a) => !!a.mediaName).length;

  const COLS = [
    { label: i18n.t("announcements.table.title"),     align: "left",   icon: <AnnouncementIcon sx={{ fontSize: 13 }} /> },
    { label: i18n.t("announcements.table.priority"),  align: "center", icon: <PriorityHigh     sx={{ fontSize: 13 }} /> },
    { label: i18n.t("announcements.table.mediaName"), align: "center", icon: <AttachFile        sx={{ fontSize: 13 }} /> },
    { label: i18n.t("announcements.table.status"),    align: "center", icon: <ToggleOn          sx={{ fontSize: 13 }} /> },
    { label: i18n.t("announcements.table.actions"),   align: "center", icon: <MoreHoriz         sx={{ fontSize: 13 }} /> },
  ];

  const thCellSx = {
    fontWeight: 700, fontSize: "0.72rem",
    color: p.textMuted, textTransform: "uppercase", letterSpacing: "0.07em",
    backgroundColor: p.headBg, borderBottom: `1px solid ${p.divider}`,
    whiteSpace: "nowrap", py: 1.1, fontFamily: "'DM Sans', sans-serif",
  };
  const tdCellSx = {
    fontSize: "0.79rem", color: p.textSecond,
    borderBottom: `1px solid ${p.divider}`,
    py: 0.95, fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <Box
      className="ann-root"
      style={{ "--ann-hover-row": p.hoverRow }}
      sx={{
        width: "100%",
        minHeight: "calc(100% - 48px)",
        backgroundColor: p.pageBg,
        transition: "background-color 0.3s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <FontStyle />

      {/* ── Modais ── */}
      <ConfirmationModal
        title={
          deletingAnnouncement &&
          `${i18n.t("announcements.confirmationModal.deleteTitle")} ${deletingAnnouncement.name}?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteAnnouncement(deletingAnnouncement)}
      >
        {i18n.t("announcements.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <AnnouncementModal
        resetPagination={() => { setPageNumber(1); fetchAnnouncements(); }}
        open={announcementModalOpen}
        onClose={handleCloseAnnouncementModal}
        aria-labelledby="form-dialog-title"
        announcementId={selectedAnnouncement && selectedAnnouncement.id}
      />

      {/* ══ CABEÇALHO CORPORATIVO ══════════════════════════════════════════ */}
      <Box sx={{
        background: p.isDark
          ? `linear-gradient(135deg, #0d1b2e 0%, #0a1520 60%, ${alpha(p.primary, 0.12)} 100%)`
          : `linear-gradient(135deg, ${p.primary} 0%, ${alpha(p.primary, 0.82)} 55%, ${alpha("#0ea5e9", 0.9)} 100%)`,
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 2.5, sm: 3, md: 3.5 },
        pb: { xs: 2, sm: 2.5, md: 3 },
        position: "relative", overflow: "hidden",
      }}>
        <Box sx={{
          position: "absolute", top: -40, right: -40,
          width: { xs: 160, md: 220 }, height: { xs: 160, md: 220 },
          borderRadius: "50%",
          background: p.isDark ? alpha(p.primary, 0.08) : alpha("#fff", 0.08),
          pointerEvents: "none",
        }} />
        <Box sx={{
          position: "absolute", bottom: -30, left: "35%",
          width: { xs: 100, md: 140 }, height: { xs: 100, md: 140 },
          borderRadius: "50%",
          background: p.isDark ? alpha("#0ea5e9", 0.06) : alpha("#fff", 0.06),
          pointerEvents: "none",
        }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: 0.8 }}>
              <Typography sx={{
                fontSize: { xs: 10, sm: 11 }, fontWeight: 600,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: p.isDark ? alpha(p.primary, 0.8) : alpha("#fff", 0.7),
              }}>
                Sistema
              </Typography>
              <Box sx={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: p.isDark ? alpha(p.primary, 0.5) : alpha("#fff", 0.45) }} />
              <Typography sx={{
                fontSize: { xs: 10, sm: 11 }, fontWeight: 600,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: p.isDark ? alpha("#fff", 0.5) : alpha("#fff", 0.55),
              }}>
                Informativos
              </Typography>
            </Stack>

            <Typography sx={{
              fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
              letterSpacing: "-0.025em", lineHeight: 1,
              color: p.isDark ? p.textPrimary : "#ffffff",
            }}>
              {i18n.t("announcements.title")}
            </Typography>

            <Typography sx={{
              fontSize: { xs: 12, sm: 13.5 }, mt: 0.6,
              color: p.isDark ? p.textMuted : alpha("#fff", 0.72),
              display: { xs: "none", sm: "block" },
            }}>
              Publique comunicados importantes com prioridade e controle de status.
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.2, sm: 1.5 }, flexWrap: "wrap", gap: 0.8 }}>
              {[
                { icon: <FiberManualRecord sx={{ fontSize: 8 }} />,  label: "Atualizado agora" },
                { icon: <AnnouncementIcon  sx={{ fontSize: 12 }} />, label: `${totalAnnouncements} informativos` },
              ].map((tag, i) => (
                <Box key={i} sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.6,
                  px: 1.2, py: 0.4, borderRadius: "20px",
                  backgroundColor: p.isDark ? alpha(p.primary, 0.14) : alpha("#fff", 0.15),
                  border: `1px solid ${p.isDark ? alpha(p.primary, 0.22) : alpha("#fff", 0.22)}`,
                  backdropFilter: "blur(8px)",
                }}>
                  <Box sx={{ color: p.isDark ? p.primary : "#fff", display: "flex" }}>{tag.icon}</Box>
                  <Typography sx={{
                    fontSize: { xs: 10, sm: 11 }, fontWeight: 600,
                    color: p.isDark ? alpha("#fff", 0.8) : "#fff",
                  }}>
                    {tag.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* ── Conteúdo ── */}
      <Box sx={{
        px: { xs: 1, sm: 1.5, md: 2.5 },
        py: { xs: 1.5, sm: 2, md: 2.5 },
        flex: 1, display: "flex", flexDirection: "column", gap: { xs: 1, sm: 1.5 },
      }}>

        {/* ── KPI Cards ── */}
        <Grid container spacing={{ xs: 1, sm: 1.5 }}>
          {[
            { title: "Total",     value: totalAnnouncements, hint: "Informativos cadastrados", icon: <AnnouncementIcon />, colorCfg: p.kpiPrimary, delay: 40  },
            { title: "Ativos",    value: ativos,             hint: "Publicados e visíveis",    icon: <CheckCircle />,     colorCfg: p.kpiSuccess, delay: 80  },
            { title: "Com mídia", value: comMidia,           hint: "Possuem anexo ou imagem",  icon: <AttachFile />,      colorCfg: p.kpiPurple,  delay: 120 },
          ].map((card, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <KpiCard {...card} p={p} />
            </Grid>
          ))}
        </Grid>

        {/* ── Busca + Botão ── */}
        <SubPaper p={p} sx={{ p: { xs: "12px 14px", sm: "14px 18px" } }} className="ann-animate" style={{ animationDelay: "100ms" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            sx={{ mb: 1.4 }}
          >
            <Box>
              <SectionLabel p={p}>Busca</SectionLabel>
              <Typography sx={{ fontSize: { xs: 13, sm: 14.5 }, color: p.textPrimary, fontWeight: 700, mt: 0.2 }}>
                Localizar informativos
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={{ xs: 1, sm: 1.5 }} alignItems="center">
            <Grid item xs={12} sm={8} md={9}>
              <TextField
                fullWidth
                placeholder={i18n.t("announcements.searchPlaceholder")}
                type="search"
                value={searchParam}
                onChange={handleSearch}
                variant="outlined"
                size="small"
                sx={inputSx(p)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Button
                fullWidth
                variant="contained"
                disableElevation
                startIcon={<Add sx={{ fontSize: 16 }} />}
                onClick={handleOpenAnnouncementModal}
                sx={{
                  position: "relative", overflow: "hidden",
                  backgroundColor: p.primary, color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700, fontSize: 13, letterSpacing: "0.02em",
                  textTransform: "none", borderRadius: "10px", height: 40,
                  boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 3px 12px ${alpha(p.primary, 0.30)}`,
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                  "&::before": {
                    content: '""', position: "absolute",
                    top: 0, left: "-75%", width: "50%", height: "100%",
                    background: "linear-gradient(120deg,transparent,rgba(255,255,255,0.22),transparent)",
                    transition: "left 0.4s ease", pointerEvents: "none",
                  },
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 6px 22px ${alpha(p.primary, 0.42)}`,
                    "&::before": { left: "125%" },
                  },
                  "&:active": { transform: "translateY(0px)" },
                }}
              >
                {i18n.t("announcements.buttons.add")}
              </Button>
            </Grid>
          </Grid>
        </SubPaper>

        {/* ── Tabela ── */}
        <SubPaper
          p={p}
          onScroll={handleScroll}
          sx={{ flex: 1, overflow: "hidden", p: 0 }}
          className="ann-animate"
          style={{ animationDelay: "160ms" }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            sx={{ px: { xs: "14px", sm: "16px", md: "18px" }, pt: { xs: "13px", sm: "15px", md: "16px" }, pb: 1.2 }}
          >
            <Box>
              <SectionLabel p={p}>Cadastro</SectionLabel>
              <Typography sx={{ fontSize: { xs: 13, sm: 14.5 }, color: p.textPrimary, fontWeight: 700, mt: 0.2 }}>
                Informativos cadastrados
              </Typography>
            </Box>
            {totalAnnouncements > 0 && (
              <Box sx={{
                display: "inline-flex", alignItems: "center", gap: 0.6,
                px: 1.2, py: 0.45, borderRadius: "8px",
                backgroundColor: p.chipBg,
                border: `1px solid ${alpha(p.primary, p.isDark ? 0.25 : 0.16)}`,
              }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: p.primary, boxShadow: `0 0 0 3px ${alpha(p.primary, 0.2)}` }} />
                <Typography sx={{ fontSize: 11.5, color: p.chipColor, fontWeight: 600 }}>
                  {totalAnnouncements.toLocaleString("pt-BR")} informativos
                </Typography>
              </Box>
            )}
          </Stack>

          <Box sx={{ height: "1px", backgroundColor: p.divider, mx: { xs: "14px", sm: "16px", md: "18px" } }} />

          <Box sx={{ overflowY: "auto", maxHeight: "60vh", WebkitOverflowScrolling: "touch" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {COLS.map((col) => (
                    <TableCell key={col.label} align={col.align} sx={thCellSx}>
                      <Stack
                        direction="row" spacing={0.5} alignItems="center"
                        justifyContent={col.align === "center" ? "center" : "flex-start"}
                      >
                        <Box sx={{ color: p.primary, opacity: 0.7, display: "flex", alignItems: "center" }}>
                          {col.icon}
                        </Box>
                        {col.label}
                      </Stack>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow
                    key={announcement.id}
                    className="ann-row"
                    sx={{ "& td": { transition: "background 0.13s" } }}
                  >
                    <TableCell align="left" sx={{ ...tdCellSx, fontWeight: 700, color: p.textPrimary }}>
                      {announcement.title}
                    </TableCell>

                    <TableCell align="center" sx={tdCellSx}>
                      <PriorityBadge priority={announcement.priority} p={p} />
                    </TableCell>

                    <TableCell align="center" sx={tdCellSx}>
                      {announcement.mediaName ? (
                        <Box sx={{
                          display: "inline-flex", alignItems: "center", gap: 0.6,
                          px: 1, py: 0.2, borderRadius: "6px",
                          backgroundColor: alpha(p.purple, p.isDark ? 0.14 : 0.08),
                          border: `1px solid ${alpha(p.purple, p.isDark ? 0.24 : 0.16)}`,
                        }}>
                          <AttachFile sx={{ fontSize: 12, color: p.purple }} />
                          <Typography sx={{
                            fontSize: 11, color: p.purple, fontWeight: 600,
                            maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {announcement.mediaName}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: 12, color: p.textMuted }}>
                          {i18n.t("quickMessages.noAttachment")}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="center" sx={tdCellSx}>
                      <StatusBadge active={announcement.status} p={p} />
                    </TableCell>

                    <TableCell align="center" sx={tdCellSx}>
                      <Stack direction="row" spacing={0.4} justifyContent="center">
                        <ActionBtn
                          title="Editar"
                          onClick={() => handleEditAnnouncement(announcement)}
                          icon={<Edit />}
                          color={p.primary}
                          p={p}
                        />
                        <ActionBtn
                          title="Excluir"
                          onClick={() => { setConfirmModalOpen(true); setDeletingAnnouncement(announcement); }}
                          icon={<DeleteOutline />}
                          color={p.danger}
                          p={p}
                        />
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

                {loading && <TableRowSkeleton columns={5} />}

                {!loading && announcements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 0, borderBottom: "none" }}>
                      <EmptyState searchParam={searchParam} p={p} />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </SubPaper>

      </Box>
    </Box>
  );
};

export default Announcements;
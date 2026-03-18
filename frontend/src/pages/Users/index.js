import React, { useState, useEffect, useReducer, useContext, useMemo } from "react";
import { toast } from "react-toastify";

import {
  Avatar,
  Box,
  Button,
  CircularProgress,
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
  AccessTime,
  Add,
  AdminPanelSettings,
  DeleteOutline,
  Edit,
  Email,
  FiberManualRecord,
  MoreHoriz,
  PeopleAlt,
  Person,
  Search,
  Tag,
} from "@mui/icons-material";

import whatsappIcon from "../../assets/nopicture.png";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import UserModal from "../../components/UserModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import UserStatusIcon from "../../components/UserModal/statusIcon";
import { getBackendUrl } from "../../config";
import { AuthContext } from "../../context/Auth/AuthContext";
import ForbiddenPage from "../../components/ForbiddenPage";

const backendUrl = getBackendUrl();

/* ─── Estilos globais (padrão Quickemessages) ────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .usr-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .usr-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .usr-root { max-width: 100%; overflow-x: hidden; }

    @keyframes usrFadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes usrKpiIconGlow {
      0%   { box-shadow: 0 0 0 0   var(--kpi-glow); }
      50%  { box-shadow: 0 0 0 7px var(--kpi-glow); }
      100% { box-shadow: 0 0 0 0   transparent; }
    }

    .usr-animate { animation: usrFadeSlideUp 0.36s ease both; }

    .usr-kpi-card { position: relative; overflow: hidden; }
    .usr-kpi-card::after {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--kpi-color); border-radius: 14px 14px 0 0;
      transform: scaleX(0); transform-origin: left center;
      transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
    }
    .usr-kpi-card:hover::after { transform: scaleX(1); }
    .usr-kpi-icon-box {
      transition: transform 0.24s cubic-bezier(0.34,1.56,0.64,1) !important;
      will-change: transform;
    }
    .usr-kpi-card:hover .usr-kpi-icon-box {
      transform: scale(1.22) rotate(10deg) !important;
      animation: usrKpiIconGlow 0.6s ease forwards;
    }

    .usr-row:hover td { background: var(--usr-hover-row) !important; }

    .usr-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .usr-root ::-webkit-scrollbar-track { background: transparent; }
    .usr-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
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
      className="usr-animate usr-kpi-card"
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
        <Box className="usr-kpi-icon-box" sx={{
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

/* ─── inputSx ────────────────────────────────────────────────────────────── */
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

/* ─── ProfileBadge ───────────────────────────────────────────────────────── */
const ProfileBadge = ({ profile, p }) => {
  const isAdmin = profile === "admin";
  const color   = isAdmin ? p.purple : p.teal;
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.55,
      px: 1, py: 0.25, borderRadius: "6px",
      backgroundColor: alpha(color, p.isDark ? 0.14 : 0.08),
      border: `1px solid ${alpha(color, p.isDark ? 0.28 : 0.18)}`,
    }}>
      <Typography sx={{
        fontSize: 11, fontWeight: 700, color, lineHeight: 1, textTransform: "capitalize",
      }}>
        {profile}
      </Typography>
    </Box>
  );
};

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
          borderColor:     alpha(color, p.isDark ? 0.45 : 0.35),
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

          {/* Card base */}
          <rect x="28" y="20" width="124" height="98" rx="12"
            fill={p.isDark ? "#141f30" : "#f0f6ff"}
            stroke={p.isDark ? "rgba(255,255,255,0.08)" : "#c7ddf7"} strokeWidth="1.5" />

          {/* Linha de header da tabela */}
          <rect x="28" y="20" width="124" height="20" rx="12"
            fill={p.isDark ? "rgba(255,255,255,0.04)" : "#e8f0fb"} />
          <rect x="28" y="32" width="124" height="8" rx="0"
            fill={p.isDark ? "rgba(255,255,255,0.04)" : "#e8f0fb"} />

          {/* Colunas do header */}
          <rect x="40" y="25" width="16" height="5" rx="2.5"
            fill={p.isDark ? "rgba(255,255,255,0.12)" : "#b8d0f0"} />
          <rect x="66" y="25" width="24" height="5" rx="2.5"
            fill={p.isDark ? "rgba(255,255,255,0.12)" : "#b8d0f0"} />
          <rect x="102" y="25" width="18" height="5" rx="2.5"
            fill={p.isDark ? "rgba(255,255,255,0.12)" : "#b8d0f0"} />
          <rect x="132" y="25" width="12" height="5" rx="2.5"
            fill={p.isDark ? "rgba(255,255,255,0.12)" : "#b8d0f0"} />

          {/* Linha de usuário 1 */}
          <circle cx="42" cy="54" r="8"
            fill={p.isDark ? "rgba(99,179,237,0.2)" : "#dbeafe"}
            stroke={p.isDark ? "rgba(99,179,237,0.35)" : "#93c5fd"} strokeWidth="1" />
          <rect x="56" y="51" width="32" height="5" rx="2.5"
            fill={p.isDark ? "rgba(255,255,255,0.08)" : "#d6e8fb"} />
          <rect x="96" y="51" width="22" height="5" rx="2.5"
            fill={p.isDark ? "rgba(139,92,246,0.25)" : "#ede9fe"} />
          <rect x="126" y="51" width="18" height="5" rx="2.5"
            fill={p.isDark ? "rgba(255,255,255,0.05)" : "#e3eef8"} />

          {/* Separador */}
          <line x1="36" y1="67" x2="144" y2="67"
            stroke={p.isDark ? "rgba(255,255,255,0.05)" : "#e8eef4"} strokeWidth="1" />

          {/* Linha de usuário 2 */}
          <circle cx="42" cy="78" r="8"
            fill={p.isDark ? "rgba(20,184,166,0.18)" : "#ccfbf1"}
            stroke={p.isDark ? "rgba(20,184,166,0.3)" : "#99f6e4"} strokeWidth="1" />
          <rect x="56" y="75" width="28" height="5" rx="2.5"
            fill={p.isDark ? "rgba(255,255,255,0.07)" : "#d6e8fb"} />
          <rect x="96" y="75" width="18" height="5" rx="2.5"
            fill={p.isDark ? "rgba(20,184,166,0.22)" : "#ccfbf1"} />
          <rect x="126" y="75" width="18" height="5" rx="2.5"
            fill={p.isDark ? "rgba(255,255,255,0.04)" : "#eaf2fb"} />

          {/* Separador */}
          <line x1="36" y1="91" x2="144" y2="91"
            stroke={p.isDark ? "rgba(255,255,255,0.05)" : "#e8eef4"} strokeWidth="1" />

          {/* Linha de usuário 3 (desbotada) */}
          <circle cx="42" cy="102" r="8"
            fill={p.isDark ? "rgba(255,255,255,0.05)" : "#f0f6ff"}
            stroke={p.isDark ? "rgba(255,255,255,0.08)" : "#dbeafe"} strokeWidth="1" />
          <rect x="56" y="99" width="20" height="5" rx="2.5"
            fill={p.isDark ? "rgba(255,255,255,0.04)" : "#eaf2fb"} />
          <rect x="96" y="99" width="14" height="5" rx="2.5"
            fill={p.isDark ? "rgba(255,255,255,0.03)" : "#f0f6ff"} />

          {/* Círculo de destaque com ícone de pessoas */}
          <circle cx="138" cy="104" r="20"
            fill={p.isDark ? "#0f1929" : "#ffffff"}
            stroke={p.isDark ? "rgba(255,255,255,0.09)" : "#d0e4f7"} strokeWidth="1.5" />
          {/* Pessoas */}
          <circle cx="134" cy="98" r="4.5"
            fill={p.isDark ? "rgba(99,179,237,0.5)" : "#93c5fd"}
            stroke={p.isDark ? "rgba(99,179,237,0.8)" : "#3b82f6"} strokeWidth="0.8" />
          <path d="M126 110 Q126 103 134 103 Q142 103 142 110"
            fill={p.isDark ? "rgba(99,179,237,0.35)" : "#bfdbfe"}
            stroke={p.isDark ? "rgba(99,179,237,0.6)" : "#3b82f6"} strokeWidth="0.8" strokeLinejoin="round" />
          <circle cx="144" cy="97" r="3.5"
            fill={p.isDark ? "rgba(99,179,237,0.35)" : "#bfdbfe"}
            stroke={p.isDark ? "rgba(99,179,237,0.55)" : "#60a5fa"} strokeWidth="0.8" />

          {/* Pontos decorativos */}
          <circle cx="36" cy="22" r="4" fill={p.isDark ? "rgba(99,179,237,0.18)" : "#bfdbfe"} />
          <circle cx="150" cy="24" r="3" fill={p.isDark ? "rgba(99,179,237,0.12)" : "#dbeafe"} />
          <circle cx="156" cy="116" r="5" fill={p.isDark ? "rgba(99,179,237,0.08)" : "#eff6ff"} />
          <circle cx="30" cy="112" r="3" fill={p.isDark ? "rgba(99,179,237,0.1)" : "#e0f2fe"} />
        </svg>
      </Box>

      <Typography sx={{
        fontSize: { xs: 15, sm: 16.5 }, fontWeight: 700,
        color: p.textPrimary, mb: 0.8, textAlign: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {isFiltered ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado ainda"}
      </Typography>

      <Typography sx={{
        fontSize: 13, color: p.textMuted, textAlign: "center",
        maxWidth: 320, lineHeight: 1.6,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {isFiltered
          ? <>Sua busca por <Box component="span" sx={{ color: p.primary, fontWeight: 600 }}>"{searchParam}"</Box> não retornou resultados. Tente outro termo.</>
          : <>Clique em <Box component="span" sx={{ color: p.primary, fontWeight: 700 }}>+ Adicionar</Box> para cadastrar o primeiro usuário da operação.</>
        }
      </Typography>

      {!isFiltered && (
        <Box sx={{
          mt: 2.5, display: "inline-flex", alignItems: "center", gap: 0.8,
          px: 1.8, py: 0.7, borderRadius: "10px",
          backgroundColor: alpha(p.primary, p.isDark ? 0.1 : 0.06),
          border: `1px solid ${alpha(p.primary, p.isDark ? 0.22 : 0.15)}`,
        }}>
          <PeopleAlt sx={{ fontSize: 14, color: p.primary }} />
          <Typography sx={{ fontSize: 12, color: p.primary, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
            Usuários definem quem acessa e opera o sistema
          </Typography>
        </Box>
      )}
    </Box>
  );
};

/* ─── Reducer ────────────────────────────────────────────────────────────── */
const reducer = (state, action) => {
  if (action.type === "LOAD_USERS") {
    const newUsers = [];
    action.payload.forEach((user) => {
      const idx = state.findIndex((u) => u.id === user.id);
      if (idx !== -1) state[idx] = user;
      else newUsers.push(user);
    });
    return [...state, ...newUsers];
  }
  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const idx  = state.findIndex((u) => u.id === user.id);
    if (idx !== -1) { state[idx] = user; return [...state]; }
    return [user, ...state];
  }
  if (action.type === "DELETE_USER") {
    const idx = state.findIndex((u) => u.id === action.payload);
    if (idx !== -1) state.splice(idx, 1);
    return [...state];
  }
  if (action.type === "RESET") return [];
};

/* ─── Users ──────────────────────────────────────────────────────────────── */
const Users = () => {
  const p = usePalette();
  const { user: loggedInUser, socket } = useContext(AuthContext);
  const { profileImage } = loggedInUser;

  const [loading, setLoading]               = useState(false);
  const [loadingMore, setLoadingMore]       = useState(false);
  const [pageNumber, setPageNumber]         = useState(1);
  const [hasMore, setHasMore]               = useState(false);
  const [selectedUser, setSelectedUser]     = useState(null);
  const [deletingUser, setDeletingUser]     = useState(null);
  const [userModalOpen, setUserModalOpen]   = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam]       = useState("");
  const [users, dispatch]                   = useReducer(reducer, []);

  useEffect(() => { dispatch({ type: "RESET" }); setPageNumber(1); }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users/", { params: { searchParam, pageNumber } });
        dispatch({ type: "LOAD_USERS", payload: data.users });
        setHasMore(data.hasMore);
      } catch (err) { toastError(err); }
      finally { setLoading(false); setLoadingMore(false); }
    };
    fetchUsers();
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (!loggedInUser) return;
    const companyId = loggedInUser.companyId;
    const onCompanyUser = (data) => {
      if (data.action === "update" || data.action === "create")
        dispatch({ type: "UPDATE_USERS", payload: data.user });
      if (data.action === "delete")
        dispatch({ type: "DELETE_USER", payload: +data.userId });
    };
    socket.on(`company-${companyId}-user`, onCompanyUser);
    return () => socket.off(`company-${companyId}-user`, onCompanyUser);
  }, [socket, loggedInUser]);

  const handleOpenUserModal  = () => { setSelectedUser(null); setUserModalOpen(true); };
  const handleCloseUserModal = () => { setSelectedUser(null); setUserModalOpen(false); };
  const handleSearch         = (e) => setSearchParam(e.target.value.toLowerCase());
  const handleEditUser       = (user) => { setSelectedUser(user); setUserModalOpen(true); };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      toast.success(i18n.t("users.toasts.deleted"));
    } catch (err) { toastError(err); }
    setDeletingUser(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore = () => { setLoadingMore(true); setPageNumber((prev) => prev + 1); };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) loadMore();
  };

  const renderProfileImage = (user) => {
    const src =
      user.id === loggedInUser.id
        ? profileImage
          ? `${backendUrl}/public/avatar/${profileImage}`
          : whatsappIcon
        : user.profileImage
          ? `${backendUrl}/public/avatar/${user.profileImage}`
          : whatsappIcon;

    const initials = (user.name || "?")
      .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Avatar
          src={src}
          alt={user.name}
          sx={{
            width: 34, height: 34,
            fontSize: 12, fontWeight: 700,
            backgroundColor: alpha(p.primary, 0.82),
            color: "#fff",
            border: `1.5px solid ${alpha(p.primary, 0.30)}`,
            boxShadow: `0 2px 8px ${alpha(p.primary, 0.18)}`,
          }}
        >
          {initials}
        </Avatar>
      </Box>
    );
  };

  /* ── KPIs derivados ── */
  const totalUsers = users.length;
  const admins     = users.filter((u) => u.profile === "admin").length;
  const agents     = users.filter((u) => u.profile !== "admin").length;

  /* ── Colunas com ícones — padrão Quickemessages ── */
  const COLS = [
    { label: i18n.t("users.table.ID"),        align: "center", icon: <Tag                  sx={{ fontSize: 13 }} /> },
    { label: i18n.t("users.table.status"),    align: "center", icon: <FiberManualRecord     sx={{ fontSize: 10 }} /> },
    { label: "Avatar",                         align: "center", icon: <Person               sx={{ fontSize: 13 }} /> },
    { label: i18n.t("users.table.name"),      align: "left",   icon: <PeopleAlt            sx={{ fontSize: 13 }} /> },
    { label: i18n.t("users.table.email"),     align: "center", icon: <Email                sx={{ fontSize: 13 }} /> },
    { label: i18n.t("users.table.profile"),   align: "center", icon: <AdminPanelSettings   sx={{ fontSize: 13 }} /> },
    { label: i18n.t("users.table.startWork"), align: "center", icon: <AccessTime           sx={{ fontSize: 13 }} /> },
    { label: i18n.t("users.table.endWork"),   align: "center", icon: <AccessTime           sx={{ fontSize: 13 }} /> },
    { label: i18n.t("users.table.actions"),   align: "center", icon: <MoreHoriz            sx={{ fontSize: 13 }} /> },
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

  /* ── Guarda de perfil ── */
  if (loggedInUser.profile === "user") return <ForbiddenPage />;

  return (
    <Box
      className="usr-root"
      style={{ "--usr-hover-row": p.hoverRow }}
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
          deletingUser &&
          `${i18n.t("users.confirmationModal.deleteTitle")} ${deletingUser.name}?`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteUser(deletingUser.id)}
      >
        {i18n.t("users.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <UserModal
        open={userModalOpen}
        onClose={handleCloseUserModal}
        aria-labelledby="form-dialog-title"
        userId={selectedUser && selectedUser.id}
        key={i18n.language}
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
                Administração
              </Typography>
              <Box sx={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: p.isDark ? alpha(p.primary, 0.5) : alpha("#fff", 0.45) }} />
              <Typography sx={{
                fontSize: { xs: 10, sm: 11 }, fontWeight: 600,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: p.isDark ? alpha("#fff", 0.5) : alpha("#fff", 0.55),
              }}>
                Usuários
              </Typography>
            </Stack>

            <Typography sx={{
              fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
              letterSpacing: "-0.025em", lineHeight: 1,
              color: p.isDark ? p.textPrimary : "#ffffff",
            }}>
              {i18n.t("users.title")}
            </Typography>

            <Typography sx={{
              fontSize: { xs: 12, sm: 13.5 }, mt: 0.6,
              color: p.isDark ? p.textMuted : alpha("#fff", 0.72),
              display: { xs: "none", sm: "block" },
            }}>
              Gerencie acessos, perfis e jornada dos usuários da operação.
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.2, sm: 1.5 }, flexWrap: "wrap", gap: 0.8 }}>
              {[
                { icon: <FiberManualRecord sx={{ fontSize: 8 }} />, label: "Atualizado agora" },
                { icon: <PeopleAlt sx={{ fontSize: 12 }} />,        label: `${totalUsers} usuários` },
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
            { title: "Total de usuários", value: totalUsers, hint: "Cadastrados no sistema",  icon: <PeopleAlt />,          colorCfg: p.kpiPrimary, delay: 40  },
            { title: "Administradores",   value: admins,     hint: "Com perfil admin",         icon: <AdminPanelSettings />, colorCfg: p.kpiPurple,  delay: 80  },
            { title: "Agentes",           value: agents,     hint: "Com perfil operador",      icon: <Person />,             colorCfg: p.kpiSuccess, delay: 120 },
          ].map((card, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <KpiCard {...card} p={p} />
            </Grid>
          ))}
        </Grid>

        {/* ── Busca + Botão ── */}
        <SubPaper p={p} sx={{ p: { xs: "12px 14px", sm: "14px 18px" } }} className="usr-animate" style={{ animationDelay: "100ms" }}>
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
                Localizar usuários
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={{ xs: 1, sm: 1.5 }} alignItems="center">
            <Grid item xs={12} sm={8} md={9}>
              <TextField
                fullWidth
                placeholder={i18n.t("contacts.searchPlaceholder")}
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
                onClick={handleOpenUserModal}
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
                {i18n.t("users.buttons.add")}
              </Button>
            </Grid>
          </Grid>
        </SubPaper>

        {/* ── Tabela ── */}
        <SubPaper
          p={p}
          onScroll={handleScroll}
          sx={{ flex: 1, overflow: "hidden", p: 0 }}
          className="usr-animate"
          style={{ animationDelay: "160ms" }}
        >
          {/* Cabeçalho da seção */}
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
                Usuários cadastrados
              </Typography>
            </Box>
            {totalUsers > 0 && (
              <Box sx={{
                display: "inline-flex", alignItems: "center", gap: 0.6,
                px: 1.2, py: 0.45, borderRadius: "8px",
                backgroundColor: p.chipBg,
                border: `1px solid ${alpha(p.primary, p.isDark ? 0.25 : 0.16)}`,
              }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: p.primary, boxShadow: `0 0 0 3px ${alpha(p.primary, 0.2)}` }} />
                <Typography sx={{ fontSize: 11.5, color: p.chipColor, fontWeight: 600 }}>
                  {totalUsers.toLocaleString("pt-BR")} usuários
                </Typography>
              </Box>
            )}
          </Stack>

          {/* Separador */}
          <Box sx={{ height: "1px", backgroundColor: p.divider, mx: { xs: "14px", sm: "16px", md: "18px" } }} />

          {/* Scroll da tabela */}
          <Box sx={{ overflowY: "auto", maxHeight: "60vh", WebkitOverflowScrolling: "touch" }}>

            {/* Loading inicial */}
            {loading && !loadingMore && (
              <Stack justifyContent="center" alignItems="center" sx={{ minHeight: 220 }}>
                <CircularProgress size={32} sx={{ color: p.primary }} />
                <Typography sx={{ fontSize: 13, color: p.textMuted, mt: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                  {i18n.t("loading")}
                </Typography>
              </Stack>
            )}

            {!loading && (
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
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
                      className="usr-row"
                      sx={{ "& td": { transition: "background 0.13s" } }}
                    >
                      {/* ID */}
                      <TableCell align="center" sx={tdCellSx}>
                        <Typography className="mono" sx={{ fontSize: 12, color: p.textMuted, fontWeight: 600 }}>
                          #{user.id}
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell align="center" sx={tdCellSx}>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <UserStatusIcon user={user} />
                        </Box>
                      </TableCell>

                      {/* Avatar */}
                      <TableCell align="center" sx={tdCellSx}>
                        {renderProfileImage(user)}
                      </TableCell>

                      {/* Nome */}
                      <TableCell align="left" sx={{ ...tdCellSx, fontWeight: 700, color: p.textPrimary }}>
                        {user.name}
                      </TableCell>

                      {/* Email */}
                      <TableCell align="center" sx={{ ...tdCellSx, color: p.textMuted }}>
                        {user.email}
                      </TableCell>

                      {/* Perfil */}
                      <TableCell align="center" sx={tdCellSx}>
                        <ProfileBadge profile={user.profile} p={p} />
                      </TableCell>

                      {/* Início jornada */}
                      <TableCell align="center" sx={tdCellSx}>
                        {user.startWork
                          ? <Typography className="mono" sx={{ fontSize: 12, color: p.textSecond, fontWeight: 600 }}>{user.startWork}</Typography>
                          : <Typography sx={{ fontSize: 11, color: p.textMuted, fontStyle: "italic" }}>—</Typography>
                        }
                      </TableCell>

                      {/* Fim jornada */}
                      <TableCell align="center" sx={tdCellSx}>
                        {user.endWork
                          ? <Typography className="mono" sx={{ fontSize: 12, color: p.textSecond, fontWeight: 600 }}>{user.endWork}</Typography>
                          : <Typography sx={{ fontSize: 11, color: p.textMuted, fontStyle: "italic" }}>—</Typography>
                        }
                      </TableCell>

                      {/* Ações */}
                      <TableCell align="center" sx={tdCellSx}>
                        <Stack direction="row" spacing={0.4} justifyContent="center">
                          <ActionBtn
                            title="Editar"
                            onClick={() => handleEditUser(user)}
                            icon={<Edit />}
                            color={p.primary}
                            p={p}
                          />
                          <ActionBtn
                            title="Excluir"
                            onClick={() => { setConfirmModalOpen(true); setDeletingUser(user); }}
                            icon={<DeleteOutline />}
                            color={p.danger}
                            p={p}
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Carregando mais páginas */}
                  {loadingMore && (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 1.5, borderBottom: "none" }}>
                        <CircularProgress size={22} sx={{ color: p.primary }} />
                      </TableCell>
                    </TableRow>
                  )}

                  {/* ── Empty state com ilustração ── */}
                  {!loadingMore && users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 0, borderBottom: "none" }}>
                        <EmptyState searchParam={searchParam} p={p} />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Box>
        </SubPaper>

      </Box>
    </Box>
  );
};

export default Users;
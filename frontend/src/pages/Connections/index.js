import React, { useState, useCallback, useContext, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { add, format, parseISO } from "date-fns";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";

import { makeStyles, useTheme as useMuiThemeV4 } from "@material-ui/core/styles";
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";
import { green } from "@material-ui/core/colors";

import {
  Button,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Table,
  TableHead,
  Paper,
  Tooltip,
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent,
} from "@material-ui/core";

import {
  Edit,
  CheckCircle,
  SignalCellularConnectedNoInternet2Bar,
  SignalCellularConnectedNoInternet0Bar,
  SignalCellular4Bar,
  CropFree,
  DeleteOutline,
  Facebook,
  Instagram,
  WhatsApp,
  FiberManualRecord,
  DeviceHub,
  WifiTethering,
} from "@material-ui/icons";

import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

import {
  Box as MuiBox,
  Grid,
  Paper as MuiPaper,
  Stack,
  Typography as MuiTypography,
  alpha,
} from "@mui/material";

import TableRowSkeleton from "../../components/TableRowSkeleton";
import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import formatSerializedId from "../../utils/formatSerializedId";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ForbiddenPage from "../../components/ForbiddenPage";
import { Can } from "../../components/Can";

// ─── Estilos globais ──────────────────────────────────────────────────────────

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .conn-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .conn-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .conn-root { max-width: 100%; overflow-x: hidden; }

    @keyframes connFadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes connKpiIconGlow {
      0%   { box-shadow: 0 0 0 0   var(--kpi-glow); }
      50%  { box-shadow: 0 0 0 7px var(--kpi-glow); }
      100% { box-shadow: 0 0 0 0   transparent; }
    }
    @keyframes connPulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.45; }
    }

    .conn-animate { animation: connFadeSlideUp 0.36s ease both; }

    .conn-kpi-card { position: relative; overflow: hidden; }
    .conn-kpi-card::after {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--kpi-color); border-radius: 14px 14px 0 0;
      transform: scaleX(0); transform-origin: left center;
      transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
    }
    .conn-kpi-card:hover::after { transform: scaleX(1); }
    .conn-kpi-icon-box {
      transition: transform 0.24s cubic-bezier(0.34,1.56,0.64,1) !important;
      will-change: transform;
    }
    .conn-kpi-card:hover .conn-kpi-icon-box {
      transform: scale(1.22) rotate(10deg) !important;
      animation: connKpiIconGlow 0.6s ease forwards;
    }

    .conn-row:hover td { background: var(--conn-hover-row) !important; }
    .conn-dot-pulse { animation: connPulse 2s ease-in-out infinite; }

    .conn-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .conn-root ::-webkit-scrollbar-track { background: transparent; }
    .conn-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  `}</style>
);

// ─── usePalette ───────────────────────────────────────────────────────────────

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
      border:      "rgba(255,255,255,0.065)",
      divider:     "rgba(255,255,255,0.055)",
      textPrimary: "#f0f4f8",
      textSecond:  "#8fa4be",
      textMuted:   "#4d6478",
      hoverRow:    "rgba(255,255,255,0.03)",
      headBg:      "#0a1420",
    } : {
      pageBg:      "#f0f4f8",
      surfaceBg:   "#ffffff",
      border:      "#e3eaf2",
      divider:     "#e8eef4",
      textPrimary: "#0d1b2a",
      textSecond:  "#3d5166",
      textMuted:   "#8fa0b0",
      hoverRow:    "#f5f8fc",
      headBg:      "#f7fafd",
    };

    return {
      primary, isDark, ...t,
      chipBg:     alpha(primary, isDark ? 0.18 : 0.10),
      chipColor:  primary,
      kpiPrimary: { color: primary, bg: alpha(primary, isDark ? 0.16 : 0.09) },
      kpiSuccess: { color: success, bg: alpha(success, isDark ? 0.16 : 0.09) },
      kpiWarning: { color: warning, bg: alpha(warning, isDark ? 0.16 : 0.09) },
      kpiDanger:  { color: danger,  bg: alpha(danger,  isDark ? 0.16 : 0.09) },
      kpiPurple:  { color: purple,  bg: alpha(purple,  isDark ? 0.16 : 0.09) },
      success, warning, danger, purple, teal,
    };
  }, [primary, isDark]);
};

// ─── KpiCard ──────────────────────────────────────────────────────────────────

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
    <MuiPaper
      elevation={0}
      className="conn-animate conn-kpi-card"
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
        <MuiBox sx={{ flex: 1, minWidth: 0 }}>
          <MuiTypography sx={{
            color: p.textMuted, fontSize: { xs: 9.5, sm: 11 }, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1,
          }}>
            {title}
          </MuiTypography>
          <MuiTypography className="mono" sx={{
            color: p.textPrimary, fontSize: { xs: 24, sm: 29, md: 32 },
            lineHeight: 1.1, mt: { xs: 0.5, sm: 0.75 }, fontWeight: 700, letterSpacing: "-0.025em",
          }}>
            {disp.toLocaleString("pt-BR")}
          </MuiTypography>
        </MuiBox>
        <MuiBox className="conn-kpi-icon-box" sx={{
          width: { xs: 38, sm: 48 }, height: { xs: 38, sm: 48 }, borderRadius: "12px",
          backgroundColor: colorCfg.bg, color: colorCfg.color,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          border: `1.5px solid ${alpha(colorCfg.color, p.isDark ? 0.22 : 0.14)}`,
          boxShadow: `0 2px 10px ${alpha(colorCfg.color, p.isDark ? 0.18 : 0.10)}`,
        }}>
          {React.cloneElement(icon, { style: { fontSize: 23 } })}
        </MuiBox>
      </Stack>
      <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mt: 0.7 }}>
        <MuiBox sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: colorCfg.color, opacity: 0.65, flexShrink: 0 }} />
        <MuiTypography sx={{
          color: p.textMuted, fontSize: { xs: 10, sm: 11.5 },
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {hint}
        </MuiTypography>
      </Stack>
    </MuiPaper>
  );
};

// ─── makeStyles — apenas para componentes MUI v4 ─────────────────────────────

const useStyles = makeStyles((theme) => {
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";
  const border  = isDark ? "rgba(255,255,255,0.065)" : "#e3eaf2";
  const divider = isDark ? "rgba(255,255,255,0.055)" : "#e8eef4";
  const textPrimary = isDark ? "#f0f4f8" : "#0d1b2a";
  const textSecond  = isDark ? "#8fa4be" : "#3d5166";
  const textMuted   = isDark ? "#4d6478" : "#8fa0b0";
  const hoverRow    = isDark ? "rgba(255,255,255,0.03)" : "#f5f8fc";
  const surfaceBg   = isDark ? "#0f1929" : "#ffffff";

  return {
    pageRoot: {
      display: "flex", flexDirection: "column", position: "relative",
      flex: 1, width: "100%", maxWidth: "100%",
      height: "calc(100% - 48px)", overflowY: "hidden",
      backgroundColor: isDark ? "#080e1a" : "#f0f4f8",
      transition: "background-color 0.3s ease",
      "--conn-hover-row": hoverRow,
    },
    contentArea: {
      padding: theme.spacing(2, 2.5, 2.5),
      overflowY: "auto", flex: 1,
      ...theme.scrollbarStyles,
      [theme.breakpoints.down("sm")]: { padding: theme.spacing(1.5, 1, 1.5) },
    },
    controlsBar: {
      marginBottom: theme.spacing(2), borderRadius: 14,
      border: `1px solid ${border}`,
      boxShadow: isDark ? "0 8px 22px rgba(0,0,0,0.35)" : "0 8px 22px rgba(15,23,42,0.08)",
      padding: theme.spacing(1.5, 1.75), backgroundColor: surfaceBg, flexShrink: 0,
    },
    controlsActions: {
      display: "flex", flexWrap: "wrap", gap: theme.spacing(1), alignItems: "center",
    },
    actionButton: {
      minHeight: 38, borderRadius: 10, fontWeight: 700, fontSize: "0.78rem",
      padding: theme.spacing(0.8, 2), textTransform: "none",
      position: "relative", overflow: "hidden", color: "#fff",
      boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 3px 12px ${alpha(primary, 0.30)}`,
      transition: "transform 0.18s, box-shadow 0.18s",
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 6px 22px ${alpha(primary, 0.42)}`,
      },
    },
    statusCard: {
      margin: "0 0 16px", borderRadius: 14,
      border: `1px solid ${alpha("#f59e0b", isDark ? 0.25 : 0.18)}`,
      boxShadow: `0 6px 20px ${alpha("#f59e0b", isDark ? 0.14 : 0.08)}`,
      backgroundColor: alpha("#f59e0b", isDark ? 0.07 : 0.04), flexShrink: 0,
    },
    statusCardContent: { padding: theme.spacing(1.5, 2) },
    statusTitle: {
      fontSize: "0.95rem", fontWeight: 700,
      color: isDark ? "#fbbf24" : "#b45309", textAlign: "center",
    },
    statusText: { fontSize: "0.8rem", color: textSecond },
    mainPaper: {
      flex: 1, overflowY: "auto", ...theme.scrollbarStyles,
      borderRadius: 14, border: `1px solid ${border}`,
      boxShadow: isDark ? "0 12px 26px rgba(0,0,0,0.45)" : "0 12px 26px rgba(17,24,39,0.09)",
      backgroundColor: surfaceBg,
    },
    tableHeaderCell: {
      fontWeight: 700, color: textMuted, fontSize: "0.72rem",
      textTransform: "uppercase", letterSpacing: "0.07em",
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : alpha(primary, 0.04),
      borderBottom: `1px solid ${divider}`,
    },
    tableRow: { transition: "background-color 0.15s" },
    tableCellText: { fontSize: "0.8rem", color: textSecond },
    tableCellMono: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "0.8rem", color: textPrimary, fontWeight: 700,
    },
    tableCell: { borderBottom: `1px solid ${divider}` },
    actionIconButton: {
      border: `1px solid ${border}`, margin: "0 2px", borderRadius: 8, transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha(primary, 0.45), color: primary,
        backgroundColor: alpha(primary, isDark ? 0.1 : 0.05),
      },
    },
    deleteIconButton: {
      border: `1px solid ${border}`, margin: "0 2px", borderRadius: 8, transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha("#ef4444", 0.45), color: "#ef4444",
        backgroundColor: alpha("#ef4444", isDark ? 0.1 : 0.05),
      },
    },
    customTableCell: { display: "flex", alignItems: "center", justifyContent: "center" },
    tooltip: {
      backgroundColor: isDark ? "#1e2d3d" : "#f5f5f9",
      color: isDark ? "#e2e8f0" : "rgba(0,0,0,0.87)",
      fontSize: theme.typography.pxToRem(13),
      border: `1px solid ${border}`, borderRadius: 10, maxWidth: 450,
    },
    tooltipPopper: { textAlign: "center" },
    buttonProgress: { color: green[500] },
    sectionLabel: {
      fontSize: 11, color: textMuted, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.09em",
    },
  };
});

// ─── CircularProgressWithLabel (sem alteração) ────────────────────────────────

function CircularProgressWithLabel(props) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" {...props} />
      <Box top={0} left={0} bottom={0} right={0} position="absolute"
        display="flex" alignItems="center" justifyContent="center">
        <Typography variant="caption" component="div" color="textSecondary">
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── CustomToolTip (sem alteração) ────────────────────────────────────────────

const CustomToolTip = ({ title, content, children }) => {
  const classes = useStyles();
  return (
    <Tooltip arrow
      classes={{ tooltip: classes.tooltip, popper: classes.tooltipPopper }}
      title={
        <React.Fragment>
          <Typography gutterBottom color="inherit">{title}</Typography>
          {content && <Typography>{content}</Typography>}
        </React.Fragment>
      }
    >
      {children}
    </Tooltip>
  );
};

// ─── IconChannel (sem alteração) ──────────────────────────────────────────────

const IconChannel = (channel) => {
  switch (channel) {
    case "facebook":  return <Facebook  style={{ color: "#3b5998" }} />;
    case "instagram": return <Instagram style={{ color: "#e1306c" }} />;
    case "whatsapp":  return <WhatsApp  style={{ color: "#25d366" }} />;
    default: return "error";
  }
};

// ─── EmptyState ───────────────────────────────────────────────────────────────

const EmptyState = ({ p }) => (
  <MuiBox sx={{
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", py: { xs: 5, sm: 7 }, px: 3,
  }}>
    <MuiBox sx={{ mb: 3, opacity: p.isDark ? 0.88 : 1 }}>
      <svg width="180" height="148" viewBox="0 0 180 148" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="90" cy="136" rx="68" ry="7"
          fill={p.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} />
        {/* Smartphone */}
        <rect x="62" y="20" width="46" height="80" rx="8"
          fill={p.isDark ? "#141f30" : "#f0f6ff"}
          stroke={p.isDark ? "rgba(99,179,237,0.30)" : "#93c5fd"} strokeWidth="1.5" />
        {/* Tela */}
        <rect x="66" y="28" width="38" height="56" rx="4"
          fill={p.isDark ? "#0f1929" : "#ffffff"}
          stroke={p.isDark ? "rgba(99,179,237,0.15)" : "#dbeafe"} strokeWidth="1" />
        {/* Ícone WhatsApp na tela */}
        <circle cx="85" cy="52" r="12"
          fill={p.isDark ? "rgba(37,211,102,0.18)" : "#dcfce7"}
          stroke={p.isDark ? "rgba(37,211,102,0.40)" : "#86efac"} strokeWidth="1.2" />
        <path d="M85 44 C80.6 44 77 47.6 77 52 C77 53.6 77.5 55.1 78.3 56.3 L77 59 L79.8 57.8 C81 58.5 82.4 59 84 59 C88.4 59 92 55.4 92 51 C92 46.6 88.9 44 85 44 Z"
          fill={p.isDark ? "rgba(37,211,102,0.7)" : "#16a34a"} />
        {/* Notch */}
        <rect x="80" y="24" width="10" height="3" rx="1.5"
          fill={p.isDark ? "rgba(99,179,237,0.20)" : "#bfdbfe"} />
        {/* Botão home */}
        <circle cx="85" cy="93" r="3"
          fill={p.isDark ? "rgba(99,179,237,0.25)" : "#bfdbfe"}
          stroke={p.isDark ? "rgba(99,179,237,0.35)" : "#93c5fd"} strokeWidth="1" />
        {/* Ondas de sinal — direita */}
        <path d="M114 46 Q122 52 114 58" stroke={p.isDark ? "rgba(99,179,237,0.50)" : "#60a5fa"} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M119 40 Q131 52 119 64" stroke={p.isDark ? "rgba(99,179,237,0.32)" : "#93c5fd"} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M124 34 Q140 52 124 70" stroke={p.isDark ? "rgba(99,179,237,0.18)" : "#bfdbfe"} strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Ondas de sinal — esquerda */}
        <path d="M56 46 Q48 52 56 58" stroke={p.isDark ? "rgba(99,179,237,0.50)" : "#60a5fa"} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M51 40 Q39 52 51 64" stroke={p.isDark ? "rgba(99,179,237,0.30)" : "#93c5fd"} strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Badge Facebook */}
        <circle cx="138" cy="38" r="10"
          fill={p.isDark ? "rgba(59,89,152,0.22)" : "#dbeafe"}
          stroke={p.isDark ? "rgba(59,89,152,0.38)" : "#93c5fd"} strokeWidth="1" />
        <text x="134" y="43" fontSize="11" fontWeight="700" fontFamily="sans-serif"
          fill={p.isDark ? "rgba(99,179,237,0.75)" : "#3b5998"}>f</text>
        {/* Badge Instagram */}
        <circle cx="138" cy="66" r="10"
          fill={p.isDark ? "rgba(225,48,108,0.16)" : "#fce7f3"}
          stroke={p.isDark ? "rgba(225,48,108,0.30)" : "#f9a8d4"} strokeWidth="1" />
        <rect x="133.5" y="61.5" width="9" height="9" rx="2.5"
          fill="none" stroke={p.isDark ? "rgba(225,48,108,0.60)" : "#ec4899"} strokeWidth="1.2" />
        <circle cx="138" cy="66" r="2.2"
          fill={p.isDark ? "rgba(225,48,108,0.55)" : "#ec4899"} />
        <circle cx="141" cy="63" r="0.9"
          fill={p.isDark ? "rgba(225,48,108,0.55)" : "#ec4899"} />
        {/* Pontos decorativos */}
        <circle cx="30"  cy="24"  r="3" fill={p.isDark ? "rgba(99,179,237,0.14)" : "#dbeafe"} />
        <circle cx="152" cy="22"  r="4" fill={p.isDark ? "rgba(99,179,237,0.10)" : "#eff6ff"} />
        <circle cx="155" cy="112" r="3" fill={p.isDark ? "rgba(99,179,237,0.10)" : "#e0f2fe"} />
        <circle cx="26"  cy="118" r="4" fill={p.isDark ? "rgba(99,179,237,0.08)" : "#f0fdf4"} />
      </svg>
    </MuiBox>

    <MuiTypography sx={{
      fontSize: { xs: 15, sm: 16.5 }, fontWeight: 700,
      color: p.textPrimary, mb: 0.8, textAlign: "center",
    }}>
      Nenhuma conexão cadastrada ainda
    </MuiTypography>

    <MuiTypography sx={{
      fontSize: 13, color: p.textMuted, textAlign: "center",
      maxWidth: 320, lineHeight: 1.6,
    }}>
      Clique em{" "}
      <MuiBox component="span" sx={{ color: p.primary, fontWeight: 700 }}>Nova Conexão</MuiBox>
      {" "}para adicionar canais como WhatsApp, Facebook ou Instagram ao seu atendimento.
    </MuiTypography>

    <MuiBox sx={{
      mt: 2.5, display: "inline-flex", alignItems: "center", gap: 0.8,
      px: 1.8, py: 0.7, borderRadius: "10px",
      backgroundColor: alpha(p.primary, p.isDark ? 0.1 : 0.06),
      border: `1px solid ${alpha(p.primary, p.isDark ? 0.22 : 0.15)}`,
    }}>
      <WifiTethering style={{ fontSize: 14, color: p.primary }} />
      <MuiTypography sx={{ fontSize: 12, color: p.primary, fontWeight: 600 }}>
        Conexões ativas garantem atendimento em tempo real
      </MuiTypography>
    </MuiBox>
  </MuiBox>
);

// ─── Connections ──────────────────────────────────────────────────────────────

const Connections = () => {
  const classes = useStyles();
  const p       = usePalette();

  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [statusImport, setStatusImport]           = useState([]);
  const [qrModalOpen, setQrModalOpen]             = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp]   = useState(null);
  const [confirmModalOpen, setConfirmModalOpen]   = useState(false);
  const [planConfig, setPlanConfig]               = useState(false);
  const [supportWhatsapp, setSupportWhatsapp]     = useState("");
  const history = useHistory();

  const confirmationModalInitialState = {
    action: "", title: "", message: "", whatsAppId: "", open: false,
  };
  const [confirmModalInfo, setConfirmModalInfo] = useState(confirmationModalInitialState);

  const { user, socket } = useContext(AuthContext);
  const companyId = user.companyId;
  const { getPlanCompany } = usePlans();

  const connectedCount    = whatsApps.filter(w => w.status === "CONNECTED").length;
  const disconnectedCount = whatsApps.filter(w => w.status === "DISCONNECTED" || w.status === "qrcode").length;

  // ── plano ──
  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      setPlanConfig(planConfigs);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Facebook ──
  const responseFacebook = (response) => {
    if (response.status !== "unknown") {
      const { accessToken, userID } = response;
      api.post("/facebook", { facebookUserId: userID, facebookUserToken: accessToken })
        .then(() => toast.success(i18n.t("connections.facebook.success")))
        .catch((error) => toastError(error));
    }
  };

  const responseInstagram = (response) => {
    if (response.status !== "unknown") {
      const { accessToken, userID } = response;
      api.post("/facebook", { addInstagram: true, facebookUserId: userID, facebookUserToken: accessToken })
        .then(() => toast.success(i18n.t("connections.facebook.success")))
        .catch((error) => toastError(error));
    }
  };

  // ── socket importação ──
  useEffect(() => {
    const onImportMessages = (data) => {
      if (data.action === "refresh") { setStatusImport([]); history.go(0); }
      if (data.action === "update")  { setStatusImport(data.status); }
    };
    socket.on(`importMessages-${user.companyId}`, onImportMessages);
    return () => socket.off(`importMessages-${user.companyId}`, onImportMessages);
  }, [socket, user.companyId, history]);

  // ── suporte WhatsApp ──
  useEffect(() => {
    const fetchSupportWhatsapp = async () => {
      try {
        const { data } = await api.get("/global-config/public-branding");
        const fromPanel = data?.loginWhatsapp;
        const fromEnv = process.env.REACT_APP_NUMBER_SUPPORT
          ? `https://wa.me/${process.env.REACT_APP_NUMBER_SUPPORT}` : "";
        setSupportWhatsapp(fromPanel || fromEnv);
      } catch (err) {
        console.error("Erro ao carregar número de suporte:", err);
        if (process.env.REACT_APP_NUMBER_SUPPORT)
          setSupportWhatsapp(`https://wa.me/${process.env.REACT_APP_NUMBER_SUPPORT}`);
      }
    };
    fetchSupportWhatsapp();
  }, []);

  const handleStartWhatsAppSession  = async (id) => { try { await api.post(`/whatsappsession/${id}`); } catch (err) { toastError(err); } };
  const handleRequestNewQrCode      = async (id) => { try { await api.put(`/whatsappsession/${id}`); }  catch (err) { toastError(err); } };
  const handleOpenWhatsAppModal     = () => { setSelectedWhatsApp(null); setWhatsAppModalOpen(true); };
  const handleCloseWhatsAppModal    = useCallback(() => { setWhatsAppModalOpen(false); setSelectedWhatsApp(null); }, []);
  const handleOpenQrModal           = (w) => { setSelectedWhatsApp(w); setQrModalOpen(true); };
  const handleCloseQrModal          = useCallback(() => { setSelectedWhatsApp(null); setQrModalOpen(false); }, []);
  const handleEditWhatsApp          = (w) => { setSelectedWhatsApp(w); setWhatsAppModalOpen(true); };
  const openInNewTab                = (url) => window.open(url, "_blank", "noopener,noreferrer");

  const handleOpenConfirmationModal = (action, whatsAppId) => {
    const map = {
      disconnect:     { title: i18n.t("connections.confirmationModal.disconnectTitle"),     message: i18n.t("connections.confirmationModal.disconnectMessage") },
      delete:         { title: i18n.t("connections.confirmationModal.deleteTitle"),         message: i18n.t("connections.confirmationModal.deleteMessage") },
      closedImported: { title: i18n.t("connections.confirmationModal.closedImportedTitle"), message: i18n.t("connections.confirmationModal.closedImportedMessage") },
    };
    setConfirmModalInfo({ action, whatsAppId, ...(map[action] || {}) });
    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    const { action, whatsAppId } = confirmModalInfo;
    try {
      if (action === "disconnect")      await api.delete(`/whatsappsession/${whatsAppId}`);
      if (action === "delete")        { await api.delete(`/whatsapp/${whatsAppId}`); toast.success(i18n.t("connections.toasts.deleted")); }
      if (action === "closedImported"){ await api.post(`/closedimported/${whatsAppId}`); toast.success(i18n.t("connections.toasts.closedimported")); }
    } catch (err) { toastError(err); }
    setConfirmModalInfo(confirmationModalInitialState);
  };

  const restartWhatsapps = async () => {
    try { await api.post(`/whatsapp-restart/`); toast.success(i18n.t("connections.waitConnection")); }
    catch (err) { toastError(err); }
  };

  // ── renderImportButton (sem alteração) ──
  const renderImportButton = (whatsApp) => {
    if (whatsApp?.statusImportMessages === "renderButtonCloseTickets") {
      return (
        <Button style={{ marginLeft: 12 }} size="small" variant="outlined" color="primary"
          onClick={() => handleOpenConfirmationModal("closedImported", whatsApp.id)}>
          {i18n.t("connections.buttons.closedImported")}
        </Button>
      );
    }
    if (whatsApp?.importOldMessages) {
      let isTimeStamp = !isNaN(new Date(Math.floor(whatsApp?.statusImportMessages)).getTime());
      if (isTimeStamp) {
        const ultimoStatus = new Date(Math.floor(whatsApp?.statusImportMessages)).getTime();
        const dataLimite   = +add(ultimoStatus, { seconds: +35 }).getTime();
        if (dataLimite > new Date().getTime()) {
          return (
            <Button disabled style={{ marginLeft: 12 }} size="small"
              endIcon={<CircularProgress size={12} className={classes.buttonProgress} />}
              variant="outlined" color="primary">
              {i18n.t("connections.buttons.preparing")}
            </Button>
          );
        }
      }
    }
  };

  // ── renderActionButtons (sem alteração) ──
  const renderActionButtons = (whatsApp) => (
    <>
      {whatsApp.status === "qrcode" && (
        <Can role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
          perform="connections-page:addConnection"
          yes={() => (
            <Button size="small" variant="contained" color="primary"
              onClick={() => handleOpenQrModal(whatsApp)}>
              {i18n.t("connections.buttons.qrcode")}
            </Button>
          )} />
      )}
      {whatsApp.status === "DISCONNECTED" && (
        <Can role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
          perform="connections-page:addConnection"
          yes={() => (
            <>
              <Button size="small" variant="outlined" color="primary"
                onClick={() => handleStartWhatsAppSession(whatsApp.id)}>
                {i18n.t("connections.buttons.tryAgain")}
              </Button>{" "}
              <Button size="small" variant="outlined" color="secondary"
                onClick={() => handleRequestNewQrCode(whatsApp.id)}>
                {i18n.t("connections.buttons.newQr")}
              </Button>
            </>
          )} />
      )}
      {(whatsApp.status === "CONNECTED" || whatsApp.status === "PAIRING" || whatsApp.status === "TIMEOUT") && (
        <Can role={user.profile} perform="connections-page:addConnection"
          yes={() => (
            <>
              <Button size="small" variant="outlined" color="secondary"
                onClick={() => handleOpenConfirmationModal("disconnect", whatsApp.id)}>
                {i18n.t("connections.buttons.disconnect")}
              </Button>
              {renderImportButton(whatsApp)}
            </>
          )} />
      )}
      {whatsApp.status === "OPENING" && (
        <Button size="small" variant="outlined" disabled color="default">
          {i18n.t("connections.buttons.connecting")}
        </Button>
      )}
    </>
  );

  // ── renderStatusToolTips (sem alteração) ──
  const renderStatusToolTips = (whatsApp) => (
    <div className={classes.customTableCell}>
      {whatsApp.status === "DISCONNECTED" && (
        <CustomToolTip title={i18n.t("connections.toolTips.disconnected.title")}
          content={i18n.t("connections.toolTips.disconnected.content")}>
          <SignalCellularConnectedNoInternet0Bar color="secondary" />
        </CustomToolTip>
      )}
      {whatsApp.status === "OPENING" && (
        <CircularProgress size={24} className={classes.buttonProgress} />
      )}
      {whatsApp.status === "qrcode" && (
        <CustomToolTip title={i18n.t("connections.toolTips.qrcode.title")}
          content={i18n.t("connections.toolTips.qrcode.content")}>
          <CropFree />
        </CustomToolTip>
      )}
      {whatsApp.status === "CONNECTED" && (
        <CustomToolTip title={i18n.t("connections.toolTips.connected.title")}>
          <SignalCellular4Bar style={{ color: green[500] }} />
        </CustomToolTip>
      )}
      {(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
        <CustomToolTip title={i18n.t("connections.toolTips.timeout.title")}
          content={i18n.t("connections.toolTips.timeout.content")}>
          <SignalCellularConnectedNoInternet2Bar color="secondary" />
        </CustomToolTip>
      )}
    </div>
  );

  return (
    <div className={`conn-root ${classes.pageRoot}`}
      style={{ "--conn-hover-row": p.hoverRow }}>
      <FontStyle />

      <ConfirmationModal
        title={confirmModalInfo.title}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={handleSubmitConfirmationModal}
      >
        {confirmModalInfo.message}
      </ConfirmationModal>

      {qrModalOpen && (
        <QrcodeModal open={qrModalOpen} onClose={handleCloseQrModal}
          whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id} />
      )}

      <WhatsAppModal open={whatsAppModalOpen} onClose={handleCloseWhatsAppModal}
        whatsAppId={!qrModalOpen && selectedWhatsApp?.id} />

      {user.profile === "user" && user.allowConnections === "disabled" ? (
        <ForbiddenPage />
      ) : (
        <>
          {/* ══ CABEÇALHO CORPORATIVO ══════════════════════════════════════ */}
          <MuiBox sx={{
            background: p.isDark
              ? `linear-gradient(135deg, #0d1b2e 0%, #0a1520 60%, ${alpha(p.primary, 0.12)} 100%)`
              : `linear-gradient(135deg, ${p.primary} 0%, ${alpha(p.primary, 0.82)} 55%, ${alpha("#0ea5e9", 0.9)} 100%)`,
            px: { xs: 2, sm: 3, md: 4 },
            pt: { xs: 2.5, sm: 3, md: 3.5 },
            pb: { xs: 2, sm: 2.5, md: 3 },
            position: "relative", overflow: "hidden", flexShrink: 0,
          }}>
            {/* Decorações de fundo */}
            <MuiBox sx={{
              position: "absolute", top: -40, right: -40,
              width: { xs: 160, md: 220 }, height: { xs: 160, md: 220 },
              borderRadius: "50%",
              background: p.isDark ? alpha(p.primary, 0.08) : alpha("#fff", 0.08),
              pointerEvents: "none",
            }} />
            <MuiBox sx={{
              position: "absolute", bottom: -30, left: "35%",
              width: { xs: 100, md: 140 }, height: { xs: 100, md: 140 },
              borderRadius: "50%",
              background: p.isDark ? alpha("#0ea5e9", 0.06) : alpha("#fff", 0.06),
              pointerEvents: "none",
            }} />

            <MuiBox sx={{ position: "relative", zIndex: 1 }}>
              {/* Breadcrumb */}
              <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: 0.8 }}>
                <MuiTypography sx={{
                  fontSize: { xs: 10, sm: 11 }, fontWeight: 600, letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: p.isDark ? alpha(p.primary, 0.8) : alpha("#fff", 0.7),
                }}>
                  Configurações
                </MuiTypography>
                <MuiBox sx={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: p.isDark ? alpha(p.primary, 0.5) : alpha("#fff", 0.45) }} />
                <MuiTypography sx={{
                  fontSize: { xs: 10, sm: 11 }, fontWeight: 600, letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: p.isDark ? alpha("#fff", 0.5) : alpha("#fff", 0.55),
                }}>
                  Conexões
                </MuiTypography>
              </Stack>

              {/* Título */}
              <MuiTypography sx={{
                fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
                letterSpacing: "-0.025em", lineHeight: 1,
                color: p.isDark ? p.textPrimary : "#ffffff",
              }}>
                {i18n.t("connections.title")}
              </MuiTypography>

              {/* Subtítulo */}
              <MuiTypography sx={{
                fontSize: { xs: 12, sm: 13.5 }, mt: 0.6,
                color: p.isDark ? p.textMuted : alpha("#fff", 0.72),
                display: { xs: "none", sm: "block" },
              }}>
                Gerencie canais conectados, sessões e status em um único painel.
              </MuiTypography>

              {/* Meta tags */}
              <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.2, sm: 1.5 }, flexWrap: "wrap", gap: 0.8 }}>
                {[
                  { icon: <FiberManualRecord style={{ fontSize: 8 }} />,  label: "Atualizado agora" },
                  { icon: <WifiTethering     style={{ fontSize: 12 }} />, label: `${connectedCount} de ${whatsApps.length} conectadas` },
                ].map((tag, i) => (
                  <MuiBox key={i} sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.6,
                    px: 1.2, py: 0.4, borderRadius: "20px",
                    backgroundColor: p.isDark ? alpha(p.primary, 0.14) : alpha("#fff", 0.15),
                    border: `1px solid ${p.isDark ? alpha(p.primary, 0.22) : alpha("#fff", 0.22)}`,
                    backdropFilter: "blur(8px)",
                  }}>
                    <MuiBox sx={{ color: p.isDark ? p.primary : "#fff", display: "flex" }}>{tag.icon}</MuiBox>
                    <MuiTypography sx={{ fontSize: { xs: 10, sm: 11 }, fontWeight: 600, color: p.isDark ? alpha("#fff", 0.8) : "#fff" }}>
                      {tag.label}
                    </MuiTypography>
                  </MuiBox>
                ))}
              </Stack>
            </MuiBox>
          </MuiBox>

          {/* ══ CONTEÚDO ═════════════════════════════════════════════════ */}
          <Box className={classes.contentArea}>

            {/* ── KPI Cards ── */}
            <Grid container spacing={{ xs: 1, sm: 1.5 }} sx={{ mb: { xs: 1, sm: 1.5 } }}>
              {[
                { title: "Total de conexões", value: whatsApps.length,  hint: "Canais cadastrados",   icon: <DeviceHub />,                            colorCfg: p.kpiPrimary, delay: 40  },
                { title: "Conectadas",         value: connectedCount,    hint: "Sessões ativas agora", icon: <WifiTethering />,                        colorCfg: p.kpiSuccess, delay: 80  },
                { title: "Desconectadas",      value: disconnectedCount, hint: "Aguardando reconexão", icon: <SignalCellularConnectedNoInternet0Bar />, colorCfg: p.kpiWarning, delay: 120 },
              ].map((card, i) => (
                <Grid item xs={12} sm={4} key={i}>
                  <KpiCard {...card} p={p} />
                </Grid>
              ))}
            </Grid>

            {/* ── Barra de controles ── */}
            <Paper elevation={0} className={`conn-animate ${classes.controlsBar}`}
              style={{ animationDelay: "180ms" }}>
              <div className={classes.controlsActions}>
                <Button className={classes.actionButton} variant="contained" color="primary"
                  onClick={restartWhatsapps}>
                  {i18n.t("connections.restartConnections")}
                </Button>

                <Button className={classes.actionButton} variant="contained" color="primary"
                  onClick={() => openInNewTab(supportWhatsapp)}>
                  {i18n.t("connections.callSupport")}
                </Button>

                <PopupState variant="popover" popupId="demo-popup-menu">
                  {(popupState) => (
                    <React.Fragment>
                      <Can role={user.profile} perform="connections-page:addConnection"
                        yes={() => (
                          <>
                            <Button className={classes.actionButton} variant="contained"
                              color="primary" {...bindTrigger(popupState)}>
                              {i18n.t("connections.newConnection")}
                            </Button>
                            <Menu {...bindMenu(popupState)}>
                              <MenuItem
                                disabled={planConfig?.plan?.useWhatsapp ? false : true}
                                onClick={() => { handleOpenWhatsAppModal(); popupState.close(); }}>
                                <WhatsApp fontSize="small" style={{ marginRight: 10, color: "#25D366" }} />
                                WhatsApp
                              </MenuItem>
                              <FacebookLogin
                                appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                                autoLoad={false} fields="name,email,picture" version="9.0"
                                scope={
                                  process.env.REACT_APP_REQUIRE_BUSINESS_MANAGEMENT?.toUpperCase() === "TRUE"
                                    ? "public_profile,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management"
                                    : "public_profile,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement"
                                }
                                callback={responseFacebook}
                                render={(renderProps) => (
                                  <MenuItem disabled={planConfig?.plan?.useFacebook ? false : true}
                                    onClick={renderProps.onClick}>
                                    <Facebook fontSize="small" style={{ marginRight: 10, color: "#3b5998" }} />
                                    Facebook
                                  </MenuItem>
                                )}
                              />
                              <FacebookLogin
                                appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                                autoLoad={false} fields="name,email,picture" version="9.0"
                                scope={
                                  process.env.REACT_APP_REQUIRE_BUSINESS_MANAGEMENT?.toUpperCase() === "TRUE"
                                    ? "public_profile,instagram_basic,instagram_manage_messages,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management"
                                    : "public_profile,instagram_basic,instagram_manage_messages,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement"
                                }
                                callback={responseInstagram}
                                render={(renderProps) => (
                                  <MenuItem disabled={planConfig?.plan?.useInstagram ? false : true}
                                    onClick={renderProps.onClick}>
                                    <Instagram fontSize="small" style={{ marginRight: 10, color: "#e1306c" }} />
                                    Instagram
                                  </MenuItem>
                                )}
                              />
                            </Menu>
                          </>
                        )}
                      />
                    </React.Fragment>
                  )}
                </PopupState>
              </div>
            </Paper>

            {/* ── Card de importação (sem alteração) ── */}
            {statusImport?.all ? (
              <Card className={`conn-animate ${classes.statusCard}`}
                style={{ animationDelay: "220ms" }}>
                <CardContent className={classes.statusCardContent}>
                  <Typography className={classes.statusTitle}>
                    {statusImport?.this === -1
                      ? i18n.t("connections.buttons.preparing")
                      : i18n.t("connections.buttons.importing")}
                  </Typography>
                  {statusImport?.this === -1 ? (
                    <Typography className={classes.statusText} align="center">
                      <CircularProgress size={24} />
                    </Typography>
                  ) : (
                    <>
                      <Typography className={classes.statusText} align="center">
                        {`${i18n.t("connections.typography.processed")} ${statusImport?.this} ${i18n.t("connections.typography.in")} ${statusImport?.all} ${i18n.t("connections.typography.date")}: ${statusImport?.date}`}
                      </Typography>
                      <Typography align="center">
                        <CircularProgressWithLabel style={{ margin: "auto" }}
                          value={(statusImport?.this / statusImport?.all) * 100} />
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {/* ── Tabela principal ── */}
            <Paper className={`conn-animate ${classes.mainPaper}`} variant="outlined"
              style={{ animationDelay: "260ms" }}>

              {/* Cabeçalho de seção com chip contador */}
              <MuiBox sx={{
                px: { xs: "14px", sm: "16px", md: "18px" },
                pt: { xs: "13px", sm: "15px", md: "16px" },
                pb: 1.2,
                borderBottom: `1px solid ${p.divider}`,
                backgroundColor: p.isDark ? alpha("#000", 0.15) : alpha(p.primary, 0.015),
                display: "flex", flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" },
                gap: 1,
              }}>
                <MuiBox>
                  <MuiTypography sx={{
                    fontSize: { xs: 9.5, sm: 11 }, color: p.textMuted, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.09em",
                  }}>
                    Canais registrados
                  </MuiTypography>
                  <MuiTypography sx={{ fontSize: { xs: 13, sm: 14.5 }, color: p.textPrimary, fontWeight: 700, mt: 0.2 }}>
                    {i18n.t("connections.title")}
                  </MuiTypography>
                </MuiBox>
                {whatsApps.length > 0 && (
                  <MuiBox sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.6,
                    px: 1.2, py: 0.45, borderRadius: "8px",
                    backgroundColor: p.chipBg,
                    border: `1px solid ${alpha(p.primary, p.isDark ? 0.25 : 0.16)}`,
                  }}>
                    <MuiBox sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: p.primary, boxShadow: `0 0 0 3px ${alpha(p.primary, 0.2)}` }} />
                    <MuiTypography sx={{ fontSize: 11.5, color: p.chipColor, fontWeight: 600 }}>
                      {whatsApps.length.toLocaleString("pt-BR")} {whatsApps.length === 1 ? "conexão" : "conexões"}
                    </MuiTypography>
                  </MuiBox>
                )}
              </MuiBox>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    {[
                      "Channel",
                      i18n.t("connections.table.name"),
                      i18n.t("connections.table.number"),
                      i18n.t("connections.table.status"),
                      i18n.t("connections.table.session"),
                      i18n.t("connections.table.lastUpdate"),
                      i18n.t("connections.table.default"),
                    ].map((label) => (
                      <TableCell key={label} align="center" className={classes.tableHeaderCell}>
                        {label}
                      </TableCell>
                    ))}
                    <Can
                      role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
                      perform="connections-page:addConnection"
                      yes={() => (
                        <TableCell align="center" className={classes.tableHeaderCell}>
                          {i18n.t("connections.table.actions")}
                        </TableCell>
                      )}
                    />
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRowSkeleton />
                  ) : (
                    <>
                      {whatsApps?.length > 0 && whatsApps.map((whatsApp) => (
                        <TableRow key={whatsApp.id} className={`conn-row ${classes.tableRow}`}>
                          <TableCell align="center" className={classes.tableCell}>
                            {IconChannel(whatsApp.channel)}
                          </TableCell>
                          <TableCell align="center" className={`${classes.tableCellText} ${classes.tableCell}`}>
                            {whatsApp.name}
                          </TableCell>
                          <TableCell align="center" className={`${classes.tableCellMono} ${classes.tableCell}`}>
                            {whatsApp.number && whatsApp.channel === "whatsapp"
                              ? formatSerializedId(whatsApp.number)
                              : whatsApp.number}
                          </TableCell>
                          <TableCell align="center" className={classes.tableCell}>
                            {renderStatusToolTips(whatsApp)}
                          </TableCell>
                          <TableCell align="center" className={classes.tableCell}>
                            {renderActionButtons(whatsApp)}
                          </TableCell>
                          <TableCell align="center" className={`${classes.tableCellMono} ${classes.tableCell}`}>
                            {format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
                          </TableCell>
                          <TableCell align="center" className={classes.tableCell}>
                            {whatsApp.isDefault && (
                              <div className={classes.customTableCell}>
                                <CheckCircle style={{ color: green[500] }} />
                              </div>
                            )}
                          </TableCell>
                          <Can role={user.profile} perform="connections-page:addConnection"
                            yes={() => (
                              <TableCell align="center" className={classes.tableCell}>
                                <IconButton size="small" className={classes.actionIconButton}
                                  onClick={() => handleEditWhatsApp(whatsApp)}>
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton size="small" className={classes.deleteIconButton}
                                  onClick={() => handleOpenConfirmationModal("delete", whatsApp.id)}>
                                  <DeleteOutline fontSize="small" />
                                </IconButton>
                              </TableCell>
                            )}
                          />
                        </TableRow>
                      ))}

                      {/* ── Empty state com ilustração SVG ── */}
                      {!loading && whatsApps.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} align="center"
                            style={{ padding: 0, borderBottom: "none" }}>
                            <EmptyState p={p} />
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            </Paper>

          </Box>
        </>
      )}
    </div>
  );
};

export default Connections;
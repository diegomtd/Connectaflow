import React, { useState, useEffect, useReducer, useContext, useMemo } from "react";
import { toast } from "react-toastify";
import n8n from "../../assets/n8n.png";
import dialogflow from "../../assets/dialogflow.png";
import webhooks from "../../assets/webhook.png";
import typebot from "../../assets/typebot.jpg";
import flowbuilder from "../../assets/flowbuilders.png";

import {
  Avatar,
  Box, Button, Grid, IconButton, InputAdornment,
  Paper, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography, alpha,
} from "@mui/material";
import {
  Add, DeleteOutline, Edit, FiberManualRecord,
  DeviceHub, SettingsEthernet, Search,
  Fingerprint, Label, MoreHoriz,
} from "@mui/icons-material";
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";
import { useTheme as useMuiThemeV4 } from "@material-ui/core/styles";

import TableRowSkeleton from "../../components/TableRowSkeleton";
import IntegrationModal from "../../components/QueueIntegrationModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ForbiddenPage from "../../components/ForbiddenPage";

// ─── Estilos globais ──────────────────────────────────────────────────────────

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .qi-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .qi-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .qi-root { max-width: 100%; overflow-x: hidden; }

    @keyframes qiFadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes qiKpiIconGlow {
      0%   { box-shadow: 0 0 0 0   var(--kpi-glow); }
      50%  { box-shadow: 0 0 0 7px var(--kpi-glow); }
      100% { box-shadow: 0 0 0 0   transparent; }
    }

    .qi-animate { animation: qiFadeSlideUp 0.36s ease both; }

    .qi-kpi-card { position: relative; overflow: hidden; }
    .qi-kpi-card::after {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--kpi-color); border-radius: 14px 14px 0 0;
      transform: scaleX(0); transform-origin: left center;
      transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
    }
    .qi-kpi-card:hover::after { transform: scaleX(1); }
    .qi-kpi-icon-box {
      transition: transform 0.24s cubic-bezier(0.34,1.56,0.64,1) !important;
      will-change: transform;
    }
    .qi-kpi-card:hover .qi-kpi-icon-box {
      transform: scale(1.22) rotate(10deg) !important;
      animation: qiKpiIconGlow 0.6s ease forwards;
    }

    .qi-row:hover td { background: var(--qi-hover-row) !important; }

    .qi-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .qi-root ::-webkit-scrollbar-track { background: transparent; }
    .qi-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
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
      surfaceBg2:  "#141f30",
      border:      "rgba(255,255,255,0.065)",
      divider:     "rgba(255,255,255,0.055)",
      textPrimary: "#f0f4f8",
      textSecond:  "#8fa4be",
      textMuted:   "#4d6478",
      hoverRow:    "rgba(255,255,255,0.03)",
      inputBg:     "rgba(255,255,255,0.04)",
      inputBorder: "rgba(255,255,255,0.12)",
      inputHover:  "rgba(255,255,255,0.22)",
      headBg:      "#0a1420",
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
      inputBg:     "rgba(0,0,0,0.018)",
      inputBorder: "#dbe4ed",
      inputHover:  "#a8b8c8",
      headBg:      "#f7fafd",
    };

    return {
      primary, isDark, ...t,
      chipBg:     alpha(primary, isDark ? 0.18 : 0.10),
      chipColor:  primary,
      kpiPrimary: { color: primary, bg: alpha(primary, isDark ? 0.16 : 0.09) },
      kpiSuccess: { color: success, bg: alpha(success, isDark ? 0.16 : 0.09) },
      kpiTeal:    { color: teal,    bg: alpha(teal,    isDark ? 0.16 : 0.09) },
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
    <Paper
      elevation={0}
      className="qi-animate qi-kpi-card"
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
        <Box className="qi-kpi-icon-box" sx={{
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

// ─── SubPaper ─────────────────────────────────────────────────────────────────

const SubPaper = ({ children, sx = {}, p, onScroll }) => (
  <Paper elevation={0} onScroll={onScroll} sx={{
    borderRadius: "14px", border: `1px solid ${p.border}`,
    backgroundColor: p.surfaceBg, ...sx,
  }}>
    {children}
  </Paper>
);

// ─── SectionLabel ─────────────────────────────────────────────────────────────

const SectionLabel = ({ children, p }) => (
  <Typography sx={{
    fontSize: { xs: 9.5, sm: 11 }, color: p.textMuted, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.09em",
  }}>
    {children}
  </Typography>
);

// ─── inputSx ─────────────────────────────────────────────────────────────────

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
    "&:hover fieldset": { borderColor: p.isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8" },
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

// ─── EmptyState ───────────────────────────────────────────────────────────────

const EmptyState = ({ searchParam, p }) => {
  const isFiltered = searchParam && searchParam.length > 0;
  return (
    <Box sx={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", py: { xs: 5, sm: 7 }, px: 3,
    }}>
      <Box sx={{ mb: 3, opacity: p.isDark ? 0.88 : 1 }}>
        <svg width="180" height="148" viewBox="0 0 180 148" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="90" cy="136" rx="68" ry="7"
            fill={p.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} />
          {/* Nó central */}
          <circle cx="90" cy="72" r="20"
            fill={p.isDark ? "#141f30" : "#f0f6ff"}
            stroke={p.isDark ? "rgba(99,179,237,0.35)" : "#93c5fd"} strokeWidth="1.5" />
          <circle cx="90" cy="72" r="6" fill={p.isDark ? "rgba(99,179,237,0.45)" : "#60a5fa"} />
          <line x1="90" y1="66" x2="90" y2="60" stroke={p.isDark ? "rgba(99,179,237,0.55)" : "#3b82f6"} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="90" y1="78" x2="90" y2="84" stroke={p.isDark ? "rgba(99,179,237,0.55)" : "#3b82f6"} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="84" y1="72" x2="78" y2="72" stroke={p.isDark ? "rgba(99,179,237,0.55)" : "#3b82f6"} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="96" y1="72" x2="102" y2="72" stroke={p.isDark ? "rgba(99,179,237,0.55)" : "#3b82f6"} strokeWidth="1.5" strokeLinecap="round" />
          {/* Linhas tracejadas */}
          <line x1="74" y1="60" x2="52" y2="42" stroke={p.isDark ? "rgba(99,179,237,0.25)" : "#bfdbfe"} strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
          <line x1="106" y1="60" x2="128" y2="42" stroke={p.isDark ? "rgba(99,179,237,0.25)" : "#bfdbfe"} strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
          <line x1="74" y1="84" x2="52" y2="102" stroke={p.isDark ? "rgba(99,179,237,0.20)" : "#dbeafe"} strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
          <line x1="106" y1="84" x2="128" y2="102" stroke={p.isDark ? "rgba(99,179,237,0.20)" : "#dbeafe"} strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
          <line x1="90" y1="52" x2="90" y2="30" stroke={p.isDark ? "rgba(99,179,237,0.22)" : "#dbeafe"} strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
          {/* Nós satélite */}
          {[{cx:90,cy:22},{cx:44,cy:34},{cx:136,cy:34},{cx:44,cy:110},{cx:136,cy:110}].map((n,i) => (
            <React.Fragment key={i}>
              <circle cx={n.cx} cy={n.cy} r="10"
                fill={p.isDark ? "#0f1929" : "#ffffff"}
                stroke={p.isDark ? "rgba(99,179,237,0.28)" : "#bfdbfe"} strokeWidth="1.2" />
              <rect x={n.cx-5} y={n.cy-5} width="10" height="10" rx="2.5"
                fill={p.isDark ? "rgba(99,179,237,0.28)" : "#93c5fd"} />
            </React.Fragment>
          ))}
          <circle cx="30"  cy="22"  r="3" fill={p.isDark ? "rgba(99,179,237,0.14)" : "#dbeafe"} />
          <circle cx="152" cy="20"  r="4" fill={p.isDark ? "rgba(99,179,237,0.10)" : "#eff6ff"} />
          <circle cx="158" cy="118" r="3" fill={p.isDark ? "rgba(99,179,237,0.10)" : "#e0f2fe"} />
          <circle cx="24"  cy="120" r="4" fill={p.isDark ? "rgba(99,179,237,0.08)" : "#f0fdf4"} />
        </svg>
      </Box>
      <Typography sx={{
        fontSize: { xs: 15, sm: 16.5 }, fontWeight: 700,
        color: p.textPrimary, mb: 0.8, textAlign: "center",
      }}>
        {isFiltered ? "Nenhuma integração encontrada" : "Nenhuma integração cadastrada ainda"}
      </Typography>
      <Typography sx={{
        fontSize: 13, color: p.textMuted, textAlign: "center",
        maxWidth: 320, lineHeight: 1.6,
      }}>
        {isFiltered
          ? <>Sua busca por <Box component="span" sx={{ color: p.primary, fontWeight: 600 }}>"{searchParam}"</Box> não retornou resultados. Tente outro termo.</>
          : <>Clique em <Box component="span" sx={{ color: p.primary, fontWeight: 700 }}>+ Adicionar Projeto</Box> para conectar plataformas como n8n, Typebot, Dialogflow e muito mais.</>
        }
      </Typography>
      {!isFiltered && (
        <Box sx={{
          mt: 2.5, display: "inline-flex", alignItems: "center", gap: 0.8,
          px: 1.8, py: 0.7, borderRadius: "10px",
          backgroundColor: alpha(p.primary, p.isDark ? 0.1 : 0.06),
          border: `1px solid ${alpha(p.primary, p.isDark ? 0.22 : 0.15)}`,
        }}>
          <DeviceHub sx={{ fontSize: 14, color: p.primary }} />
          <Typography sx={{ fontSize: 12, color: p.primary, fontWeight: 600 }}>
            Integrações ampliam o poder do seu atendimento
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// ─── Reducer (sem alteração) ──────────────────────────────────────────────────

const reducer = (state, action) => {
  if (action.type === "LOAD_INTEGRATIONS") {
    const queueIntegration = action.payload;
    const newIntegrations = [];
    queueIntegration.forEach((integration) => {
      const idx = state.findIndex((u) => u.id === integration.id);
      if (idx !== -1) state[idx] = integration;
      else newIntegrations.push(integration);
    });
    return [...state, ...newIntegrations];
  }
  if (action.type === "UPDATE_INTEGRATIONS") {
    const queueIntegration = action.payload;
    const idx = state.findIndex((u) => u.id === queueIntegration.id);
    if (idx !== -1) { state[idx] = queueIntegration; return [...state]; }
    return [queueIntegration, ...state];
  }
  if (action.type === "DELETE_INTEGRATION") {
    const idx = state.findIndex((u) => u.id === action.payload);
    if (idx !== -1) state.splice(idx, 1);
    return [...state];
  }
  if (action.type === "RESET") return [];
};

// ─── QueueIntegration ─────────────────────────────────────────────────────────

const QueueIntegration = () => {
  const p = usePalette();

  const [loading, setLoading]                         = useState(false);
  const [pageNumber, setPageNumber]                   = useState(1);
  const [hasMore, setHasMore]                         = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [deletingUser, setDeletingUser]               = useState(null);
  const [userModalOpen, setUserModalOpen]             = useState(false);
  const [confirmModalOpen, setConfirmModalOpen]       = useState(false);
  const [searchParam, setSearchParam]                 = useState("");
  const [queueIntegration, dispatch]                  = useReducer(reducer, []);

  const { user, socket }   = useContext(AuthContext);
  const { getPlanCompany } = usePlans();
  const companyId          = user.companyId;
  const history            = useHistory();

  /* ── plano ── */
  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useIntegrations) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => history.push(`/`), 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delay = setTimeout(async () => {
      try {
        const { data } = await api.get("/queueIntegration/", {
          params: { searchParam, pageNumber },
        });
        dispatch({ type: "LOAD_INTEGRATIONS", payload: data.queueIntegrations });
        setHasMore(data.hasMore);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const onQueueEvent = (data) => {
      if (data.action === "update" || data.action === "create")
        dispatch({ type: "UPDATE_INTEGRATIONS", payload: data.queueIntegration });
      if (data.action === "delete")
        dispatch({ type: "DELETE_INTEGRATION", payload: +data.integrationId });
    };
    socket.on(`company-${companyId}-queueIntegration`, onQueueEvent);
    return () => socket.off(`company-${companyId}-queueIntegration`, onQueueEvent);
  }, [socket, companyId]);

  const handleOpenUserModal         = () => { setSelectedIntegration(null); setUserModalOpen(true); };
  const handleCloseIntegrationModal = () => { setSelectedIntegration(null); setUserModalOpen(false); };
  const handleSearch                = (e) => setSearchParam(e.target.value.toLowerCase());
  const handleEditIntegration       = (i) => { setSelectedIntegration(i); setUserModalOpen(true); };

  const handleDeleteIntegration = async (integrationId) => {
    try {
      await api.delete(`/queueIntegration/${integrationId}`);
      toast.success(i18n.t("queueIntegration.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingUser(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore     = () => setPageNumber((prev) => prev + 1);
  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) loadMore();
  };

  const thCellSx = {
    fontWeight: 700, fontSize: "0.72rem",
    color: p.textMuted, textTransform: "uppercase", letterSpacing: "0.07em",
    backgroundColor: p.headBg, borderBottom: `1px solid ${p.divider}`,
    whiteSpace: "nowrap", py: 1.1,
  };
  const tdCellSx = {
    fontSize: "0.79rem", color: p.textSecond,
    borderBottom: `1px solid ${p.divider}`, py: 0.95,
  };

  const columns = [
    { label: "",                                             align: "left",   icon: null,                                     padding: "checkbox" },
    { label: i18n.t("queueIntegration.table.id"),      align: "center", icon: <Fingerprint sx={{ fontSize: 13 }} /> },
    { label: i18n.t("queueIntegration.table.name"),    align: "center", icon: <Label       sx={{ fontSize: 13 }} /> },
    { label: i18n.t("queueIntegration.table.actions"), align: "center", icon: <MoreHoriz   sx={{ fontSize: 13 }} /> },
  ];

  return (
    <Box
      className="qi-root"
      style={{ "--qi-hover-row": p.hoverRow }}
      sx={{
        width: "100%", minHeight: "calc(100% - 48px)",
        backgroundColor: p.pageBg,
        transition: "background-color 0.3s ease",
        display: "flex", flexDirection: "column",
      }}
    >
      <FontStyle />

      <ConfirmationModal
        title={
          deletingUser &&
          `${i18n.t("queueIntegration.confirmationModal.deleteTitle")} ${deletingUser.name}?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteIntegration(deletingUser.id)}
      >
        {i18n.t("queueIntegration.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <IntegrationModal
        open={userModalOpen}
        onClose={handleCloseIntegrationModal}
        aria-labelledby="form-dialog-title"
        integrationId={selectedIntegration && selectedIntegration.id}
      />

      {user.profile === "user" ? (
        <ForbiddenPage />
      ) : (
        <>
          {/* ══ CABEÇALHO CORPORATIVO ══════════════════════════════════════ */}
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

            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: 0.8 }}>
                <Typography sx={{
                  fontSize: { xs: 10, sm: 11 }, fontWeight: 600, letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: p.isDark ? alpha(p.primary, 0.8) : alpha("#fff", 0.7),
                }}>
                  Configurações
                </Typography>
                <Box sx={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: p.isDark ? alpha(p.primary, 0.5) : alpha("#fff", 0.45) }} />
                <Typography sx={{
                  fontSize: { xs: 10, sm: 11 }, fontWeight: 600, letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: p.isDark ? alpha("#fff", 0.5) : alpha("#fff", 0.55),
                }}>
                  Integrações
                </Typography>
              </Stack>

              <Typography sx={{
                fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
                letterSpacing: "-0.025em", lineHeight: 1,
                color: p.isDark ? p.textPrimary : "#ffffff",
              }}>
                {i18n.t("queueIntegration.title")}
              </Typography>

              <Typography sx={{
                fontSize: { xs: 12, sm: 13.5 }, mt: 0.6,
                color: p.isDark ? p.textMuted : alpha("#fff", 0.72),
                display: { xs: "none", sm: "block" },
              }}>
                Centralize e gerencie integrações com plataformas externas em um único painel.
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.2, sm: 1.5 }, flexWrap: "wrap", gap: 0.8 }}>
                {[
                  { icon: <FiberManualRecord sx={{ fontSize: 8 }} />, label: "Atualizado agora" },
                  { icon: <DeviceHub sx={{ fontSize: 12 }} />,        label: `${queueIntegration.length} integrações cadastradas` },
                ].map((tag, i) => (
                  <Box key={i} sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.6,
                    px: 1.2, py: 0.4, borderRadius: "20px",
                    backgroundColor: p.isDark ? alpha(p.primary, 0.14) : alpha("#fff", 0.15),
                    border: `1px solid ${p.isDark ? alpha(p.primary, 0.22) : alpha("#fff", 0.22)}`,
                    backdropFilter: "blur(8px)",
                  }}>
                    <Box sx={{ color: p.isDark ? p.primary : "#fff", display: "flex" }}>{tag.icon}</Box>
                    <Typography sx={{ fontSize: { xs: 10, sm: 11 }, fontWeight: 600, color: p.isDark ? alpha("#fff", 0.8) : "#fff" }}>
                      {tag.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
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
                { title: "Total de integrações", value: queueIntegration.length, hint: "Cadastradas no sistema",  icon: <DeviceHub />,        colorCfg: p.kpiPrimary, delay: 40  },
                { title: "Integrações ativas",   value: queueIntegration.length, hint: "Disponíveis para uso",    icon: <SettingsEthernet />, colorCfg: p.kpiSuccess, delay: 80  },
                { title: "Tipos disponíveis",    value: 5,                       hint: "n8n · Typebot · Webhook…", icon: <DeviceHub />,        colorCfg: p.kpiTeal,    delay: 120 },
              ].map((card, i) => (
                <Grid item xs={12} sm={4} key={i}>
                  <KpiCard {...card} p={p} />
                </Grid>
              ))}
            </Grid>

            {/* ── Busca + Botão ── */}
            <SubPaper p={p} sx={{ p: { xs: "12px 14px", sm: "14px 18px" } }} className="qi-animate" style={{ animationDelay: "100ms" }}>
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
                    Localizar integrações
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={{ xs: 1, sm: 1.5 }} alignItems="center">
                <Grid item xs={12} sm={8} md={9}>
                  <TextField
                    fullWidth
                    placeholder={i18n.t("queueIntegration.searchPlaceholder")}
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
                    onClick={handleOpenUserModal}
                    startIcon={<Add sx={{ fontSize: 16 }} />}
                    sx={{
                      position: "relative", overflow: "hidden",
                      backgroundColor: p.primary, color: "#fff",
                      fontWeight: 700, fontSize: 13, letterSpacing: "0.02em",
                      textTransform: "none", borderRadius: "10px", height: 40,
                      boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 3px 12px ${alpha(p.primary, 0.30)}`,
                      transition: "transform 0.18s ease, box-shadow 0.18s ease",
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 6px 22px ${alpha(p.primary, 0.42)}`,
                      },
                      "&:active": { transform: "translateY(0px)" },
                    }}
                  >
                    {i18n.t("queueIntegration.buttons.add")}
                  </Button>
                </Grid>
              </Grid>
            </SubPaper>

            {/* ── Tabela ── */}
            <SubPaper
              p={p}
              onScroll={handleScroll}
              sx={{ flex: 1, overflow: "hidden", p: 0 }}
              className="qi-animate"
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
                    Plataformas conectadas
                  </Typography>
                </Box>
                {queueIntegration.length > 0 && (
                  <Box sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.6,
                    px: 1.2, py: 0.45, borderRadius: "8px",
                    backgroundColor: p.chipBg,
                    border: `1px solid ${alpha(p.primary, p.isDark ? 0.25 : 0.16)}`,
                  }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: p.primary, boxShadow: `0 0 0 3px ${alpha(p.primary, 0.2)}` }} />
                    <Typography sx={{ fontSize: 11.5, color: p.chipColor, fontWeight: 600 }}>
                      {queueIntegration.length.toLocaleString("pt-BR")} {queueIntegration.length === 1 ? "integração" : "integrações"}
                    </Typography>
                  </Box>
                )}
              </Stack>

              <Box sx={{ height: "1px", backgroundColor: p.divider, mx: { xs: "14px", sm: "16px", md: "18px" } }} />

              <Box sx={{ overflowY: "auto", maxHeight: "60vh", WebkitOverflowScrolling: "touch" }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {columns.map((col, i) => (
                        <TableCell
                          key={i}
                          align={col.align}
                          padding={col.padding || "normal"}
                          sx={thCellSx}
                        >
                          {col.label ? (
                            <Stack
                              direction="row" spacing={0.5} alignItems="center"
                              justifyContent={col.align === "center" ? "center" : "flex-start"}
                            >
                              {col.icon && (
                                <Box sx={{ color: p.primary, opacity: 0.7, display: "flex", alignItems: "center" }}>
                                  {col.icon}
                                </Box>
                              )}
                              {col.label}
                            </Stack>
                          ) : null}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {queueIntegration.map((integration) => (
                      <TableRow
                        key={integration.id}
                        className="qi-row"
                        sx={{ "& td": { transition: "background 0.13s" } }}
                      >
                        {/* Logo */}
                        <TableCell sx={tdCellSx}>
                          {integration.type === "dialogflow"  && <Avatar src={dialogflow}  sx={{ width: 110, height: 32, borderRadius: "4px" }} />}
                          {integration.type === "n8n"         && <Avatar src={n8n}         sx={{ width: 110, height: 32, borderRadius: "4px" }} />}
                          {integration.type === "webhook"     && <Avatar src={webhooks}    sx={{ width: 110, height: 32, borderRadius: "4px" }} />}
                          {integration.type === "typebot"     && <Avatar src={typebot}     sx={{ width: 110, height: 32, borderRadius: "4px" }} />}
                          {integration.type === "flowbuilder" && <Avatar src={flowbuilder} sx={{ width: 110, height: 32, borderRadius: "4px" }} />}
                        </TableCell>

                        {/* ID */}
                        <TableCell align="center" sx={{ ...tdCellSx, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: p.textPrimary }}>
                          {integration.id}
                        </TableCell>

                        {/* Nome */}
                        <TableCell align="center" sx={tdCellSx}>
                          {integration.name}
                        </TableCell>

                        {/* Ações */}
                        <TableCell align="center" sx={tdCellSx}>
                          <Stack direction="row" spacing={0.4} justifyContent="center">
                            <IconButton
                              size="small"
                              onClick={() => handleEditIntegration(integration)}
                              sx={{
                                p: 0.55, borderRadius: "7px",
                                color: p.primary,
                                backgroundColor: alpha(p.primary, p.isDark ? 0.12 : 0.07),
                                border: `1px solid ${alpha(p.primary, p.isDark ? 0.22 : 0.14)}`,
                                transition: "all 0.16s",
                                "&:hover": { backgroundColor: alpha(p.primary, p.isDark ? 0.22 : 0.14), transform: "translateY(-1px)" },
                              }}
                            >
                              <Edit sx={{ fontSize: 15 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => { setConfirmModalOpen(true); setDeletingUser(integration); }}
                              sx={{
                                p: 0.55, borderRadius: "7px",
                                color: p.danger,
                                backgroundColor: alpha(p.danger, p.isDark ? 0.12 : 0.07),
                                border: `1px solid ${alpha(p.danger, p.isDark ? 0.22 : 0.14)}`,
                                transition: "all 0.16s",
                                "&:hover": { backgroundColor: alpha(p.danger, p.isDark ? 0.22 : 0.14), transform: "translateY(-1px)" },
                              }}
                            >
                              <DeleteOutline sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}

                    {loading && <TableRowSkeleton columns={4} />}

                    {!loading && queueIntegration.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 0, borderBottom: "none" }}>
                          <EmptyState searchParam={searchParam} p={p} />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </SubPaper>

          </Box>
        </>
      )}
    </Box>
  );
};

export default QueueIntegration;
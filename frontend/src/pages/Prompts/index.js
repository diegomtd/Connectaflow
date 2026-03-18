import React, { useContext, useEffect, useReducer, useState, useMemo } from "react";
import { toast } from "react-toastify";

import {
  Box, Button, Grid, IconButton, Paper, Stack,
  Table, TableBody, TableCell, TableHead, TableRow,
  Typography, alpha,
} from "@mui/material";
import {
  Add, DeleteOutline, Edit, FiberManualRecord,
  Memory, Person, Category, MoreHoriz,
} from "@mui/icons-material";
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";
import { useTheme as useMuiThemeV4 } from "@material-ui/core/styles";

import TableRowSkeleton from "../../components/TableRowSkeleton";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import PromptModal from "../../components/PromptModal";
import { toast as toastV4 } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ForbiddenPage from "../../components/ForbiddenPage";

// ─── Estilos globais ──────────────────────────────────────────────────────────

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .pr-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .pr-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .pr-root { max-width: 100%; overflow-x: hidden; }

    @keyframes prFadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes prKpiIconGlow {
      0%   { box-shadow: 0 0 0 0   var(--kpi-glow); }
      50%  { box-shadow: 0 0 0 7px var(--kpi-glow); }
      100% { box-shadow: 0 0 0 0   transparent; }
    }

    .pr-animate { animation: prFadeSlideUp 0.36s ease both; }

    .pr-kpi-card { position: relative; overflow: hidden; }
    .pr-kpi-card::after {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--kpi-color); border-radius: 14px 14px 0 0;
      transform: scaleX(0); transform-origin: left center;
      transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
    }
    .pr-kpi-card:hover::after { transform: scaleX(1); }
    .pr-kpi-icon-box {
      transition: transform 0.24s cubic-bezier(0.34,1.56,0.64,1) !important;
      will-change: transform;
    }
    .pr-kpi-card:hover .pr-kpi-icon-box {
      transform: scale(1.22) rotate(10deg) !important;
      animation: prKpiIconGlow 0.6s ease forwards;
    }

    .pr-row:hover td { background: var(--pr-hover-row) !important; }

    .pr-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .pr-root ::-webkit-scrollbar-track { background: transparent; }
    .pr-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
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
    <Paper
      elevation={0}
      className="pr-animate pr-kpi-card"
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
        <Box className="pr-kpi-icon-box" sx={{
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

const SubPaper = ({ children, sx = {}, p }) => (
  <Paper elevation={0} sx={{
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

// ─── EmptyState ───────────────────────────────────────────────────────────────

const EmptyState = ({ p }) => (
  <Box sx={{
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", py: { xs: 5, sm: 7 }, px: 3,
  }}>
    <Box sx={{ mb: 3, opacity: p.isDark ? 0.88 : 1 }}>
      <svg width="180" height="148" viewBox="0 0 180 148" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="90" cy="136" rx="68" ry="7"
          fill={p.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} />
        <rect x="28" y="18" width="124" height="100" rx="12"
          fill={p.isDark ? "#141f30" : "#f0f6ff"}
          stroke={p.isDark ? "rgba(255,255,255,0.08)" : "#c7ddf7"} strokeWidth="1.5" />
        <rect x="46" y="36" width="88" height="7" rx="3.5"
          fill={p.isDark ? "rgba(255,255,255,0.07)" : "#d6e8fb"} />
        <rect x="46" y="50" width="64" height="6" rx="3"
          fill={p.isDark ? "rgba(255,255,255,0.05)" : "#e3eef8"} />
        <rect x="46" y="62" width="76" height="6" rx="3"
          fill={p.isDark ? "rgba(255,255,255,0.05)" : "#e3eef8"} />
        <rect x="46" y="74" width="52" height="6" rx="3"
          fill={p.isDark ? "rgba(255,255,255,0.04)" : "#eaf2fb"} />
        <circle cx="122" cy="98" r="22"
          fill={p.isDark ? "#0f1929" : "#ffffff"}
          stroke={p.isDark ? "rgba(255,255,255,0.09)" : "#d0e4f7"} strokeWidth="1.5" />
        <rect x="112" y="88" width="20" height="20" rx="5"
          fill={p.isDark ? "rgba(99,179,237,0.18)" : "#dbeafe"}
          stroke={p.isDark ? "rgba(99,179,237,0.45)" : "#93c5fd"} strokeWidth="1.2" />
        <line x1="116" y1="93" x2="128" y2="93" stroke={p.isDark ? "rgba(99,179,237,0.6)" : "#60a5fa"} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="116" y1="98" x2="128" y2="98" stroke={p.isDark ? "rgba(99,179,237,0.6)" : "#60a5fa"} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="116" y1="103" x2="124" y2="103" stroke={p.isDark ? "rgba(99,179,237,0.4)" : "#93c5fd"} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="112" y1="92" x2="109" y2="92" stroke={p.isDark ? "rgba(99,179,237,0.35)" : "#bfdbfe"} strokeWidth="1" strokeLinecap="round" />
        <line x1="112" y1="98" x2="109" y2="98" stroke={p.isDark ? "rgba(99,179,237,0.35)" : "#bfdbfe"} strokeWidth="1" strokeLinecap="round" />
        <line x1="112" y1="104" x2="109" y2="104" stroke={p.isDark ? "rgba(99,179,237,0.35)" : "#bfdbfe"} strokeWidth="1" strokeLinecap="round" />
        <line x1="132" y1="92" x2="135" y2="92" stroke={p.isDark ? "rgba(99,179,237,0.35)" : "#bfdbfe"} strokeWidth="1" strokeLinecap="round" />
        <line x1="132" y1="98" x2="135" y2="98" stroke={p.isDark ? "rgba(99,179,237,0.35)" : "#bfdbfe"} strokeWidth="1" strokeLinecap="round" />
        <line x1="132" y1="104" x2="135" y2="104" stroke={p.isDark ? "rgba(99,179,237,0.35)" : "#bfdbfe"} strokeWidth="1" strokeLinecap="round" />
        <rect x="46" y="92" width="48" height="14" rx="7"
          fill={p.isDark ? "rgba(99,179,237,0.12)" : "#dbeafe"}
          stroke={p.isDark ? "rgba(99,179,237,0.22)" : "#bfdbfe"} strokeWidth="1" />
        <rect x="53" y="97" width="34" height="4" rx="2"
          fill={p.isDark ? "rgba(99,179,237,0.3)" : "#93c5fd"} />
        <circle cx="38"  cy="20"  r="4" fill={p.isDark ? "rgba(99,179,237,0.18)" : "#bfdbfe"} />
        <circle cx="146" cy="22"  r="3" fill={p.isDark ? "rgba(99,179,237,0.12)" : "#dbeafe"} />
        <circle cx="152" cy="116" r="5" fill={p.isDark ? "rgba(99,179,237,0.08)" : "#eff6ff"} />
        <circle cx="32"  cy="110" r="3" fill={p.isDark ? "rgba(99,179,237,0.10)" : "#e0f2fe"} />
      </svg>
    </Box>
    <Typography sx={{
      fontSize: { xs: 15, sm: 16.5 }, fontWeight: 700,
      color: p.textPrimary, mb: 0.8, textAlign: "center",
    }}>
      Nenhum prompt cadastrado ainda
    </Typography>
    <Typography sx={{
      fontSize: 13, color: p.textMuted, textAlign: "center",
      maxWidth: 310, lineHeight: 1.6,
    }}>
      Crie seu primeiro prompt clicando em{" "}
      <Box component="span" sx={{ color: p.primary, fontWeight: 700 }}>+ Adicionar Prompt</Box>
      {" "}e configure a inteligência artificial para o seu atendimento.
    </Typography>
    <Box sx={{
      mt: 2.5, display: "inline-flex", alignItems: "center", gap: 0.8,
      px: 1.8, py: 0.7, borderRadius: "10px",
      backgroundColor: alpha(p.primary, p.isDark ? 0.1 : 0.06),
      border: `1px solid ${alpha(p.primary, p.isDark ? 0.22 : 0.15)}`,
    }}>
      <Memory sx={{ fontSize: 14, color: p.primary }} />
      <Typography sx={{ fontSize: 12, color: p.primary, fontWeight: 600 }}>
        Prompts personalizam o comportamento da IA
      </Typography>
    </Box>
  </Box>
);

// ─── Reducer (sem alteração) ──────────────────────────────────────────────────

const reducer = (state, action) => {
  if (action.type === "LOAD_PROMPTS") {
    const prompts = action.payload;
    const newPrompts = [];
    prompts.forEach((prompt) => {
      const idx = state.findIndex((p) => p.id === prompt.id);
      if (idx !== -1) state[idx] = prompt;
      else newPrompts.push(prompt);
    });
    return [...state, ...newPrompts];
  }
  if (action.type === "UPDATE_PROMPTS") {
    const prompt = action.payload;
    const idx = state.findIndex((p) => p.id === prompt.id);
    if (idx !== -1) { state[idx] = prompt; return [...state]; }
    return [prompt, ...state];
  }
  if (action.type === "DELETE_PROMPT") {
    const idx = state.findIndex((p) => p.id === action.payload);
    if (idx !== -1) state.splice(idx, 1);
    return [...state];
  }
  if (action.type === "RESET") return [];
};

// ─── Prompts ──────────────────────────────────────────────────────────────────

const Prompts = () => {
  const p = usePalette();

  const [prompts, dispatch]                         = useReducer(reducer, []);
  const [loading, setLoading]                       = useState(false);
  const [promptModalOpen, setPromptModalOpen]       = useState(false);
  const [selectedPrompt, setSelectedPrompt]         = useState(null);
  const [confirmModalOpen, setConfirmModalOpen]     = useState(false);

  const { user, socket }   = useContext(AuthContext);
  const { getPlanCompany } = usePlans();
  const history            = useHistory();
  const companyId          = user.companyId;

  /* ── plano ── */
  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useOpenAi) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => history.push(`/`), 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── carga inicial ── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/prompt");
        dispatch({ type: "LOAD_PROMPTS", payload: data.prompts });
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── socket ── */
  useEffect(() => {
    const onPromptEvent = (data) => {
      if (data.action === "update" || data.action === "create")
        dispatch({ type: "UPDATE_PROMPTS", payload: data.prompt });
      if (data.action === "delete")
        dispatch({ type: "DELETE_PROMPT", payload: data.promptId });
    };
    socket.on(`company-${companyId}-prompt`, onPromptEvent);
    return () => socket.off(`company-${companyId}-prompt`, onPromptEvent);
  }, [socket, companyId]);

  const handleOpenPromptModal  = () => { setPromptModalOpen(true);  setSelectedPrompt(null); };
  const handleClosePromptModal = () => { setPromptModalOpen(false); setSelectedPrompt(null); };
  const handleEditPrompt       = (pt) => { setSelectedPrompt(pt); setPromptModalOpen(true); };
  const handleCloseConfirm     = () => { setConfirmModalOpen(false); setSelectedPrompt(null); };

  const handleDeletePrompt = async (promptId) => {
    try {
      const { data } = await api.delete(`/prompt/${promptId}`);
      toast.info(i18n.t(data.message));
    } catch (err) {
      toastError(err);
    }
    setSelectedPrompt(null);
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
    { label: i18n.t("prompts.table.name"),       align: "left",   icon: <Person    sx={{ fontSize: 13 }} /> },
    { label: i18n.t("prompts.table.queue"),      align: "left",   icon: <Category  sx={{ fontSize: 13 }} /> },
    { label: i18n.t("prompts.table.max_tokens"), align: "left",   icon: <Memory    sx={{ fontSize: 13 }} /> },
    { label: i18n.t("prompts.table.actions"),    align: "center", icon: <MoreHoriz sx={{ fontSize: 13 }} /> },
  ];

  return (
    <Box
      className="pr-root"
      style={{ "--pr-hover-row": p.hoverRow }}
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
          selectedPrompt &&
          `${i18n.t("prompts.confirmationModal.deleteTitle")} ${selectedPrompt.name}?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirm}
        onConfirm={() => handleDeletePrompt(selectedPrompt.id)}
      >
        {i18n.t("prompts.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <PromptModal
        open={promptModalOpen}
        onClose={handleClosePromptModal}
        promptId={selectedPrompt?.id}
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
                  Prompts IA
                </Typography>
              </Stack>

              <Typography sx={{
                fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
                letterSpacing: "-0.025em", lineHeight: 1,
                color: p.isDark ? p.textPrimary : "#ffffff",
              }}>
                {i18n.t("prompts.title")}
              </Typography>

              <Typography sx={{
                fontSize: { xs: 12, sm: 13.5 }, mt: 0.6,
                color: p.isDark ? p.textMuted : alpha("#fff", 0.72),
                display: { xs: "none", sm: "block" },
              }}>
                Gerencie prompts de IA com foco em consistência e produtividade da equipe.
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.2, sm: 1.5 }, flexWrap: "wrap", gap: 0.8 }}>
                {[
                  { icon: <FiberManualRecord sx={{ fontSize: 8 }} />, label: "Atualizado agora" },
                  { icon: <Memory sx={{ fontSize: 12 }} />,           label: `${prompts.length} prompts cadastrados` },
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
                { title: "Total de prompts", value: prompts.length, hint: "Cadastrados no sistema",  icon: <Memory />,          colorCfg: p.kpiPrimary, delay: 40  },
                { title: "Prompts ativos",   value: prompts.length, hint: "Disponíveis para uso",    icon: <FiberManualRecord />, colorCfg: p.kpiSuccess, delay: 80  },
              ].map((card, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <KpiCard {...card} p={p} />
                </Grid>
              ))}
            </Grid>

            {/* ── Controles ── */}
            <SubPaper p={p} sx={{ p: { xs: "12px 14px", sm: "14px 18px" } }} className="pr-animate" style={{ animationDelay: "100ms" }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1}
                sx={{ mb: 1.4 }}
              >
                <Box>
                  <SectionLabel p={p}>Gerenciar</SectionLabel>
                  <Typography sx={{ fontSize: { xs: 13, sm: 14.5 }, color: p.textPrimary, fontWeight: 700, mt: 0.2 }}>
                    Biblioteca de prompts
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={{ xs: 1, sm: 1.5 }} alignItems="center">
                <Grid item xs={12} sm={4} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    disableElevation
                    onClick={handleOpenPromptModal}
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
                    {i18n.t("prompts.buttons.add")}
                  </Button>
                </Grid>

                {/* Chip contador */}
                {prompts.length > 0 && (
                  <Grid item xs={12} sm="auto" sx={{ ml: { sm: "auto" } }}>
                    <Box sx={{
                      display: "inline-flex", alignItems: "center", gap: 0.6,
                      px: 1.2, py: 0.45, borderRadius: "8px",
                      backgroundColor: p.chipBg,
                      border: `1px solid ${alpha(p.primary, p.isDark ? 0.25 : 0.16)}`,
                    }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: p.primary, boxShadow: `0 0 0 3px ${alpha(p.primary, 0.2)}` }} />
                      <Typography sx={{ fontSize: 11.5, color: p.chipColor, fontWeight: 600 }}>
                        {prompts.length.toLocaleString("pt-BR")} prompts
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </SubPaper>

            {/* ── Tabela ── */}
            <SubPaper
              p={p}
              sx={{ flex: 1, overflow: "hidden", p: 0 }}
              className="pr-animate"
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
                    {i18n.t("prompts.title")}
                  </Typography>
                </Box>
                {prompts.length > 0 && (
                  <Box sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.6,
                    px: 1.2, py: 0.45, borderRadius: "8px",
                    backgroundColor: p.chipBg,
                    border: `1px solid ${alpha(p.primary, p.isDark ? 0.25 : 0.16)}`,
                  }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: p.primary, boxShadow: `0 0 0 3px ${alpha(p.primary, 0.2)}` }} />
                    <Typography sx={{ fontSize: 11.5, color: p.chipColor, fontWeight: 600 }}>
                      {prompts.length.toLocaleString("pt-BR")} prompts
                    </Typography>
                  </Box>
                )}
              </Stack>

              <Box sx={{ height: "1px", backgroundColor: p.divider, mx: { xs: "14px", sm: "16px", md: "18px" } }} />

              <Box sx={{ overflowY: "auto", maxHeight: "60vh" }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {columns.map((col) => (
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
                    {prompts.map((prompt) => (
                      <TableRow
                        key={prompt.id}
                        className="pr-row"
                        sx={{ "& td": { transition: "background 0.13s" } }}
                      >
                        <TableCell align="left" sx={tdCellSx}>{prompt.name}</TableCell>
                        <TableCell align="left" sx={tdCellSx}>{prompt.queue.name}</TableCell>
                        <TableCell align="left" sx={{ ...tdCellSx, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: p.textPrimary }}>
                          {prompt.maxTokens}
                        </TableCell>
                        <TableCell align="center" sx={tdCellSx}>
                          <Stack direction="row" spacing={0.4} justifyContent="center">
                            <IconButton
                              size="small"
                              onClick={() => handleEditPrompt(prompt)}
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
                              onClick={() => { setSelectedPrompt(prompt); setConfirmModalOpen(true); }}
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

                    {!loading && prompts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 0, borderBottom: "none" }}>
                          <EmptyState p={p} />
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

export default Prompts;
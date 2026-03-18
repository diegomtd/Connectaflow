import React, { useState, useEffect, useContext, useMemo } from "react";
import { toast } from "react-toastify";

import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";
import { useTheme as useMuiThemeV4 } from "@material-ui/core/styles";
import {
  AddCircleOutline,
  Campaign as CampaignIcon,
  CheckCircle,
  DeleteOutline,
  Edit,
  FiberManualRecord,
  MoreHoriz,
  TextFields,
  ToggleOn,
} from "@mui/icons-material";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import ConfirmationModal from "../../components/ConfirmationModal";
import { Can } from "../../components/Can";
import { AuthContext } from "../../context/Auth/AuthContext";
import CampaignModalPhrase from "../../components/CampaignModalPhrase";

/* ─── Estilos globais (padrão Quickemessages) ────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .cp-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .cp-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .cp-root { max-width: 100%; overflow-x: hidden; }

    @keyframes cpFadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes cpKpiIconGlow {
      0%   { box-shadow: 0 0 0 0   var(--kpi-glow); }
      50%  { box-shadow: 0 0 0 7px var(--kpi-glow); }
      100% { box-shadow: 0 0 0 0   transparent; }
    }

    .cp-animate { animation: cpFadeSlideUp 0.36s ease both; }

    .cp-kpi-card { position: relative; overflow: hidden; }
    .cp-kpi-card::after {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--kpi-color); border-radius: 14px 14px 0 0;
      transform: scaleX(0); transform-origin: left center;
      transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
    }
    .cp-kpi-card:hover::after { transform: scaleX(1); }
    .cp-kpi-icon-box {
      transition: transform 0.24s cubic-bezier(0.34,1.56,0.64,1) !important;
      will-change: transform;
    }
    .cp-kpi-card:hover .cp-kpi-icon-box {
      transform: scale(1.22) rotate(10deg) !important;
      animation: cpKpiIconGlow 0.6s ease forwards;
    }

    .cp-row:hover td { background: var(--cp-hover-row) !important; }

    .cp-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .cp-root ::-webkit-scrollbar-track { background: transparent; }
    .cp-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
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
      headBg:      "#0a1420",
      rowEven:     "rgba(255,255,255,0.015)",
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
      headBg:      "#f7fafd",
      rowEven:     "#fbfdff",
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
      className="cp-animate cp-kpi-card"
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
        <Box className="cp-kpi-icon-box" sx={{
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

/* ─── StatusBadge ────────────────────────────────────────────────────────── */
const StatusBadge = ({ active, p }) => (
  <Box sx={{
    display: "inline-flex", alignItems: "center", gap: 0.55,
    px: 1, py: 0.25, borderRadius: "6px",
    backgroundColor: active
      ? alpha(p.success, p.isDark ? 0.14 : 0.08)
      : alpha(p.textMuted, p.isDark ? 0.12 : 0.08),
    border: `1px solid ${alpha(
      active ? p.success : p.textMuted,
      p.isDark ? 0.28 : 0.18
    )}`,
  }}>
    <Box sx={{
      width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
      backgroundColor: active ? p.success : p.textMuted,
    }} />
    <Typography sx={{
      fontSize: 11, fontWeight: 700, lineHeight: 1,
      color: active ? (p.isDark ? "#34d399" : "#166534") : p.textMuted,
    }}>
      {active ? "Ativo" : "Desativado"}
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
const EmptyState = ({ p }) => (
  <Box sx={{
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", py: { xs: 5, sm: 7 }, px: 3,
  }}>
    {/* Ilustração SVG temática — frases / balões de texto */}
    <Box sx={{ mb: 3, opacity: p.isDark ? 0.88 : 1 }}>
      <svg width="180" height="148" viewBox="0 0 180 148" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Sombra de chão */}
        <ellipse cx="90" cy="136" rx="68" ry="7" fill={p.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} />

        {/* Balão de fala principal */}
        <rect x="28" y="20" width="100" height="64" rx="12"
          fill={p.isDark ? "#141f30" : "#f0f6ff"}
          stroke={p.isDark ? "rgba(255,255,255,0.08)" : "#c7ddf7"} strokeWidth="1.5" />
        {/* Cauda do balão */}
        <path d="M48 84 L38 96 L62 84 Z"
          fill={p.isDark ? "#141f30" : "#f0f6ff"}
          stroke={p.isDark ? "rgba(255,255,255,0.08)" : "#c7ddf7"} strokeWidth="1.5" strokeLinejoin="round" />

        {/* Linhas de texto simuladas dentro do balão */}
        <rect x="42" y="34" width="72" height="6" rx="3"
          fill={p.isDark ? "rgba(255,255,255,0.09)" : "#d6e8fb"} />
        <rect x="42" y="46" width="56" height="5" rx="2.5"
          fill={p.isDark ? "rgba(255,255,255,0.06)" : "#e3eef8"} />
        <rect x="42" y="57" width="64" height="5" rx="2.5"
          fill={p.isDark ? "rgba(255,255,255,0.06)" : "#e3eef8"} />
        <rect x="42" y="68" width="40" height="5" rx="2.5"
          fill={p.isDark ? "rgba(255,255,255,0.04)" : "#eaf2fb"} />

        {/* Balão menor secundário */}
        <rect x="104" y="48" width="52" height="36" rx="10"
          fill={p.isDark ? "#0f1929" : "#ffffff"}
          stroke={p.isDark ? "rgba(255,255,255,0.07)" : "#d0e4f7"} strokeWidth="1.5" />
        <path d="M116 84 L108 94 L128 84 Z"
          fill={p.isDark ? "#0f1929" : "#ffffff"}
          stroke={p.isDark ? "rgba(255,255,255,0.07)" : "#d0e4f7"} strokeWidth="1.5" strokeLinejoin="round" />

        {/* Ícone de raio/campanha no balão secundário */}
        <path
          d="M133 56 L127 65 L131 65 L128 74 L135 64 L131 64 Z"
          fill={p.isDark ? "rgba(99,179,237,0.55)" : "#60a5fa"}
          stroke={p.isDark ? "rgba(99,179,237,0.8)" : "#3b82f6"}
          strokeWidth="0.8" strokeLinejoin="round"
        />

        {/* Linhas decorativas no balão secundário */}
        <rect x="110" y="56" width="16" height="4" rx="2"
          fill={p.isDark ? "rgba(255,255,255,0.06)" : "#dbeafe"} />
        <rect x="110" y="63" width="12" height="4" rx="2"
          fill={p.isDark ? "rgba(255,255,255,0.04)" : "#e0f2fe"} />

        {/* Pontos decorativos */}
        <circle cx="36" cy="22" r="4" fill={p.isDark ? "rgba(99,179,237,0.18)" : "#bfdbfe"} />
        <circle cx="148" cy="26" r="3" fill={p.isDark ? "rgba(99,179,237,0.12)" : "#dbeafe"} />
        <circle cx="154" cy="110" r="5" fill={p.isDark ? "rgba(99,179,237,0.08)" : "#eff6ff"} />
        <circle cx="30" cy="108" r="3" fill={p.isDark ? "rgba(99,179,237,0.1)" : "#e0f2fe"} />
      </svg>
    </Box>

    <Typography sx={{
      fontSize: { xs: 15, sm: 16.5 }, fontWeight: 700,
      color: p.textPrimary, mb: 0.8, textAlign: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      Nenhuma campanha cadastrada ainda
    </Typography>

    <Typography sx={{
      fontSize: 13, color: p.textMuted, textAlign: "center",
      maxWidth: 320, lineHeight: 1.6,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      Clique em <Box component="span" sx={{ color: p.primary, fontWeight: 700 }}>+ Campanha</Box> para criar seu primeiro fluxo de frases e automatizar disparos.
    </Typography>

    {/* Dica visual */}
    <Box sx={{
      mt: 2.5, display: "inline-flex", alignItems: "center", gap: 0.8,
      px: 1.8, py: 0.7, borderRadius: "10px",
      backgroundColor: alpha(p.primary, p.isDark ? 0.1 : 0.06),
      border: `1px solid ${alpha(p.primary, p.isDark ? 0.22 : 0.15)}`,
    }}>
      <TextFields sx={{ fontSize: 14, color: p.primary }} />
      <Typography sx={{ fontSize: 12, color: p.primary, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
        Frases personalizadas tornam os disparos mais eficientes
      </Typography>
    </Box>
  </Box>
);

/* ─── CampaignsPhrase ────────────────────────────────────────────────────── */
const CampaignsPhrase = () => {
  const p = usePalette();
  const { user } = useContext(AuthContext);

  const [loading, setLoading]                           = useState(true);
  const [confirmModalOpen, setConfirmModalOpen]         = useState(false);
  const [deletingFlow, setDeletingFlow]                 = useState(null);
  const [campaignFlows, setCampaignFlows]               = useState([]);
  const [modalOpenPhrase, setModalOpenPhrase]           = useState(false);
  const [campaignFlowSelected, setCampaignFlowSelected] = useState();

  const getCampaigns = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/flowcampaign");
      setCampaignFlows(data.flow || []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getCampaigns(); }, []);

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await api.delete(`/flowcampaign/${campaignId}`);
      toast.success("Frase deletada");
      setDeletingFlow(null);
      getCampaigns();
    } catch (err) {
      toastError(err);
    }
  };

  /* ── KPIs derivados ── */
  const totalFlows  = campaignFlows.length;
  const ativos      = campaignFlows.filter((f) => f.status).length;
  const desativados = campaignFlows.filter((f) => !f.status).length;

  /* ── Colunas com ícones — padrão Quickemessages ── */
  const COLS = [
    { label: "Nome",                              align: "left",   icon: <TextFields   sx={{ fontSize: 13 }} /> },
    { label: "Status",                            align: "center", icon: <ToggleOn     sx={{ fontSize: 13 }} /> },
    { label: i18n.t("contacts.table.actions"),    align: "center", icon: <MoreHoriz    sx={{ fontSize: 13 }} /> },
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
      className="cp-root"
      style={{ "--cp-hover-row": p.hoverRow }}
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
          deletingFlow &&
          `${i18n.t("campaigns.confirmationModal.deleteTitle")} ${deletingFlow.name}?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteCampaign(deletingFlow.id)}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <CampaignModalPhrase
        open={modalOpenPhrase}
        onClose={() => setModalOpenPhrase(false)}
        FlowCampaignId={campaignFlowSelected}
        onSave={getCampaigns}
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
                Campanhas
              </Typography>
              <Box sx={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: p.isDark ? alpha(p.primary, 0.5) : alpha("#fff", 0.45) }} />
              <Typography sx={{
                fontSize: { xs: 10, sm: 11 }, fontWeight: 600,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: p.isDark ? alpha("#fff", 0.5) : alpha("#fff", 0.55),
              }}>
                Frases
              </Typography>
            </Stack>

            <Typography sx={{
              fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
              letterSpacing: "-0.025em", lineHeight: 1,
              color: p.isDark ? p.textPrimary : "#ffffff",
            }}>
              Campanhas
            </Typography>

            <Typography sx={{
              fontSize: { xs: 12, sm: 13.5 }, mt: 0.6,
              color: p.isDark ? p.textMuted : alpha("#fff", 0.72),
              display: { xs: "none", sm: "block" },
            }}>
              Configure fluxos de campanha com regras e textos para disparos automáticos.
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.2, sm: 1.5 }, flexWrap: "wrap", gap: 0.8 }}>
              {[
                { icon: <FiberManualRecord sx={{ fontSize: 8 }} />, label: "Atualizado agora" },
                { icon: <CampaignIcon sx={{ fontSize: 12 }} />,     label: `${totalFlows} campanhas` },
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
            { title: "Total de campanhas", value: totalFlows,  hint: "Cadastradas no sistema",  icon: <CampaignIcon />, colorCfg: p.kpiPrimary, delay: 40  },
            { title: "Ativas",             value: ativos,      hint: "Campanhas em execução",   icon: <CheckCircle />, colorCfg: p.kpiSuccess, delay: 80  },
            { title: "Desativadas",        value: desativados, hint: "Pausadas ou inativas",    icon: <TextFields />,  colorCfg: p.kpiWarning, delay: 120 },
          ].map((card, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <KpiCard {...card} p={p} />
            </Grid>
          ))}
        </Grid>

        {/* ── Barra de ações ── */}
        <SubPaper p={p} sx={{ p: { xs: "12px 14px", sm: "14px 18px" } }} className="cp-animate" style={{ animationDelay: "100ms" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            sx={{ mb: 1.4 }}
          >
            <Box>
              <SectionLabel p={p}>Ações</SectionLabel>
              <Typography sx={{ fontSize: { xs: 13, sm: 14.5 }, color: p.textPrimary, fontWeight: 700, mt: 0.2 }}>
                Gerenciar campanhas
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            disableElevation
            startIcon={<AddCircleOutline sx={{ fontSize: 16 }} />}
            onClick={() => { setCampaignFlowSelected(undefined); setModalOpenPhrase(true); }}
            sx={{
              position: "relative", overflow: "hidden",
              backgroundColor: p.primary, color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700, fontSize: 13, letterSpacing: "0.02em",
              textTransform: "none", borderRadius: "10px", height: 40, px: 2.5,
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
            Campanha
          </Button>
        </SubPaper>

        {/* ── Tabela ── */}
        <SubPaper
          p={p}
          sx={{ flex: 1, overflow: "hidden", p: 0 }}
          className="cp-animate"
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
                Fluxos cadastrados
              </Typography>
            </Box>
            {totalFlows > 0 && (
              <Box sx={{
                display: "inline-flex", alignItems: "center", gap: 0.6,
                px: 1.2, py: 0.45, borderRadius: "8px",
                backgroundColor: p.chipBg,
                border: `1px solid ${alpha(p.primary, p.isDark ? 0.25 : 0.16)}`,
              }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: p.primary, boxShadow: `0 0 0 3px ${alpha(p.primary, 0.2)}` }} />
                <Typography sx={{ fontSize: 11.5, color: p.chipColor, fontWeight: 600 }}>
                  {totalFlows.toLocaleString("pt-BR")} campanhas
                </Typography>
              </Box>
            )}
          </Stack>

          {/* Separador */}
          <Box sx={{ height: "1px", backgroundColor: p.divider, mx: { xs: "14px", sm: "16px", md: "18px" } }} />

          {/* Scroll da tabela */}
          <Box sx={{ overflowY: "auto", maxHeight: "60vh", WebkitOverflowScrolling: "touch" }}>

            {/* Loading */}
            {loading && (
              <Stack justifyContent="center" alignItems="center" sx={{ minHeight: 220 }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                  <CircularProgress size={32} sx={{ color: p.primary }} />
                  <Typography sx={{ fontSize: 13, color: p.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
                    Carregando campanhas…
                  </Typography>
                </Box>
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
                  {campaignFlows.map((flow) => (
                    <TableRow
                      key={flow.id}
                      className="cp-row"
                      sx={{ "& td": { transition: "background 0.13s" } }}
                    >
                      {/* Nome */}
                      <TableCell align="left" sx={tdCellSx}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{
                            width: 28, height: 28, borderRadius: "8px", flexShrink: 0,
                            backgroundColor: alpha(p.primary, p.isDark ? 0.14 : 0.08),
                            border: `1px solid ${alpha(p.primary, p.isDark ? 0.22 : 0.14)}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: p.primary,
                          }}>
                            <TextFields sx={{ fontSize: 14 }} />
                          </Box>
                          <Typography sx={{
                            fontSize: { xs: 12, sm: 13 }, fontWeight: 600,
                            color: p.textPrimary,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            fontFamily: "'DM Sans', system-ui, sans-serif",
                          }}>
                            {flow.name}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Status */}
                      <TableCell align="center" sx={tdCellSx}>
                        <StatusBadge active={flow.status} p={p} />
                      </TableCell>

                      {/* Ações */}
                      <TableCell align="center" sx={tdCellSx}>
                        <Stack direction="row" spacing={0.4} justifyContent="center">
                          <ActionBtn
                            title="Editar"
                            onClick={() => { setCampaignFlowSelected(flow.id); setModalOpenPhrase(true); }}
                            icon={<Edit />}
                            color={p.primary}
                            p={p}
                          />
                          <Can
                            role={user.profile}
                            perform="contacts-page:deleteContact"
                            yes={() => (
                              <ActionBtn
                                title="Excluir"
                                onClick={() => { setConfirmModalOpen(true); setDeletingFlow(flow); }}
                                icon={<DeleteOutline />}
                                color={p.danger}
                                p={p}
                              />
                            )}
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* ── Empty state com ilustração ── */}
                  {campaignFlows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 0, borderBottom: "none" }}>
                        <EmptyState p={p} />
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

export default CampaignsPhrase;
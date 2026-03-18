/**
 * ServerMetrics — Visual 100% fiel ao Dashboard
 * - Mesma fonte DM Sans / JetBrains Mono
 * - usePalette idêntico (dark/light, whitelabel)
 * - KpiCard com animação de contagem, barra colorida no hover, ícone animado
 * - SubPaper / SectionLabel / cabeçalho corporativo com gradiente
 * - Lógica de dados e atualização 100% preservada
 */

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar, Box, Chip, Grid, Paper, Stack, Typography, alpha, useMediaQuery,
} from "@mui/material";
import {
  AccessTime, Autorenew, CloudQueue, DeveloperBoard, Dns,
  FiberManualRecord, Memory, Storage, Insights,
} from "@mui/icons-material";
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";
import { useTheme as useMuiThemeV4 } from "@material-ui/core/styles";

import ForbiddenPage from "../../components/ForbiddenPage";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import toastError from "../../errors/toastError";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatBytes = (bytes) => {
  const num = Number(bytes || 0);
  if (!num) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(num) / Math.log(1024)), sizes.length - 1);
  const value = num / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
};

const formatSeconds = (seconds) => {
  const total = Math.max(0, Math.floor(Number(seconds || 0)));
  const days    = Math.floor(total / 86400);
  const hours   = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs    = total % 60;
  if (days > 0)  return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  return `${minutes}m ${secs}s`;
};

// ─── Estilos globais (idênticos ao Dashboard) ─────────────────────────────────

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .sm-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .sm-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .sm-root { max-width: 100%; overflow-x: hidden; }

    @keyframes smFadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes smKpiIconGlow {
      0%   { box-shadow: 0 0 0 0   var(--kpi-glow); }
      50%  { box-shadow: 0 0 0 7px var(--kpi-glow); }
      100% { box-shadow: 0 0 0 0   transparent; }
    }

    .sm-animate { animation: smFadeSlideUp 0.36s ease both; }

    /* KPI card — barra colorida no topo ao hover */
    .sm-kpi-card { position: relative; overflow: hidden; }
    .sm-kpi-card::after {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--kpi-color); border-radius: 14px 14px 0 0;
      transform: scaleX(0); transform-origin: left center;
      transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
    }
    .sm-kpi-card:hover::after { transform: scaleX(1); }
    .sm-kpi-icon-box {
      transition: transform 0.24s cubic-bezier(0.34,1.56,0.64,1) !important;
      will-change: transform;
    }
    .sm-kpi-card:hover .sm-kpi-icon-box {
      transform: scale(1.22) rotate(10deg) !important;
      animation: smKpiIconGlow 0.6s ease forwards;
    }

    /* Info section — linha hover */
    .sm-row-hover:hover { background: var(--sm-hover-row) !important; }

    /* Scrollbar fina */
    .sm-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .sm-root ::-webkit-scrollbar-track { background: transparent; }
    .sm-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  `}</style>
);

// ─── usePalette (idêntico ao Dashboard) ──────────────────────────────────────

const usePalette = () => {
  const themeV4 = useMuiThemeV4();
  const themeV5 = useMuiThemeV5();
  const isDark  = themeV4?.palette?.type === "dark" || themeV5?.palette?.mode === "dark";

  const BLUES  = ["#1976d2","#2196f3","#1565c0","#42a5f5","#1769aa","#2563eb","#1d4ed8"];
  const v4Raw  = themeV4?.palette?.primary?.main || "";
  const v5p    = themeV5?.palette?.primary?.main || "#0f6cbd";
  const isC4   = v4Raw && !BLUES.includes(v4Raw.toLowerCase().trim());
  const isC5   = v5p   && !BLUES.includes(v5p.toLowerCase().trim());
  const primary = isC4 ? v4Raw : isC5 ? v5p : (v4Raw || v5p);

  return useMemo(() => {
    const success="#10b981", warning="#f59e0b", danger="#ef4444";
    const purple="#8b5cf6", teal="#14b8a6", green="#22c55e";

    const t = isDark ? {
      pageBg:"#080e1a", surfaceBg:"#0f1929", surfaceBg2:"#141f30",
      border:"rgba(255,255,255,0.065)", divider:"rgba(255,255,255,0.055)",
      textPrimary:"#f0f4f8", textSecond:"#8fa4be", textMuted:"#4d6478",
      barTrack:"rgba(255,255,255,0.06)", hoverRow:"rgba(255,255,255,0.03)",
      tagBg:"rgba(255,255,255,0.07)",
    } : {
      pageBg:"#f0f4f8", surfaceBg:"#ffffff", surfaceBg2:"#fafbfd",
      border:"#e3eaf2", divider:"#e8eef4",
      textPrimary:"#0d1b2a", textSecond:"#3d5166", textMuted:"#8fa0b0",
      barTrack:"#e8eef5", hoverRow:"#f5f8fc",
      tagBg:"rgba(0,0,0,0.045)",
    };

    return {
      primary, isDark, ...t,
      chipBg:    alpha(primary, isDark ? 0.18 : 0.10),
      chipColor: primary,
      kpiPrimary:{ color:primary,  bg:alpha(primary,  isDark?0.16:0.09) },
      kpiWarning:{ color:warning,  bg:alpha(warning,  isDark?0.16:0.09) },
      kpiSuccess:{ color:success,  bg:alpha(success,  isDark?0.16:0.09) },
      kpiPurple: { color:purple,   bg:alpha(purple,   isDark?0.16:0.09) },
      kpiTeal:   { color:teal,     bg:alpha(teal,     isDark?0.16:0.09) },
      kpiDanger: { color:danger,   bg:alpha(danger,   isDark?0.16:0.09) },
      success, warning, danger, purple, teal, green,
    };
  }, [primary, isDark]);
};

// ─── KpiCard (idêntico ao Dashboard — animação de contagem + ícone animado) ──

const KpiCard = ({ title, value, hint, icon, colorCfg, p, delay = 0, isText = false }) => {
  const num = isText ? 0 : (typeof value === "number" ? value : (parseInt(String(value).replace(/\D/g, ""), 10) || 0));
  const [disp, setDisp] = useState(isText ? value : 0);

  useEffect(() => {
    if (isText) { setDisp(value); return; }
    if (num === 0) { setDisp(0); return; }
    const steps = 40, st = 900 / steps; let cur = 0;
    const t = setInterval(() => {
      cur += 1; setDisp(Math.round((num * cur) / steps));
      if (cur >= steps) { setDisp(num); clearInterval(t); }
    }, st);
    return () => clearInterval(t);
  }, [num, value]); // eslint-disable-line

  return (
    <Paper
      elevation={0}
      className="sm-animate sm-kpi-card"
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
          <Typography
            className={isText ? "" : "mono"}
            sx={{
              color: p.textPrimary, lineHeight: 1.1, mt: { xs: 0.5, sm: 0.75 }, fontWeight: 700,
              fontSize: isText ? { xs: 18, sm: 22 } : { xs: 24, sm: 29, md: 32 },
              letterSpacing: isText ? "-0.01em" : "-0.025em",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}
          >
            {isText ? disp : (typeof disp === "number" ? disp.toLocaleString("pt-BR") : disp)}
          </Typography>
        </Box>
        <Box
          className="sm-kpi-icon-box"
          sx={{
            width: { xs: 38, sm: 48 }, height: { xs: 38, sm: 48 }, borderRadius: "12px",
            backgroundColor: colorCfg.bg, color: colorCfg.color,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            border: `1.5px solid ${alpha(colorCfg.color, p.isDark ? 0.22 : 0.14)}`,
            boxShadow: `0 2px 10px ${alpha(colorCfg.color, p.isDark ? 0.18 : 0.10)}`,
          }}
        >
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

// ─── SubPaper (idêntico ao Dashboard) ────────────────────────────────────────

const SubPaper = ({ children, sx = {}, p }) => (
  <Paper elevation={0} sx={{
    p: { xs: "13px 13px", sm: "15px 16px", md: "16px 18px" },
    borderRadius: "14px", border: `1px solid ${p.border}`,
    backgroundColor: p.surfaceBg, ...sx,
  }}>
    {children}
  </Paper>
);

// ─── SectionLabel (idêntico ao Dashboard) ────────────────────────────────────

const SectionLabel = ({ children, p }) => (
  <Typography sx={{
    fontSize: { xs: 9.5, sm: 11 }, color: p.textMuted, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.09em",
  }}>
    {children}
  </Typography>
);

// ─── InfoRow — linha de dado dentro do SubPaper ───────────────────────────────

const InfoRow = ({ label, value, extra, isLast, p }) => (
  <Box
    className="sm-row-hover"
    sx={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      py: { xs: 0.85, sm: 1 },
      borderBottom: isLast ? "none" : `1px solid ${p.divider}`,
      borderRadius: "6px", px: 0.5,
      transition: "background 0.15s",
    }}
  >
    <Typography sx={{ fontSize: { xs: 12, sm: 12.5 }, color: p.textMuted, fontWeight: 500 }}>
      {label}
    </Typography>
    <Stack direction="row" spacing={0.8} alignItems="center">
      {extra}
      <Typography className="mono" sx={{
        fontSize: { xs: 12, sm: 12.5 }, color: p.textPrimary,
        fontWeight: 600, textAlign: "right",
      }}>
        {value}
      </Typography>
    </Stack>
  </Box>
);

// ─── InfoSection — SubPaper com título + linhas de dados ─────────────────────

const InfoSection = ({ title, sectionLabel, icon, rows, p, sx = {}, delay = 0 }) => (
  <SubPaper p={p} sx={{ height: "100%", ...sx }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.2 }}>
      <Box>
        {sectionLabel && <SectionLabel p={p}>{sectionLabel}</SectionLabel>}
        <Typography sx={{
          fontSize: { xs: 13, sm: 14.5 }, color: p.textPrimary, fontWeight: 700,
          mt: sectionLabel ? 0.2 : 0,
        }}>
          {title}
        </Typography>
      </Box>
      {icon && (
        <Box sx={{
          width: { xs: 34, sm: 40 }, height: { xs: 34, sm: 40 }, borderRadius: "10px",
          backgroundColor: alpha(p.primary, p.isDark ? 0.16 : 0.09),
          color: p.primary, display: "flex", alignItems: "center", justifyContent: "center",
          border: `1.5px solid ${alpha(p.primary, p.isDark ? 0.22 : 0.14)}`,
          flexShrink: 0,
        }}>
          {React.cloneElement(icon, { sx: { fontSize: { xs: 17, sm: 20 } } })}
        </Box>
      )}
    </Stack>

    <Stack spacing={0} sx={{ mt: 0.5 }}>
      {rows.map(({ label, value, extra }, idx) => (
        <InfoRow
          key={idx}
          label={label}
          value={value}
          extra={extra}
          isLast={idx === rows.length - 1}
          p={p}
        />
      ))}
    </Stack>
  </SubPaper>
);

// ─── ServerMetrics ────────────────────────────────────────────────────────────

const ServerMetrics = () => {
  const p        = usePalette();
  const themeV5  = useMuiThemeV5();
  const isMobile = useMediaQuery(themeV5.breakpoints.down("sm"));

  const { user }    = useContext(AuthContext);
  const [loading, setLoading]   = useState(false);
  const [metrics, setMetrics]   = useState(null);

  useEffect(() => {
    if (!user?.super) return;
    let mounted = true;

    const fetchMetrics = async () => {
      if (!mounted) return;
      try {
        setLoading(true);
        const { data } = await api.get("/server-metrics");
        if (mounted) setMetrics(data);
      } catch (error) {
        if (mounted) toastError(error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMetrics();
    const timer = setInterval(fetchMetrics, 15000);
    return () => { mounted = false; clearInterval(timer); };
  }, [user?.super]);

  const statusData = useMemo(() => {
    const redisStatus = metrics?.redis?.status || "offline";
    const serverStatus = metrics?.status || "offline";
    return {
      server: serverStatus,
      serverColor:
        serverStatus === "online"   ? p.success :
        serverStatus === "degraded" ? p.warning : p.danger,
      redis: redisStatus,
      redisColor:
        redisStatus === "online"   ? p.success :
        redisStatus === "degraded" ? p.warning : p.danger,
    };
  }, [metrics, p.success, p.warning, p.danger]);

  if (!user?.super) return <ForbiddenPage />;

  const gs = { xs: 1, sm: 1.5 };

  return (
    <Box
      className="sm-root"
      style={{ "--sm-hover-row": p.hoverRow }}
      sx={{
        width: "100%", minHeight: "calc(100% - 48px)",
        backgroundColor: p.pageBg,
        transition: "background-color 0.3s ease",
      }}
    >
      <FontStyle />

      {/* ══ CABEÇALHO CORPORATIVO (idêntico ao Dashboard) ══════════════════ */}
      <Box sx={{
        background: p.isDark
          ? `linear-gradient(135deg, #0d1b2e 0%, #0a1520 60%, ${alpha(p.primary, 0.12)} 100%)`
          : `linear-gradient(135deg, ${p.primary} 0%, ${alpha(p.primary, 0.82)} 55%, ${alpha("#0ea5e9", 0.9)} 100%)`,
        px: { xs: 2, sm: 3, md: 4 }, pt: { xs: 2.5, sm: 3, md: 3.5 }, pb: { xs: 2, sm: 2.5, md: 3 },
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorações geométricas */}
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
            {/* Breadcrumb */}
            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: 0.8 }}>
              <Typography sx={{
                fontSize: { xs: 10, sm: 11 }, fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: p.isDark ? alpha(p.primary, 0.8) : alpha("#fff", 0.7),
              }}>
                Painel
              </Typography>
              <Box sx={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: p.isDark ? alpha(p.primary, 0.5) : alpha("#fff", 0.45) }} />
              <Typography sx={{
                fontSize: { xs: 10, sm: 11 }, fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: p.isDark ? alpha("#fff", 0.5) : alpha("#fff", 0.55),
              }}>
                Servidor
              </Typography>
            </Stack>

            {/* Título */}
            <Typography sx={{
              fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
              letterSpacing: "-0.025em", lineHeight: 1,
              color: p.isDark ? p.textPrimary : "#ffffff",
            }}>
              Dados do Servidor
            </Typography>

            {/* Subtítulo */}
            <Typography sx={{
              fontSize: { xs: 12, sm: 13.5 }, mt: 0.6,
              color: p.isDark ? p.textMuted : alpha("#fff", 0.72),
              display: { xs: "none", sm: "block" },
            }}>
              Painel de recursos da VPS · Atualização automática a cada 15 segundos
            </Typography>

            {/* Meta-tags */}
            <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.2, sm: 1.5 }, flexWrap: "wrap", gap: 0.8 }}>
              {[
                {
                  icon: <FiberManualRecord sx={{ fontSize: 8 }} />,
                  label: loading ? "Atualizando..." : "Atualizado agora",
                },
                {
                  icon: <Autorenew sx={{ fontSize: 12 }} />,
                  label: "Atualização 15s",
                },
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
        </Stack>
      </Box>

      {/* ── Conteúdo ── */}
      <Box sx={{ px: { xs: 1, sm: 1.5, md: 2.5 }, py: { xs: 1.5, sm: 2, md: 2.5 } }}>

        {/* ── KPI Cards ── */}
        <Grid container spacing={gs} sx={{ mb: gs }}>
          {[
            {
              title: "Status do Servidor",
              value: String(statusData.server).toUpperCase(),
              hint:  "Estado atual do processo Node",
              icon:  <Storage />,
              colorCfg: statusData.server === "online" ? p.kpiSuccess : p.kpiDanger,
              isText: true, delay: 40,
            },
            {
              title: "Uptime do Servidor",
              value: formatSeconds(metrics?.uptimeSeconds),
              hint:  "Tempo em execução contínua",
              icon:  <AccessTime />,
              colorCfg: p.kpiPrimary,
              isText: true, delay: 80,
            },
            {
              title: "Hora do Servidor",
              value: metrics?.serverTime
                ? new Date(metrics.serverTime).toLocaleTimeString("pt-BR")
                : "-",
              hint: metrics?.serverTime
                ? new Date(metrics.serverTime).toLocaleDateString("pt-BR")
                : "Aguardando dados",
              icon: <Dns />,
              colorCfg: p.kpiPurple,
              isText: true, delay: 120,
            },
          ].map((card, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <KpiCard {...card} p={p} />
            </Grid>
          ))}
        </Grid>

        {/* ── Cards de detalhe ── */}
        <Grid container spacing={gs}>

          {/* Informações gerais */}
          <Grid item xs={12} md={6}>
            <InfoSection
              sectionLabel="Sistema"
              title="Informações Gerais"
              icon={<Storage />}
              p={p}
              delay={160}
              rows={[
                { label: "Hostname",         value: metrics?.general?.hostname    || "-" },
                { label: "Plataforma",       value: metrics?.general?.platform    || "-" },
                { label: "Kernel / Release", value: metrics?.general?.release     || "-" },
                { label: "Arquitetura",      value: metrics?.general?.arch        || "-" },
                { label: "Node",             value: metrics?.general?.nodeVersion || "-" },
              ]}
            />
          </Grid>

          {/* Memória RAM */}
          <Grid item xs={12} md={6}>
            <InfoSection
              sectionLabel="Hardware"
              title="Memória RAM"
              icon={<Memory />}
              p={p}
              delay={200}
              rows={[
                { label: "Total",   value: formatBytes(metrics?.memory?.total) },
                { label: "Em uso",  value: formatBytes(metrics?.memory?.used)  },
                { label: "Livre",   value: formatBytes(metrics?.memory?.free)  },
                {
                  label: "Uso (%)",
                  value: `${Number(metrics?.memory?.usedPercent || 0).toFixed(1)}%`,
                  extra: (
                    <Box sx={{
                      px: 0.7, py: 0.1, borderRadius: "5px",
                      backgroundColor: alpha(
                        Number(metrics?.memory?.usedPercent || 0) > 85 ? p.danger :
                        Number(metrics?.memory?.usedPercent || 0) > 65 ? p.warning : p.success,
                        p.isDark ? 0.18 : 0.10
                      ),
                      color:
                        Number(metrics?.memory?.usedPercent || 0) > 85 ? p.danger :
                        Number(metrics?.memory?.usedPercent || 0) > 65 ? p.warning : p.success,
                      fontSize: 10.5, fontWeight: 700,
                    }}>
                      {Number(metrics?.memory?.usedPercent || 0).toFixed(0)}%
                    </Box>
                  ),
                },
              ]}
            />
          </Grid>

          {/* CPU */}
          <Grid item xs={12} md={6}>
            <InfoSection
              sectionLabel="Hardware"
              title="CPU"
              icon={<DeveloperBoard />}
              p={p}
              delay={240}
              rows={[
                { label: "Modelo",   value: metrics?.cpu?.model || "-" },
                { label: "Núcleos",  value: String(metrics?.cpu?.cores || 0) },
                { label: "Load 1m",  value: Number(metrics?.cpu?.loadAverage1m  || 0).toFixed(2) },
                { label: "Load 5m",  value: Number(metrics?.cpu?.loadAverage5m  || 0).toFixed(2) },
                { label: "Load 15m", value: Number(metrics?.cpu?.loadAverage15m || 0).toFixed(2) },
              ]}
            />
          </Grid>

          {/* Disco e Redis */}
          <Grid item xs={12} md={6}>
            <InfoSection
              sectionLabel="Armazenamento & Cache"
              title="Disco e Redis"
              icon={<CloudQueue />}
              p={p}
              delay={280}
              rows={[
                { label: "Disco (mount)", value: metrics?.disk?.mount || "/" },
                { label: "Disco total",   value: formatBytes(metrics?.disk?.total) },
                {
                  label: "Disco usado",
                  value: `${formatBytes(metrics?.disk?.used)} (${Number(metrics?.disk?.usedPercent || 0).toFixed(0)}%)`,
                  extra: (
                    <Box sx={{
                      px: 0.7, py: 0.1, borderRadius: "5px",
                      backgroundColor: alpha(
                        Number(metrics?.disk?.usedPercent || 0) > 85 ? p.danger :
                        Number(metrics?.disk?.usedPercent || 0) > 65 ? p.warning : p.success,
                        p.isDark ? 0.18 : 0.10
                      ),
                      color:
                        Number(metrics?.disk?.usedPercent || 0) > 85 ? p.danger :
                        Number(metrics?.disk?.usedPercent || 0) > 65 ? p.warning : p.success,
                      fontSize: 10.5, fontWeight: 700,
                    }}>
                      {Number(metrics?.disk?.usedPercent || 0).toFixed(0)}%
                    </Box>
                  ),
                },
                { label: "Disco livre",  value: formatBytes(metrics?.disk?.free) },
                {
                  label: "Redis status",
                  value: String(statusData.redis).toUpperCase(),
                  extra: (
                    <Box sx={{
                      display: "inline-flex", alignItems: "center", gap: 0.5,
                      px: 0.9, py: 0.2, borderRadius: "20px",
                      backgroundColor: alpha(statusData.redisColor, p.isDark ? 0.14 : 0.08),
                      border: `1px solid ${alpha(statusData.redisColor, p.isDark ? 0.22 : 0.15)}`,
                    }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: statusData.redisColor }} />
                    </Box>
                  ),
                },
              ]}
            />
          </Grid>

        </Grid>
      </Box>
    </Box>
  );
};

export default ServerMetrics;
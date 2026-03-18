import React, { useState, useEffect, useCallback } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Paper, Typography, Modal } from "@material-ui/core";
import { alpha } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import CircularProgress from "@material-ui/core/CircularProgress";

import LiveHelpIcon from "@material-ui/icons/LiveHelp";
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";
import OndemandVideoIcon from "@material-ui/icons/OndemandVideo";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import SearchIcon from "@material-ui/icons/Search";

// ── MUI v5 — cabeçalho (idêntico ao Invoices) ──
import {
  Box as MuiBox,
  Stack,
  Typography as MuiTypography,
  alpha as muiAlpha,
} from "@mui/material";

import { i18n } from "../../translate/i18n";
import useHelps from "../../hooks/useHelps";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .hlp-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .hlp-root .mono { font-family: 'JetBrains Mono', monospace !important; }

    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .hlp-animate { animation: fadeSlideUp 0.36s ease both; }

    .hlp-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .hlp-root ::-webkit-scrollbar-track { background: transparent; }
    .hlp-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }

    .hlp-card {
      transition: transform 0.22s, box-shadow 0.22s !important;
    }
    .hlp-card:hover {
      transform: translateY(-5px) !important;
    }

    .hlp-play-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0);
      transition: background 0.22s;
      border-radius: 12px 12px 0 0;
    }
    .hlp-card:hover .hlp-play-overlay {
      background: rgba(0,0,0,0.35);
    }
    .hlp-play-icon {
      opacity: 0;
      transform: scale(0.7);
      transition: opacity 0.22s, transform 0.22s;
      color: #fff;
      font-size: 56px !important;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5));
    }
    .hlp-card:hover .hlp-play-icon {
      opacity: 1;
      transform: scale(1);
    }

    .kpi-card-hlp { position: relative; overflow: hidden; }
    .kpi-card-hlp::after {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--kpi-color, #2563eb); border-radius: 14px 14px 0 0;
      transform: scaleX(0); transform-origin: left center;
      transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
    }
    .kpi-card-hlp:hover::after { transform: scaleX(1); }
    .kpi-icon-box-hlp {
      transition: transform 0.24s cubic-bezier(0.34,1.56,0.64,1) !important;
    }
    .kpi-card-hlp:hover .kpi-icon-box-hlp {
      transform: scale(1.22) rotate(10deg) !important;
    }
  `}</style>
);

/* ─── makeStyles ──────────────────────────────────────────────────────────── */
const useStyles = makeStyles((theme) => {
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";

  const pageBg      = isDark ? "#080e1a" : "#f0f4f8";
  const surfaceBg   = isDark ? "#0f1929" : "#ffffff";
  const border      = isDark ? "rgba(255,255,255,0.065)" : "#e3eaf2";
  const divider     = isDark ? "rgba(255,255,255,0.055)" : "#e8eef4";
  const textPrimary = isDark ? "#f0f4f8" : "#0d1b2a";
  const textSecond  = isDark ? "#8fa4be" : "#3d5166";
  const textMuted   = isDark ? "#4d6478" : "#8fa0b0";
  const success     = "#10b981";

  return {
    pageRoot: {
      display: "flex", flexDirection: "column", position: "relative",
      flex: 1, width: "100%", maxWidth: "100%",
      height: "100%", overflowY: "hidden",
      backgroundColor: pageBg,
      transition: "background-color 0.3s ease",
    },
    contentArea: {
      padding: theme.spacing(2, 2.5, 2.5),
      overflowY: "auto", flex: 1,
      ...theme.scrollbarStyles,
      [theme.breakpoints.down("sm")]: { padding: theme.spacing(1.5, 1, 1.5) },
    },
    // ── KPI Cards ──
    kpiCard: {
      padding: "16px 18px 13px", borderRadius: 14,
      border: `1px solid ${border}`, minHeight: 110,
      backgroundColor: surfaceBg,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      cursor: "default",
      transition: "box-shadow 0.22s, transform 0.22s, border-color 0.22s",
      "&:hover": { transform: "translateY(-2px)" },
    },
    kpiTitle: {
      color: textMuted, fontSize: 11, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1,
    },
    kpiValue: {
      fontFamily: "'JetBrains Mono', monospace !important",
      color: textPrimary, fontSize: 32, lineHeight: 1.1,
      marginTop: 6, fontWeight: 700, letterSpacing: "-0.025em",
    },
    kpiHint: {
      color: textMuted, fontSize: 11.5,
      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    },
    kpiDot: { width: 5, height: 5, borderRadius: "50%", opacity: 0.65, flexShrink: 0, marginRight: 5 },
    // ── Main paper ──
    mainPaper: {
      borderRadius: 14, border: `1px solid ${border}`,
      boxShadow: isDark ? "0 12px 26px rgba(0,0,0,0.45)" : "0 12px 26px rgba(17,24,39,0.09)",
      backgroundColor: surfaceBg,
      overflow: "hidden",
    },
    sectionLabel: {
      fontSize: 11, color: textMuted, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.09em",
    },
    sectionTitle: {
      fontSize: 14.5, color: textPrimary, fontWeight: 700, marginTop: 2,
    },
    // ── Cards grid ──
    cardsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: theme.spacing(2.5),
      padding: theme.spacing(2.5),
      [theme.breakpoints.down("xs")]: { gridTemplateColumns: "1fr" },
    },
    // ── Help card ──
    helpCard: {
      borderRadius: 14,
      border: `1px solid ${border}`,
      backgroundColor: surfaceBg,
      boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.30)" : "0 4px 16px rgba(15,23,42,0.08)",
      cursor: "pointer",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    thumbnailWrapper: {
      position: "relative",
      width: "100%",
      paddingTop: "56.25%", // 16:9
      overflow: "hidden",
      borderRadius: "12px 12px 0 0",
      backgroundColor: isDark ? "#0a1117" : "#e2e8f0",
      flexShrink: 0,
    },
    thumbnail: {
      position: "absolute",
      top: 0, left: 0,
      width: "100%", height: "100%",
      objectFit: "cover",
      borderRadius: "12px 12px 0 0",
      display: "block",
    },
    cardBody: {
      padding: "14px 16px 16px",
      display: "flex",
      flexDirection: "column",
      flex: 1,
    },
    videoTitle: {
      fontSize: "0.9rem", fontWeight: 700,
      color: textPrimary, lineHeight: 1.35,
      marginBottom: 6,
    },
    videoDescription: {
      fontSize: "0.78rem", color: textSecond,
      lineHeight: 1.55, flex: 1,
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    },
    watchBadge: {
      display: "inline-flex", alignItems: "center", gap: 5,
      marginTop: 12,
      padding: "4px 10px", borderRadius: 20,
      backgroundColor: alpha(primary, isDark ? 0.18 : 0.10),
      border: `1px solid ${alpha(primary, isDark ? 0.26 : 0.18)}`,
      color: primary,
      fontSize: "0.72rem", fontWeight: 700,
      alignSelf: "flex-start",
    },
    // ── Modal ──
    videoModal: {
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    videoModalContent: {
      outline: "none", width: "90%", maxWidth: 1024,
      aspectRatio: "16/9", position: "relative",
      backgroundColor: "#000",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
    },
    // ── Empty state ──
    emptyState: {
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "64px 32px",
      color: textMuted,
    },
  };
});

/* ══════════════════════════════════════════════════════════════════════════ */
const Helps = () => {
  const classes = useStyles();
  const theme   = useTheme();
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";

  const [records, setRecords]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const { list } = useHelps();

  const border = isDark ? "rgba(255,255,255,0.065)" : "#e3eaf2";
  const green  = "#10b981";
  const blue   = "#0ea5e9";

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const helps = await list();
      setRecords(helps);
      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openVideoModal  = (video) => setSelectedVideo(video);
  const closeVideoModal = ()      => setSelectedVideo(null);

  const handleModalClose = useCallback((event) => {
    if (event.key === "Escape") closeVideoModal();
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleModalClose);
    return () => document.removeEventListener("keydown", handleModalClose);
  }, [handleModalClose]);

  /* ── Cabeçalho — MUI v5 sx, idêntico ao Invoices ── */
  const HeroHeader = () => (
    <MuiBox sx={{
      background: isDark
        ? `linear-gradient(135deg, #0d1b2e 0%, #0a1520 60%, ${muiAlpha(primary, 0.12)} 100%)`
        : `linear-gradient(135deg, ${primary} 0%, ${muiAlpha(primary, 0.82)} 55%, ${muiAlpha("#0ea5e9", 0.9)} 100%)`,
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
        background: isDark ? muiAlpha(primary, 0.08) : muiAlpha("#fff", 0.08),
        pointerEvents: "none",
      }} />
      <MuiBox sx={{
        position: "absolute", bottom: -30, left: "35%",
        width: { xs: 100, md: 140 }, height: { xs: 100, md: 140 },
        borderRadius: "50%",
        background: isDark ? muiAlpha("#0ea5e9", 0.06) : muiAlpha("#fff", 0.06),
        pointerEvents: "none",
      }} />

      <MuiBox sx={{ position: "relative", zIndex: 1 }}>
        {/* Breadcrumb */}
        <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: 0.8 }}>
          <MuiTypography sx={{
            fontSize: { xs: 10, sm: 11 }, fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: isDark ? muiAlpha(primary, 0.8) : muiAlpha("#fff", 0.7),
          }}>
            Suporte
          </MuiTypography>
          <MuiBox sx={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: isDark ? muiAlpha(primary, 0.5) : muiAlpha("#fff", 0.45) }} />
          <MuiTypography sx={{
            fontSize: { xs: 10, sm: 11 }, fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: isDark ? muiAlpha("#fff", 0.5) : muiAlpha("#fff", 0.55),
          }}>
            {i18n.t("helps.title")}
          </MuiTypography>
        </Stack>

        {/* Título */}
        <MuiTypography sx={{
          fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
          letterSpacing: "-0.025em", lineHeight: 1,
          color: isDark ? "#f0f4f8" : "#ffffff",
        }}>
          {i18n.t("helps.title")}
        </MuiTypography>

        {/* Subtítulo */}
        <MuiTypography sx={{
          fontSize: { xs: 12, sm: 13.5 }, mt: 0.6,
          color: isDark ? "#4d6478" : muiAlpha("#fff", 0.72),
          display: { xs: "none", sm: "block" },
        }}>
          Aprenda a utilizar todas as funcionalidades da plataforma com nossos tutoriais em vídeo.
        </MuiTypography>

        {/* Meta tags */}
        <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.2, sm: 1.5 }, flexWrap: "wrap", gap: 0.8 }}>
          {[
            { icon: <FiberManualRecordIcon style={{ fontSize: 8 }} />,  label: "Atualizado agora" },
            { icon: <OndemandVideoIcon     style={{ fontSize: 12 }} />, label: `${records.length} vídeos` },
            { icon: <LiveHelpIcon          style={{ fontSize: 12 }} />, label: "Tutoriais oficiais" },
          ].map((tag, i) => (
            <MuiBox key={i} sx={{
              display: "inline-flex", alignItems: "center", gap: 0.6,
              px: 1.2, py: 0.4, borderRadius: "20px",
              backgroundColor: isDark ? muiAlpha(primary, 0.14) : muiAlpha("#fff", 0.15),
              border: `1px solid ${isDark ? muiAlpha(primary, 0.22) : muiAlpha("#fff", 0.22)}`,
              backdropFilter: "blur(8px)",
            }}>
              <MuiBox sx={{ color: isDark ? primary : "#fff", display: "flex" }}>{tag.icon}</MuiBox>
              <MuiTypography sx={{ fontSize: { xs: 10, sm: 11 }, fontWeight: 600, color: isDark ? muiAlpha("#fff", 0.8) : "#fff" }}>
                {tag.label}
              </MuiTypography>
            </MuiBox>
          ))}
        </Stack>
      </MuiBox>
    </MuiBox>
  );

  /* ── KPI Cards ── */
  const kpiCards = [
    {
      title: "Total de vídeos",
      value: records.length,
      hint: "Tutoriais disponíveis",
      color: primary,
      bg: alpha(primary, isDark ? 0.16 : 0.09),
      icon: <OndemandVideoIcon style={{ fontSize: 23 }} />,
    },
    {
      title: "Gratuitos",
      value: records.length,
      hint: "Acesso liberado",
      color: green,
      bg: alpha(green, isDark ? 0.16 : 0.09),
      icon: <PlayCircleFilledIcon style={{ fontSize: 23 }} />,
    },
    {
      title: "Categorias",
      value: [...new Set(records.map(r => r.title?.split(" ")[0]).filter(Boolean))].length || 0,
      hint: "Tópicos cobertos",
      color: blue,
      bg: alpha(blue, isDark ? 0.16 : 0.09),
      icon: <SearchIcon style={{ fontSize: 23 }} />,
    },
    {
      title: "Suporte",
      value: "24/7",
      hint: "Sempre disponível",
      color: "#8b5cf6",
      bg: alpha("#8b5cf6", isDark ? 0.16 : 0.09),
      icon: <LiveHelpIcon style={{ fontSize: 23 }} />,
    },
  ];

  /* ── Modal ── */
  const renderVideoModal = () => (
    <Modal open={Boolean(selectedVideo)} onClose={closeVideoModal} className={classes.videoModal}>
      <div className={classes.videoModalContent}>
        {selectedVideo && (
          <iframe
            style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
            src={`https://www.youtube.com/embed/${selectedVideo}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </Modal>
  );

  return (
    <div className={`hlp-root ${classes.pageRoot}`}>
        <FontStyle />

        {/* ══ CABEÇALHO ══ */}
        <HeroHeader />

        {/* ══ CONTEÚDO ══ */}
        <Box className={classes.contentArea}>

          {/* ── KPI Cards ── */}
          <Box style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginBottom: 16,
          }}
            sx={{
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
            }}
          >
            {kpiCards.map((card, i) => (
              <Paper
                key={i}
                elevation={0}
                className={`hlp-animate kpi-card-hlp ${classes.kpiCard}`}
                style={{
                  "--kpi-color": card.color,
                  animationDelay: `${i * 60}ms`,
                  borderColor: border,
                }}
              >
                <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Typography className={classes.kpiTitle}>{card.title}</Typography>
                    <Typography
                      className={`mono ${classes.kpiValue}`}
                      style={{
                        fontSize: typeof card.value === "string" ? 24 : 32,
                      }}
                    >
                      {typeof card.value === "number" ? card.value.toLocaleString("pt-BR") : card.value}
                    </Typography>
                  </Box>
                  <Box
                    className="kpi-icon-box-hlp"
                    style={{
                      width: 48, height: 48, borderRadius: 12,
                      backgroundColor: card.bg, color: card.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      border: `1.5px solid ${alpha(card.color, isDark ? 0.22 : 0.14)}`,
                      boxShadow: `0 2px 10px ${alpha(card.color, isDark ? 0.18 : 0.10)}`,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
                <Box style={{ display: "flex", alignItems: "center", marginTop: 6 }}>
                  <Box className={classes.kpiDot} style={{ backgroundColor: card.color }} />
                  <Typography className={classes.kpiHint}>{card.hint}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>

          {/* ── Painel de vídeos ── */}
          <Paper
            className={`hlp-animate ${classes.mainPaper}`}
            variant="outlined"
            style={{ animationDelay: "240ms" }}
          >
            <Box style={{
              padding: "14px 18px 10px",
              borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.055)" : "#e8eef4"}`,
              backgroundColor: isDark ? alpha("#000", 0.15) : alpha(primary, 0.015),
            }}>
              <Typography className={classes.sectionLabel}>Central de ajuda</Typography>
              <Typography className={classes.sectionTitle}>
                {i18n.t("helps.title")} ({records.length})
              </Typography>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                <CircularProgress style={{ color: primary }} />
              </Box>
            ) : records.length === 0 ? (
              <Box className={classes.emptyState}>
                <OndemandVideoIcon style={{ fontSize: 52, marginBottom: 12, opacity: 0.3 }} />
                <Typography style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                  Nenhum tutorial disponível
                </Typography>
                <Typography style={{ fontSize: "0.8rem", marginTop: 4, opacity: 0.6 }}>
                  Os vídeos de ajuda aparecerão aqui quando forem adicionados.
                </Typography>
              </Box>
            ) : (
              <div className={classes.cardsGrid}>
                {records.map((record, key) => (
                  <Paper
                    key={key}
                    elevation={0}
                    className={`hlp-animate hlp-card ${classes.helpCard}`}
                    style={{ animationDelay: `${key * 40}ms` }}
                    onClick={() => openVideoModal(record.video)}
                  >
                    {/* Thumbnail */}
                    <div className={classes.thumbnailWrapper}>
                      <img
                        src={`https://img.youtube.com/vi/${record.video}/mqdefault.jpg`}
                        alt={record.title}
                        className={classes.thumbnail}
                      />
                      <div className="hlp-play-overlay">
                        <PlayCircleFilledIcon className="hlp-play-icon" />
                      </div>
                    </div>

                    {/* Body */}
                    <div className={classes.cardBody}>
                      <Typography className={classes.videoTitle}>{record.title}</Typography>
                      <Typography className={classes.videoDescription}>{record.description}</Typography>
                      <span className={classes.watchBadge}>
                        <PlayCircleFilledIcon style={{ fontSize: 13 }} />
                        Assistir tutorial
                      </span>
                    </div>
                  </Paper>
                ))}
              </div>
            )}
          </Paper>

        </Box>

        {renderVideoModal()}
      </div>
  );
};

export default Helps;
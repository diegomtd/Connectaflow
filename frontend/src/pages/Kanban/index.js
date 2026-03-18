/**
 * Kanban — Visual 100% fiel ao Dashboard
 * - usePalette idêntico (dark/light, whitelabel)
 * - FontStyle DM Sans + JetBrains Mono
 * - Cabeçalho corporativo com gradiente, breadcrumb e meta-tags
 * - Modal de filtros no estilo Dashboard/Reports
 * - SubPaper / SectionLabel / FieldLabel / inputSx idênticos
 * - Lógica original 100% preservada (fetchTags, fetchTickets, popularCards,
 *   handleCardMove, handleSearchClick, socket, handleAddConnectionClick)
 * - Cards (laneBaseStyle + cardBaseStyle + tagLaneStyle) INTOCADOS
 */

import React, { useState, useEffect, useContext, useMemo } from "react";
import { useTheme } from "@material-ui/core/styles";           // v4 — usado pelos cards
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";
import { useTheme as useMuiThemeV4 } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from "react-trello";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from "react-router-dom";
import { format } from "date-fns";
import { Can } from "../../components/Can";

/* MUI v5 */
import {
  Box, Button, Dialog, DialogContent, DialogTitle,
  IconButton, Paper, Stack, TextField, Typography, alpha,
  useMediaQuery,
} from "@mui/material";
import {
  Close, FiberManualRecord, FilterAlt, FlashOn,
  Insights, TableChart, TuneRounded, ViewKanban,
} from "@mui/icons-material";

/* ─── Estilos globais (idênticos ao Dashboard) ───────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .kb-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .kb-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .kb-root { max-width: 100%; }

    @keyframes kbFadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: none; }
    }
    /* kb-animate NUNCA deve ser aplicado ao container do Board —
       qualquer transform em ancestral do react-dnd quebra getBoundingClientRect() */
    .kb-animate { animation: kbFadeSlideUp 0.36s ease both; }

    /* Scrollbar fina */
    .kb-root ::-webkit-scrollbar { width: 4px; height: 6px; }
    .kb-root ::-webkit-scrollbar-track { background: transparent; }
    .kb-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  `}</style>
);

/* ─── usePalette (idêntico ao Dashboard) ─────────────────────────────────── */
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
      laneBg:      "linear-gradient(180deg,#0d1b2e 0%,#0a1520 100%)",
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
      laneBg:      "linear-gradient(180deg,#f8fbff 0%,#f3f7ff 100%)",
    };

    return {
      primary, isDark, ...t,
      chipBg:    alpha(primary, isDark ? 0.18 : 0.10),
      chipColor: primary,
      success, warning, danger, purple, teal,
    };
  }, [primary, isDark]);
};

/* ─── SubPaper ────────────────────────────────────────────────────────────── */
const SubPaper = ({ children, sx = {}, p, className = "" }) => (
  <Paper elevation={0} className={className} sx={{
    borderRadius: "14px",
    border: `1px solid ${p.border}`,
    backgroundColor: p.surfaceBg,
    ...sx,
  }}>
    {children}
  </Paper>
);

/* ─── SectionLabel ────────────────────────────────────────────────────────── */
const SectionLabel = ({ children, p }) => (
  <Typography sx={{
    fontSize: { xs: 9.5, sm: 11 }, color: p.textMuted, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.09em",
    fontFamily: "'DM Sans', sans-serif",
  }}>
    {children}
  </Typography>
);

/* ─── FieldLabel ──────────────────────────────────────────────────────────── */
const FieldLabel = ({ children, p }) => (
  <Typography sx={{
    fontSize: 12, fontWeight: 600, color: p.textMuted,
    textTransform: "uppercase", letterSpacing: "0.06em",
    mb: 0.7, fontFamily: "'DM Sans', sans-serif",
  }}>
    {children}
  </Typography>
);

/* ─── inputSx ─────────────────────────────────────────────────────────────── */
const inputSx = (p) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    backgroundColor: p.inputBg,
    "& fieldset": { borderColor: p.inputBorder },
    "&:hover fieldset": { borderColor: p.isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8" },
    "&.Mui-focused fieldset": { borderColor: p.primary, borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": { display: "none" },
  "& .MuiInputLabel-outlined": { display: "none" },
});

/* ══════════════════════════════════════════════════════════════════════════ */
/* ─── Kanban ──────────────────────────────────────────────────────────────── */
/* ══════════════════════════════════════════════════════════════════════════ */
const Kanban = () => {
  const p        = usePalette();
  const theme    = useTheme();                // v4 — usado nos cardBaseStyle/laneBaseStyle
  const themeV5  = useMuiThemeV5();
  const isMobile = useMediaQuery(themeV5.breakpoints.down("sm"));
  const history  = useHistory();
  const { user, socket } = useContext(AuthContext);

  /* ── Estado original ── */
  const [tags,      setTags]      = useState([]);
  const [tickets,   setTickets]   = useState([]);
  const [file,      setFile]      = useState({ lanes: [] });
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate,   setEndDate]   = useState(format(new Date(), "yyyy-MM-dd"));

  /* ── Estado do modal de filtros ── */
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(startDate);
  const [draftEnd,   setDraftEnd]   = useState(endDate);

  const queueIds = user.queues.map((queue) => queue.UserQueue.queueId);

  /* ── Lógica original 100% preservada ── */
  useEffect(() => {
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchTags = async () => {
    try {
      const response = await api.get("/tag/kanban/");
      const fetchedTags = response.data.lista || [];
      setTags(fetchedTags);
      fetchTickets();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(queueIds),
          startDate,
          endDate,
        },
      });
      setTickets(data.tickets);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };

  useEffect(() => {
    const companyId = user.companyId;
    const onAppMessage = (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "delete") {
        fetchTickets();
      }
    };
    socket.on(`company-${companyId}-ticket`, onAppMessage);
    socket.on(`company-${companyId}-appMessage`, onAppMessage);
    return () => {
      socket.off(`company-${companyId}-ticket`, onAppMessage);
      socket.off(`company-${companyId}-appMessage`, onAppMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, startDate, endDate]);

  const handleSearchClick = () => {
    fetchTickets();
  };

  /* ── popularCards — laneBaseStyle, cardBaseStyle e tagLaneStyle INTOCADOS ── */
  const popularCards = () => {
    const filteredTickets = tickets.filter((ticket) => ticket.tags.length === 0);

    const laneBaseStyle = {
      borderRadius: 14,
      border: `1px solid ${theme.palette.divider}`,
      background:
        theme.mode === "light"
          ? "linear-gradient(180deg, #f8fbff 0%, #f3f7ff 100%)"
          : "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
      color: theme.palette.text.primary,
    };

    const cardBaseStyle = {
      borderRadius: 12,
      border: `1px solid ${theme.palette.divider}`,
      backgroundColor:
        theme.mode === "light" ? "rgba(255,255,255,0.96)" : "#ffffff",
      color: theme.mode === "light" ? theme.palette.text.primary : "#0f172a",
      boxShadow:
        theme.mode === "light"
          ? "0 10px 20px rgba(15, 23, 42, 0.08)"
          : "0 10px 20px rgba(2, 6, 23, 0.45)",
    };

    const tagLaneStyle = (tagColor) => ({
      ...laneBaseStyle,
      background: tagColor,
      backgroundColor: tagColor,
      color: "#ffffff",
      borderTop: "none",
      border: "1px solid rgba(255,255,255,0.22)",
      boxShadow:
        theme.mode === "light"
          ? "0 10px 24px rgba(15, 23, 42, 0.08)"
          : "0 10px 24px rgba(2, 6, 23, 0.45)",
    });

    const lanes = [
      {
        id: "lane0",
        title: i18n.t("tagsKanban.laneDefault"),
        label: filteredTickets.length.toString(),
        style: laneBaseStyle,
        cards: filteredTickets.map((ticket) => ({
          id: ticket.id.toString(),
          label: `Ticket nº ${ticket.id}`,
          description: `${ticket.contact?.number || ""} | ${ticket.lastMessage || ""}`,
          title: ticket.contact?.name || "",
          draggable: true,
          href: `/tickets/${ticket.uuid}`,
          style: cardBaseStyle,
        })),
      },
      ...tags.map((tag) => {
        const taggedTickets = tickets.filter((ticket) => {
          const tagIds = ticket.tags.map((item) => item.id);
          return tagIds.includes(tag.id);
        });
        return {
          id: tag.id.toString(),
          title: tag.name,
          label: taggedTickets.length.toString(),
          cards: taggedTickets.map((ticket) => ({
            id: ticket.id.toString(),
            label: `Ticket nº ${ticket.id}`,
            description: `${ticket.contact?.number || ""} | ${ticket.lastMessage || ""}`,
            title: ticket.contact?.name || "",
            draggable: true,
            href: `/tickets/${ticket.uuid}`,
            style: cardBaseStyle,
          })),
          style: tagLaneStyle(tag.color),
        };
      }),
    ];

    setFile({ lanes });
  };

  useEffect(() => {
    popularCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tags, tickets, theme.mode]);

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
      await api.delete(`/ticket-tags/${targetLaneId}`);
      toast.success("Ticket Tag Removido!");
      await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);
      toast.success("Ticket Tag Adicionado com Sucesso!");
      await fetchTickets();
      popularCards();
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddConnectionClick = () => {
    history.push("/tagsKanban");
  };

  const ticketsWithoutLane = tickets.filter((ticket) => ticket.tags.length === 0).length;

  /* ── Modal helpers ── */
  const handleOpenFilter = () => {
    setDraftStart(startDate);
    setDraftEnd(endDate);
    setFilterOpen(true);
  };

  const handleApplyFilter = () => {
    setStartDate(draftStart);
    setEndDate(draftEnd);
    setFilterOpen(false);
    setTimeout(() => fetchTickets(), 0);
  };

  const fmtDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");

  const periodLabel = isMobile
    ? `${fmtDate(startDate)}–${fmtDate(endDate)}`
    : `Período: ${fmtDate(startDate)} – ${fmtDate(endDate)}`;

  /* ════════════════════════════════════════════════════════════════════════ */
  return (
    <Box
      className="kb-root"
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

      {/* ══ MODAL DE FILTROS ════════════════════════════════════════════════ */}
      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: "18px",
            border: `1px solid ${p.border}`,
            backgroundColor: p.surfaceBg,
            backgroundImage: "none",
          },
        }}
        BackdropProps={{
          sx: { backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.35)" },
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Stack
            direction="row" justifyContent="space-between" alignItems="center"
            sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${p.divider}` }}
          >
            <Box>
              <Typography sx={{
                fontSize: 10, fontWeight: 700, color: p.textMuted,
                textTransform: "uppercase", letterSpacing: "0.09em",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Período do Kanban
              </Typography>
              <Typography sx={{
                fontSize: 16, fontWeight: 700, color: p.textPrimary,
                mt: 0.2, fontFamily: "'DM Sans', sans-serif",
              }}>
                Filtrar Tickets
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setFilterOpen(false)}
              sx={{
                borderRadius: "10px", p: 0.7,
                border: `1px solid ${p.border}`,
                backgroundColor: p.inputBg,
                color: p.textMuted,
                transition: "all 0.16s",
                "&:hover": {
                  borderColor: alpha("#ef4444", 0.45),
                  color: "#ef4444",
                  backgroundColor: alpha("#ef4444", p.isDark ? 0.1 : 0.05),
                },
              }}
            >
              <Close sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Stack spacing={2.5}>
            <Box>
              <FieldLabel p={p}>Data de Início</FieldLabel>
              <TextField
                type="date" value={draftStart} fullWidth size="small"
                onChange={(e) => setDraftStart(e.target.value)}
                InputLabelProps={{ shrink: false, sx: { display: "none" } }}
                sx={inputSx(p)}
              />
            </Box>
            <Box>
              <FieldLabel p={p}>Data de Fim</FieldLabel>
              <TextField
                type="date" value={draftEnd} fullWidth size="small"
                onChange={(e) => setDraftEnd(e.target.value)}
                InputLabelProps={{ shrink: false, sx: { display: "none" } }}
                sx={inputSx(p)}
              />
            </Box>

            <Box sx={{ height: "1px", backgroundColor: p.divider }} />

            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button
                variant="outlined" size="small"
                onClick={() => setFilterOpen(false)}
                sx={{
                  borderRadius: "10px", textTransform: "none", fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                  borderColor: p.border, color: p.textMuted,
                  "&:hover": { borderColor: p.textMuted, backgroundColor: alpha(p.textMuted, 0.06) },
                }}
              >
                Fechar
              </Button>
              <Button
                variant="contained" disableElevation
                onClick={handleApplyFilter}
                startIcon={<FilterAlt sx={{ fontSize: 15 }} />}
                sx={{
                  position: "relative", overflow: "hidden",
                  backgroundColor: p.primary, color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700, fontSize: 13, textTransform: "none",
                  borderRadius: "10px", height: 38, px: 2.2,
                  boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 3px 12px ${alpha(p.primary, 0.30)}`,
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
                Aplicar e fechar
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* ══ CABEÇALHO CORPORATIVO ═══════════════════════════════════════════ */}
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
                fontSize: { xs: 10, sm: 11 }, fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: p.isDark ? alpha(p.primary, 0.8) : alpha("#fff", 0.7),
              }}>
                Painel
              </Typography>
              <Box sx={{
                width: 3, height: 3, borderRadius: "50%",
                backgroundColor: p.isDark ? alpha(p.primary, 0.5) : alpha("#fff", 0.45),
              }} />
              <Typography sx={{
                fontSize: { xs: 10, sm: 11 }, fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: p.isDark ? alpha("#fff", 0.5) : alpha("#fff", 0.55),
              }}>
                Kanban
              </Typography>
            </Stack>

            <Typography sx={{
              fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
              letterSpacing: "-0.025em", lineHeight: 1,
              color: p.isDark ? p.textPrimary : "#ffffff",
            }}>
              {i18n.t("kanban.title")}
            </Typography>

            <Typography sx={{
              fontSize: { xs: 12, sm: 13.5 }, mt: 0.6,
              color: p.isDark ? p.textMuted : alpha("#fff", 0.72),
              display: { xs: "none", sm: "block" },
            }}>
              Gerencie tickets por estágio com visão operacional completa em tempo real.
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.2, sm: 1.5 }, flexWrap: "wrap", gap: 0.8 }}>
              {[
                { icon: <FiberManualRecord sx={{ fontSize: 8 }} />,  label: "Tempo real" },
                { icon: <Insights         sx={{ fontSize: 12 }} />,  label: periodLabel },
                { icon: <ViewKanban       sx={{ fontSize: 12 }} />,  label: `${tickets.length} tickets` },
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
        flex: 1, display: "flex", flexDirection: "column",
        gap: { xs: 1, sm: 1.5 },
      }}>

        {/* ── Barra de controles ── */}
        <SubPaper p={p} className="kb-animate" sx={{ p: { xs: "12px 14px", sm: "13px 18px" } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.2}
          >
            {/* Esquerdo: counters */}
            <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
              <SectionLabel p={p}>Visão geral</SectionLabel>

              <Box sx={{
                display: "inline-flex", alignItems: "center", gap: 0.6,
                px: 1.2, py: 0.45, borderRadius: "8px",
                backgroundColor: p.chipBg,
                border: `1px solid ${alpha(p.primary, p.isDark ? 0.25 : 0.16)}`,
              }}>
                <FlashOn sx={{ fontSize: 12, color: p.primary }} />
                <Typography sx={{ fontSize: 11.5, color: p.chipColor, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                  {tickets.length} tickets no período
                </Typography>
              </Box>

              <Box sx={{
                display: "inline-flex", alignItems: "center", gap: 0.6,
                px: 1.2, py: 0.45, borderRadius: "8px",
                backgroundColor: p.isDark ? alpha("#fff", 0.04) : alpha("#000", 0.03),
                border: `1px solid ${p.border}`,
              }}>
                <TableChart sx={{ fontSize: 12, color: p.textMuted }} />
                <Typography sx={{ fontSize: 11.5, color: p.textMuted, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                  {`Lanes ativas: ${tags.length + 1} | Sem lane: ${ticketsWithoutLane}`}
                </Typography>
              </Box>
            </Stack>

            {/* Direito: botões */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
              <Button
                onClick={handleOpenFilter}
                startIcon={<TuneRounded sx={{ fontSize: 15 }} />}
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: "9px", textTransform: "none",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 12.5,
                  height: 34, px: 1.5,
                  borderColor: p.border, color: p.textSecond, backgroundColor: p.inputBg,
                  transition: "all 0.18s",
                  "&:hover": {
                    borderColor: alpha(p.primary, 0.45),
                    color: p.primary,
                    backgroundColor: alpha(p.primary, p.isDark ? 0.1 : 0.05),
                  },
                }}
              >
                Filtros
                <Box component="span" sx={{
                  ml: 0.8, px: 0.8, py: 0.15, borderRadius: "5px",
                  backgroundColor: alpha(p.primary, p.isDark ? 0.18 : 0.10),
                  color: p.primary, fontSize: 10.5, fontWeight: 700,
                  display: { xs: "none", md: "inline" },
                }}>
                  {fmtDate(startDate)} – {fmtDate(endDate)}
                </Box>
              </Button>

              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleAddConnectionClick}
                    sx={{
                      borderRadius: "9px", textTransform: "none",
                      fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 12.5,
                      height: 34, px: 1.5,
                      borderColor: p.border, color: p.textSecond, backgroundColor: p.inputBg,
                      transition: "all 0.18s",
                      "&:hover": {
                        borderColor: alpha(p.primary, 0.45),
                        color: p.primary,
                        backgroundColor: alpha(p.primary, p.isDark ? 0.1 : 0.05),
                      },
                    }}
                  >
                    + Adicionar colunas
                  </Button>
                )}
              />
            </Stack>
          </Stack>
        </SubPaper>

        {/* ── Board ──
            IMPORTANTE: não usar Paper/SubPaper aqui.
            O MUI Paper aplica position:relative, tornando-se o "containing block"
            do react-dnd. Isso faz o card fantasma ser posicionado relativo ao Paper
            em vez de relativo à viewport, causando o offset para baixo durante o drag.
            Usamos Box puro (position:static por padrão) com os mesmos tokens visuais. */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            borderRadius: "14px",
            border: `1px solid ${p.border}`,
            backgroundColor: p.surfaceBg,
            p: { xs: "10px", sm: "14px" },
            /* Overrides do react-trello */
            "& .react-trello-board": {
              backgroundColor: "transparent !important",
            },
            "& section": {
              background: `${p.laneBg} !important`,
              border: `1px solid ${p.border} !important`,
              borderRadius: "14px !important",
              color: `${p.textSecond} !important`,
              boxShadow: `0 4px 14px ${alpha("#000", p.isDark ? 0.22 : 0.06)} !important`,
              margin: "0 6px !important",
            },
            "& [data-id='CardTitle'], & .react-trello-card-title": {
              fontWeight: "700 !important",
              fontSize: "0.88rem !important",
              fontFamily: "'DM Sans', sans-serif !important",
            },
            "& [data-id='CardDescription'], & .react-trello-card-description": {
              fontSize: "0.78rem !important",
              opacity: "0.88 !important",
              fontFamily: "'DM Sans', sans-serif !important",
            },
            "& [data-id='lane-title'], & .react-trello-lane-header": {
              fontWeight: "700 !important",
              letterSpacing: "0.2px !important",
              fontFamily: "'DM Sans', sans-serif !important",
            },
          }}
        >
          <Box
            sx={{
              width: "100%",
              overflowX: "auto",
              "&::-webkit-scrollbar": { height: 5 },
              "&::-webkit-scrollbar-track": { background: "transparent", borderRadius: 3 },
              "&::-webkit-scrollbar-thumb": { background: alpha(p.primary, 0.2), borderRadius: 3 },
            }}
          >
            <Board
              data={file}
              onCardMoveAcrossLanes={handleCardMove}
              style={{ backgroundColor: "transparent" }}
            />
          </Box>
        </Box>

      </Box>
    </Box>
  );
};

export default Kanban;
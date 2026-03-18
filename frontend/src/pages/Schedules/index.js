/**
 * Schedules — Visual 100% fiel ao Dashboard
 * - usePalette idêntico (dark/light, whitelabel)
 * - FontStyle DM Sans + JetBrains Mono
 * - Cabeçalho corporativo com gradiente, breadcrumb e meta-tags
 * - SubPaper / SectionLabel / inputSx idênticos
 * - Calendar estilizado com tokens reativos do design system
 * - Toda a lógica original 100% preservada
 */

import React, {
  useState, useEffect, useReducer, useCallback, useContext, useMemo,
} from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import {
  Box, Button, Grid, InputAdornment, Paper, Stack, TextField, Typography, alpha,
} from "@mui/material";
import {
  Add, CalendarMonth, DeleteOutline, Edit,
  EventNote, FiberManualRecord, Search, WatchLater,
} from "@mui/icons-material";
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";
import { useTheme as useMuiThemeV4 } from "@material-ui/core/styles";

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";

import api              from "../../services/api";
import { i18n }         from "../../translate/i18n";
import ScheduleModal    from "../../components/ScheduleModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError       from "../../errors/toastError";
import { AuthContext }  from "../../context/Auth/AuthContext";
import usePlans         from "../../hooks/usePlans";

import "./Schedules.css";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getUrlParam(paramName) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(paramName);
}

const localizer = momentLocalizer(moment);

const defaultMessages = {
  date: "Data", time: "Hora", event: "Evento", allDay: "Dia Todo",
  week: "Semana", work_week: "Agendamentos", day: "Dia", month: "Mês",
  previous: "Anterior", next: "Próximo", yesterday: "Ontem",
  tomorrow: "Amanhã", today: "Hoje", agenda: "Agenda",
  noEventsInRange: "Não há agendamentos no período.",
  showMore: (total) => `+${total} mais`,
};

// ─── Reducer (original intocado) ─────────────────────────────────────────────

const reducer = (state, action) => {
  if (action.type === "LOAD_SCHEDULES") {
    const newSchedules = [];
    action.payload.forEach((schedule) => {
      const idx = state.findIndex((s) => s.id === schedule.id);
      if (idx !== -1) state[idx] = schedule;
      else newSchedules.push(schedule);
    });
    return [...state, ...newSchedules];
  }
  if (action.type === "UPDATE_SCHEDULES") {
    const schedule = action.payload;
    const idx = state.findIndex((s) => s.id === schedule.id);
    if (idx !== -1) { state[idx] = schedule; return [...state]; }
    return [schedule, ...state];
  }
  if (action.type === "DELETE_SCHEDULE") {
    const idx = state.findIndex((s) => s.id === action.payload);
    if (idx !== -1) state.splice(idx, 1);
    return [...state];
  }
  if (action.type === "RESET") return [];
};

// ─── FontStyle ────────────────────────────────────────────────────────────────

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .sc-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .sc-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .sc-root { max-width: 100%; overflow-x: hidden; }

    @keyframes scFadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: none; }
    }
    .sc-animate { animation: scFadeSlideUp 0.36s ease both; }

    /* Scrollbar fina */
    .sc-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .sc-root ::-webkit-scrollbar-track { background: transparent; }
    .sc-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  `}</style>
);

// ─── usePalette (idêntico ao Dashboard) ──────────────────────────────────────

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

    const t = isDark ? {
      pageBg:      "#080e1a",
      surfaceBg:   "#0f1929",
      surfaceBg2:  "#141f30",
      border:      "rgba(255,255,255,0.065)",
      divider:     "rgba(255,255,255,0.055)",
      textPrimary: "#f0f4f8",
      textSecond:  "#8fa4be",
      textMuted:   "#4d6478",
      barTrack:    "rgba(255,255,255,0.06)",
      hoverRow:    "rgba(255,255,255,0.03)",
      tagBg:       "rgba(255,255,255,0.07)",
      avatarBg:    "rgba(255,255,255,0.08)",
      inputBg:     "rgba(255,255,255,0.04)",
      inputBorder: "rgba(255,255,255,0.12)",
    } : {
      pageBg:      "#f0f4f8",
      surfaceBg:   "#ffffff",
      surfaceBg2:  "#fafbfd",
      border:      "#e3eaf2",
      divider:     "#e8eef4",
      textPrimary: "#0d1b2a",
      textSecond:  "#3d5166",
      textMuted:   "#8fa0b0",
      barTrack:    "#e8eef5",
      hoverRow:    "#f5f8fc",
      tagBg:       "rgba(0,0,0,0.045)",
      avatarBg:    "#eef2f8",
      inputBg:     "rgba(0,0,0,0.018)",
      inputBorder: "#dbe4ed",
    };

    return {
      primary, isDark, ...t, success, warning, danger,
      chipBg:    alpha(primary, isDark ? 0.18 : 0.10),
      chipColor: primary,
    };
  }, [primary, isDark]);
};

// ─── SubPaper ─────────────────────────────────────────────────────────────────

const SubPaper = ({ children, sx = {}, p, onScroll }) => (
  <Paper elevation={0} onScroll={onScroll} sx={{
    borderRadius: "14px",
    border: `1px solid ${p.border}`,
    backgroundColor: p.surfaceBg,
    ...sx,
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

// ─── inputSx — altura fixa 40px, texto centralizado, ícone primário no dark ──

const mkInputSx = (p) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: 12.5,
    backgroundColor: p.inputBg,
    overflow: "hidden",
    height: 40,
    "& input": {
      padding: "0 8px",
      height: "100%",
      boxSizing: "border-box",
      fontSize: 12.5,
      lineHeight: "40px",
      color: p.isDark ? "#ffffff" : undefined,
    },
    "& fieldset": { borderColor: p.inputBorder },
    "&:hover fieldset": { borderColor: p.isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8" },
    "&.Mui-focused fieldset": { borderColor: p.primary, borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": {
    fontSize: 12.5,
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

// ─── Schedules ───────────────────────────────────────────────────────────────

const Schedules = () => {
  const p       = usePalette();
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);

  /* ── Estado original 100% preservado ── */
  const [loading,           setLoading]           = useState(false);
  const [pageNumber,        setPageNumber]        = useState(1);
  const [hasMore,           setHasMore]           = useState(false);
  const [selectedSchedule,  setSelectedSchedule]  = useState(null);
  const [deletingSchedule,  setDeletingSchedule]  = useState(null);
  const [confirmModalOpen,  setConfirmModalOpen]  = useState(false);
  const [searchParam,       setSearchParam]       = useState("");
  const [schedules,         dispatch]             = useReducer(reducer, []);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [contactId,         setContactId]         = useState(+getUrlParam("contactId"));

  const { getPlanCompany } = usePlans();

  /* ── Handlers originais 100% preservados ── */
  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useSchedules) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => history.push("/"), 1000);
      }
    }
    fetchData();
  }, [user, history, getPlanCompany]);

  const fetchSchedules = useCallback(async () => {
    try {
      const { data } = await api.get("/schedules", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_SCHEDULES", payload: data.schedules });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delay = setTimeout(() => { fetchSchedules(); }, 500);
    return () => clearTimeout(delay);
  }, [searchParam, pageNumber, contactId, fetchSchedules]);

  useEffect(() => {
    const onCompanySchedule = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_SCHEDULES", payload: data.schedule });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_SCHEDULE", payload: +data.scheduleId });
      }
    };
    socket.on(`company${user.companyId}-schedule`, onCompanySchedule);
    return () => socket.off(`company${user.companyId}-schedule`, onCompanySchedule);
  }, [socket, user.companyId]);

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await api.delete(`/schedules/${scheduleId}`);
      toast.success(i18n.t("schedules.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingSchedule(null);
    setSearchParam("");
    setPageNumber(1);
    dispatch({ type: "RESET" });
    await fetchSchedules();
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const calendarEvents = schedules.map((schedule) => ({
    id: schedule.id,
    title: schedule?.contact?.name || "Agendamento",
    start: new Date(schedule.sendAt),
    end:   new Date(schedule.sendAt),
    resource: schedule,
  }));

  /* ── Evento customizado do calendário ── */
  const EventComponent = ({ event }) => (
    <Box sx={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 0.5, px: 0.5, width: "100%",
    }}>
      <Typography sx={{
        fontSize: 11, fontWeight: 600, color: "#fff",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
      }}>
        {event.title}
      </Typography>
      <Stack direction="row" spacing={0.3} sx={{ flexShrink: 0 }}>
        <Edit
          sx={{ fontSize: 13, color: "rgba(255,255,255,0.85)", cursor: "pointer", "&:hover": { color: "#fff" } }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSchedule(event.resource);
            setScheduleModalOpen(true);
          }}
        />
        <DeleteOutline
          sx={{ fontSize: 13, color: "rgba(255,255,255,0.85)", cursor: "pointer", "&:hover": { color: "#fca5a5" } }}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteSchedule(event.id);
          }}
        />
      </Stack>
    </Box>
  );

  /* ── Estilos do calendário reativos ao tema ── */
  const calendarSx = {
    "& .rbc-toolbar": {
      mb: 1.2, gap: "10px", flexWrap: "wrap",
      p: "12px 16px", borderRadius: "10px",
      border: `1px solid ${p.border}`,
      backgroundColor: p.isDark ? p.surfaceBg2 : p.surfaceBg2,
      alignItems: "center",
    },
    "& .rbc-toolbar-label": {
      fontWeight: 700, fontSize: "0.95rem",
      color: p.textPrimary, letterSpacing: 0.2,
    },
    "& .rbc-btn-group": {
      display: "flex !important",
      gap: "6px !important",
    },
    "& .rbc-btn-group button": {
      borderRadius: "8px !important",
      border: `1px solid ${p.border} !important`,
      backgroundColor: `${p.surfaceBg} !important`,
      color: `${p.textSecond} !important`,
      fontWeight: "600 !important", fontSize: "12px !important",
      padding: "5px 13px !important",
      transition: "all 0.15s ease",
      margin: "0 !important",
    },
    "& .rbc-btn-group button:hover": {
      backgroundColor: `${alpha(p.primary, p.isDark ? 0.14 : 0.07)} !important`,
      borderColor: `${alpha(p.primary, 0.40)} !important`,
      color: `${p.primary} !important`,
    },
    "& .rbc-btn-group button.rbc-active": {
      backgroundColor: `${p.primary} !important`,
      borderColor: `${p.primary} !important`,
      color: "#fff !important",
      boxShadow: `0 4px 12px ${alpha(p.primary, 0.30)} !important`,
    },
    "& .rbc-month-view, & .rbc-time-view, & .rbc-agenda-view": {
      borderRadius: "10px", overflow: "hidden",
      border: `1px solid ${p.border} !important`,
    },
    "& .rbc-header": {
      py: 0.8,
      fontWeight: "700 !important", fontSize: "0.72rem !important",
      letterSpacing: "0.05em", textTransform: "uppercase",
      color: `${p.textMuted} !important`,
      backgroundColor: `${p.surfaceBg2 || p.surfaceBg} !important`,
      borderBottom: `1px solid ${p.divider} !important`,
    },
    "& .rbc-month-view": {
      backgroundColor: `${p.surfaceBg} !important`,
    },
    "& .rbc-today": {
      backgroundColor: `${alpha(p.primary, p.isDark ? 0.12 : 0.06)} !important`,
    },
    "& .rbc-off-range-bg": {
      backgroundColor: `${p.isDark ? "rgba(255,255,255,0.02)" : "rgba(248,250,252,0.7)"} !important`,
    },
    "& .rbc-month-row + .rbc-month-row": {
      borderTop: `1px solid ${p.divider} !important`,
    },
    "& .rbc-day-bg + .rbc-day-bg": {
      borderLeft: `1px solid ${p.divider} !important`,
    },
    "& .rbc-day-bg": {
      backgroundColor: `${p.surfaceBg} !important`,
    },
    "& .rbc-date-cell button": {
      fontWeight: "600 !important",
      color: `${p.textSecond} !important`,
      fontSize: "12px !important",
    },
    "& .rbc-event": {
      border: "none !important",
      borderRadius: "8px !important",
      background: `linear-gradient(135deg, ${p.primary} 0%, ${alpha(p.primary, 0.80)} 100%) !important`,
      boxShadow: `0 4px 10px ${alpha(p.primary, 0.30)} !important`,
      padding: "2px 5px !important",
    },
    "& .rbc-event:focus": { outline: "none !important" },
    "& .rbc-event.rbc-selected": {
      background: `linear-gradient(135deg, ${alpha(p.primary, 0.88)} 0%, ${alpha(p.primary, 0.70)} 100%) !important`,
    },
    "& .rbc-show-more": {
      color: `${p.primary} !important`,
      fontWeight: "700 !important", fontSize: "11px !important",
    },
    "& .rbc-agenda-date-cell, & .rbc-agenda-time-cell": {
      fontSize: "12px !important", color: `${p.textSecond} !important`,
      backgroundColor: `${p.surfaceBg} !important`,
      borderBottom: `1px solid ${p.divider} !important`,
    },
    "& .rbc-agenda-event-cell": {
      fontSize: "13px !important",
      backgroundColor: `${p.surfaceBg} !important`,
      borderBottom: `1px solid ${p.divider} !important`,
      color: `${p.textPrimary} !important`,
    },
    "& .rbc-agenda-table": {
      borderColor: `${p.divider} !important`,
    },
    "& .rbc-time-content, & .rbc-time-header": {
      borderColor: `${p.divider} !important`,
      backgroundColor: `${p.surfaceBg} !important`,
    },
    "& .rbc-timeslot-group": {
      borderColor: `${p.divider} !important`,
    },
    "& .rbc-time-slot": {
      color: `${p.textMuted} !important`,
      fontSize: "11px !important",
    },
    "& .rbc-calendar": {
      fontFamily: "'DM Sans', system-ui, sans-serif !important",
      fontSize: "13px !important",
      color: `${p.textSecond} !important`,
      backgroundColor: `${p.surfaceBg} !important`,
    },
    "& .rbc-row-bg .rbc-today ~ .rbc-day-bg": {
      backgroundColor: `${p.surfaceBg} !important`,
    },
  };

  /* ════════════════════════════════════════════════════════════════════════ */
  return (
    <Box
      className="sc-root"
      sx={{
        minHeight: "calc(100% - 48px)",
        backgroundColor: p.pageBg,
        transition: "background-color 0.3s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <FontStyle />

      {/* ── Modais (originais, intocados) ── */}
      <ConfirmationModal
        title={deletingSchedule && `${i18n.t("schedules.confirmationModal.deleteTitle")}`}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteSchedule(deletingSchedule.id)}
      >
        {i18n.t("schedules.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      {scheduleModalOpen && (
        <ScheduleModal
          open={scheduleModalOpen}
          onClose={() => { setSelectedSchedule(null); setScheduleModalOpen(false); }}
          reload={fetchSchedules}
          scheduleId={selectedSchedule ? selectedSchedule.id : null}
          contactId={contactId}
          cleanContact={() => setContactId("")}
        />
      )}

      {/* ══ CABEÇALHO CORPORATIVO ═══════════════════════════════════════════ */}
      <Box sx={{
        background: p.isDark
          ? `linear-gradient(135deg, #0d1b2e 0%, #0a1520 60%, ${alpha(p.primary, 0.12)} 100%)`
          : `linear-gradient(135deg, ${p.primary} 0%, ${alpha(p.primary, 0.82)} 55%, ${alpha("#0ea5e9", 0.9)} 100%)`,
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 2.5, sm: 3, md: 3.5 },
        pb: { xs: 2,   sm: 2.5, md: 3 },
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
              Agendamentos
            </Typography>
          </Stack>

          <Typography sx={{
            fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
            letterSpacing: "-0.025em", lineHeight: 1,
            color: p.isDark ? p.textPrimary : "#ffffff",
          }}>
            {i18n.t("schedules.title")}
          </Typography>

          <Typography sx={{
            fontSize: { xs: 12, sm: 13.5 }, mt: 0.6,
            color: p.isDark ? p.textMuted : alpha("#fff", 0.72),
            display: { xs: "none", sm: "block" },
          }}>
            Organize seus envios e compromissos com visão clara do calendário.
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.2, sm: 1.5 }, flexWrap: "wrap", gap: 0.8 }}>
            {[
              { icon: <FiberManualRecord sx={{ fontSize: 8 }} />, label: "Tempo real" },
              { icon: <EventNote sx={{ fontSize: 12 }} />,        label: `${schedules.length} agendamentos` },
              { icon: <WatchLater sx={{ fontSize: 12 }} />,       label: "Calendário mensal" },
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
      </Box>

      {/* ── Conteúdo ── */}
      <Box sx={{
        px: { xs: 1, sm: 1.5, md: 2.5 },
        py: { xs: 1.5, sm: 2, md: 2.5 },
        flex: 1, display: "flex", flexDirection: "column",
        gap: { xs: 1, sm: 1.5 },
      }}>

        {/* ── Busca + Botão ── */}
        <SubPaper p={p} className="sc-animate" sx={{ p: { xs: "12px 14px", sm: "14px 18px" } }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={8} md={9}>
              <TextField
                fullWidth
                placeholder={i18n.t("contacts.searchPlaceholder")}
                type="search"
                value={searchParam}
                onChange={(e) => setSearchParam(e.target.value.toLowerCase())}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={mkInputSx(p)}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Button
                fullWidth
                variant="contained"
                disableElevation
                startIcon={<Add />}
                onClick={() => { setSelectedSchedule(null); setScheduleModalOpen(true); }}
                sx={{
                  borderRadius: "9px",
                  height: 38,
                  fontWeight: 700,
                  fontSize: 13,
                  textTransform: "none",
                  backgroundColor: p.primary,
                  boxShadow: `0 2px 10px ${alpha(p.primary, 0.30)}`,
                  "&:hover": { backgroundColor: alpha(p.primary, 0.88) },
                }}
              >
                {i18n.t("schedules.buttons.add")}
              </Button>
            </Grid>
          </Grid>
        </SubPaper>

        {/* ── Calendário ── */}
        <SubPaper
          p={p}
          onScroll={handleScroll}
          sx={{
            flex: 1,
            overflow: "hidden",
            p: { xs: "14px", sm: "18px" },
            ...calendarSx,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: "9px",
              backgroundColor: alpha(p.primary, p.isDark ? 0.16 : 0.09),
              border: `1.5px solid ${alpha(p.primary, p.isDark ? 0.22 : 0.14)}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CalendarMonth sx={{ fontSize: 17, color: p.primary }} />
            </Box>
            <Box>
              <SectionLabel p={p}>Calendário de Agendamentos</SectionLabel>
              <Typography sx={{ fontSize: 11, color: p.textMuted, mt: 0.1 }}>
                {schedules.length} evento{schedules.length !== 1 ? "s" : ""} cadastrado{schedules.length !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Stack>

          <Calendar
            messages={defaultMessages}
            formats={{
              agendaDateFormat: "DD/MM ddd",
              weekdayFormat: "dddd",
            }}
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%", minHeight: 520 }}
            components={{ event: EventComponent }}
          />
        </SubPaper>
      </Box>
    </Box>
  );
};

export default Schedules;
/**
 * Reports — Visual 100% fiel ao Dashboard
 * Alterações aplicadas:
 * 1. "Apenas avaliados" movido para dentro do modal de filtros
 * 2. Botão "Download" só aparece após clicar em "Aplicar e fechar"
 * 3. Corrigido: alterar quantidade de tickets por página aplica imediatamente
 */

import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  Autocomplete, Box, Button, CircularProgress, Dialog,
  DialogContent, DialogTitle, FormControl,
  Grid, IconButton, InputLabel, MenuItem,
  Paper, Select, Stack, Switch, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Tooltip, Typography, alpha,
  useMediaQuery,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import { createFilterOptions } from "@mui/material/Autocomplete";
import {
  Facebook, Forward, History, Instagram, SaveAlt, WhatsApp,
  FilterAlt, FiberManualRecord, Insights, Close, TuneRounded,
  Tag, Wifi, Person, AccountTree, Circle, Message,
  CalendarToday, EventAvailable, Timer, StarRate, MoreHoriz,
} from "@mui/icons-material";
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";
import { useTheme as useMuiThemeV4 } from "@material-ui/core/styles";
import { useMemo } from "react";
import * as XLSX from "xlsx";
import moment from "moment";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { UsersFilter } from "../../components/UsersFilter";
import { WhatsappsFilter } from "../../components/WhatsappsFilter";
import { StatusFilter } from "../../components/StatusFilter";
import useDashboard from "../../hooks/useDashboard";
import QueueSelectCustom from "../../components/QueueSelectCustom";
import ShowTicketLogModal from "../../components/ShowTicketLogModal";

// ─── Estilos globais ──────────────────────────────────────────────────────────

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .rp-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .rp-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .rp-root { max-width: 100%; overflow-x: hidden; }

    @keyframes rpFadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .rp-animate { animation: rpFadeSlideUp 0.36s ease both; }

    .rp-row:hover td { background: var(--rp-hover-row) !important; }

    .rp-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .rp-root ::-webkit-scrollbar-track { background: transparent; }
    .rp-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }

    .rp-root input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
  `}</style>
);

// ─── usePalette ───────────────────────────────────────────────────────────────

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
    };

    return {
      primary, isDark, ...t,
      chipBg:    alpha(primary, isDark ? 0.18 : 0.10),
      chipColor: primary,
      success, warning, danger, purple, teal,
      statusColors: {
        open:    { bg: alpha("#3b82f6", isDark?0.18:0.10), color: isDark?"#93c5fd":"#1d4ed8" },
        closed:  { bg: alpha("#10b981", isDark?0.18:0.10), color: isDark?"#6ee7b7":"#15803d" },
        pending: { bg: alpha("#f59e0b", isDark?0.18:0.10), color: isDark?"#fcd34d":"#92400e" },
        default: { bg: alpha("#64748b", isDark?0.14:0.08), color: isDark?"#94a3b8":"#475569" },
      },
    };
  }, [primary, isDark]);
};

// ─── SubPaper ─────────────────────────────────────────────────────────────────

const SubPaper = ({ children, sx = {}, p }) => (
  <Paper elevation={0} sx={{
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

// ─── inputSx ─────────────────────────────────────────────────────────────────

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
  "& .MuiInputLabel-root": { fontSize: 13, fontFamily: "'DM Sans', sans-serif" },
  "& .MuiInputLabel-root.Mui-focused": { color: p.primary },
  "& .MuiSelect-select": { fontSize: 13 },
});

// ─── StatusChip ──────────────────────────────────────────────────────────────

const StatusChip = ({ status, p }) => {
  const cfg = p.statusColors[status] || p.statusColors.default;
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.5,
      px: 1, py: 0.25, borderRadius: "6px",
      backgroundColor: cfg.bg,
      border: `1px solid ${alpha(cfg.color, p.isDark ? 0.28 : 0.18)}`,
    }}>
      <Box sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: cfg.color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: cfg.color, textTransform: "capitalize" }}>
        {status}
      </Typography>
    </Box>
  );
};

// ─── Reports ─────────────────────────────────────────────────────────────────

const Reports = () => {
  const history   = useHistory();
  const p         = usePalette();
  const themeV5   = useMuiThemeV5();
  const isMobile  = useMediaQuery(themeV5.breakpoints.down("sm"));
  const { getReport } = useDashboard();

  const [loading,              setLoading]              = useState(false);
  const [pageNumber,           setPageNumber]           = useState(1);
  const [pageSize,             setPageSize]             = useState(10);
  const [searchParam,          setSearchParam]          = useState("");
  const [selectedContactId,    setSelectedContactId]    = useState(null);
  const [selectedWhatsapp,     setSelectedWhatsapp]     = useState([]);
  const [selectedStatus,       setSelectedStatus]       = useState([]);
  const [queueIds,             setQueueIds]             = useState([]);
  const [userIds,              setUserIds]              = useState([]);
  const [options,              setOptions]              = useState([]);
  const [dateFrom,             setDateFrom]             = useState(moment("1","D").format("YYYY-MM-DD"));
  const [dateTo,               setDateTo]               = useState(moment().format("YYYY-MM-DD"));
  const [onlyRated,            setOnlyRated]            = useState(false);
  const [totalTickets,         setTotalTickets]         = useState(0);
  const [tickets,              setTickets]              = useState([]);
  const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
  const [ticketOpen,           setTicketOpen]           = useState(null);
  const [filterModalOpen,      setFilterModalOpen]      = useState(false);

  // ── NOVO: controla se o usuário já aplicou ao menos um filtro ──────────────
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("contacts", { params: { searchParam } });
          setOptions(data.contacts);
        } catch (err) {
          toastError(err);
        } finally {
          setLoading(false);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam]);

  // ── CORRIGIDO: ao mudar pageSize, reaplica a busca imediatamente ───────────
  useEffect(() => {
    if (hasSearched) {
      handleFilter(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const exportarGridParaExcel = async () => {
    setLoading(true);
    try {
      const data = await getReport({
        searchParam,
        contactId:   selectedContactId,
        whatsappId:  JSON.stringify(selectedWhatsapp),
        users:       JSON.stringify(userIds),
        queueIds:    JSON.stringify(queueIds),
        status:      JSON.stringify(selectedStatus),
        dateFrom, dateTo,
        page: 1, pageSize: 9999999,
        onlyRated: onlyRated ? "true" : "false",
      });
      const ticketsData = data.tickets.map((ticket) => {
        const createdAt = new Date(ticket.createdAt);
        const closedAt  = new Date(ticket.closedAt);
        return {
          id: ticket.id,
          Conexão: ticket.whatsappName,
          Contato: ticket.contactName,
          Usuário: ticket.userName,
          Fila: ticket.queueName,
          Status: ticket.status,
          ÚltimaMensagem: ticket.lastMessage,
          DataAbertura:   createdAt.toLocaleDateString(),
          HoraAbertura:   createdAt.toLocaleTimeString(),
          DataFechamento: ticket.closedAt === null ? "" : closedAt.toLocaleDateString(),
          HoraFechamento: ticket.closedAt === null ? "" : closedAt.toLocaleTimeString(),
          TempoDeAtendimento: ticket.supportTime,
          nps: ticket.NPS,
        };
      });
      const ws = XLSX.utils.json_to_sheet(ticketsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "RelatorioDeAtendimentos");
      XLSX.writeFile(wb, "relatorio-de-atendimentos.xlsx");
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (page) => {
    setLoading(true);
    try {
      const data = await getReport({
        searchParam,
        contactId:   selectedContactId,
        whatsappId:  JSON.stringify(selectedWhatsapp),
        users:       JSON.stringify(userIds),
        queueIds:    JSON.stringify(queueIds),
        status:      JSON.stringify(selectedStatus),
        dateFrom, dateTo,
        page, pageSize,
        onlyRated: onlyRated ? "true" : "false",
      });
      setTotalTickets(data.totalTickets.total);
      setTickets(data.tickets);
      setPageNumber(page);
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectedUsers     = (s) => setUserIds(s.map((t) => t.id));
  const handleSelectedWhatsapps = (s) => setSelectedWhatsapp(s.map((t) => t.id));
  const handleSelectedStatus    = (s) => setSelectedStatus(s.map((t) => t.status));

  const IconChannel = (channel) => {
    switch (channel) {
      case "facebook":  return <Facebook  sx={{ color: "#3b5998", verticalAlign: "middle", fontSize: 16 }} />;
      case "instagram": return <Instagram sx={{ color: "#e1306c", verticalAlign: "middle", fontSize: 16 }} />;
      case "whatsapp":  return <WhatsApp  sx={{ color: "#25d366", verticalAlign: "middle", fontSize: 16 }} />;
      default: return null;
    }
  };

  const renderOption = (props, option) => (
    <li {...props}>
      {option.number ? (
        <Stack direction="row" spacing={1} alignItems="center">
          {IconChannel(option.channel)}
          <Typography sx={{ fontSize: 13 }}>{option.name} - {option.number}</Typography>
        </Stack>
      ) : (
        `${i18n.t("newTicketModal.add")} ${option.name}`
      )}
    </li>
  );

  const renderOptionLabel = (option) =>
    option.number ? `${option.name} - ${option.number}` : option.name;

  const filter = createFilterOptions({ trim: true });
  const createAddContactOption = (filterOptions, params) => {
    const filtered = filter(filterOptions, params);
    if (params.inputValue !== "" && !loading && searchParam.length >= 3) {
      filtered.push({ name: `${params.inputValue}` });
    }
    return filtered;
  };

  const gs = { xs: 1, sm: 1.5 };

  const thCellSx = {
    fontWeight: 700,
    fontSize: "0.72rem",
    color: p.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    backgroundColor: p.headBg,
    borderBottom: `1px solid ${p.divider}`,
    whiteSpace: "nowrap",
    py: 1.1,
    fontFamily: "'DM Sans', sans-serif",
  };
  const tdCellSx = {
    fontSize: "0.79rem",
    color: p.textSecond,
    borderBottom: `1px solid ${p.divider}`,
    py: 0.9,
    fontFamily: "'DM Sans', sans-serif",
  };

  // ── Label externo reutilizável no modal ────────────────────────────────────
  const FieldLabel = ({ children }) => (
    <Typography sx={{
      fontSize: 12, fontWeight: 600, color: p.textMuted,
      textTransform: "uppercase", letterSpacing: "0.06em",
      mb: 0.7, fontFamily: "'DM Sans', sans-serif",
    }}>
      {children}
    </Typography>
  );

  // ── Estilos dos filtros internos do modal ──────────────────────────────────
  const fw = {
    "& .MuiFormControl-root": { margin: "0 !important", width: "100%" },
    "& .MuiInputBase-root": { fontSize: 13, borderRadius: "10px", backgroundColor: p.inputBg, fontFamily: "'DM Sans', sans-serif" },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: p.inputBorder },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: p.isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8" },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: p.primary, borderWidth: "1.5px" },
    "& .MuiInputLabel-root": { fontSize: 13, fontFamily: "'DM Sans', sans-serif" },
    "& .MuiInputLabel-root.Mui-focused": { color: p.primary },
    "& .MuiInputLabel-outlined:not(.MuiInputLabel-shrink)": { opacity: 0 },
    "& .MuiInputLabel-outlined.MuiInputLabel-shrink": { opacity: 0 },
  };

  return (
    <Box
      className="rp-root"
      style={{ "--rp-hover-row": p.hoverRow }}
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

      {openTicketMessageDialog && (
        <ShowTicketLogModal
          isOpen={openTicketMessageDialog}
          handleClose={() => setOpenTicketMessageDialog(false)}
          ticketId={ticketOpen.id}
        />
      )}

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
                Relatórios
              </Typography>
            </Stack>

            <Typography sx={{
              fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
              letterSpacing: "-0.025em", lineHeight: 1,
              color: p.isDark ? p.textPrimary : "#ffffff",
            }}>
              {i18n.t("reports.title")}
            </Typography>

            <Typography sx={{
              fontSize: { xs: 12, sm: 13.5 }, mt: 0.6,
              color: p.isDark ? p.textMuted : alpha("#fff", 0.72),
              display: { xs: "none", sm: "block" },
            }}>
              Filtre atendimentos por período, equipe e status para extrair relatórios completos
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.2, sm: 1.5 }, flexWrap: "wrap", gap: 0.8 }}>
              {[
                { icon: <FiberManualRecord sx={{ fontSize: 8 }} />,  label: "Relatórios de atendimento" },
                { icon: <Insights         sx={{ fontSize: 12 }} />, label: `${totalTickets} registros encontrados` },
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
      <Box sx={{
        px: { xs: 1, sm: 1.5, md: 2.5 },
        py: { xs: 1.5, sm: 2, md: 2.5 },
        flex: 1, display: "flex", flexDirection: "column", gap: gs,
      }}>

        {/* ══ MODAL DE FILTROS ══════════════════════════════════════════════ */}
        <Dialog
          open={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            elevation: 0,
            sx: {
              borderRadius: "18px",
              border: `1px solid ${p.border}`,
              backgroundColor: p.surfaceBg,
              backgroundImage: "none",
              overflow: "visible",
            },
          }}
          BackdropProps={{
            sx: { backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.35)" },
          }}
        >
          {/* Cabeçalho do modal */}
          <DialogTitle sx={{ p: 0 }}>
            <Stack
              direction="row" justifyContent="space-between" alignItems="center"
              sx={{
                px: { xs: 2.5, sm: 3 }, pt: { xs: 2, sm: 2.5 }, pb: 2,
                borderBottom: `1px solid ${p.divider}`,
              }}
            >
              <Box>
                <SectionLabel p={p}>Busca avançada</SectionLabel>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: p.textPrimary, mt: 0.2, fontFamily: "'DM Sans', sans-serif" }}>
                  Filtros de Relatório
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => setFilterModalOpen(false)}
                sx={{
                  borderRadius: "10px", p: 0.7,
                  border: `1px solid ${p.border}`,
                  backgroundColor: p.inputBg,
                  color: p.textMuted,
                  transition: "all 0.16s",
                  "&:hover": { borderColor: alpha(p.danger, 0.45), color: p.danger, backgroundColor: alpha(p.danger, p.isDark ? 0.1 : 0.05) },
                }}
              >
                <Close sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, py: 2.5 }}>
            <Grid container spacing={2.5}>

              {/* Conexão */}
              <Grid item xs={12} sm={6}>
                <FieldLabel>Filtro por Conexão</FieldLabel>
                <Box sx={fw}><WhatsappsFilter onFiltered={handleSelectedWhatsapps} /></Box>
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6}>
                <FieldLabel>Filtro por Status</FieldLabel>
                <Box sx={fw}><StatusFilter onFiltered={handleSelectedStatus} /></Box>
              </Grid>

              {/* Usuário */}
              <Grid item xs={12} sm={6}>
                <FieldLabel>Filtro por Usuário</FieldLabel>
                <Box sx={fw}><UsersFilter onFiltered={handleSelectedUsers} /></Box>
              </Grid>

              {/* Filas */}
              <Grid item xs={12} sm={6}>
                <FieldLabel>Filas</FieldLabel>
                <Box sx={fw}>
                  <QueueSelectCustom selectedQueueIds={queueIds} onChange={(values) => setQueueIds(values)} />
                </Box>
              </Grid>

              {/* Contato */}
              <Grid item xs={12}>
                <FieldLabel>Pesquisar Contato</FieldLabel>
                <Autocomplete
                  fullWidth options={options} loading={loading}
                  clearOnBlur autoHighlight freeSolo size="small" clearOnEscape
                  getOptionLabel={renderOptionLabel} renderOption={renderOption}
                  filterOptions={createAddContactOption}
                  onChange={(e, newValue) => { setSelectedContactId(newValue?.id || null); setSearchParam(""); }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Digite o nome ou número do contato"
                      variant="outlined" size="small"
                      onChange={(e) => setSearchParam(e.target.value)}
                      sx={{
                        ...inputSx(p),
                        "& .MuiInputLabel-root": { display: "none" },
                        "& .MuiInputLabel-outlined": { display: "none" },
                      }}
                      InputLabelProps={{ shrink: false, sx: { display: "none" } }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (<>{loading ? <CircularProgress color="inherit" size={14} /> : null}{params.InputProps.endAdornment}</>),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Data Inicial */}
              <Grid item xs={12} sm={6}>
                <FieldLabel>Data Inicial</FieldLabel>
                <TextField type="date" value={dateFrom} variant="outlined"
                  fullWidth size="small" onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: false, sx: { display: "none" } }}
                  sx={inputSx(p)} />
              </Grid>

              {/* Data Final */}
              <Grid item xs={12} sm={6}>
                <FieldLabel>Data Final</FieldLabel>
                <TextField type="date" value={dateTo} variant="outlined"
                  fullWidth size="small" onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: false, sx: { display: "none" } }}
                  sx={inputSx(p)} />
              </Grid>

              {/* ── APENAS AVALIADOS — movido para dentro do modal ── */}
              <Grid item xs={12}>
                <Box sx={{ height: "1px", backgroundColor: p.divider, mb: 0.5 }} />
                <Box
                  onClick={() => setOnlyRated(!onlyRated)}
                  sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    px: 1.8, py: 1.2, borderRadius: "12px",
                    border: `1px solid ${onlyRated ? alpha(p.primary, p.isDark ? 0.4 : 0.3) : p.border}`,
                    backgroundColor: onlyRated ? alpha(p.primary, p.isDark ? 0.1 : 0.05) : p.inputBg,
                    cursor: "pointer", userSelect: "none",
                    transition: "border-color 0.18s, background 0.18s",
                  }}
                >
                  <Box>
                    <Typography sx={{
                      fontSize: 13, fontWeight: 600,
                      color: onlyRated ? p.primary : p.textPrimary,
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "color 0.18s",
                    }}>
                      {i18n.t("reports.buttons.onlyRated")}
                    </Typography>
                    <Typography sx={{
                      fontSize: 11.5, color: p.textMuted,
                      fontFamily: "'DM Sans', sans-serif", mt: 0.15,
                    }}>
                      Exibir apenas atendimentos que receberam avaliação NPS
                    </Typography>
                  </Box>
                  <Switch
                    checked={onlyRated}
                    onChange={() => setOnlyRated(!onlyRated)}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      flexShrink: 0, ml: 1,
                      "& .MuiSwitch-switchBase.Mui-checked": { color: p.primary },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: p.primary },
                    }}
                  />
                </Box>
              </Grid>

              {/* Botões do modal */}
              <Grid item xs={12}>
                <Box sx={{ height: "1px", backgroundColor: p.divider, mb: 2, mt: 0.5 }} />
                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                  <Button
                    variant="outlined" size="small"
                    onClick={() => setFilterModalOpen(false)}
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
                    onClick={() => {
                      setFilterModalOpen(false);
                      setHasSearched(true); // ← marca que já buscou (libera Download)
                      handleFilter(1);
                    }}
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
                    }}
                  >
                    Aplicar e fechar
                  </Button>
                </Stack>
              </Grid>

            </Grid>
          </DialogContent>
        </Dialog>

        {/* ── Barra de filtros compacta ── */}
        <SubPaper p={p} sx={{ p: { xs: "12px 14px", sm: "13px 18px" } }} className="rp-animate">
          <Stack direction="row" alignItems="center" spacing={1.2} flexWrap="nowrap">

            {/* Botão abre modal */}
            <Button
              onClick={() => setFilterModalOpen(true)}
              startIcon={<TuneRounded sx={{ fontSize: 16 }} />}
              variant="outlined"
              size="small"
              sx={{
                flexShrink: 0,
                borderRadius: "10px", textTransform: "none",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
                height: 40, px: 1.8,
                borderColor: p.border,
                color: p.textSecond,
                backgroundColor: p.inputBg,
                transition: "all 0.18s",
                "&:hover": {
                  borderColor: alpha(p.primary, 0.45),
                  color: p.primary,
                  backgroundColor: alpha(p.primary, p.isDark ? 0.1 : 0.05),
                },
              }}
            >
              Filtros
            </Button>

            {/* Chips de filtros ativos */}
            <Stack direction="row" spacing={0.7} alignItems="center" sx={{ flex: 1, overflow: "hidden", flexWrap: "nowrap", minWidth: 0 }}>
              {selectedWhatsapp.length > 0 && (
                <Box sx={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.3, borderRadius: "7px", backgroundColor: alpha(p.primary, p.isDark ? 0.15 : 0.08), border: `1px solid ${alpha(p.primary, p.isDark ? 0.28 : 0.18)}` }}>
                  <Wifi sx={{ fontSize: 12, color: p.primary }} />
                  <Typography sx={{ fontSize: 11.5, color: p.primary, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>
                    {selectedWhatsapp.length} conexão{selectedWhatsapp.length > 1 ? "ões" : ""}
                  </Typography>
                </Box>
              )}
              {selectedStatus.length > 0 && (
                <Box sx={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.3, borderRadius: "7px", backgroundColor: alpha(p.success, p.isDark ? 0.15 : 0.08), border: `1px solid ${alpha(p.success, p.isDark ? 0.28 : 0.18)}` }}>
                  <Circle sx={{ fontSize: 8, color: p.success }} />
                  <Typography sx={{ fontSize: 11.5, color: p.success, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>
                    {selectedStatus.length} status
                  </Typography>
                </Box>
              )}
              {userIds.length > 0 && (
                <Box sx={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.3, borderRadius: "7px", backgroundColor: alpha(p.purple, p.isDark ? 0.15 : 0.08), border: `1px solid ${alpha(p.purple, p.isDark ? 0.28 : 0.18)}` }}>
                  <Person sx={{ fontSize: 12, color: p.purple }} />
                  <Typography sx={{ fontSize: 11.5, color: p.purple, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>
                    {userIds.length} usuário{userIds.length > 1 ? "s" : ""}
                  </Typography>
                </Box>
              )}
              {queueIds.length > 0 && (
                <Box sx={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.3, borderRadius: "7px", backgroundColor: alpha(p.teal, p.isDark ? 0.15 : 0.08), border: `1px solid ${alpha(p.teal, p.isDark ? 0.28 : 0.18)}` }}>
                  <AccountTree sx={{ fontSize: 12, color: p.teal }} />
                  <Typography sx={{ fontSize: 11.5, color: p.teal, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>
                    {queueIds.length} fila{queueIds.length > 1 ? "s" : ""}
                  </Typography>
                </Box>
              )}
              {selectedContactId && (
                <Box sx={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.3, borderRadius: "7px", backgroundColor: alpha(p.warning, p.isDark ? 0.15 : 0.08), border: `1px solid ${alpha(p.warning, p.isDark ? 0.28 : 0.18)}` }}>
                  <Person sx={{ fontSize: 12, color: p.warning }} />
                  <Typography sx={{ fontSize: 11.5, color: p.warning, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>
                    Contato
                  </Typography>
                </Box>
              )}
              {/* Chip "Apenas avaliados" na barra — somente quando ativo */}
              {onlyRated && (
                <Box sx={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.3, borderRadius: "7px", backgroundColor: alpha(p.primary, p.isDark ? 0.15 : 0.08), border: `1px solid ${alpha(p.primary, p.isDark ? 0.28 : 0.18)}` }}>
                  <StarRate sx={{ fontSize: 12, color: p.primary }} />
                  <Typography sx={{ fontSize: 11.5, color: p.primary, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>
                    Apenas avaliados
                  </Typography>
                </Box>
              )}
              {/* Período */}
              <Box sx={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.3, borderRadius: "7px", backgroundColor: p.tagBg, border: `1px solid ${p.border}` }}>
                <CalendarToday sx={{ fontSize: 11, color: p.textMuted }} />
                <Typography className="mono" sx={{ fontSize: 11, color: p.textMuted, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace" }}>
                  {dateFrom} → {dateTo}
                </Typography>
              </Box>

              {/* Placeholder quando nenhum filtro ativo */}
              {selectedWhatsapp.length === 0 && selectedStatus.length === 0 && userIds.length === 0 && queueIds.length === 0 && !selectedContactId && !onlyRated && (
                <Typography sx={{ fontSize: 12.5, color: p.textMuted, fontFamily: "'DM Sans', sans-serif", ml: 0.5 }}>
                  Nenhum filtro ativo — clique em <Box component="span" sx={{ color: p.primary, fontWeight: 600 }}>Filtros</Box> para refinar
                </Typography>
              )}
            </Stack>

            {/* ── Download — visível apenas após primeira busca ── */}
            {hasSearched && (
              <Tooltip title="Exportar para Excel">
                <IconButton onClick={exportarGridParaExcel} size="small" sx={{
                  flexShrink: 0, borderRadius: "10px", border: `1px solid ${p.border}`,
                  backgroundColor: p.inputBg, color: p.textSecond, p: 0.85,
                  transition: "all 0.18s",
                  "&:hover": { backgroundColor: alpha(p.success, p.isDark ? 0.16 : 0.09), borderColor: alpha(p.success, 0.35), color: p.success, transform: "translateY(-1px)" },
                }}>
                  <SaveAlt sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}

          </Stack>
        </SubPaper>

        {/* ── Tabela ── */}
        <SubPaper p={p} sx={{ flex: 1, overflow: "hidden", p: 0 }} className="rp-animate" style={{ animationDelay: "80ms" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            sx={{ px: { xs: "14px", sm: "16px", md: "18px" }, pt: { xs: "13px", sm: "15px", md: "16px" }, pb: 1.2 }}
          >
            <Box>
              <SectionLabel p={p}>Resultados</SectionLabel>
              <Typography sx={{ fontSize: { xs: 13, sm: 14.5 }, color: p.textPrimary, fontWeight: 700, mt: 0.2 }}>
                Histórico de atendimentos
              </Typography>
            </Box>
            {totalTickets > 0 && (
              <Box sx={{
                display: "inline-flex", alignItems: "center", gap: 0.6,
                px: 1.2, py: 0.45, borderRadius: "8px",
                backgroundColor: p.chipBg,
                border: `1px solid ${alpha(p.primary, p.isDark ? 0.25 : 0.16)}`,
              }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: p.primary, boxShadow: `0 0 0 3px ${alpha(p.primary, 0.2)}` }} />
                <Typography sx={{ fontSize: 11.5, color: p.chipColor, fontWeight: 600 }}>
                  {totalTickets.toLocaleString("pt-BR")} registros
                </Typography>
              </Box>
            )}
          </Stack>

          <Box sx={{ height: "1px", backgroundColor: p.divider, mx: { xs: "14px", sm: "16px", md: "18px" } }} />

          <Box sx={{ overflowX: "auto", overflowY: "auto", maxHeight: "56vh", WebkitOverflowScrolling: "touch" }}
            id="grid-attendants">
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {[
                    { label: i18n.t("reports.table.id"),          align: "center", icon: <Tag sx={{ fontSize: 13 }} />          },
                    { label: i18n.t("reports.table.whatsapp"),    align: "left",   icon: <Wifi sx={{ fontSize: 13 }} />          },
                    { label: i18n.t("reports.table.contact"),     align: "left",   icon: <Person sx={{ fontSize: 13 }} />        },
                    { label: i18n.t("reports.table.user"),        align: "left",   icon: <Person sx={{ fontSize: 13 }} />        },
                    { label: i18n.t("reports.table.queue"),       align: "left",   icon: <AccountTree sx={{ fontSize: 13 }} />   },
                    { label: i18n.t("reports.table.status"),      align: "center", icon: <Circle sx={{ fontSize: 10 }} />        },
                    { label: i18n.t("reports.table.lastMessage"), align: "left",   icon: <Message sx={{ fontSize: 13 }} />       },
                    { label: i18n.t("reports.table.dateOpen"),    align: "center", icon: <CalendarToday sx={{ fontSize: 12 }} /> },
                    { label: i18n.t("reports.table.dateClose"),   align: "center", icon: <EventAvailable sx={{ fontSize: 12 }}/>},
                    { label: i18n.t("reports.table.supportTime"), align: "center", icon: <Timer sx={{ fontSize: 13 }} />         },
                    { label: i18n.t("reports.table.NPS"),         align: "center", icon: <StarRate sx={{ fontSize: 13 }} />      },
                    { label: i18n.t("reports.table.actions"),     align: "center", icon: <MoreHoriz sx={{ fontSize: 13 }} />     },
                  ].map((col) => (
                    <TableCell key={col.label} align={col.align} sx={thCellSx}>
                      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent={col.align === "center" ? "center" : "flex-start"}>
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
                {tickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="rp-row"
                    sx={{ "& td": { transition: "background 0.13s" } }}
                  >
                    <TableCell align="center" sx={tdCellSx}>
                      <Typography className="mono" sx={{ fontSize: 12, color: p.textMuted, fontWeight: 600 }}>
                        #{ticket.id}
                      </Typography>
                    </TableCell>

                    <TableCell align="left" sx={tdCellSx}>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        {IconChannel(ticket.channel)}
                        <Typography sx={{ fontSize: 12.5, color: p.textSecond }}>
                          {ticket?.whatsappName}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell align="left" sx={{ ...tdCellSx, fontWeight: 500, color: p.textPrimary }}>
                      {ticket?.contactName}
                    </TableCell>

                    <TableCell align="left" sx={tdCellSx}>{ticket?.userName}</TableCell>

                    <TableCell align="left" sx={tdCellSx}>
                      {ticket?.queueName && (
                        <Box sx={{
                          display: "inline-flex", px: 0.9, py: 0.2, borderRadius: "6px",
                          backgroundColor: p.tagBg,
                          border: `1px solid ${p.border}`,
                        }}>
                          <Typography sx={{ fontSize: 11.5, color: p.textMuted, fontWeight: 600 }}>
                            {ticket.queueName}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>

                    <TableCell align="center" sx={tdCellSx}>
                      <StatusChip status={ticket?.status} p={p} />
                    </TableCell>

                    <TableCell align="left" sx={{
                      ...tdCellSx, maxWidth: 180,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      <Typography sx={{ fontSize: 12, color: p.textMuted }}>
                        {ticket?.lastMessage}
                      </Typography>
                    </TableCell>

                    <TableCell align="center" sx={tdCellSx}>
                      <Typography className="mono" sx={{ fontSize: 11.5, color: p.textSecond }}>
                        {ticket?.createdAt}
                      </Typography>
                    </TableCell>

                    <TableCell align="center" sx={tdCellSx}>
                      <Typography className="mono" sx={{ fontSize: 11.5, color: p.textSecond }}>
                        {ticket?.closedAt}
                      </Typography>
                    </TableCell>

                    <TableCell align="center" sx={tdCellSx}>
                      <Typography className="mono" sx={{ fontSize: 12, color: p.textPrimary, fontWeight: 600 }}>
                        {ticket?.supportTime}
                      </Typography>
                    </TableCell>

                    <TableCell align="center" sx={tdCellSx}>
                      {ticket?.NPS != null && ticket?.NPS !== "" && (
                        <Box sx={{
                          display: "inline-flex", px: 0.9, py: 0.2, borderRadius: "6px",
                          backgroundColor: alpha(
                            Number(ticket.NPS) >= 9 ? p.success :
                            Number(ticket.NPS) >= 7 ? p.warning : p.danger,
                            p.isDark ? 0.18 : 0.10
                          ),
                          border: `1px solid ${alpha(
                            Number(ticket.NPS) >= 9 ? p.success :
                            Number(ticket.NPS) >= 7 ? p.warning : p.danger,
                            p.isDark ? 0.28 : 0.18
                          )}`,
                        }}>
                          <Typography className="mono" sx={{
                            fontSize: 12, fontWeight: 700,
                            color:
                              Number(ticket.NPS) >= 9 ? p.success :
                              Number(ticket.NPS) >= 7 ? p.warning : p.danger,
                          }}>
                            {ticket.NPS}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>

                    <TableCell align="center" sx={tdCellSx}>
                      <Stack direction="row" spacing={0.3} justifyContent="center">
                        <Tooltip title="Logs do Ticket">
                          <IconButton
                            size="small"
                            onClick={() => { setOpenTicketMessageDialog(true); setTicketOpen(ticket); }}
                            sx={{
                              p: 0.5, borderRadius: "7px",
                              color: p.primary,
                              backgroundColor: alpha(p.primary, p.isDark ? 0.12 : 0.07),
                              border: `1px solid ${alpha(p.primary, p.isDark ? 0.22 : 0.14)}`,
                              transition: "all 0.16s",
                              "&:hover": {
                                backgroundColor: alpha(p.primary, p.isDark ? 0.22 : 0.14),
                                transform: "translateY(-1px)",
                              },
                            }}
                          >
                            <History sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Acessar Ticket">
                          <IconButton
                            size="small"
                            onClick={() => history.push(`/tickets/${ticket.uuid}`)}
                            sx={{
                              p: 0.5, borderRadius: "7px",
                              color: p.success,
                              backgroundColor: alpha(p.success, p.isDark ? 0.12 : 0.07),
                              border: `1px solid ${alpha(p.success, p.isDark ? 0.22 : 0.14)}`,
                              transition: "all 0.16s",
                              "&:hover": {
                                backgroundColor: alpha(p.success, p.isDark ? 0.22 : 0.14),
                                transform: "translateY(-1px)",
                              },
                            }}
                          >
                            <Forward sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

                {loading && <TableRowSkeleton avatar columns={3} />}

                {!loading && tickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 0, borderBottom: "none" }}>
                      <Box sx={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", py: { xs: 5, sm: 7 }, px: 3,
                      }}>
                        <Box sx={{ mb: 3, opacity: p.isDark ? 0.85 : 1 }}>
                          <svg width="180" height="140" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <ellipse cx="90" cy="128" rx="72" ry="8" fill={p.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} />
                            <rect x="38" y="18" width="104" height="98" rx="10" fill={p.isDark ? "#141f30" : "#f0f6ff"} stroke={p.isDark ? "rgba(255,255,255,0.08)" : "#c7ddf7"} strokeWidth="1.5"/>
                            <rect x="54" y="36" width="72" height="7" rx="3.5" fill={p.isDark ? "rgba(255,255,255,0.07)" : "#d6e8fb"}/>
                            <rect x="54" y="50" width="56" height="6" rx="3" fill={p.isDark ? "rgba(255,255,255,0.05)" : "#e3eef8"}/>
                            <rect x="54" y="63" width="64" height="6" rx="3" fill={p.isDark ? "rgba(255,255,255,0.05)" : "#e3eef8"}/>
                            <rect x="54" y="76" width="44" height="6" rx="3" fill={p.isDark ? "rgba(255,255,255,0.04)" : "#eaf2fb"}/>
                            <circle cx="118" cy="95" r="20" fill={p.isDark ? "#0f1929" : "#ffffff"} stroke={p.isDark ? "rgba(255,255,255,0.1)" : "#d0e4f7"} strokeWidth="1.5"/>
                            <circle cx="115" cy="92" r="10" fill="none" stroke={p.isDark ? "rgba(99,179,237,0.55)" : "#93c5fd"} strokeWidth="3"/>
                            <line x1="122" y1="99" x2="131" y2="108" stroke={p.isDark ? "rgba(99,179,237,0.55)" : "#93c5fd"} strokeWidth="3" strokeLinecap="round"/>
                            <path d="M54 95 L66 95" stroke={p.isDark ? "rgba(255,255,255,0.12)" : "#b8d4ef"} strokeWidth="2" strokeLinecap="round"/>
                            <path d="M57 100 L63 100" stroke={p.isDark ? "rgba(255,255,255,0.08)" : "#ccdff4"} strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="46" cy="18" r="4" fill={p.isDark ? "rgba(99,179,237,0.2)" : "#bfdbfe"}/>
                            <circle cx="134" cy="20" r="3" fill={p.isDark ? "rgba(99,179,237,0.15)" : "#dbeafe"}/>
                            <circle cx="140" cy="110" r="5" fill={p.isDark ? "rgba(99,179,237,0.1)" : "#eff6ff"}/>
                          </svg>
                        </Box>
                        <Typography sx={{
                          fontSize: { xs: 15, sm: 16.5 }, fontWeight: 700,
                          color: p.textPrimary, mb: 0.8, textAlign: "center",
                          fontFamily: "'DM Sans', sans-serif",
                        }}>
                          Aguardando geração do relatório
                        </Typography>
                        <Typography sx={{
                          fontSize: 13, color: p.textMuted, textAlign: "center",
                          maxWidth: 320, lineHeight: 1.6,
                          fontFamily: "'DM Sans', sans-serif",
                        }}>
                          Configure os filtros desejados e clique em{" "}
                          <Box component="span" sx={{ color: p.primary, fontWeight: 700 }}>
                            Aplicar e fechar
                          </Box>{" "}
                          para visualizar os atendimentos.
                        </Typography>
                        <Box sx={{
                          mt: 2.5, display: "inline-flex", alignItems: "center", gap: 0.8,
                          px: 1.8, py: 0.7, borderRadius: "10px",
                          backgroundColor: alpha(p.primary, p.isDark ? 0.1 : 0.06),
                          border: `1px solid ${alpha(p.primary, p.isDark ? 0.22 : 0.15)}`,
                        }}>
                          <FilterAlt sx={{ fontSize: 14, color: p.primary }} />
                          <Typography sx={{ fontSize: 12, color: p.primary, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                            Use os filtros acima para refinar sua busca
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </SubPaper>

        {/* ── Paginação ── */}
        <SubPaper p={p} sx={{ p: { xs: "10px 14px", sm: "11px 18px" } }} className="rp-animate" style={{ animationDelay: "140ms" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Pagination
              count={Math.ceil(totalTickets / pageSize)}
              page={pageNumber}
              onChange={(event, value) => handleFilter(value)}
              size="small"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontSize: 12, fontWeight: 600,
                  color: p.textSecond,
                  borderRadius: "8px",
                  fontFamily: "'DM Sans', sans-serif",
                },
                "& .MuiPaginationItem-root.Mui-selected": {
                  backgroundColor: p.primary,
                  color: "#fff",
                  "&:hover": { backgroundColor: p.primary },
                },
                "& .MuiPaginationItem-root:hover:not(.Mui-selected)": {
                  backgroundColor: alpha(p.primary, p.isDark ? 0.14 : 0.08),
                },
              }}
            />

            {/* ── CORRIGIDO: onChange chama handleFilter(1) diretamente ── */}
            <FormControl variant="outlined" size="small" sx={{ minWidth: 130 }}>
              <InputLabel sx={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: p.textMuted }}>
                {i18n.t("tickets.search.ticketsPerPage")}
              </InputLabel>
              <Select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value);
                  // O useEffect acima captura a mudança e chama handleFilter(1) quando hasSearched=true
                }}
                label={i18n.t("tickets.search.ticketsPerPage")}
                sx={{
                  ...inputSx(p)["& .MuiOutlinedInput-root"],
                  fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  borderRadius: "10px",
                  backgroundColor: p.inputBg,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: p.inputBorder },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: p.isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: p.primary, borderWidth: "1.5px",
                  },
                  color: p.textPrimary,
                }}
              >
                {[5, 10, 20, 50].map((n) => (
                  <MenuItem key={n} value={n} sx={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </SubPaper>

      </Box>
    </Box>
  );
};

export default Reports;
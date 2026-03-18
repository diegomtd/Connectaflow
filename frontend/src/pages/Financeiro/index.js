import React, { useState, useEffect, useReducer, useContext } from "react";
import { makeStyles, alpha, useTheme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Chip from "@material-ui/core/Chip";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Divider from "@material-ui/core/Divider";
import Avatar from "@material-ui/core/Avatar";
import CircularProgress from "@material-ui/core/CircularProgress";
import Tooltip from "@material-ui/core/Tooltip";
import Grid from "@material-ui/core/Grid";

import PaymentIcon        from "@material-ui/icons/Payment";
import ReceiptIcon        from "@material-ui/icons/Receipt";
import CheckCircleIcon    from "@material-ui/icons/CheckCircle";
import ErrorIcon          from "@material-ui/icons/Error";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import PersonIcon         from "@material-ui/icons/Person";
import DevicesIcon        from "@material-ui/icons/Devices";
import QueueIcon          from "@material-ui/icons/Queue";
import MoneyIcon          from "@material-ui/icons/Money";
import DateRangeIcon      from "@material-ui/icons/DateRange";
import InfoIcon           from "@material-ui/icons/Info";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";

// ── MUI v5 — apenas para o cabeçalho (igual ao FileLists) ──
import {
  Box as MuiBox,
  Stack,
  Typography as MuiTypography,
  alpha as muiAlpha,
} from "@mui/material";

import SubscriptionModal from "../../components/SubscriptionModal";
import api               from "../../services/api";
import TableRowSkeleton  from "../../components/TableRowSkeleton";
import toastError        from "../../errors/toastError";
import { AuthContext }   from "../../context/Auth/AuthContext";

import moment from "moment";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .inv-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .inv-root .mono { font-family: 'JetBrains Mono', monospace !important; }

    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .inv-animate { animation: fadeSlideUp 0.36s ease both; }

    .inv-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .inv-root ::-webkit-scrollbar-track { background: transparent; }
    .inv-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }

    .inv-row:hover td { background-color: var(--inv-row-hover) !important; }

    .kpi-card-inv { position: relative; overflow: hidden; }
    .kpi-card-inv::after {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--kpi-color, #2563eb); border-radius: 14px 14px 0 0;
      transform: scaleX(0); transform-origin: left center;
      transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
    }
    .kpi-card-inv:hover::after { transform: scaleX(1); }
    .kpi-icon-box-inv {
      transition: transform 0.24s cubic-bezier(0.34,1.56,0.64,1) !important;
    }
    .kpi-card-inv:hover .kpi-icon-box-inv {
      transform: scale(1.22) rotate(10deg) !important;
    }

    .inv-bill-card {
      transition: transform 0.22s, box-shadow 0.22s !important;
    }
    .inv-bill-card:hover {
      transform: translateY(-4px) !important;
    }
  `}</style>
);

/* ─── Reducer ─────────────────────────────────────────────────────────────── */
const reducer = (state, action) => {
  if (action.type === "LOAD_INVOICES") {
    const invoices = action.payload;
    const newUsers = [];
    invoices.forEach((user) => {
      const idx = state.findIndex((u) => u.id === user.id);
      if (idx !== -1) state[idx] = user;
      else newUsers.push(user);
    });
    return [...state, ...newUsers];
  }
  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const idx = state.findIndex((u) => u.id === user.id);
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
  const hoverRow    = isDark ? "rgba(255,255,255,0.03)" : "#f5f8fc";
  const success     = "#10b981";
  const warning     = "#f59e0b";
  const danger      = "#ef4444";

  return {
    pageRoot: {
      display: "flex", flexDirection: "column", position: "relative",
      flex: 1, width: "100%", maxWidth: "100%",
      height: "calc(100% - 48px)", overflowY: "hidden",
      backgroundColor: pageBg,
      transition: "background-color 0.3s ease",
      "--inv-row-hover": hoverRow,
    },
    contentArea: {
      padding: theme.spacing(2, 2.5, 2.5),
      overflowY: "auto", flex: 1,
      ...theme.scrollbarStyles,
      [theme.breakpoints.down("sm")]: { padding: theme.spacing(1.5, 1, 1.5) },
    },
    kpiCard: {
      padding: "16px 18px 13px", borderRadius: 14,
      border: `1px solid ${border}`, minHeight: 122,
      backgroundColor: surfaceBg,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      cursor: "default",
      transition: "box-shadow 0.22s, transform 0.22s, border-color 0.22s",
      "&:hover": { transform: "translateY(-2px)" },
      [theme.breakpoints.down("sm")]: { padding: "12px 14px 10px", minHeight: 105 },
    },
    kpiTitle: {
      color: textMuted, fontSize: 11, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1,
      [theme.breakpoints.down("sm")]: { fontSize: 9.5 },
    },
    kpiValue: {
      fontFamily: "'JetBrains Mono', monospace !important",
      color: textPrimary, fontSize: 32, lineHeight: 1.1,
      marginTop: 6, fontWeight: 700, letterSpacing: "-0.025em",
      [theme.breakpoints.down("sm")]: { fontSize: 24 },
    },
    kpiHint: {
      color: textMuted, fontSize: 11.5,
      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      [theme.breakpoints.down("sm")]: { fontSize: 10 },
    },
    kpiDot: { width: 5, height: 5, borderRadius: "50%", opacity: 0.65, flexShrink: 0, marginRight: 5 },
    mainPaper: {
      flex: 1, overflowY: "auto",
      ...theme.scrollbarStyles,
      borderRadius: 14, border: `1px solid ${border}`,
      boxShadow: isDark ? "0 12px 26px rgba(0,0,0,0.45)" : "0 12px 26px rgba(17,24,39,0.09)",
      backgroundColor: surfaceBg,
    },
    tableContainer: { overflowX: "auto" },
    table: { minWidth: 600 },
    tableHeadCell: {
      fontWeight: 700, color: textMuted,
      fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.07em",
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : alpha(primary, 0.04),
      borderBottom: `1px solid ${divider}`,
      padding: theme.spacing(1.25),
    },
    tableRow: { transition: "background-color 0.15s" },
    tableCell: {
      padding: theme.spacing(1.1),
      borderBottom: `1px solid ${divider}`,
      fontSize: "0.8rem", color: textSecond,
    },
    chipPaid: {
      backgroundColor: alpha(success, isDark ? 0.22 : 0.14),
      color: isDark ? "#4ade80" : "#15803d",
      border: `1px solid ${alpha(success, 0.30)}`,
      fontWeight: 700, fontSize: "0.7rem",
    },
    chipPending: {
      backgroundColor: alpha(warning, isDark ? 0.22 : 0.12),
      color: isDark ? "#fbbf24" : "#b45309",
      border: `1px solid ${alpha(warning, 0.30)}`,
      fontWeight: 700, fontSize: "0.7rem",
    },
    chipOverdue: {
      backgroundColor: alpha(danger, isDark ? 0.22 : 0.10),
      color: isDark ? "#f87171" : "#dc2626",
      border: `1px solid ${alpha(danger, 0.28)}`,
      fontWeight: 700, fontSize: "0.7rem",
    },
    paymentButton: {
      borderRadius: 10, textTransform: "none",
      fontWeight: 700, fontSize: "0.74rem", minHeight: 34,
      color: "#fff",
      background: `linear-gradient(135deg, ${primary} 0%, ${alpha("#0ea5e9", 0.9)} 100%)`,
      boxShadow: `0 3px 12px ${alpha(primary, 0.35)}`,
      transition: "transform 0.18s, box-shadow 0.18s",
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: `0 6px 18px ${alpha(primary, 0.45)}`,
      },
    },
    paidButton: {
      borderRadius: 10, textTransform: "none",
      fontWeight: 700, fontSize: "0.74rem", minHeight: 34,
      color: isDark ? "#4ade80" : "#15803d",
      borderColor: isDark ? "#4ade80" : "#15803d",
    },
    cardGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: theme.spacing(2.5),
      padding: theme.spacing(2, 0),
      [theme.breakpoints.down("xs")]: { gridTemplateColumns: "1fr" },
    },
    billCard: {
      borderRadius: 14,
      border: `1px solid ${border}`,
      backgroundColor: surfaceBg,
      boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.30)" : "0 4px 16px rgba(15,23,42,0.08)",
    },
    cardHeader: { paddingBottom: 0 },
    cardAvatar: {
      backgroundColor: alpha(primary, isDark ? 0.22 : 0.12),
      color: primary,
      border: `1.5px solid ${alpha(primary, isDark ? 0.28 : 0.18)}`,
    },
    cardTitle: { fontSize: "0.9rem", fontWeight: 700, color: textPrimary },
    cardSubheader: { fontSize: "0.72rem", color: textMuted },
    statusDivider: { margin: theme.spacing(2, 0), borderColor: divider },
    detailsGrid: {
      display: "grid", gridTemplateColumns: "1fr 1fr",
      gap: theme.spacing(1.5), marginTop: theme.spacing(1.5),
    },
    detailItem: { display: "flex", alignItems: "center", marginBottom: theme.spacing(0.5) },
    detailIcon: { marginRight: theme.spacing(0.8), color: primary, fontSize: 16 },
    bodyTextSm: { fontSize: "0.78rem", color: textSecond },
    amountText: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "1.1rem", fontWeight: 700, color: primary,
      display: "flex", alignItems: "center", gap: 4,
    },
    sectionLabel: {
      fontSize: 11, color: textMuted, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.09em",
    },
    mobileView: {
      display: "none",
      [theme.breakpoints.down("sm")]: { display: "block" },
    },
    desktopView: {
      display: "block",
      [theme.breakpoints.down("sm")]: { display: "none" },
    },
  };
});

/* ══════════════════════════════════════════════════════════════════════════ */
const Invoices = () => {
  const classes = useStyles();
  const theme   = useTheme();
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";

  const { user } = useContext(AuthContext);

  const [loading, setLoading]                     = useState(false);
  const [pageNumber, setPageNumber]               = useState(1);
  const [hasMore, setHasMore]                     = useState(false);
  const [searchParam]                             = useState("");
  const [invoices, dispatch]                      = useReducer(reducer, []);
  const [storagePlans, setStoragePlans]           = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen]   = useState(false);
  const [companyPlan, setCompanyPlan]             = useState(null);

  const border  = isDark ? "rgba(255,255,255,0.065)" : "#e3eaf2";
  const divider = isDark ? "rgba(255,255,255,0.055)" : "#e8eef4";
  const success = "#10b981";
  const warning = "#f59e0b";
  const danger  = "#ef4444";
  const purple  = "#8b5cf6";

  const handleOpenContactModal = (invoice) => {
    const invoiceWithPlanValue = {
      ...invoice,
      value: companyPlan?.amount ? parseFloat(companyPlan.amount) : invoice.value,
    };
    setStoragePlans(invoiceWithPlanValue);
    setSelectedContactId(null);
    setContactModalOpen(true);
  };
  const handleCloseContactModal = () => { setSelectedContactId(null); setContactModalOpen(false); };

  useEffect(() => { dispatch({ type: "RESET" }); setPageNumber(1); }, [searchParam]);

  useEffect(() => {
    const fetchCompanyPlan = async () => {
      try {
        if (user?.companyId) {
          const companyRes = await api.get(`/companies/${user.companyId}`);
          const company = companyRes.data;
          if (company?.planId) {
            const planRes = await api.get(`/plans/${company.planId}`);
            setCompanyPlan(planRes.data);
          }
        }
      } catch (err) { toastError(err); }
    };
    fetchCompanyPlan();
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const delay = setTimeout(async () => {
      try {
        const { data } = await api.get("/invoices/all", { params: { searchParam, pageNumber } });
        dispatch({ type: "LOAD_INVOICES", payload: data });
        setHasMore(data.hasMore);
        setLoading(false);
      } catch (err) { toastError(err); }
    }, 500);
    return () => clearTimeout(delay);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    window.addEventListener("error", (e) => console.error("Erro global capturado:", e.message, e.error));
  }, []);

  /* ── Cabeçalho — reescrito com MUI v5 sx, idêntico ao FileLists ── */
  const HeroHeader = ({ subtitle, invoiceCount, planName }) => (
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
            Financeiro
          </MuiTypography>
          <MuiBox sx={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: isDark ? muiAlpha(primary, 0.5) : muiAlpha("#fff", 0.45) }} />
          <MuiTypography sx={{
            fontSize: { xs: 10, sm: 11 }, fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: isDark ? muiAlpha("#fff", 0.5) : muiAlpha("#fff", 0.55),
          }}>
            Faturas
          </MuiTypography>
        </Stack>

        {/* Título */}
        <MuiTypography sx={{
          fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
          letterSpacing: "-0.025em", lineHeight: 1,
          color: isDark ? "#f0f4f8" : "#ffffff",
        }}>
          Faturas
        </MuiTypography>

        {/* Subtítulo */}
        <MuiTypography sx={{
          fontSize: { xs: 12, sm: 13.5 }, mt: 0.6,
          color: isDark ? "#4d6478" : muiAlpha("#fff", 0.72),
          display: { xs: "none", sm: "block" },
        }}>
          {subtitle}
        </MuiTypography>

        {/* Meta tags */}
        <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.2, sm: 1.5 }, flexWrap: "wrap", gap: 0.8 }}>
          {[
            { icon: <FiberManualRecordIcon style={{ fontSize: 8 }} />,     label: "Atualizado agora" },
            { icon: <ReceiptIcon           style={{ fontSize: 12 }} />,    label: `${invoiceCount} faturas` },
            { icon: <AccountBalanceWalletIcon style={{ fontSize: 12 }} />, label: planName },
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

  /* ── loading fallback ── */
  if (!user || !user.companyId || !companyPlan) {
    return (
      <div className={`inv-root ${classes.pageRoot}`}>
        <FontStyle />
        <HeroHeader
          subtitle="Carregando dados financeiros da sua conta."
          invoiceCount={0}
          planName="Plano atual"
        />
        <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
          <CircularProgress style={{ color: primary }} />
        </Box>
      </div>
    );
  }

  const loadMore     = () => setPageNumber((p) => p + 1);
  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) loadMore();
  };

  const rowStyle = (record) => {
    const hoje = moment().format("DD/MM/yyyy");
    const venc = moment(record.dueDate).format("DD/MM/yyyy");
    const dias = moment.duration(moment(venc, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"))).asDays();
    if (dias < 0 && record.status !== "paid")
      return { backgroundColor: isDark ? "rgba(239,68,68,0.06)" : "rgba(255,188,188,0.15)" };
  };

  const getInvoiceStatus = (record) => {
    const hoje = moment().format("DD/MM/yyyy");
    const venc = moment(record.dueDate).format("DD/MM/yyyy");
    const dias = moment.duration(moment(venc, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"))).asDays();
    if (record.status === "paid") return { text: "Pago",      chip: classes.chipPaid,    icon: <CheckCircleIcon fontSize="small" /> };
    if (dias < 0)                 return { text: "Vencido",   chip: classes.chipOverdue, icon: <ErrorIcon fontSize="small" /> };
    return                               { text: "Em Aberto", chip: classes.chipPending, icon: <HourglassEmptyIcon fontSize="small" /> };
  };

  const renderDaysLeft = (record) => {
    if (record.status === "paid") return null;
    const hoje = moment().format("DD/MM/yyyy");
    const venc = moment(record.dueDate).format("DD/MM/yyyy");
    const dias = moment.duration(moment(venc, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"))).asDays();
    if (dias < 0)   return `Vencido há ${Math.abs(Math.floor(dias))} dias`;
    if (dias === 0) return "Vence hoje";
    return `Vence em ${Math.floor(dias)} dias`;
  };

  const paidCount    = invoices.filter(i => i.status === "paid").length;
  const overdueCount = invoices.filter(i => {
    const dias = moment.duration(
      moment(moment(i.dueDate).format("DD/MM/yyyy"), "DD/MM/yyyy")
        .diff(moment(moment().format("DD/MM/yyyy"), "DD/MM/yyyy"))
    ).asDays();
    return dias < 0 && i.status !== "paid";
  }).length;

  const kpiCards = [
    { title: "Total de faturas", value: invoices.length, hint: "No período",           color: primary, bg: alpha(primary, isDark ? 0.16 : 0.09), icon: <ReceiptIcon style={{ fontSize: 23 }} /> },
    { title: "Pagas",            value: paidCount,       hint: "Quitadas com sucesso", color: success, bg: alpha(success, isDark ? 0.16 : 0.09), icon: <CheckCircleIcon style={{ fontSize: 23 }} /> },
    { title: "Vencidas",         value: overdueCount,    hint: "Requerem atenção",     color: danger,  bg: alpha(danger,  isDark ? 0.16 : 0.09), icon: <ErrorIcon style={{ fontSize: 23 }} /> },
    { title: "Valor do plano",   value: companyPlan?.amount
        ? parseFloat(companyPlan.amount).toLocaleString("pt-br", { style: "currency", currency: "BRL" })
        : "—",                                           hint: companyPlan?.name || "Plano atual", color: purple, bg: alpha(purple, isDark ? 0.16 : 0.09), icon: <AccountBalanceWalletIcon style={{ fontSize: 23 }} /> },
  ];

  const renderMobileCards = () => {
    if (loading && invoices.length === 0)
      return <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>;

    return (
      <div className={classes.cardGrid}>
        {invoices.map((invoice) => {
          const statusInfo = getInvoiceStatus(invoice);
          return (
            <Card key={invoice.id} className={`inv-bill-card ${classes.billCard}`} elevation={0}>
              <CardHeader
                className={classes.cardHeader}
                avatar={<Avatar className={classes.cardAvatar}><ReceiptIcon /></Avatar>}
                title={<Typography className={classes.cardTitle}>{invoice.detail}</Typography>}
                subheader={<Typography className={classes.cardSubheader}>ID: {invoice.id}</Typography>}
              />
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Chip icon={statusInfo.icon} label={statusInfo.text} className={statusInfo.chip} size="small" />
                  <Typography variant="body2" style={{ fontSize: "0.72rem", color: isDark ? "#4d6478" : "#8fa0b0" }}>
                    {renderDaysLeft(invoice)}
                  </Typography>
                </Box>

                <Divider className={classes.statusDivider} />

                <div className={classes.detailsGrid}>
                  {[
                    { icon: <PersonIcon />,    label: `${companyPlan?.users} usuários` },
                    { icon: <DevicesIcon />,   label: `${companyPlan?.connections} conexões` },
                    { icon: <QueueIcon />,     label: `${companyPlan?.queues} filas` },
                    { icon: <DateRangeIcon />, label: moment(invoice.dueDate).format("DD/MM/YYYY") },
                  ].map((d, i) => (
                    <div key={i} className={classes.detailItem}>
                      <span className={classes.detailIcon}>{d.icon}</span>
                      <Typography className={classes.bodyTextSm}>{d.label}</Typography>
                    </div>
                  ))}
                </div>

                <Box mt={2.5}>
                  <Typography className={`mono ${classes.amountText}`}>
                    {companyPlan?.amount
                      ? parseFloat(companyPlan.amount).toLocaleString("pt-br", { style: "currency", currency: "BRL" })
                      : invoice.value.toLocaleString("pt-br", { style: "currency", currency: "BRL" })}
                  </Typography>
                </Box>

                <Box mt={2.5} display="flex" justifyContent="flex-end">
                  {statusInfo.text !== "Pago" ? (
                    <Button variant="contained" className={classes.paymentButton}
                      startIcon={<PaymentIcon />} onClick={() => handleOpenContactModal(invoice)}>
                      PAGAR AGORA
                    </Button>
                  ) : (
                    <Button variant="outlined" className={classes.paidButton} startIcon={<CheckCircleIcon />}>
                      PAGO
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`inv-root ${classes.pageRoot}`}>
      <FontStyle />

      <SubscriptionModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        Invoice={storagePlans}
        contactId={selectedContactId}
      />

      {/* ══ CABEÇALHO — MUI v5 sx, idêntico ao FileLists ═════════════════ */}
      <HeroHeader
        subtitle="Acompanhe status, vencimentos e pagamentos em um painel financeiro único."
        invoiceCount={invoices.length}
        planName={companyPlan?.name || "Plano atual"}
      />

      {/* ══ CONTEÚDO ═══════════════════════════════════════════════════════ */}
      <Box className={classes.contentArea}>

        {/* ── KPI Cards ── */}
        <Grid container spacing={2} style={{ marginBottom: 16 }}>
          {kpiCards.map((card, i) => (
            <Grid item xs={6} sm={3} md={3} key={i}>
              <Paper
                elevation={0}
                className={`inv-animate kpi-card-inv ${classes.kpiCard}`}
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
                        color: isDark ? "#f0f4f8" : "#0d1b2a",
                        fontSize: typeof card.value === "string" ? (card.value.length > 8 ? 20 : 28) : undefined,
                      }}
                    >
                      {typeof card.value === "number" ? card.value.toLocaleString("pt-BR") : card.value}
                    </Typography>
                  </Box>
                  <Box
                    className="kpi-icon-box-inv"
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
            </Grid>
          ))}
        </Grid>

        {/* ── Tabela / Cards ── */}
        <Paper
          className={`inv-animate ${classes.mainPaper}`}
          variant="outlined"
          onScroll={handleScroll}
          style={{ animationDelay: "240ms" }}
        >
          <Box style={{
            padding: "14px 18px 10px",
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.055)" : "#e8eef4"}`,
            backgroundColor: isDark ? alpha("#000", 0.15) : alpha(primary, 0.015),
          }}>
            <Typography className={classes.sectionLabel}>Histórico financeiro</Typography>
            <Typography style={{ fontSize: 14.5, color: isDark ? "#f0f4f8" : "#0d1b2a", fontWeight: 700, marginTop: 2 }}>
              Faturas
            </Typography>
          </Box>

          <Box className={classes.mobileView} style={{ padding: "0 16px 16px" }}>
            {renderMobileCards()}
          </Box>

          <Box className={classes.desktopView}>
            <div className={classes.tableContainer}>
              <Table className={classes.table} size="small">
                <TableHead>
                  <TableRow>
                    {[
                      { label: "Detalhes",   icon: <InfoIcon fontSize="small" />,      align: "left"   },
                      { label: "Usuários",   icon: <PersonIcon fontSize="small" />,    align: "center" },
                      { label: "Conexões",   icon: <DevicesIcon fontSize="small" />,   align: "center" },
                      { label: "Filas",      icon: <QueueIcon fontSize="small" />,     align: "center" },
                      { label: "Valor",      icon: <MoneyIcon fontSize="small" />,     align: "center" },
                      { label: "Vencimento", icon: <DateRangeIcon fontSize="small" />, align: "center" },
                      { label: "Status",     icon: null,                               align: "center" },
                      { label: "Ação",       icon: null,                               align: "center" },
                    ].map((h) => (
                      <TableCell key={h.label} align={h.align} className={classes.tableHeadCell}>
                        {h.icon ? (
                          <Tooltip title={h.label}>
                            <Box display="flex" alignItems="center" justifyContent={h.align === "center" ? "center" : "flex-start"} style={{ gap: 6 }}>
                              {h.icon}{h.label}
                            </Box>
                          </Tooltip>
                        ) : h.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {invoices.map((invoice) => {
                    const statusInfo = getInvoiceStatus(invoice);
                    return (
                      <TableRow key={invoice.id} style={rowStyle(invoice)} className={`inv-row ${classes.tableRow}`}>
                        <TableCell className={classes.tableCell}>{companyPlan.name}</TableCell>
                        <TableCell className={classes.tableCell} align="center" style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>
                          {companyPlan?.users}
                        </TableCell>
                        <TableCell className={classes.tableCell} align="center" style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>
                          {companyPlan?.connections}
                        </TableCell>
                        <TableCell className={classes.tableCell} align="center" style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>
                          {companyPlan?.queues}
                        </TableCell>
                        <TableCell className={classes.tableCell} align="center" style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: isDark ? "#f0f4f8" : "#0d1b2a" }}>
                          {companyPlan?.amount
                            ? parseFloat(companyPlan.amount).toLocaleString("pt-br", { style: "currency", currency: "BRL" })
                            : invoice.value.toLocaleString("pt-br", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className={classes.tableCell} align="center">
                          <Box display="flex" flexDirection="column" alignItems="center">
                            <Typography style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem", fontWeight: 600 }}>
                              {moment(invoice.dueDate).format("DD/MM/YYYY")}
                            </Typography>
                            <Typography style={{ fontSize: "0.7rem", color: isDark ? "#4d6478" : "#8fa0b0", marginTop: 1 }}>
                              {renderDaysLeft(invoice)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell className={classes.tableCell} align="center">
                          <Chip icon={statusInfo.icon} label={statusInfo.text} className={statusInfo.chip} size="small" />
                        </TableCell>
                        <TableCell className={classes.tableCell} align="center">
                          {statusInfo.text !== "Pago" ? (
                            <Button size="small" variant="contained" className={classes.paymentButton}
                              startIcon={<PaymentIcon />} onClick={() => handleOpenContactModal(invoice)}>
                              PAGAR
                            </Button>
                          ) : (
                            <Button size="small" variant="outlined" className={classes.paidButton} startIcon={<CheckCircleIcon />}>
                              PAGO
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {loading && <TableRowSkeleton columns={8} />}
                </TableBody>
              </Table>
            </div>
          </Box>
        </Paper>

      </Box>
    </div>
  );
};

export default Invoices;
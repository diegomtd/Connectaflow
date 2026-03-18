import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Box,
  Chip,
  makeStyles,
} from "@material-ui/core";
import { alpha, useTheme } from "@material-ui/core/styles";
import { Save, CloudUpload, DeleteOutline } from "@material-ui/icons";
import FiberManualRecordIcon  from "@material-ui/icons/FiberManualRecord";
import SecurityIcon           from "@material-ui/icons/Security";
import TuneIcon               from "@material-ui/icons/Tune";
import EmailIcon              from "@material-ui/icons/Email";
import TimerIcon              from "@material-ui/icons/Timer";
import ImageIcon              from "@material-ui/icons/Image";
import PaymentIcon            from "@material-ui/icons/Payment";
import { toast } from "react-toastify";

// ── MUI v5 — apenas para o cabeçalho (igual ao FileLists / Invoices / SettingsCustom) ──
import {
  Box as MuiBox,
  Stack,
  Typography as MuiTypography,
  Chip as MuiChip,
  alpha as muiAlpha,
} from "@mui/material";

import api from "../../services/api";
import toastError from "../../errors/toastError";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .gc-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .gc-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    code { font-family: 'JetBrains Mono', monospace !important; font-size: 0.78em; }

    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .gc-animate { animation: fadeSlideUp 0.36s ease both; }

    .gc-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .gc-root ::-webkit-scrollbar-track { background: transparent; }
    .gc-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  `}</style>
);

/* ─── makeStyles ──────────────────────────────────────────────────────────── */
const useStyles = makeStyles((theme) => {
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";

  const pageBg    = isDark ? "#080e1a" : "#f0f4f8";
  const surfaceBg = isDark ? "#0f1929" : "#ffffff";
  const border    = isDark ? "rgba(255,255,255,0.065)" : "#e3eaf2";
  const divider   = isDark ? "rgba(255,255,255,0.055)" : "#e8eef4";
  const textPrimary = isDark ? "#f0f4f8" : "#0d1b2a";
  const textSecond  = isDark ? "#8fa4be" : "#3d5166";
  const textMuted   = isDark ? "#4d6478" : "#8fa0b0";

  return {
    pageRoot: {
      flex: 1, width: "100%", maxWidth: "100%",
      height: "calc(100% - 48px)", display: "flex", flexDirection: "column",
      backgroundColor: pageBg, transition: "background-color 0.3s ease",
      [theme.breakpoints.down("sm")]: { padding: 0 },
    },
    pageWrap: {
      width: "100%", maxWidth: "100%",
      display: "flex", flexDirection: "column", flex: 1, minHeight: 0,
    },
    contentArea: {
      padding: theme.spacing(2, 2.5, 2.5),
      display: "flex", flexDirection: "column", flex: 1, minHeight: 0,
      [theme.breakpoints.down("sm")]: { padding: theme.spacing(1.5, 1, 1.5) },
    },
    tabsShell: {
      borderRadius: 12, border: `1px solid ${border}`,
      backgroundColor: isDark ? alpha("#000", 0.3) : alpha(primary, 0.04),
      padding: theme.spacing(0.5), marginBottom: theme.spacing(2), flexShrink: 0,
    },
    tabsRoot: {
      minHeight: 40,
      "& .MuiTabs-indicator": { display: "none" },
      "& .MuiTab-root": {
        minHeight: 36, borderRadius: 8,
        textTransform: "none", fontWeight: 500, fontSize: "0.8rem",
        color: textMuted, transition: "all 0.18s ease",
        padding: "0 14px", marginRight: 3,
        fontFamily: "'DM Sans', sans-serif",
      },
      "& .Mui-selected": {
        color: "#fff", backgroundColor: primary, fontWeight: 600,
        boxShadow: `0 1px 6px ${alpha(primary, 0.30)}, inset 0 1px 0 ${alpha("#fff", 0.12)}`,
      },
    },
    mainPaper: {
      ...theme.scrollbarStyles,
      overflow: "hidden", display: "flex", flexDirection: "column",
      flex: 1, minHeight: 0, borderRadius: 14, border: `1px solid ${border}`,
      backgroundColor: surfaceBg,
      boxShadow: isDark ? "0 12px 26px rgba(0,0,0,0.45)" : "0 12px 26px rgba(17,24,39,0.09)",
    },
    sectionHeader: {
      padding: "14px 18px 10px",
      borderBottom: `1px solid ${divider}`,
      backgroundColor: isDark ? alpha("#000", 0.15) : alpha(primary, 0.015),
      flexShrink: 0,
    },
    sectionLabel: {
      fontSize: 11, color: textMuted, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.09em",
    },
    sectionTitleText: { fontSize: 14.5, color: textPrimary, fontWeight: 700, marginTop: 2 },
    panelPaper: {
      ...theme.scrollbarStyles,
      overflowY: "auto", flex: 1, minHeight: 0,
      padding: theme.spacing(2.5, 3), width: "100%",
      backgroundColor: "transparent",
    },
    form: { display: "flex", flexDirection: "column", height: "100%" },
    textField: {
      marginBottom: theme.spacing(2),
      "& .MuiOutlinedInput-root": {
        borderRadius: 10,
        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.018)",
        "& fieldset": { borderColor: isDark ? "rgba(255,255,255,0.12)" : "#dbe4ed" },
        "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8" },
        "&.Mui-focused fieldset": { borderColor: primary, borderWidth: "1.5px" },
      },
      "& .MuiInputLabel-root": { color: textMuted, fontSize: "0.92rem" },
      "& .MuiInputBase-input": { fontSize: "0.92rem", color: textPrimary, padding: "18px 14px" },
      "& .MuiInputLabel-outlined": { transform: "translate(14px, 18px) scale(1)" },
      "& .MuiInputLabel-outlined.MuiInputLabel-shrink": { transform: "translate(14px, -6px) scale(0.75)" },
      "& .MuiFormHelperText-root": { fontSize: "0.72rem", color: textMuted },
    },
    helperText: {
      color: textMuted, fontSize: "0.76rem",
      marginTop: -theme.spacing(1), marginBottom: theme.spacing(2),
      lineHeight: 1.5,
    },
    saveButton: {
      minWidth: 140, borderRadius: 10, fontWeight: 700,
      textTransform: "none", fontSize: "0.85rem", color: "#fff",
      boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 3px 12px ${alpha(primary, 0.30)}`,
      transition: "transform 0.18s, box-shadow 0.18s",
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 6px 22px ${alpha(primary, 0.42)}`,
      },
    },
    actions: {
      marginTop: theme.spacing(3), display: "flex", justifyContent: "flex-end",
      borderTop: `1px solid ${divider}`, paddingTop: theme.spacing(2.5),
    },
    brandingPreviewImg: {
      maxWidth: "100%", maxHeight: 120, borderRadius: 10,
      boxShadow: isDark ? "0 4px 14px rgba(0,0,0,0.35)" : "0 2px 10px rgba(0,0,0,0.12)",
      objectFit: "contain", border: `1px solid ${border}`,
      backgroundColor: isDark ? alpha("#fff", 0.03) : "#fafafa",
    },
    uploadButton: {
      marginTop: theme.spacing(1), marginBottom: theme.spacing(1),
      borderRadius: 10, textTransform: "none", fontWeight: 600, fontSize: "0.78rem",
      borderColor: border, color: textSecond, transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha(primary, 0.45), color: primary,
        backgroundColor: alpha(primary, isDark ? 0.08 : 0.04),
      },
    },
    removeButton: {
      marginTop: theme.spacing(1), marginBottom: theme.spacing(1),
      borderRadius: 10, textTransform: "none", fontWeight: 600, fontSize: "0.78rem",
      borderColor: border, color: textMuted, transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha("#ef4444", 0.45), color: "#ef4444",
        backgroundColor: alpha("#ef4444", isDark ? 0.08 : 0.04),
      },
    },
    uploadActions: { display: "flex", alignItems: "center", gap: theme.spacing(1), flexWrap: "wrap" },
    subsectionTitle: {
      fontWeight: 700, fontSize: "0.9rem", color: textPrimary,
      marginBottom: theme.spacing(2), display: "flex", alignItems: "center", gap: 8,
    },
    subsectionIcon: { color: primary, fontSize: 18 },
    loadingWrapper: { display: "flex", justifyContent: "center", alignItems: "center", flex: 1 },
  };
});

/* ─── helper de URL ──────────────────────────────────────────────────────── */
const resolveImageUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  const base = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/+$/, "");
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${base}${path}`;
};

/* ── label de cada aba ── */
const TAB_META = [
  { label: "Mercado Pago",       sub: "Integração de pagamentos", icon: <PaymentIcon /> },
  { label: "E-mail (SMTP)",      sub: "Configurações de envio",   icon: <EmailIcon />   },
  { label: "Trial / Assinatura", sub: "Período de teste",         icon: <TimerIcon />   },
  { label: "Login / Capa",       sub: "Identidade visual",        icon: <ImageIcon />   },
];

/* ══════════════════════════════════════════════════════════════════════════ */
const GlobalConfig = () => {
  const classes = useStyles();
  const theme   = useTheme();
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";

  const [tab, setTab]         = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState({ loginLogo: false, loginBackground: false });
  const [removing,  setRemoving]  = useState({ loginLogo: false, loginBackground: false });

  const [config, setConfig] = useState({
    mpAccessToken: "", smtpHost: "", smtpPort: "", smtpSecure: "false",
    smtpUser: "", smtpPass: "", smtpFrom: "", trialExpiration: "",
    loginLogo: "", loginBackground: "", loginWhatsapp: "",
  });

  const handleTabChange = (_, v) => setTab(v);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "trialExpiration")
      return setConfig((p) => ({ ...p, [name]: value.replace(/\D/g, "") }));
    setConfig((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/global-config", config);
      toast.success("Configurações salvas com sucesso.");
    } catch (err) { toastError(err); }
    finally { setSaving(false); }
  };

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/global-config");
      setConfig((p) => ({
        ...p, ...data,
        trialExpiration: data.trialExpiration != null ? String(data.trialExpiration) : p.trialExpiration,
      }));
    } catch (err) { toastError(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleBrandingUpload = async (field, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("field", field);
    try {
      setUploading((p) => ({ ...p, [field]: true }));
      const { data } = await api.post("/global-config/upload", formData);
      const url = data?.url || data?.[field];
      if (url) setConfig((p) => ({ ...p, [field]: url }));
      toast.success("Imagem atualizada com sucesso.");
    } catch (err) { toastError(err); }
    finally { setUploading((p) => ({ ...p, [field]: false })); }
  };

  const handleBrandingRemove = async (field) => {
    try {
      setRemoving((p) => ({ ...p, [field]: true }));
      await api.post("/global-config/upload/remove", { field });
      setConfig((p) => ({ ...p, [field]: "" }));
      toast.success("Imagem removida com sucesso.");
    } catch (err) { toastError(err); }
    finally { setRemoving((p) => ({ ...p, [field]: false })); }
  };

  /* ── Cabeçalho reutilizável — MUI v5 sx ── */
  const HeroHeader = ({ subtitle, tabSub }) => (
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

      <MuiBox sx={{
        position: "relative", zIndex: 1,
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", flexWrap: "wrap", gap: "12px",
      }}>
        <MuiBox>
          {/* Breadcrumb */}
          <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: 0.8 }}>
            <MuiTypography sx={{
              fontSize: { xs: 10, sm: 11 }, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: isDark ? muiAlpha(primary, 0.8) : muiAlpha("#fff", 0.7),
            }}>
              Sistema
            </MuiTypography>
            <MuiBox sx={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: isDark ? muiAlpha(primary, 0.5) : muiAlpha("#fff", 0.45) }} />
            <MuiTypography sx={{
              fontSize: { xs: 10, sm: 11 }, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: isDark ? muiAlpha("#fff", 0.5) : muiAlpha("#fff", 0.55),
            }}>
              Config. Global
            </MuiTypography>
          </Stack>

          {/* Título */}
          <MuiTypography sx={{
            fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
            letterSpacing: "-0.025em", lineHeight: 1,
            color: isDark ? "#f0f4f8" : "#ffffff",
          }}>
            Configurações Globais da Plataforma
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
              { icon: <FiberManualRecordIcon style={{ fontSize: 8 }} />,  label: "Atualizado agora" },
              { icon: <TuneIcon              style={{ fontSize: 12 }} />, label: tabSub },
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

        {/* Chip Super Admin */}
        <MuiBox sx={{ display: "flex", alignItems: "flex-start", pt: { xs: 0, sm: 0.5 } }}>
          <MuiChip
            icon={<SecurityIcon style={{ fontSize: 14, color: isDark ? muiAlpha(primary, 0.9) : "#fff" }} />}
            label="Super Admin"
            sx={{
              height: 28, borderRadius: "8px", fontWeight: 700, fontSize: "0.72rem",
              backgroundColor: isDark ? muiAlpha(primary, 0.14) : muiAlpha("#fff", 0.15),
              color: isDark ? muiAlpha("#fff", 0.85) : "#fff",
              border: `1px solid ${isDark ? muiAlpha(primary, 0.22) : muiAlpha("#fff", 0.25)}`,
              backdropFilter: "blur(8px)",
              "& .MuiChip-label": { fontFamily: "'DM Sans', sans-serif" },
            }}
          />
        </MuiBox>
      </MuiBox>
    </MuiBox>
  );

  /* ── Loading fallback ── */
  if (loading) {
    return (
      <div className={`gc-root ${classes.pageRoot}`}>
        <FontStyle />
        <HeroHeader
          subtitle="Carregando configurações da plataforma…"
          tabSub="Aguarde"
        />
        <Box style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress style={{ color: primary }} />
        </Box>
      </div>
    );
  }

  return (
    <div className={`gc-root ${classes.pageRoot}`}>
      <FontStyle />
      <div className={classes.pageWrap}>

        {/* ══ CABEÇALHO — MUI v5 sx, idêntico ao FileLists / Invoices / SettingsCustom ══ */}
        <HeroHeader
          subtitle="Gerencie integrações, e-mail, período de trial e identidade visual do login."
          tabSub={TAB_META[tab].sub}
        />

        {/* ══ CONTEÚDO ═══════════════════════════════════════════════════ */}
        <Box className={`gc-animate ${classes.contentArea}`} style={{ animationDelay: "60ms" }}>

          {/* ── Tab bar ── */}
          <Paper elevation={0} className={classes.tabsShell}>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              scrollButtons="on"
              variant="scrollable"
              className={classes.tabsRoot}
            >
              {TAB_META.map((t) => (
                <Tab key={t.label} label={t.label} />
              ))}
            </Tabs>
          </Paper>

          {/* ── Paper principal ── */}
          <Paper className={classes.mainPaper} elevation={0}>

            <Box className={classes.sectionHeader}>
              <Typography className={classes.sectionLabel}>Configurações globais</Typography>
              <Typography className={classes.sectionTitleText}>
                {TAB_META[tab].label}
              </Typography>
            </Box>

            <Box className={classes.panelPaper}>
              <form onSubmit={handleSubmit} className={classes.form}>

                {/* ── ABA 0: MERCADO PAGO ── */}
                {tab === 0 && (
                  <>
                    <Typography className={classes.subsectionTitle}>
                      <PaymentIcon className={classes.subsectionIcon} />
                      Mercado Pago
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Access Token" name="mpAccessToken"
                          value={config.mpAccessToken} onChange={handleChange}
                          variant="outlined" fullWidth className={classes.textField}
                        />
                        <div className={classes.helperText}>
                          Use o Access Token do Mercado Pago da conta principal da plataforma.
                          As empresas clientes usarão sempre essa configuração.
                        </div>
                      </Grid>
                    </Grid>
                  </>
                )}

                {/* ── ABA 1: SMTP ── */}
                {tab === 1 && (
                  <>
                    <Typography className={classes.subsectionTitle}>
                      <EmailIcon className={classes.subsectionIcon} />
                      E-mail (SMTP)
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField label="Host" name="smtpHost" value={config.smtpHost}
                          onChange={handleChange} variant="outlined" fullWidth className={classes.textField} />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField label="Porta" name="smtpPort" value={config.smtpPort}
                          onChange={handleChange} variant="outlined" fullWidth className={classes.textField} />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField label="Secure (SSL/TLS)" name="smtpSecure" value={config.smtpSecure}
                          onChange={handleChange} variant="outlined" fullWidth className={classes.textField}
                          helperText={`"true" para conexão segura, "false" para STARTTLS/normal`} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField label="E-mail" name="smtpUser" value={config.smtpUser}
                          onChange={handleChange} variant="outlined" fullWidth className={classes.textField} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField label="Senha de app" name="smtpPass" value={config.smtpPass}
                          onChange={handleChange} variant="outlined" fullWidth
                          type="password" className={classes.textField} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField label="Remetente (FROM)" name="smtpFrom" value={config.smtpFrom}
                          onChange={handleChange} variant="outlined" fullWidth className={classes.textField}
                          helperText={`Exemplo: Sua empresa <suporte@gmail.com>`} />
                      </Grid>
                    </Grid>
                  </>
                )}

                {/* ── ABA 2: TRIAL ── */}
                {tab === 2 && (
                  <>
                    <Typography className={classes.subsectionTitle}>
                      <TimerIcon className={classes.subsectionIcon} />
                      Trial / Período de Teste
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField label="Dias de teste" name="trialExpiration"
                          value={config.trialExpiration} onChange={handleChange}
                          variant="outlined" fullWidth type="number"
                          inputProps={{ min: 1 }} className={classes.textField} />
                        <div className={classes.helperText}>
                          Quantidade de dias de teste que a empresa nova terá. Se vazio,
                          o sistema usa o valor padrão do .env (<code>APP_TRIALEXPIRATION</code>, ex.: 3).
                        </div>
                      </Grid>
                    </Grid>
                  </>
                )}

                {/* ── ABA 3: LOGIN / CAPA ── */}
                {tab === 3 && (
                  <>
                    <Typography className={classes.subsectionTitle}>
                      <ImageIcon className={classes.subsectionIcon} />
                      Login / Capa
                    </Typography>
                    <Grid container spacing={3}>

                      {/* Logo do login */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8 }}>
                          Logo do login
                        </Typography>
                        {config.loginLogo && (
                          <Box mt={1} mb={1.5}>
                            <img src={resolveImageUrl(config.loginLogo)} alt="Logo do login"
                              className={classes.brandingPreviewImg} />
                          </Box>
                        )}
                        <input id="loginLogoUpload" type="file" accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleBrandingUpload("loginLogo", e.target.files[0])} />
                        <div className={classes.uploadActions}>
                          <label htmlFor="loginLogoUpload">
                            <Button variant="outlined" component="span"
                              startIcon={<CloudUpload />} className={classes.uploadButton}
                              disabled={uploading.loginLogo}>
                              {uploading.loginLogo ? "Enviando…" : "Enviar logo"}
                            </Button>
                          </label>
                          <Button variant="outlined" startIcon={<DeleteOutline />}
                            className={classes.removeButton}
                            disabled={!config.loginLogo || removing.loginLogo}
                            onClick={() => handleBrandingRemove("loginLogo")}>
                            {removing.loginLogo ? "Removendo…" : "Remover"}
                          </Button>
                        </div>
                        <div className={classes.helperText}>
                          Se nenhuma imagem for enviada, o sistema usa <code>/logo.png</code>.
                        </div>
                      </Grid>

                      {/* Capa / background do login */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8 }}>
                          Imagem de fundo (capa do login)
                        </Typography>
                        {config.loginBackground && (
                          <Box mt={1} mb={1.5}>
                            <img src={resolveImageUrl(config.loginBackground)} alt="Capa do login"
                              className={classes.brandingPreviewImg} />
                          </Box>
                        )}
                        <input id="loginBackgroundUpload" type="file" accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleBrandingUpload("loginBackground", e.target.files[0])} />
                        <div className={classes.uploadActions}>
                          <label htmlFor="loginBackgroundUpload">
                            <Button variant="outlined" component="span"
                              startIcon={<CloudUpload />} className={classes.uploadButton}
                              disabled={uploading.loginBackground}>
                              {uploading.loginBackground ? "Enviando…" : "Enviar capa"}
                            </Button>
                          </label>
                          <Button variant="outlined" startIcon={<DeleteOutline />}
                            className={classes.removeButton}
                            disabled={!config.loginBackground || removing.loginBackground}
                            onClick={() => handleBrandingRemove("loginBackground")}>
                            {removing.loginBackground ? "Removendo…" : "Remover"}
                          </Button>
                        </div>
                        <div className={classes.helperText}>
                          Recomendada imagem em <code>.webp</code> ou <code>.jpg</code>.
                          Se vazio, o sistema usa a capa padrão.
                        </div>
                      </Grid>

                      {/* Link WhatsApp */}
                      <Grid item xs={12} md={6}>
                        <TextField label="Link do WhatsApp do login" name="loginWhatsapp"
                          value={config.loginWhatsapp} onChange={handleChange}
                          variant="outlined" fullWidth className={classes.textField}
                          helperText={`Exemplo: https://wa.me/5541999999999`} />
                      </Grid>
                    </Grid>
                  </>
                )}

                {/* ── Botão salvar ── */}
                <div className={classes.actions}>
                  <Button
                    type="submit" color="primary" variant="contained"
                    className={classes.saveButton}
                    startIcon={!saving && <Save />}
                    disabled={saving}
                  >
                    {saving ? <CircularProgress size={18} style={{ color: "#fff" }} /> : "Salvar configurações"}
                  </Button>
                </div>

              </form>
            </Box>
          </Paper>

        </Box>
      </div>
    </div>
  );
};

export default GlobalConfig;
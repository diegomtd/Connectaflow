import React, { useEffect, useState, useContext, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";
import { useTheme as useMuiThemeV4 } from "@material-ui/core/styles";
import { FiberManualRecord, Tune } from "@mui/icons-material";

import api from "../../services/api";
import usePlans from "../../hooks/usePlans";
import { i18n } from "../../translate/i18n";
import ForbiddenPage from "../../components/ForbiddenPage";
import { AuthContext } from "../../context/Auth/AuthContext";

/* ─── Estilos globais (idênticos ao Dashboard) ───────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .cc-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .cc-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .cc-root { max-width: 100%; overflow-x: hidden; }

    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .cc-animate { animation: fadeSlideUp 0.36s ease both; }

    .cc-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .cc-root ::-webkit-scrollbar-track { background: transparent; }
    .cc-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
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
    const success = "#10b981", warning = "#f59e0b";

    const t = isDark ? {
      pageBg:      "#080e1a",
      surfaceBg:   "#0f1929",
      surfaceBg2:  "#141f30",
      border:      "rgba(255,255,255,0.065)",
      divider:     "rgba(255,255,255,0.055)",
      textPrimary: "#f0f4f8",
      textSecond:  "#8fa4be",
      textMuted:   "#4d6478",
      cardBg:      "#121e2e",
      inputBg:     "rgba(255,255,255,0.04)",
      inputBorder: "rgba(255,255,255,0.12)",
      inputHover:  "rgba(255,255,255,0.22)",
    } : {
      pageBg:      "#f0f4f8",
      surfaceBg:   "#ffffff",
      surfaceBg2:  "#fafbfd",
      border:      "#e3eaf2",
      divider:     "#e8eef4",
      textPrimary: "#0d1b2a",
      textSecond:  "#3d5166",
      textMuted:   "#8fa0b0",
      cardBg:      "#fafbfc",
      inputBg:     "rgba(0,0,0,0.018)",
      inputBorder: "#dbe4ed",
      inputHover:  "#a8b8c8",
    };

    return {
      primary, isDark, ...t,
      chipBg:    alpha(primary, isDark ? 0.18 : 0.10),
      chipColor: primary,
      success, warning,
    };
  }, [primary, isDark]);
};

/* ─── Estado inicial ─────────────────────────────────────────────────────── */
const initialSettings = {
  messageInterval:     20,
  longerIntervalAfter: 20,
  greaterInterval:     60,
  variables:           [],
  sabado:              "false",
  domingo:             "false",
  startHour:           "09:00",
  endHour:             "18:00",
};

/* ─── SelectField — visual Dashboard ─────────────────────────────────────── */
const SelectField = ({ name, label, value, onChange, children, p }) => (
  <FormControl variant="outlined" fullWidth size="small">
    <InputLabel sx={{
      fontSize: 13,
      fontFamily: "'DM Sans', sans-serif",
      color: p.textMuted,
      "&.Mui-focused": { color: p.primary },
    }}>
      {label}
    </InputLabel>
    <Select
      name={name}
      id={name}
      labelId={`${name}-label`}
      label={label}
      value={value}
      onChange={onChange}
      sx={{
        fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
        borderRadius: "10px",
        backgroundColor: p.inputBg,
        color: p.textPrimary,
        "& .MuiOutlinedInput-notchedOutline": { borderColor: p.inputBorder },
        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: p.inputHover },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: p.primary, borderWidth: "1.5px" },
        "& .MuiSvgIcon-root": { color: p.textMuted },
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            backgroundColor: p.surfaceBg,
            border: `1px solid ${p.border}`,
            borderRadius: "12px",
            boxShadow: `0 8px 24px ${alpha("#000", isDark => isDark ? 0.4 : 0.12)}`,
            mt: 0.5,
            "& .MuiMenuItem-root": {
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              color: p.textSecond,
              "&:hover": { backgroundColor: alpha(p.primary, p.isDark ? 0.12 : 0.06) },
              "&.Mui-selected": {
                backgroundColor: alpha(p.primary, p.isDark ? 0.18 : 0.09),
                color: p.primary, fontWeight: 600,
                "&:hover": { backgroundColor: alpha(p.primary, p.isDark ? 0.24 : 0.13) },
              },
            },
          },
        },
      }}
    >
      {children}
    </Select>
  </FormControl>
);

/* ─── SettingCard — visual Dashboard ─────────────────────────────────────── */
const SettingCard = ({ label, hint, children, p, delay = 0 }) => (
  <Paper
    elevation={0}
    className="cc-animate"
    style={{ animationDelay: `${delay}ms` }}
    sx={{
      p: { xs: "14px 14px", sm: "18px 18px" },
      borderRadius: "14px",
      border: `1px solid ${p.border}`,
      backgroundColor: p.cardBg,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 1.2,
      transition: "box-shadow 0.22s, border-color 0.22s, transform 0.22s",
      "&:hover": {
        borderColor: alpha(p.primary, p.isDark ? 0.30 : 0.18),
        boxShadow: `0 6px 22px ${alpha(p.primary, p.isDark ? 0.12 : 0.07)}`,
        transform: "translateY(-2px)",
      },
    }}
  >
    {/* Label estilo SectionLabel do Dashboard */}
    <Typography sx={{
      fontSize: { xs: 9.5, sm: 11 }, fontWeight: 700,
      color: p.textMuted, textTransform: "uppercase", letterSpacing: "0.09em",
    }}>
      {label}
    </Typography>

    {children}

    {hint && (
      <Typography sx={{
        fontSize: 11, color: p.textMuted, mt: "auto", pt: 0.5, lineHeight: 1.5,
      }}>
        {hint}
      </Typography>
    )}
  </Paper>
);

/* ─── CampaignsConfig ────────────────────────────────────────────────────── */
const CampaignsConfig = () => {
  const p       = usePalette();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();

  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useCampaigns) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => history.push("/"), 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api.get("/campaign-settings").then(({ data }) => {
      if (Array.isArray(data) && data.length > 0) {
        const settingsList = data.map((item) => [item.key, item.value]);
        setSettings(Object.fromEntries(settingsList));
      }
    });
  }, []);

  const handleOnChangeSettings = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const saveSettings = async () => {
    await api.post("/campaign-settings", { settings });
    toast.success("Configurações salvas");
  };

  if (user.profile === "user") return <ForbiddenPage />;

  return (
    <Box
      className="cc-root"
      sx={{
        width: "100%",
        minHeight: "calc(100% - 48px)",
        py: 0, px: 0,
        backgroundColor: p.pageBg,
        transition: "background-color 0.3s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <FontStyle />

      {/* ══ CABEÇALHO CORPORATIVO (idêntico ao Dashboard) ══════════════════ */}
      <Box sx={{
        background: p.isDark
          ? `linear-gradient(135deg, #0d1b2e 0%, #0a1520 60%, ${alpha(p.primary, 0.12)} 100%)`
          : `linear-gradient(135deg, ${p.primary} 0%, ${alpha(p.primary, 0.82)} 55%, ${alpha("#0ea5e9", 0.9)} 100%)`,
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 2.5, sm: 3, md: 3.5 },
        pb: { xs: 2, sm: 2.5, md: 3 },
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
                Configurações
              </Typography>
            </Stack>

            {/* Título */}
            <Typography sx={{
              fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
              letterSpacing: "-0.025em", lineHeight: 1,
              color: p.isDark ? p.textPrimary : "#ffffff",
            }}>
              {i18n.t("campaignsConfig.title")}
            </Typography>

            {/* Subtítulo */}
            <Typography sx={{
              fontSize: { xs: 12, sm: 13.5 }, mt: 0.6,
              color: p.isDark ? p.textMuted : alpha("#fff", 0.72),
              display: { xs: "none", sm: "block" },
            }}>
              Ajuste intervalos e regras de envio para melhorar performance de campanhas.
            </Typography>

            {/* Meta-tags */}
            <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.2, sm: 1.5 }, flexWrap: "wrap", gap: 0.8 }}>
              {[
                { icon: <FiberManualRecord sx={{ fontSize: 8 }} />, label: "Atualizado agora" },
                { icon: <Tune sx={{ fontSize: 12 }} />,             label: "Parâmetros de disparo" },
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

      {/* ── Conteúdo abaixo do header ── */}
      <Box sx={{
        px: { xs: 1, sm: 1.5, md: 2.5 },
        py: { xs: 1.5, sm: 2, md: 2.5 },
        flex: 1, display: "flex", flexDirection: "column", minHeight: 0,
      }}>

        {/* ── Painel principal ── */}
        <Paper
          elevation={0}
          className="cc-animate"
          sx={{
            flex: 1,
            borderRadius: "16px",
            border: `1px solid ${p.border}`,
            backgroundColor: p.surfaceBg,
            p: { xs: "14px", sm: "20px", md: "28px" },
            overflowY: "auto",
            animationDelay: "80ms",
          }}
        >
          {/* Cabeçalho da seção — estilo Dashboard */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={1}
            sx={{
              mb: { xs: 2, sm: 2.5 },
              pb: { xs: 1.5, sm: 2 },
              borderBottom: `1px solid ${p.divider}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.2}>
              <Box sx={{
                width: 3, height: 22, borderRadius: "2px",
                backgroundColor: p.primary, flexShrink: 0,
                boxShadow: `0 0 8px ${alpha(p.primary, 0.45)}`,
              }} />
              <Box>
                <Typography sx={{
                  fontSize: { xs: 9.5, sm: 11 }, fontWeight: 700,
                  color: p.textMuted, textTransform: "uppercase",
                  letterSpacing: "0.09em", lineHeight: 1,
                }}>
                  Parâmetros
                </Typography>
                <Typography sx={{
                  fontSize: { xs: 14, sm: 15 }, fontWeight: 700,
                  color: p.textPrimary, lineHeight: 1.2, mt: 0.3,
                }}>
                  Intervalos de Disparo
                </Typography>
              </Box>
            </Stack>
            <Typography sx={{
              fontSize: 12, color: p.textMuted,
              display: { xs: "none", sm: "block" },
            }}>
              Configure os tempos entre envios para evitar bloqueios
            </Typography>
          </Stack>

          <Grid container spacing={{ xs: 1.5, sm: 2 }}>

            {/* Intervalo randômico */}
            <Grid item xs={12} md={4}>
              <SettingCard
                label={i18n.t("campaigns.settings.randomInterval")}
                hint="Tempo aleatório entre cada mensagem enviada"
                p={p}
                delay={100}
              >
                <SelectField
                  name="messageInterval"
                  label={i18n.t("campaigns.settings.randomInterval")}
                  value={settings.messageInterval}
                  onChange={handleOnChangeSettings}
                  p={p}
                >
                  <MenuItem value={0}>{i18n.t("campaigns.settings.noBreak")}</MenuItem>
                  <MenuItem value={5}>5 segundos</MenuItem>
                  <MenuItem value={10}>10 segundos</MenuItem>
                  <MenuItem value={15}>15 segundos</MenuItem>
                  <MenuItem value={20}>20 segundos</MenuItem>
                  <MenuItem value={30}>30 segundos</MenuItem>
                  <MenuItem value={60}>40 segundos</MenuItem>
                  <MenuItem value={70}>60 segundos</MenuItem>
                  <MenuItem value={80}>80 segundos</MenuItem>
                  <MenuItem value={100}>100 segundos</MenuItem>
                  <MenuItem value={120}>120 segundos</MenuItem>
                </SelectField>
              </SettingCard>
            </Grid>

            {/* Intervalo longo após N mensagens */}
            <Grid item xs={12} md={4}>
              <SettingCard
                label={i18n.t("campaigns.settings.intervalGapAfter")}
                hint="Após quantas mensagens aplicar pausa maior"
                p={p}
                delay={180}
              >
                <SelectField
                  name="longerIntervalAfter"
                  label={i18n.t("campaigns.settings.intervalGapAfter")}
                  value={settings.longerIntervalAfter}
                  onChange={handleOnChangeSettings}
                  p={p}
                >
                  <MenuItem value={0}>{i18n.t("campaigns.settings.undefined")}</MenuItem>
                  {[5, 10, 15, 20, 30, 40, 50, 60].map((v) => (
                    <MenuItem key={v} value={v}>
                      {v} {i18n.t("campaigns.settings.messages")}
                    </MenuItem>
                  ))}
                </SelectField>
              </SettingCard>
            </Grid>

            {/* Intervalo maior */}
            <Grid item xs={12} md={4}>
              <SettingCard
                label={i18n.t("campaigns.settings.laggerTriggerRange")}
                hint="Duração da pausa maior entre lotes de envio"
                p={p}
                delay={260}
              >
                <SelectField
                  name="greaterInterval"
                  label={i18n.t("campaigns.settings.laggerTriggerRange")}
                  value={settings.greaterInterval}
                  onChange={handleOnChangeSettings}
                  p={p}
                >
                  <MenuItem value={0}>{i18n.t("campaigns.settings.noBreak")}</MenuItem>
                  {[20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180].map((v) => (
                    <MenuItem key={v} value={v}>{v} segundos</MenuItem>
                  ))}
                </SelectField>
              </SettingCard>
            </Grid>

            {/* Botão salvar */}
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="flex-end" sx={{ pt: 0.5 }}>
                <Button
                  onClick={saveSettings}
                  variant="contained"
                  disableElevation
                  sx={{
                    position: "relative", overflow: "hidden",
                    backgroundColor: p.primary, color: "#fff",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700, fontSize: 13, textTransform: "none",
                    borderRadius: "10px", height: 40, px: 3.5,
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
                  {i18n.t("campaigns.settings.save")}
                </Button>
              </Stack>
            </Grid>

          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default CampaignsConfig;
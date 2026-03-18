import React, { useState, useEffect, useContext } from "react";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { makeStyles, alpha, useTheme } from "@material-ui/core/styles";
import { Paper, Tabs, Tab, Box, Typography, Chip } from "@material-ui/core";

import TabPanel from "../../components/TabPanel";
import SchedulesForm from "../../components/SchedulesForm";
import CompaniesManager from "../../components/CompaniesManager";
import PlansManager from "../../components/PlansManager";
import HelpsManager from "../../components/HelpsManager";
import Options from "../../components/Settings/Options";
import Whitelabel from "../../components/Settings/Whitelabel";

import { i18n } from "../../translate/i18n.js";
import { toast } from "react-toastify";

import useCompanies from "../../hooks/useCompanies";
import { AuthContext } from "../../context/Auth/AuthContext";

import OnlyForSuperUser from "../../components/OnlyForSuperUser";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import useSettings from "../../hooks/useSettings";
import ForbiddenPage from "../../components/ForbiddenPage/index.js";

import SettingsIcon          from "@material-ui/icons/Settings";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import BusinessIcon          from "@material-ui/icons/Business";

// ── MUI v5 — apenas para o cabeçalho (igual ao FileLists / Invoices) ──
import {
  Box as MuiBox,
  Stack,
  Typography as MuiTypography,
  Chip as MuiChip,
  alpha as muiAlpha,
} from "@mui/material";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .sc-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .sc-root .mono { font-family: 'JetBrains Mono', monospace !important; }

    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .sc-animate { animation: fadeSlideUp 0.36s ease both; }

    .sc-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .sc-root ::-webkit-scrollbar-track { background: transparent; }
    .sc-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
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
  const textMuted   = isDark ? "#4d6478" : "#8fa0b0";

  return {
    pageRoot: {
      flex: 1,
      width: "100%",
      maxWidth: "100%",
      height: "calc(100% - 48px)",
      display: "flex",
      flexDirection: "column",
      backgroundColor: pageBg,
      transition: "background-color 0.3s ease",
    },
    pageWrap: {
      width: "100%",
      maxWidth: "100%",
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minHeight: 0,
    },
    contentArea: {
      padding: theme.spacing(2, 2.5, 2.5),
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minHeight: 0,
      [theme.breakpoints.down("sm")]: { padding: theme.spacing(1.5, 1, 1.5) },
    },
    tabsShell: {
      borderRadius: 12,
      border: `1px solid ${border}`,
      backgroundColor: isDark ? alpha("#000", 0.3) : alpha(primary, 0.04),
      padding: theme.spacing(0.5),
      marginBottom: theme.spacing(2),
      flexShrink: 0,
    },
    tabsRoot: {
      minHeight: 40,
      "& .MuiTabs-indicator": { display: "none" },
      "& .MuiTab-root": {
        minHeight: 36,
        borderRadius: 8,
        textTransform: "none",
        fontWeight: 500,
        fontSize: "0.8rem",
        color: textMuted,
        transition: "all 0.18s ease",
        padding: "0 14px",
        marginRight: 3,
        fontFamily: "'DM Sans', sans-serif",
      },
      "& .Mui-selected": {
        color: "#fff",
        backgroundColor: primary,
        fontWeight: 600,
        boxShadow: `0 1px 6px ${alpha(primary, 0.30)}, inset 0 1px 0 ${alpha("#fff", 0.12)}`,
      },
    },
    mainPaper: {
      ...theme.scrollbarStyles,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minHeight: 0,
      borderRadius: 14,
      border: `1px solid ${border}`,
      backgroundColor: surfaceBg,
      boxShadow: isDark ? "0 12px 26px rgba(0,0,0,0.45)" : "0 12px 26px rgba(17,24,39,0.09)",
    },
    panelSectionHeader: {
      padding: "14px 18px 10px",
      borderBottom: `1px solid ${divider}`,
      backgroundColor: isDark ? alpha("#000", 0.15) : alpha(primary, 0.015),
      flexShrink: 0,
    },
    sectionLabel: {
      fontSize: 11, color: textMuted, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.09em",
    },
    sectionTitle: {
      fontSize: 14.5, color: textPrimary, fontWeight: 700, marginTop: 2,
    },
    panelPaper: {
      ...theme.scrollbarStyles,
      overflowY: "auto",
      flex: 1,
      minHeight: 0,
      padding: theme.spacing(2),
      width: "100%",
      backgroundColor: "transparent",
    },
    container: { width: "100%", maxHeight: "100%" },
  };
});

/* ══════════════════════════════════════════════════════════════════════════ */
const SettingsCustom = () => {
  const classes = useStyles();
  const theme   = useTheme();
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";

  const [tab, setTab]                           = useState("options");
  const [schedules, setSchedules]               = useState([]);
  const [company, setCompany]                   = useState({});
  const [loading, setLoading]                   = useState(false);
  const [currentUser, setCurrentUser]           = useState({});
  const [settings, setSettings]                 = useState({});
  const [oldSettings, setOldSettings]           = useState({});
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);

  const { find, updateSchedules }    = useCompanies();
  const { getAll: getAllSettings }    = useCompanySettings();
  const { getAll: getAllSettingsOld } = useSettings();
  const { user }                     = useContext(AuthContext);

  useEffect(() => {
    async function findData() {
      setLoading(true);
      try {
        const companyId      = user.companyId;
        const comp           = await find(companyId);
        const settingList    = await getAllSettings(companyId);
        const settingListOld = await getAllSettingsOld();

        setCompany(comp);
        setSchedules(comp.schedules);
        setSettings(settingList);
        setOldSettings(settingListOld);
        setSchedulesEnabled(settingList.scheduleType === "company");
        setCurrentUser(user);
      } catch (e) {
        toast.error(e);
      }
      setLoading(false);
    }
    findData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (event, newValue) => setTab(newValue);

  const handleSubmitSchedules = async (data) => {
    setLoading(true);
    try {
      setSchedules(data);
      await updateSchedules({ id: company.id, schedules: data });
      toast.success("Horários atualizados com sucesso.");
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  const isSuper = () => currentUser.super;

  const tabLabels = {
    options:    i18n.t("settings.tabs.options"),
    schedules:  "Horários",
    companies:  "Empresas",
    plans:      i18n.t("settings.tabs.plans"),
    helps:      i18n.t("settings.tabs.helps"),
    whitelabel: "Whitelabel",
  };

  return (
    <div className={`sc-root ${classes.pageRoot}`}>
      <FontStyle />

      {user.profile === "user" ? (
        <ForbiddenPage />
      ) : (
        <div className={classes.pageWrap}>

          {/* ══ CABEÇALHO — MUI v5 sx, idêntico ao FileLists / Invoices ══ */}
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
                    Configurações
                  </MuiTypography>
                </Stack>

                {/* Título */}
                <MuiTypography sx={{
                  fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
                  letterSpacing: "-0.025em", lineHeight: 1,
                  color: isDark ? "#f0f4f8" : "#ffffff",
                }}>
                  {i18n.t("settings.title")}
                </MuiTypography>

                {/* Subtítulo */}
                <MuiTypography sx={{
                  fontSize: { xs: 12, sm: 13.5 }, mt: 0.6,
                  color: isDark ? "#4d6478" : muiAlpha("#fff", 0.72),
                  display: { xs: "none", sm: "block" },
                }}>
                  Centralize preferências operacionais, automações e identidade visual da sua conta.
                </MuiTypography>

                {/* Meta tags */}
                <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.2, sm: 1.5 }, flexWrap: "wrap", gap: 0.8 }}>
                  {[
                    { icon: <FiberManualRecordIcon style={{ fontSize: 8 }} />, label: "Atualizado agora" },
                    { icon: <BusinessIcon          style={{ fontSize: 12 }} />, label: company?.name || "Empresa" },
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

              {/* Chip de perfil — canto direito */}
              <MuiBox sx={{ display: "flex", alignItems: "flex-start", pt: { xs: 0, sm: 0.5 } }}>
                <MuiChip
                  icon={isSuper()
                    ? <SupervisorAccountIcon style={{ fontSize: 14, color: isDark ? muiAlpha(primary, 0.9) : "#fff" }} />
                    : <BusinessIcon          style={{ fontSize: 14, color: isDark ? muiAlpha(primary, 0.9) : "#fff" }} />
                  }
                  label={isSuper() ? "Modo super admin" : "Configurações da empresa"}
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

          {/* ══ CONTEÚDO ════════════════════════════════════════════════ */}
          <Box className={`sc-animate ${classes.contentArea}`} style={{ animationDelay: "60ms" }}>

            {/* ── Tab bar ── */}
            <Paper elevation={0} className={classes.tabsShell}>
              <Tabs
                value={tab}
                scrollButtons="on"
                variant="scrollable"
                onChange={handleTabChange}
                className={classes.tabsRoot}
              >
                <Tab label={i18n.t("settings.tabs.options")} value="options" />
                {schedulesEnabled && <Tab label="Horários"  value="schedules" />}
                {isSuper() && <Tab label="Empresas"                      value="companies"  />}
                {isSuper() && <Tab label={i18n.t("settings.tabs.plans")} value="plans"      />}
                {isSuper() && <Tab label={i18n.t("settings.tabs.helps")} value="helps"      />}
                {isSuper() && <Tab label="Whitelabel"                    value="whitelabel" />}
              </Tabs>
            </Paper>

            {/* ── Paper principal ── */}
            <Paper elevation={0} className={classes.mainPaper}>

              <Box className={classes.panelSectionHeader}>
                <Typography className={classes.sectionLabel}>Configurações</Typography>
                <Typography className={classes.sectionTitle}>
                  {tabLabels[tab] || "Opções"}
                </Typography>
              </Box>

              <Box className={classes.panelPaper}>
                <TabPanel className={classes.container} value={tab} name="schedules">
                  <SchedulesForm
                    loading={loading}
                    onSubmit={handleSubmitSchedules}
                    initialValues={schedules}
                  />
                </TabPanel>

                <OnlyForSuperUser
                  user={currentUser}
                  yes={() => (
                    <>
                      <TabPanel className={classes.container} value={tab} name="companies">
                        <CompaniesManager />
                      </TabPanel>
                      <TabPanel className={classes.container} value={tab} name="plans">
                        <PlansManager />
                      </TabPanel>
                      <TabPanel className={classes.container} value={tab} name="helps">
                        <HelpsManager />
                      </TabPanel>
                      <TabPanel className={classes.container} value={tab} name="whitelabel">
                        <Whitelabel settings={oldSettings} />
                      </TabPanel>
                    </>
                  )}
                />

                <TabPanel className={classes.container} value={tab} name="options">
                  <Options
                    settings={settings}
                    oldSettings={oldSettings}
                    user={currentUser}
                    scheduleTypeChanged={(value) =>
                      setSchedulesEnabled(value === "company")
                    }
                  />
                </TabPanel>
              </Box>
            </Paper>

          </Box>
        </div>
      )}
    </div>
  );
};

export default SettingsCustom;
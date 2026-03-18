import React, { useEffect, useRef, useState, useContext } from "react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Tooltip, Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import brLocale from "date-fns/locale/pt-BR";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import {
  Button, Grid, TextField, Box, Typography, CircularProgress, alpha,
} from "@mui/material";
import { FilterAlt } from "@mui/icons-material";
import api from "../../services/api";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useTheme as useThemeV4 } from "@material-ui/core/styles";
import { useTheme as useThemeV5 } from "@mui/material/styles";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

/* ── helpers ── */
function hexToRgb(hex = "") {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map(x => x + x).join("");
  const r = parseInt(c.substr(0, 2), 16) || 25;
  const g = parseInt(c.substr(2, 2), 16) || 118;
  const b = parseInt(c.substr(4, 2), 16) || 210;
  return `${r},${g},${b}`;
}

/* ── DatePicker sx — cantos consistentes em light e dark ── */
function dpSx(isDark, primary) {
  const border    = isDark ? "rgba(255,255,255,0.12)" : "#dbe4ed";
  const borderHov = isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8";
  const bg        = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.018)";
  return {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px !important",
      fontSize: 13,
      fontFamily: "'DM Sans', sans-serif",
      backgroundColor: bg,
      overflow: "hidden",
      "& fieldset": { borderRadius: "10px !important", borderColor: border },
      "&:hover fieldset": { borderColor: borderHov },
      "&.Mui-focused fieldset": { borderColor: primary, borderWidth: "1.5px" },
    },
    "& .MuiInputLabel-root": { fontSize: 13, fontFamily: "'DM Sans', sans-serif" },
    "& .MuiInputLabel-root.Mui-focused": { color: primary },
    "& .MuiInputAdornment-root .MuiIconButton-root": {
      borderRadius: "8px",
      color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)",
      transition: "color 0.18s, background 0.18s",
      "&:hover": { color: primary, backgroundColor: alpha(primary, 0.1) },
    },
  };
}

/* ══ ChatsUser ═══════════════════════════════════════════════════════════════ */
export const ChatsUser = () => {
  const themeV4 = useThemeV4();
  const themeV5 = useThemeV5();
  const chartRef = useRef(null);

  const isDark    = themeV5?.palette?.mode === "dark" || themeV4?.palette?.type === "dark";
  const PRIMARY   = themeV4?.palette?.primary?.main        || "#1976d2";
  const P_DARK    = themeV4?.palette?.primary?.dark        || "#115293";
  const P_CONTRAST= themeV4?.palette?.primary?.contrastText|| "#fff";
  const RGB       = hexToRgb(PRIMARY);

  const textColor     = isDark ? "#8fa4be" : "#4a6070";
  const gridColor     = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.055)";
  const tooltipBg     = isDark ? "#0f1929" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.09)" : "#e0eaf2";
  const emptyBg       = isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)";

  const [initialDate, setInitialDate] = useState(new Date());
  const [finalDate, setFinalDate]     = useState(new Date());
  const [ticketsData, setTicketsData] = useState({ data: [] });
  const [isLoading, setIsLoading]     = useState(false);

  const { user }  = useContext(AuthContext);
  const companyId = user.companyId;

  useEffect(() => { if (companyId) fetchData(); }, [companyId]); // eslint-disable-line

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(
        `/dashboard/ticketsUsers?initialDate=${format(initialDate, "yyyy-MM-dd")}&finalDate=${format(finalDate, "yyyy-MM-dd")}&companyId=${companyId}`
      );
      setTicketsData(data);
    } catch { toast.error("Erro ao buscar informações dos tickets"); }
    finally  { setIsLoading(false); }
  };

  const names  = ticketsData?.data?.map(d => d.nome)       || [];
  const counts = ticketsData?.data?.map(d => d.quantidade)  || [];
  const maxVal = Math.max(...counts, 1);

  /* Gradiente horizontal: da esquerda (sólido) para a direita (suave) */
  const getGradient = (ctx, chartArea) => {
    const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
    gradient.addColorStop(0,   `rgba(${RGB}, ${isDark ? 0.85 : 0.75})`);
    gradient.addColorStop(0.6, `rgba(${RGB}, ${isDark ? 0.55 : 0.45})`);
    gradient.addColorStop(1,   `rgba(${RGB}, ${isDark ? 0.28 : 0.20})`);
    return gradient;
  };

  /* Cor de cada barra — mais opaca quanto maior o valor */
  const barColors = counts.map((v) => {
    const intensity = 0.30 + (v / maxVal) * 0.55;
    return `rgba(${RGB}, ${intensity})`;
  });

  const dataCharts = {
    labels: names,
    datasets: [{
      label: "Tickets",
      data: counts,
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return `rgba(${RGB}, 0.45)`;
        return getGradient(ctx, chartArea);
      },
      hoverBackgroundColor: PRIMARY,
      borderRadius: { topRight: 6, bottomRight: 6, topLeft: 2, bottomLeft: 2 },
      borderSkipped: false,
      barThickness: "flex",
      maxBarThickness: 28,
      /* borda esquerda colorida como acento */
      borderColor: PRIMARY,
      borderWidth: { left: 3, top: 0, right: 0, bottom: 0 },
    }],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: isDark ? "#f0f4f8" : "#0d1b2a",
        bodyColor: textColor,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        cornerRadius: 10,
        usePointStyle: true,
        callbacks: {
          label: item => `  ${item.formattedValue} tickets`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: gridColor, drawTicks: false },
        border: { display: false, dash: [4, 4] },
        ticks: {
          color: textColor,
          font: { size: 11, family: "'DM Sans', sans-serif" },
          precision: 0,
          padding: 6,
        },
      },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: textColor,
          font: { size: 12, family: "'DM Sans', sans-serif" },
          padding: 8,
        },
      },
    },
  };

  /* Altura dinâmica: pelo menos 300px, ou 46px por agente */
  const chartHeight = Math.max(300, names.length * 46);

  return (
    <Box>
      {/* ── Filtros ── */}
      <Grid container spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={5} md={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
            <DatePicker
              value={initialDate}
              onChange={v => setInitialDate(v)}
              label={i18n.t("dashboard.date.initialDate")}
              renderInput={params => (
                <TextField {...params} fullWidth size="small" sx={dpSx(isDark, PRIMARY)} />
              )}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} sm={5} md={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
            <DatePicker
              value={finalDate}
              onChange={v => setFinalDate(v)}
              label={i18n.t("dashboard.date.finalDate")}
              renderInput={params => (
                <TextField {...params} fullWidth size="small" sx={dpSx(isDark, PRIMARY)} />
              )}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} sm={2} md={4}>
          <Button
            onClick={fetchData}
            variant="contained"
            fullWidth
            disabled={isLoading}
            disableElevation
            startIcon={isLoading ? null : <FilterAlt sx={{ fontSize: 15 }} />}
            sx={{
              position: "relative", overflow: "hidden",
              backgroundColor: PRIMARY, color: P_CONTRAST,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700, fontSize: 13, letterSpacing: "0.02em",
              textTransform: "none", borderRadius: "10px", height: 40,
              border: `1px solid rgba(${RGB}, 0.55)`,
              boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 3px 12px rgba(${RGB}, 0.30)`,
              transition: "transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease",
              "&::before": {
                content: '""', position: "absolute",
                top: 0, left: "-75%", width: "50%", height: "100%",
                background: "linear-gradient(120deg,transparent,rgba(255,255,255,0.22),transparent)",
                transition: "left 0.4s ease", pointerEvents: "none",
              },
              "&:hover": {
                backgroundColor: P_DARK,
                transform: "translateY(-1px)",
                boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 6px 22px rgba(${RGB}, 0.42)`,
                "&::before": { left: "125%" },
              },
              "&:active": { transform: "translateY(0px)", boxShadow: `0 1px 6px rgba(${RGB}, 0.28)` },
              "&:disabled": { opacity: 0.5, boxShadow: "none" },
            }}
          >
            {isLoading ? <CircularProgress size={17} sx={{ color: P_CONTRAST }} /> : "Filtrar"}
          </Button>
        </Grid>
      </Grid>

      {/* ── Área do gráfico ── */}
      <Box sx={{ height: chartHeight, position: "relative" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress size={30} sx={{ color: PRIMARY }} />
          </Box>
        ) : counts.length > 0 ? (
          <Bar ref={chartRef} options={options} data={dataCharts} />
        ) : (
          <Box sx={{
            display: "flex", flexDirection: "column", justifyContent: "center",
            alignItems: "center", height: "100%", borderRadius: "12px",
            backgroundColor: emptyBg,
            border: `1px dashed ${isDark ? "rgba(255,255,255,0.08)" : "#dce6f0"}`, gap: 0.8
          }}>
            <Typography sx={{ fontSize: 13, color: isDark ? "#4d6478" : "#8fa0b0", fontWeight: 500 }}>
              Nenhum dado para o período selecionado
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: isDark ? "#253444" : "#cad5e0" }}>
              Ajuste as datas e clique em Filtrar
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatsUser;
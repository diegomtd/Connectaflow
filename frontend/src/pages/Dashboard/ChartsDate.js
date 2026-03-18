import React, { useEffect, useRef, useState, useContext } from "react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  Box, CircularProgress, Typography, alpha,
} from "@mui/material";
import api from "../../services/api";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useTheme as useThemeV4 } from "@material-ui/core/styles";
import { useTheme as useThemeV5 } from "@mui/material/styles";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

/* ── helpers ── */
function hexToRgb(hex = "") {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map(x => x + x).join("");
  const r = parseInt(c.substr(0, 2), 16) || 25;
  const g = parseInt(c.substr(2, 2), 16) || 118;
  const b = parseInt(c.substr(4, 2), 16) || 210;
  return `${r},${g},${b}`;
}

/* ══ ChartsDate ══════════════════════════════════════════════════════════════
   Props:
     dateFrom  {string}  "YYYY-MM-DD"  — controlado pelo Dashboard
     dateTo    {string}  "YYYY-MM-DD"  — controlado pelo Dashboard
   O componente NÃO mantém estado de datas próprio nem exibe filtros;
   ele apenas reage aos props e busca os dados quando eles mudam.
*/
export const ChartsDate = ({ dateFrom, dateTo }) => {
  const themeV4 = useThemeV4();
  const themeV5 = useThemeV5();
  const chartRef = useRef(null);

  const isDark    = themeV5?.palette?.mode === "dark" || themeV4?.palette?.type === "dark";
  const PRIMARY   = themeV4?.palette?.primary?.main         || "#1976d2";
  const RGB       = hexToRgb(PRIMARY);

  const textColor     = isDark ? "#8fa4be" : "#4a6070";
  const gridColor     = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.055)";
  const tooltipBg     = isDark ? "#0f1929" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.09)" : "#e0eaf2";
  const emptyBg       = isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)";

  const [ticketsData, setTicketsData] = useState({ data: [], count: 0 });
  const [isLoading,   setIsLoading]   = useState(false);

  const { user }  = useContext(AuthContext);
  const companyId = user.companyId;

  /* Re-busca sempre que dateFrom, dateTo ou companyId mudarem */
  useEffect(() => {
    if (companyId && dateFrom && dateTo) fetchData();
  }, [companyId, dateFrom, dateTo]); // eslint-disable-line

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(
        `/dashboard/ticketsDay?initialDate=${dateFrom}&finalDate=${dateTo}&companyId=${companyId}`
      );
      setTicketsData(data);
    } catch {
      toast.error("Erro ao buscar informações dos tickets");
    } finally {
      setIsLoading(false);
    }
  };

  /* Gradiente canvas */
  const getGradient = (ctx, chartArea) => {
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0,    `rgba(${RGB}, ${isDark ? 0.38 : 0.28})`);
    gradient.addColorStop(0.55, `rgba(${RGB}, ${isDark ? 0.10 : 0.07})`);
    gradient.addColorStop(1,    `rgba(${RGB}, 0)`);
    return gradient;
  };

  const labels = ticketsData?.data.length > 0
    ? ticketsData.data.map(d => d.horario != null ? `${d.horario}:00` : d.data)
    : [];
  const values = ticketsData?.data.length > 0
    ? ticketsData.data.map(d => d.total)
    : [];

  const dataCharts = {
    labels,
    datasets: [{
      label: "Atendimentos",
      data: values,
      borderColor: PRIMARY,
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return `rgba(${RGB}, 0.12)`;
        return getGradient(ctx, chartArea);
      },
      borderWidth: 2.5,
      tension: 0.45,
      fill: true,
      pointRadius: (ctx) => {
        const data = ctx.dataset.data;
        const max  = Math.max(...data);
        return data[ctx.dataIndex] === max ? 6 : 3;
      },
      pointHoverRadius: 7,
      pointBackgroundColor: PRIMARY,
      pointBorderColor: isDark ? "#0f1929" : "#ffffff",
      pointBorderWidth: 2.5,
      pointHoverBorderWidth: 3,
      pointHoverBackgroundColor: "#ffffff",
      pointHoverBorderColor: PRIMARY,
    }],
  };

  const options = {
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
          title: (items) => items[0]?.label || "",
          label: (item)  => `  ${item.formattedValue} atendimentos`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: textColor,
          font: { size: 11, family: "'DM Sans', sans-serif" },
          maxRotation: 0,
          maxTicksLimit: 10,
        },
      },
      y: {
        grid: { color: gridColor, drawTicks: false },
        border: { display: false, dash: [4, 4] },
        ticks: {
          color: textColor,
          font: { size: 11, family: "'DM Sans', sans-serif" },
          precision: 0,
          padding: 8,
        },
        beginAtZero: true,
      },
    },
    elements: {
      line: { capBezierPoints: true },
    },
  };

  return (
    <Box>
      {/* Contador discreto */}
      {ticketsData?.count > 0 && (
        <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 0.8 }}>
          <Box sx={{
            width: 7, height: 7, borderRadius: "50%", backgroundColor: PRIMARY,
            boxShadow: `0 0 0 3px rgba(${RGB}, 0.2)`
          }} />
          <Typography sx={{ fontSize: 12, color: isDark ? "#4d6478" : "#8fa0b0", fontWeight: 600 }}>
            {i18n.t("dashboard.users.totalLabel", { count: ticketsData.count })}
          </Typography>
        </Box>
      )}

      {/* ── Área do gráfico ── */}
      <Box sx={{ height: { xs: 160, sm: 190, md: 210 }, position: "relative" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress size={30} sx={{ color: PRIMARY }} />
          </Box>
        ) : values.length === 0 ? (
          <EmptyChart isDark={isDark} emptyBg={emptyBg} />
        ) : (
          <Line ref={chartRef} options={options} data={dataCharts} />
        )}
      </Box>
    </Box>
  );
};

/* ── Empty state ── */
const EmptyChart = ({ isDark, emptyBg }) => (
  <Box sx={{
    display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
    height: "100%", borderRadius: "12px", backgroundColor: emptyBg,
    border: `1px dashed ${isDark ? "rgba(255,255,255,0.08)" : "#dce6f0"}`, gap: 0.8
  }}>
    <Typography sx={{ fontSize: 13, color: isDark ? "#4d6478" : "#8fa0b0", fontWeight: 500 }}>
      Nenhum dado para o período selecionado
    </Typography>
    <Typography sx={{ fontSize: 11.5, color: isDark ? "#253444" : "#cad5e0" }}>
      Ajuste as datas e clique em Filtrar
    </Typography>
  </Box>
);

export default ChartsDate;
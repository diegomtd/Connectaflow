import React, {
  useState,
  useEffect,
  useReducer,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { toast } from "react-toastify";

import { makeStyles, useTheme as useMuiThemeV4 } from "@material-ui/core/styles";
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";

import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
import SearchIcon from "@material-ui/icons/Search";

import {
  Box as MuiBox,
  Grid,
  InputAdornment,
  Paper as MuiPaper,
  Stack,
  TextField,
  Typography as MuiTypography,
  alpha,
} from "@mui/material";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import FileModal from "../../components/FileModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import ForbiddenPage from "../../components/ForbiddenPage";

// ─── Estilos globais ──────────────────────────────────────────────────────────

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .fl-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .fl-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .fl-root { max-width: 100%; overflow-x: hidden; }

    @keyframes flFadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes flKpiIconGlow {
      0%   { box-shadow: 0 0 0 0   var(--kpi-glow); }
      50%  { box-shadow: 0 0 0 7px var(--kpi-glow); }
      100% { box-shadow: 0 0 0 0   transparent; }
    }

    .fl-animate { animation: flFadeSlideUp 0.36s ease both; }

    .fl-kpi-card { position: relative; overflow: hidden; }
    .fl-kpi-card::after {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--kpi-color); border-radius: 14px 14px 0 0;
      transform: scaleX(0); transform-origin: left center;
      transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
    }
    .fl-kpi-card:hover::after { transform: scaleX(1); }
    .fl-kpi-icon-box {
      transition: transform 0.24s cubic-bezier(0.34,1.56,0.64,1) !important;
      will-change: transform;
    }
    .fl-kpi-card:hover .fl-kpi-icon-box {
      transform: scale(1.22) rotate(10deg) !important;
      animation: flKpiIconGlow 0.6s ease forwards;
    }

    .fl-row:hover td { background: var(--fl-hover-row) !important; }

    .fl-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .fl-root ::-webkit-scrollbar-track { background: transparent; }
    .fl-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  `}</style>
);

// ─── usePalette ───────────────────────────────────────────────────────────────

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
      border:      "rgba(255,255,255,0.065)",
      divider:     "rgba(255,255,255,0.055)",
      textPrimary: "#f0f4f8",
      textSecond:  "#8fa4be",
      textMuted:   "#4d6478",
      hoverRow:    "rgba(255,255,255,0.03)",
      inputBg:     "rgba(255,255,255,0.04)",
      inputBorder: "rgba(255,255,255,0.12)",
      inputHover:  "rgba(255,255,255,0.22)",
      headBg:      "#0a1420",
    } : {
      pageBg:      "#f0f4f8",
      surfaceBg:   "#ffffff",
      border:      "#e3eaf2",
      divider:     "#e8eef4",
      textPrimary: "#0d1b2a",
      textSecond:  "#3d5166",
      textMuted:   "#8fa0b0",
      hoverRow:    "#f5f8fc",
      inputBg:     "rgba(0,0,0,0.018)",
      inputBorder: "#dbe4ed",
      inputHover:  "#a8b8c8",
      headBg:      "#f7fafd",
    };

    return {
      primary, isDark, ...t,
      chipBg:     alpha(primary, isDark ? 0.18 : 0.10),
      chipColor:  primary,
      kpiPrimary: { color: primary, bg: alpha(primary, isDark ? 0.16 : 0.09) },
      kpiSuccess: { color: success, bg: alpha(success, isDark ? 0.16 : 0.09) },
      kpiWarning: { color: warning, bg: alpha(warning, isDark ? 0.16 : 0.09) },
      kpiTeal:    { color: teal,    bg: alpha(teal,    isDark ? 0.16 : 0.09) },
      success, warning, danger, purple, teal,
    };
  }, [primary, isDark]);
};

// ─── KpiCard ──────────────────────────────────────────────────────────────────

const KpiCard = ({ title, value, hint, icon, colorCfg, p, delay = 0 }) => {
  const num = typeof value === "number" ? value : (parseInt(String(value).replace(/\D/g, ""), 10) || 0);
  const [disp, setDisp] = useState(0);

  useEffect(() => {
    if (num === 0) { setDisp(0); return; }
    const steps = 40, st = 900 / steps; let cur = 0;
    const t = setInterval(() => {
      cur += 1; setDisp(Math.round((num * cur) / steps));
      if (cur >= steps) { setDisp(num); clearInterval(t); }
    }, st);
    return () => clearInterval(t);
  }, [num]); // eslint-disable-line

  return (
    <MuiPaper
      elevation={0}
      className="fl-animate fl-kpi-card"
      style={{ "--kpi-color": colorCfg.color, "--kpi-glow": alpha(colorCfg.color, 0.35) }}
      sx={{
        p: { xs: "12px 14px 10px", sm: "16px 18px 13px" },
        borderRadius: "14px", border: `1px solid ${p.border}`,
        minHeight: { xs: 105, sm: 122 }, backgroundColor: p.surfaceBg,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        animationDelay: `${delay}ms`, cursor: "default",
        transition: "box-shadow 0.22s, transform 0.22s, border-color 0.22s",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: alpha(colorCfg.color, p.isDark ? 0.35 : 0.22),
          boxShadow: `0 8px 28px ${alpha(colorCfg.color, p.isDark ? 0.18 : 0.12)}`,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <MuiBox sx={{ flex: 1, minWidth: 0 }}>
          <MuiTypography sx={{
            color: p.textMuted, fontSize: { xs: 9.5, sm: 11 }, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1,
          }}>
            {title}
          </MuiTypography>
          <MuiTypography className="mono" sx={{
            color: p.textPrimary, fontSize: { xs: 24, sm: 29, md: 32 },
            lineHeight: 1.1, mt: { xs: 0.5, sm: 0.75 }, fontWeight: 700, letterSpacing: "-0.025em",
          }}>
            {disp.toLocaleString("pt-BR")}
          </MuiTypography>
        </MuiBox>
        <MuiBox className="fl-kpi-icon-box" sx={{
          width: { xs: 38, sm: 48 }, height: { xs: 38, sm: 48 }, borderRadius: "12px",
          backgroundColor: colorCfg.bg, color: colorCfg.color,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          border: `1.5px solid ${alpha(colorCfg.color, p.isDark ? 0.22 : 0.14)}`,
          boxShadow: `0 2px 10px ${alpha(colorCfg.color, p.isDark ? 0.18 : 0.10)}`,
        }}>
          {React.cloneElement(icon, { style: { fontSize: 23 } })}
        </MuiBox>
      </Stack>
      <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mt: 0.7 }}>
        <MuiBox sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: colorCfg.color, opacity: 0.65, flexShrink: 0 }} />
        <MuiTypography sx={{
          color: p.textMuted, fontSize: { xs: 10, sm: 11.5 },
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {hint}
        </MuiTypography>
      </Stack>
    </MuiPaper>
  );
};

// ─── makeStyles — apenas para componentes MUI v4 ─────────────────────────────

const useStyles = makeStyles((theme) => {
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";
  const border  = isDark ? "rgba(255,255,255,0.065)" : "#e3eaf2";
  const divider = isDark ? "rgba(255,255,255,0.055)" : "#e8eef4";
  const textSecond = isDark ? "#8fa4be" : "#3d5166";
  const textMuted  = isDark ? "#4d6478" : "#8fa0b0";
  const surfaceBg  = isDark ? "#0f1929" : "#ffffff";

  return {
    pageRoot: {
      display: "flex", flexDirection: "column", position: "relative",
      flex: 1, width: "100%", maxWidth: "100%",
      height: "calc(100% - 48px)", overflowY: "hidden",
      backgroundColor: isDark ? "#080e1a" : "#f0f4f8",
      transition: "background-color 0.3s ease",
    },
    contentArea: {
      padding: theme.spacing(2, 2.5, 2.5),
      overflowY: "auto", flex: 1,
      ...theme.scrollbarStyles,
      [theme.breakpoints.down("sm")]: { padding: theme.spacing(1.5, 1, 1.5) },
    },
    controlsBar: {
      marginBottom: theme.spacing(2), borderRadius: 14,
      border: `1px solid ${border}`,
      boxShadow: isDark ? "0 8px 22px rgba(0,0,0,0.35)" : "0 8px 22px rgba(15,23,42,0.08)",
      padding: theme.spacing(1.25), backgroundColor: surfaceBg, flexShrink: 0,
    },
    actionButton: {
      minHeight: 40, borderRadius: 10, fontWeight: 700, fontSize: "0.78rem",
      padding: theme.spacing(0.8, 2.2), textTransform: "none",
      position: "relative", overflow: "hidden", color: "#fff",
      boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 3px 12px ${alpha(primary, 0.30)}`,
      transition: "transform 0.18s, box-shadow 0.18s",
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 6px 22px ${alpha(primary, 0.42)}`,
      },
    },
    mainPaper: {
      flex: 1, overflowY: "auto", ...theme.scrollbarStyles,
      borderRadius: 14, border: `1px solid ${border}`,
      boxShadow: isDark ? "0 12px 26px rgba(0,0,0,0.45)" : "0 12px 26px rgba(17,24,39,0.09)",
      backgroundColor: surfaceBg,
    },
    tableHeaderCell: {
      fontWeight: 700, color: textMuted, fontSize: "0.72rem",
      textTransform: "uppercase", letterSpacing: "0.07em",
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : alpha(primary, 0.04),
      borderBottom: `1px solid ${divider}`,
    },
    tableRow: { transition: "background-color 0.15s" },
    tableCellText: { fontSize: "0.8rem", color: textSecond },
    tableCell: { borderBottom: `1px solid ${divider}` },
    actionIconButton: {
      border: `1px solid ${border}`, margin: "0 2px", borderRadius: 8, transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha(primary, 0.45), color: primary,
        backgroundColor: alpha(primary, isDark ? 0.1 : 0.05),
      },
    },
    deleteIconButton: {
      border: `1px solid ${border}`, margin: "0 2px", borderRadius: 8, transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha("#ef4444", 0.45), color: "#ef4444",
        backgroundColor: alpha("#ef4444", isDark ? 0.1 : 0.05),
      },
    },
    sectionLabel: {
      fontSize: 11, color: textMuted, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.09em",
    },
  };
});

// ─── EmptyState ───────────────────────────────────────────────────────────────

const EmptyState = ({ searchParam, p }) => {
  const isFiltered = searchParam && searchParam.length > 0;
  return (
    <MuiBox sx={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", py: { xs: 5, sm: 7 }, px: 3,
    }}>
      <MuiBox sx={{ mb: 3, opacity: p.isDark ? 0.88 : 1 }}>
        <svg width="180" height="148" viewBox="0 0 180 148" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="90" cy="136" rx="68" ry="7"
            fill={p.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} />
          {/* Pasta principal */}
          <path d="M34 52 C34 47.6 37.6 44 42 44 L78 44 L84 52 L138 52 C142.4 52 146 55.6 146 60 L146 108 C146 112.4 142.4 116 138 116 L42 116 C37.6 116 34 112.4 34 108 Z"
            fill={p.isDark ? "#141f30" : "#f0f6ff"}
            stroke={p.isDark ? "rgba(99,179,237,0.30)" : "#93c5fd"} strokeWidth="1.5" />
          {/* Aba da pasta */}
          <path d="M42 44 L78 44 L84 52 L42 52 Z"
            fill={p.isDark ? "rgba(99,179,237,0.18)" : "#dbeafe"}
            stroke={p.isDark ? "rgba(99,179,237,0.30)" : "#93c5fd"} strokeWidth="1.5" />
          {/* Linhas de arquivo simuladas */}
          <rect x="52" y="66" width="76" height="6" rx="3"
            fill={p.isDark ? "rgba(255,255,255,0.07)" : "#d6e8fb"} />
          <rect x="52" y="78" width="56" height="6" rx="3"
            fill={p.isDark ? "rgba(255,255,255,0.05)" : "#e3eef8"} />
          <rect x="52" y="90" width="66" height="6" rx="3"
            fill={p.isDark ? "rgba(255,255,255,0.05)" : "#e3eef8"} />
          <rect x="52" y="102" width="44" height="6" rx="3"
            fill={p.isDark ? "rgba(255,255,255,0.04)" : "#eaf2fb"} />
          {/* Ícone de adição */}
          <circle cx="132" cy="108" r="16"
            fill={p.isDark ? "#0f1929" : "#ffffff"}
            stroke={p.isDark ? "rgba(99,179,237,0.28)" : "#bfdbfe"} strokeWidth="1.5" />
          <line x1="132" y1="101" x2="132" y2="115" stroke={p.isDark ? "rgba(99,179,237,0.65)" : "#60a5fa"} strokeWidth="2" strokeLinecap="round" />
          <line x1="125" y1="108" x2="139" y2="108" stroke={p.isDark ? "rgba(99,179,237,0.65)" : "#60a5fa"} strokeWidth="2" strokeLinecap="round" />
          {/* Pontos decorativos */}
          <circle cx="30"  cy="46"  r="4" fill={p.isDark ? "rgba(99,179,237,0.14)" : "#dbeafe"} />
          <circle cx="152" cy="44"  r="3" fill={p.isDark ? "rgba(99,179,237,0.10)" : "#eff6ff"} />
          <circle cx="156" cy="116" r="4" fill={p.isDark ? "rgba(99,179,237,0.08)" : "#f0fdf4"} />
          <circle cx="26"  cy="112" r="3" fill={p.isDark ? "rgba(99,179,237,0.10)" : "#e0f2fe"} />
        </svg>
      </MuiBox>

      <MuiTypography sx={{
        fontSize: { xs: 15, sm: 16.5 }, fontWeight: 700,
        color: p.textPrimary, mb: 0.8, textAlign: "center",
      }}>
        {isFiltered ? "Nenhuma lista encontrada" : "Nenhuma lista cadastrada ainda"}
      </MuiTypography>

      <MuiTypography sx={{
        fontSize: 13, color: p.textMuted, textAlign: "center",
        maxWidth: 310, lineHeight: 1.6,
      }}>
        {isFiltered
          ? <>Sua busca por <MuiBox component="span" sx={{ color: p.primary, fontWeight: 600 }}>"{searchParam}"</MuiBox> não retornou resultados. Tente outro termo.</>
          : <>Clique em <MuiBox component="span" sx={{ color: p.primary, fontWeight: 700 }}>+ Adicionar</MuiBox> para criar sua primeira lista de arquivos.</>
        }
      </MuiTypography>

      {!isFiltered && (
        <MuiBox sx={{
          mt: 2.5, display: "inline-flex", alignItems: "center", gap: 0.8,
          px: 1.8, py: 0.7, borderRadius: "10px",
          backgroundColor: alpha(p.primary, p.isDark ? 0.1 : 0.06),
          border: `1px solid ${alpha(p.primary, p.isDark ? 0.22 : 0.15)}`,
        }}>
          <FolderOpenIcon style={{ fontSize: 14, color: p.primary }} />
          <MuiTypography sx={{ fontSize: 12, color: p.primary, fontWeight: 600 }}>
            Listas organizam arquivos para envio no atendimento
          </MuiTypography>
        </MuiBox>
      )}
    </MuiBox>
  );
};

// ─── Reducer (sem alteração) ──────────────────────────────────────────────────

const reducer = (state, action) => {
  if (action.type === "LOAD_FILES") {
    const files = action.payload;
    const newFiles = [];
    files.forEach((fileList) => {
      const idx = state.findIndex((s) => s.id === fileList.id);
      if (idx !== -1) state[idx] = fileList;
      else newFiles.push(fileList);
    });
    return [...state, ...newFiles];
  }
  if (action.type === "UPDATE_FILES") {
    const fileList = action.payload;
    const idx = state.findIndex((s) => s.id === fileList.id);
    if (idx !== -1) { state[idx] = fileList; return [...state]; }
    return [fileList, ...state];
  }
  if (action.type === "DELETE_FILE") {
    const idx = state.findIndex((s) => s.id === action.payload);
    if (idx !== -1) state.splice(idx, 1);
    return [...state];
  }
  if (action.type === "RESET") return [];
};

// ─── inputSx ─────────────────────────────────────────────────────────────────

const inputSx = (p) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: 12.5,
    fontFamily: "'DM Sans', sans-serif",
    backgroundColor: p.inputBg,
    overflow: "hidden",
    height: 40,
    "& input": {
      padding: "0 8px",
      height: "100%",
      boxSizing: "border-box",
      fontSize: 12.5,
      fontFamily: "'DM Sans', sans-serif",
      lineHeight: "40px",
      color: p.isDark ? "#ffffff" : undefined,
    },
    "& fieldset": { borderColor: p.inputBorder },
    "&:hover fieldset": { borderColor: p.isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8" },
    "&.Mui-focused fieldset": { borderColor: p.primary, borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": {
    fontSize: 12.5,
    fontFamily: "'DM Sans', sans-serif",
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

// ─── FileLists ────────────────────────────────────────────────────────────────

const FileLists = () => {
  const classes = useStyles();
  const p       = usePalette();

  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading]                     = useState(false);
  const [pageNumber, setPageNumber]               = useState(1);
  const [hasMore, setHasMore]                     = useState(false);
  const [selectedFileList, setSelectedFileList]   = useState(null);
  const [deletingFileList, setDeletingFileList]   = useState(null);
  const [confirmModalOpen, setConfirmModalOpen]   = useState(false);
  const [searchParam, setSearchParam]             = useState("");
  const [files, dispatch]                         = useReducer(reducer, []);
  const [fileListModalOpen, setFileListModalOpen] = useState(false);

  // ── carga com debounce ──
  const fetchFileLists = useCallback(async () => {
    try {
      const { data } = await api.get("/files/", { params: { searchParam, pageNumber } });
      dispatch({ type: "LOAD_FILES", payload: data.files });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber]);

  useEffect(() => { dispatch({ type: "RESET" }); setPageNumber(1); }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delay = setTimeout(() => { fetchFileLists(); }, 500);
    return () => clearTimeout(delay);
  }, [searchParam, pageNumber, fetchFileLists]);

  // ── socket ──
  useEffect(() => {
    const onFileEvent = (data) => {
      if (data.action === "update" || data.action === "create")
        dispatch({ type: "UPDATE_FILES", payload: data.files });
      if (data.action === "delete")
        dispatch({ type: "DELETE_FILE", payload: +data.fileId });
    };
    socket.on(`company-${user.companyId}-file`, onFileEvent);
    return () => socket.off(`company-${user.companyId}-file`, onFileEvent);
  }, [socket, user.companyId]);

  const handleOpenFileListModal  = () => { setSelectedFileList(null); setFileListModalOpen(true); };
  const handleCloseFileListModal = () => { setSelectedFileList(null); setFileListModalOpen(false); };
  const handleSearch             = (e) => setSearchParam(e.target.value.toLowerCase());
  const handleEditFileList       = (fl) => { setSelectedFileList(fl); setFileListModalOpen(true); };

  const handleDeleteFileList = async (fileListId) => {
    try {
      await api.delete(`/files/${fileListId}`);
      toast.success(i18n.t("files.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingFileList(null);
    setSearchParam("");
    setPageNumber(1);
    dispatch({ type: "RESET" });
    setPageNumber(1);
    await fetchFileLists();
  };

  const loadMore     = () => setPageNumber((prev) => prev + 1);
  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) loadMore();
  };

  return (
    <div
      className="fl-root"
      style={{
        display: "flex", flexDirection: "column", position: "relative",
        flex: 1, width: "100%", maxWidth: "100%",
        height: "calc(100% - 48px)", overflowY: "hidden",
        backgroundColor: p.pageBg,
        transition: "background-color 0.3s ease",
        "--fl-hover-row": p.hoverRow,
      }}
    >
      <FontStyle />

      <ConfirmationModal
        title={deletingFileList && `${i18n.t("files.confirmationModal.deleteTitle")}`}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteFileList(deletingFileList.id)}
      >
        {i18n.t("files.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <FileModal
        open={fileListModalOpen}
        onClose={handleCloseFileListModal}
        reload={fetchFileLists}
        aria-labelledby="form-dialog-title"
        fileListId={selectedFileList && selectedFileList.id}
      />

      {user.profile === "user" ? (
        <ForbiddenPage />
      ) : (
        <>
          {/* ══ CABEÇALHO CORPORATIVO ══════════════════════════════════════ */}
          <MuiBox sx={{
            background: p.isDark
              ? `linear-gradient(135deg, #0d1b2e 0%, #0a1520 60%, ${alpha(p.primary, 0.12)} 100%)`
              : `linear-gradient(135deg, ${p.primary} 0%, ${alpha(p.primary, 0.82)} 55%, ${alpha("#0ea5e9", 0.9)} 100%)`,
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
              background: p.isDark ? alpha(p.primary, 0.08) : alpha("#fff", 0.08),
              pointerEvents: "none",
            }} />
            <MuiBox sx={{
              position: "absolute", bottom: -30, left: "35%",
              width: { xs: 100, md: 140 }, height: { xs: 100, md: 140 },
              borderRadius: "50%",
              background: p.isDark ? alpha("#0ea5e9", 0.06) : alpha("#fff", 0.06),
              pointerEvents: "none",
            }} />

            <MuiBox sx={{ position: "relative", zIndex: 1 }}>
              {/* Breadcrumb */}
              <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: 0.8 }}>
                <MuiTypography sx={{
                  fontSize: { xs: 10, sm: 11 }, fontWeight: 600, letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: p.isDark ? alpha(p.primary, 0.8) : alpha("#fff", 0.7),
                }}>
                  Arquivos
                </MuiTypography>
                <MuiBox sx={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: p.isDark ? alpha(p.primary, 0.5) : alpha("#fff", 0.45) }} />
                <MuiTypography sx={{
                  fontSize: { xs: 10, sm: 11 }, fontWeight: 600, letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: p.isDark ? alpha("#fff", 0.5) : alpha("#fff", 0.55),
                }}>
                  Listas de arquivos
                </MuiTypography>
              </Stack>

              {/* Título */}
              <MuiTypography sx={{
                fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
                letterSpacing: "-0.025em", lineHeight: 1,
                color: p.isDark ? p.textPrimary : "#ffffff",
              }}>
                {i18n.t("files.title")}
              </MuiTypography>

              {/* Subtítulo */}
              <MuiTypography sx={{
                fontSize: { xs: 12, sm: 13.5 }, mt: 0.6,
                color: p.isDark ? p.textMuted : alpha("#fff", 0.72),
                display: { xs: "none", sm: "block" },
              }}>
                Organize suas listas de arquivos com acesso rápido e gestão centralizada.
              </MuiTypography>

              {/* Meta tags */}
              <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.2, sm: 1.5 }, flexWrap: "wrap", gap: 0.8 }}>
                {[
                  { icon: <FiberManualRecordIcon style={{ fontSize: 8 }} />,  label: "Atualizado agora" },
                  { icon: <FolderOpenIcon        style={{ fontSize: 12 }} />, label: `${files.length} listas cadastradas` },
                ].map((tag, i) => (
                  <MuiBox key={i} sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.6,
                    px: 1.2, py: 0.4, borderRadius: "20px",
                    backgroundColor: p.isDark ? alpha(p.primary, 0.14) : alpha("#fff", 0.15),
                    border: `1px solid ${p.isDark ? alpha(p.primary, 0.22) : alpha("#fff", 0.22)}`,
                    backdropFilter: "blur(8px)",
                  }}>
                    <MuiBox sx={{ color: p.isDark ? p.primary : "#fff", display: "flex" }}>{tag.icon}</MuiBox>
                    <MuiTypography sx={{ fontSize: { xs: 10, sm: 11 }, fontWeight: 600, color: p.isDark ? alpha("#fff", 0.8) : "#fff" }}>
                      {tag.label}
                    </MuiTypography>
                  </MuiBox>
                ))}
              </Stack>
            </MuiBox>
          </MuiBox>

          {/* ══ CONTEÚDO ═════════════════════════════════════════════════ */}
          <Box className={classes.contentArea}>

            {/* ── KPI Cards ── */}
            <Grid container spacing={{ xs: 1, sm: 1.5 }} sx={{ mb: { xs: 1, sm: 1.5 } }}>
              {[
                { title: "Total de listas", value: files.length, hint: "Cadastradas no sistema",  icon: <FolderOpenIcon />,  colorCfg: p.kpiPrimary, delay: 40  },
                { title: "Listas ativas",   value: files.length, hint: "Disponíveis para uso",    icon: <PlaylistAddIcon />, colorCfg: p.kpiSuccess, delay: 80  },
              ].map((card, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <KpiCard {...card} p={p} />
                </Grid>
              ))}
            </Grid>

            {/* ── Busca + Botão ── */}
            <Paper elevation={0} className={`fl-animate ${classes.controlsBar}`}
              style={{ animationDelay: "120ms" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8} md={9}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={i18n.t("contacts.searchPlaceholder")}
                    type="search"
                    value={searchParam}
                    onChange={handleSearch}
                    size="small"
                    sx={inputSx(p)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon style={{ fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleOpenFileListModal}
                    className={classes.actionButton}
                  >
                    {i18n.t("files.buttons.add")}
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* ── Tabela principal ── */}
            <Paper
              className={`fl-animate ${classes.mainPaper}`}
              variant="outlined"
              onScroll={handleScroll}
              style={{ animationDelay: "180ms" }}
            >
              {/* Cabeçalho de seção com chip contador */}
              <MuiBox sx={{
                px: { xs: "14px", sm: "16px", md: "18px" },
                pt: { xs: "13px", sm: "15px", md: "16px" },
                pb: 1.2,
                borderBottom: `1px solid ${p.divider}`,
                backgroundColor: p.isDark ? alpha("#000", 0.15) : alpha(p.primary, 0.015),
                display: "flex", flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" },
                gap: 1,
              }}>
                <MuiBox>
                  <MuiTypography sx={{
                    fontSize: { xs: 9.5, sm: 11 }, color: p.textMuted, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.09em",
                  }}>
                    Biblioteca de arquivos
                  </MuiTypography>
                  <MuiTypography sx={{ fontSize: { xs: 13, sm: 14.5 }, color: p.textPrimary, fontWeight: 700, mt: 0.2 }}>
                    {i18n.t("files.title")}
                  </MuiTypography>
                </MuiBox>
                {files.length > 0 && (
                  <MuiBox sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.6,
                    px: 1.2, py: 0.45, borderRadius: "8px",
                    backgroundColor: p.chipBg,
                    border: `1px solid ${alpha(p.primary, p.isDark ? 0.25 : 0.16)}`,
                  }}>
                    <MuiBox sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: p.primary, boxShadow: `0 0 0 3px ${alpha(p.primary, 0.2)}` }} />
                    <MuiTypography sx={{ fontSize: 11.5, color: p.chipColor, fontWeight: 600 }}>
                      {files.length.toLocaleString("pt-BR")} {files.length === 1 ? "lista" : "listas"}
                    </MuiTypography>
                  </MuiBox>
                )}
              </MuiBox>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    {[
                      { label: i18n.t("files.table.name"),    icon: <FolderOpenIcon  style={{ fontSize: 13 }} /> },
                      { label: i18n.t("files.table.actions"), icon: null },
                    ].map((col) => (
                      <TableCell key={col.label} align="center" className={classes.tableHeaderCell}>
                        {col.icon ? (
                          <MuiBox sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, justifyContent: "center" }}>
                            <MuiBox sx={{ color: p.primary, opacity: 0.7, display: "flex", alignItems: "center" }}>
                              {col.icon}
                            </MuiBox>
                            {col.label}
                          </MuiBox>
                        ) : col.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {files.map((fileList) => (
                    <TableRow key={fileList.id} className={`fl-row ${classes.tableRow}`}
                      style={{ "--fl-hover-row": p.hoverRow }}>
                      <TableCell align="center" className={`${classes.tableCellText} ${classes.tableCell}`}>
                        {fileList.name}
                      </TableCell>
                      <TableCell align="center" className={classes.tableCell}>
                        <IconButton
                          size="small"
                          className={classes.actionIconButton}
                          onClick={() => handleEditFileList(fileList)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          className={classes.deleteIconButton}
                          onClick={() => { setConfirmModalOpen(true); setDeletingFileList(fileList); }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                  {loading && <TableRowSkeleton columns={2} />}

                  {/* ── Empty state com ilustração SVG ── */}
                  {!loading && files.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} align="center"
                        style={{ padding: 0, borderBottom: "none" }}>
                        <EmptyState searchParam={searchParam} p={p} />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>

          </Box>
        </>
      )}
    </div>
  );
};

export default FileLists;
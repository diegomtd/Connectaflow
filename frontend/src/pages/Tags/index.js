/**
 * Tags — Visual 100% fiel ao Dashboard
 * Alterações aplicadas:
 * 1. Empty state com ilustração SVG temática + texto explicativo (padrão Reports/Quickemessages)
 * 2. Ícones nas colunas do cabeçalho da tabela (padrão Reports)
 * 3. Toda a lógica original 100% preservada
 */

import React, {
  useState, useEffect, useReducer, useContext, useMemo,
} from "react";
import { toast } from "react-toastify";

import {
  Box, Button, Grid, IconButton, InputAdornment, Paper, Stack,
  Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Tooltip, Typography, alpha,
} from "@mui/material";
import {
  Add, DeleteOutline, Edit, FiberManualRecord,
  LabelOutlined, Search, StyleOutlined,
  Tag, Contacts, MoreHoriz, Palette,
} from "@mui/icons-material";
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";
import { useTheme as useMuiThemeV4 } from "@material-ui/core/styles";

import api               from "../../services/api";
import { i18n }          from "../../translate/i18n";
import TableRowSkeleton  from "../../components/TableRowSkeleton";
import TagModal          from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError        from "../../errors/toastError";
import { AuthContext }   from "../../context/Auth/AuthContext";

// ─── Reducer (original intocado) ─────────────────────────────────────────────

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_TAGS":
      return [...state, ...action.payload];
    case "UPDATE_TAGS": {
      const tag = action.payload;
      const idx = state.findIndex((s) => s.id === tag.id);
      if (idx !== -1) { state[idx] = tag; return [...state]; }
      return [tag, ...state];
    }
    case "DELETE_TAGS":
      return state.filter((tag) => tag.id !== action.payload);
    case "RESET":
      return [];
    default:
      return state;
  }
};

// ─── FontStyle ────────────────────────────────────────────────────────────────

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .tg-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .tg-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .tg-root { max-width: 100%; overflow-x: hidden; }

    @keyframes tgFadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: none; }
    }
    .tg-animate { animation: tgFadeSlideUp 0.36s ease both; }

    .tg-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .tg-root ::-webkit-scrollbar-track { background: transparent; }
    .tg-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }

    .tg-row-hover:hover { background: var(--tg-hover-row) !important; }
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

const SubPaper = ({ children, sx = {}, p, onScroll, className = "" }) => (
  <Paper elevation={0} onScroll={onScroll} className={className} sx={{
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

// ─── EmptyState — ilustração SVG temática de tags/etiquetas ──────────────────

const EmptyState = ({ searchParam, p }) => {
  const isFiltered = searchParam && searchParam.length > 0;
  return (
    <Box sx={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", py: { xs: 5, sm: 7 }, px: 3,
    }}>
      <Box sx={{ mb: 3, opacity: p.isDark ? 0.88 : 1 }}>
        <svg width="180" height="148" viewBox="0 0 180 148" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="90" cy="136" rx="68" ry="7"
            fill={p.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} />
          <rect x="28" y="20" width="124" height="100" rx="12"
            fill={p.isDark ? "#141f30" : "#f0f6ff"}
            stroke={p.isDark ? "rgba(255,255,255,0.08)" : "#c7ddf7"} strokeWidth="1.5" />
          <rect x="48" y="38" width="84" height="7" rx="3.5"
            fill={p.isDark ? "rgba(255,255,255,0.07)" : "#d6e8fb"} />
          <rect x="48" y="52" width="64" height="6" rx="3"
            fill={p.isDark ? "rgba(255,255,255,0.05)" : "#e3eef8"} />
          <rect x="48" y="64" width="72" height="6" rx="3"
            fill={p.isDark ? "rgba(255,255,255,0.05)" : "#e3eef8"} />
          <rect x="44" y="80" width="52" height="20" rx="10"
            fill={p.isDark ? "rgba(99,179,237,0.22)" : "#bfdbfe"}
            stroke={p.isDark ? "rgba(99,179,237,0.40)" : "#93c5fd"} strokeWidth="1.2" />
          <circle cx="55" cy="90" r="3.5"
            fill={p.isDark ? "rgba(99,179,237,0.7)" : "#60a5fa"} />
          <rect x="62" y="86.5" width="26" height="7" rx="3.5"
            fill={p.isDark ? "rgba(99,179,237,0.4)" : "#93c5fd"} />
          <rect x="104" y="80" width="40" height="18" rx="9"
            fill={p.isDark ? "rgba(167,139,250,0.2)" : "#ddd6fe"}
            stroke={p.isDark ? "rgba(167,139,250,0.35)" : "#c4b5fd"} strokeWidth="1.2" />
          <circle cx="114" cy="89" r="3"
            fill={p.isDark ? "rgba(167,139,250,0.65)" : "#a78bfa"} />
          <rect x="120" y="85.5" width="16" height="7" rx="3.5"
            fill={p.isDark ? "rgba(167,139,250,0.38)" : "#c4b5fd"} />
          <rect x="60" y="108" width="36" height="16" rx="8"
            fill={p.isDark ? "rgba(52,211,153,0.18)" : "#d1fae5"}
            stroke={p.isDark ? "rgba(52,211,153,0.32)" : "#6ee7b7"} strokeWidth="1.2" />
          <circle cx="70" cy="116" r="2.8"
            fill={p.isDark ? "rgba(52,211,153,0.6)" : "#34d399"} />
          <rect x="76" y="112.5" width="12" height="7" rx="3.5"
            fill={p.isDark ? "rgba(52,211,153,0.35)" : "#6ee7b7"} />
          <rect x="104" y="106" width="32" height="16" rx="8"
            fill={p.isDark ? "rgba(251,191,36,0.16)" : "#fef3c7"}
            stroke={p.isDark ? "rgba(251,191,36,0.30)" : "#fcd34d"} strokeWidth="1.2" />
          <circle cx="114" cy="114" r="2.8"
            fill={p.isDark ? "rgba(251,191,36,0.6)" : "#fbbf24"} />
          <rect x="120" y="110.5" width="10" height="7" rx="3.5"
            fill={p.isDark ? "rgba(251,191,36,0.35)" : "#fcd34d"} />
          <circle cx="136" cy="35" r="14"
            fill={p.isDark ? "#0f1929" : "#ffffff"}
            stroke={p.isDark ? "rgba(255,255,255,0.09)" : "#d0e4f7"} strokeWidth="1.5" />
          <path d="M130 35 L136 29 L142 29 L142 35 L136 41 Z" fill="none"
            stroke={p.isDark ? "rgba(99,179,237,0.65)" : "#60a5fa"}
            strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="139.5" cy="32.5" r="1.8"
            fill={p.isDark ? "rgba(99,179,237,0.65)" : "#60a5fa"} />
          <circle cx="36"  cy="20"  r="4" fill={p.isDark ? "rgba(99,179,237,0.18)" : "#bfdbfe"} />
          <circle cx="152" cy="110" r="5" fill={p.isDark ? "rgba(99,179,237,0.08)" : "#eff6ff"} />
          <circle cx="32"  cy="108" r="3" fill={p.isDark ? "rgba(99,179,237,0.10)" : "#e0f2fe"} />
        </svg>
      </Box>

      <Typography sx={{
        fontSize: { xs: 15, sm: 16.5 }, fontWeight: 700,
        color: p.textPrimary, mb: 0.8, textAlign: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {isFiltered ? "Nenhuma tag encontrada" : "Nenhuma tag cadastrada ainda"}
      </Typography>

      <Typography sx={{
        fontSize: 13, color: p.textMuted, textAlign: "center",
        maxWidth: 310, lineHeight: 1.6,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {isFiltered ? (
          <>Sua busca por <Box component="span" sx={{ color: p.primary, fontWeight: 600 }}>"{searchParam}"</Box> não retornou resultados. Tente outro termo.</>
        ) : (
          <>Crie sua primeira tag clicando em <Box component="span" sx={{ color: p.primary, fontWeight: 700 }}>+ Nova Tag</Box> e comece a organizar seus atendimentos com marcações coloridas.</>
        )}
      </Typography>

      {!isFiltered && (
        <Box sx={{
          mt: 2.5, display: "inline-flex", alignItems: "center", gap: 0.8,
          px: 1.8, py: 0.7, borderRadius: "10px",
          backgroundColor: alpha(p.primary, p.isDark ? 0.1 : 0.06),
          border: `1px solid ${alpha(p.primary, p.isDark ? 0.22 : 0.15)}`,
        }}>
          <LabelOutlined sx={{ fontSize: 14, color: p.primary }} />
          <Typography sx={{ fontSize: 12, color: p.primary, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
            Tags ajudam a segmentar e filtrar atendimentos
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// ─── Tags ─────────────────────────────────────────────────────────────────────

const Tags = () => {
  const p = usePalette();
  const { user, socket } = useContext(AuthContext);

  const [loading,          setLoading]          = useState(false);
  const [pageNumber,       setPageNumber]       = useState(1);
  const [hasMore,          setHasMore]          = useState(false);
  const [selectedTag,      setSelectedTag]      = useState(null);
  const [deletingTag,      setDeletingTag]      = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam,      setSearchParam]      = useState("");
  const [tags,             dispatch]            = useReducer(reducer, []);
  const [tagModalOpen,     setTagModalOpen]     = useState(false);

  const thCellSx = {
    fontWeight: 700,
    color: p.textMuted,
    backgroundColor: p.surfaceBg2 || p.surfaceBg,
    borderBottom: `1px solid ${p.divider}`,
    fontSize: "0.72rem",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    py: 1.1,
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
  };
  const tdCellSx = {
    fontSize: "0.78rem",
    color: p.textSecond,
    py: 0.9,
    borderBottom: `1px solid ${p.divider}`,
  };

  useEffect(() => {
    if (pageNumber > 0) {
      setLoading(true);
      const fetchMoreTags = async () => {
        try {
          const { data } = await api.get("/tags/", {
            params: { searchParam, pageNumber, kanban: 0 },
          });
          dispatch({ type: "LOAD_TAGS", payload: data.tags });
          setHasMore(data.hasMore);
        } catch (err) {
          toastError(err);
        } finally {
          setLoading(false);
        }
      };
      fetchMoreTags();
    }
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const onCompanyTags = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_TAGS", payload: data.tag });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_TAGS", payload: +data.tagId });
      }
    };
    socket.on(`company${user.companyId}-tag`, onCompanyTags);
    return () => socket.off(`company${user.companyId}-tag`, onCompanyTags);
  }, [socket, user.companyId]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
    setPageNumber(1);
    dispatch({ type: "RESET" });
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await api.delete(`/tags/${tagId}`);
      toast.success(i18n.t("tags.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingTag(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const columns = [
    { label: i18n.t("tags.table.id"),       align: "center", icon: <Tag       sx={{ fontSize: 13 }} /> },
    { label: i18n.t("tags.table.name"),     align: "center", icon: <Palette   sx={{ fontSize: 13 }} /> },
    { label: i18n.t("tags.table.contacts"), align: "center", icon: <Contacts  sx={{ fontSize: 13 }} /> },
    { label: i18n.t("tags.table.actions"),  align: "center", icon: <MoreHoriz sx={{ fontSize: 13 }} /> },
  ];

  return (
    <Box
      className="tg-root"
      style={{ "--tg-hover-row": p.hoverRow }}
      sx={{
        minHeight: "calc(100% - 48px)",
        backgroundColor: p.pageBg,
        transition: "background-color 0.3s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <FontStyle />

      {/* ── Modais ── */}
      <ConfirmationModal
        title={deletingTag && `${i18n.t("tags.confirmationModal.deleteTitle")}`}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteTag(deletingTag.id)}
      >
        {i18n.t("tags.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <TagModal
        open={tagModalOpen}
        onClose={() => { setSelectedTag(null); setTagModalOpen(false); }}
        aria-labelledby="form-dialog-title"
        tagId={selectedTag && selectedTag.id}
        kanban={0}
      />

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
              Tags
            </Typography>
          </Stack>

          <Typography sx={{
            fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
            letterSpacing: "-0.025em", lineHeight: 1,
            color: p.isDark ? p.textPrimary : "#ffffff",
          }}>
            {i18n.t("tags.title")}
          </Typography>

          <Typography sx={{
            fontSize: { xs: 12, sm: 13.5 }, mt: 0.6,
            color: p.isDark ? p.textMuted : alpha("#fff", 0.72),
            display: { xs: "none", sm: "block" },
          }}>
            Organize contatos com marcações padronizadas para segmentar atendimentos.
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.2, sm: 1.5 }, flexWrap: "wrap", gap: 0.8 }}>
            {[
              { icon: <FiberManualRecord sx={{ fontSize: 8 }} />, label: "Atualizado agora"    },
              { icon: <LabelOutlined    sx={{ fontSize: 12 }} />, label: `${tags.length} tags` },
              { icon: <StyleOutlined    sx={{ fontSize: 12 }} />, label: "Kanban desativado"   },
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
        <SubPaper p={p} className="tg-animate" sx={{ p: { xs: "12px 14px", sm: "14px 18px" } }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={8} md={9}>
              <TextField
                fullWidth
                placeholder={i18n.t("contacts.searchPlaceholder")}
                type="search"
                value={searchParam}
                onChange={handleSearch}
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
                onClick={() => { setSelectedTag(null); setTagModalOpen(true); }}
                sx={{
                  position: "relative", overflow: "hidden",
                  borderRadius: "10px", height: 40,
                  fontWeight: 700, fontSize: 13,
                  textTransform: "none",
                  backgroundColor: p.primary, color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 3px 12px ${alpha(p.primary, 0.30)}`,
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
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
                {i18n.t("tags.buttons.add")}
              </Button>
            </Grid>
          </Grid>
        </SubPaper>

        {/* ── Tabela ── */}
        <SubPaper
          p={p}
          onScroll={handleScroll}
          sx={{ flex: 1, overflow: "hidden", p: 0 }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            sx={{
              px: { xs: "14px", sm: "16px", md: "18px" },
              pt: { xs: "13px", sm: "15px", md: "16px" },
              pb: 1.2,
            }}
          >
            <Box>
              <SectionLabel p={p}>Lista de Tags</SectionLabel>
              <Typography sx={{ fontSize: { xs: 13, sm: 14.5 }, color: p.textPrimary, fontWeight: 700, mt: 0.2 }}>
                Tags cadastradas
              </Typography>
            </Box>
            {tags.length > 0 && (
              <Box sx={{
                display: "inline-flex", alignItems: "center", gap: 0.6,
                px: 1.2, py: 0.45, borderRadius: "8px",
                backgroundColor: alpha(p.primary, p.isDark ? 0.18 : 0.10),
                border: `1px solid ${alpha(p.primary, p.isDark ? 0.25 : 0.16)}`,
              }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: p.primary, boxShadow: `0 0 0 3px ${alpha(p.primary, 0.2)}` }} />
                <Typography sx={{ fontSize: 11.5, color: p.primary, fontWeight: 600 }}>
                  {tags.length.toLocaleString("pt-BR")} tag{tags.length !== 1 ? "s" : ""}
                </Typography>
              </Box>
            )}
          </Stack>

          <Box sx={{ height: "1px", backgroundColor: p.divider, mx: { xs: "14px", sm: "16px", md: "18px" } }} />

          <Box sx={{ overflowY: "auto", maxHeight: "60vh", WebkitOverflowScrolling: "touch" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col.label} align={col.align} sx={thCellSx}>
                      <Stack
                        direction="row" spacing={0.5} alignItems="center"
                        justifyContent={col.align === "center" ? "center" : "flex-start"}
                      >
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
                {tags.map((tag) => (
                  <TableRow
                    key={tag.id}
                    className="tg-row-hover"
                    sx={{
                      "& td": { transition: "background 0.13s" },
                      "&:nth-of-type(even)": {
                        backgroundColor: p.isDark ? alpha("#fff", 0.015) : alpha(p.primary, 0.012),
                      },
                    }}
                  >
                    <TableCell align="center" sx={tdCellSx}>
                      <Typography className="mono" sx={{ fontSize: 12, color: p.textMuted, fontWeight: 600 }}>
                        #{tag.id}
                      </Typography>
                    </TableCell>

                    <TableCell align="center" sx={tdCellSx}>
                      <Box sx={{
                        display: "inline-flex", alignItems: "center", gap: 0.7,
                        px: 1.1, py: 0.3, borderRadius: "7px",
                        backgroundColor: tag.color,
                        boxShadow: `0 2px 8px ${alpha(tag.color || "#000", 0.35)}`,
                      }}>
                        <Typography sx={{
                          fontSize: 11.5, fontWeight: 700, color: "#fff",
                          textShadow: "0 1px 2px rgba(0,0,0,0.25)",
                          letterSpacing: "0.02em",
                        }}>
                          {tag.name}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell align="center" sx={tdCellSx}>
                      <Box sx={{
                        display: "inline-flex", alignItems: "center",
                        px: 1, py: 0.25, borderRadius: "6px",
                        backgroundColor: alpha(p.primary, p.isDark ? 0.14 : 0.07),
                        border: `1px solid ${alpha(p.primary, p.isDark ? 0.22 : 0.14)}`,
                      }}>
                        <Typography className="mono" sx={{ fontSize: 11, fontWeight: 700, color: p.primary }}>
                          {tag?.contacts?.length ?? 0} contatos
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell align="center" sx={tdCellSx}>
                      <Stack direction="row" spacing={0.4} justifyContent="center">
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => { setSelectedTag(tag); setTagModalOpen(true); }}
                            sx={{
                              p: 0.55, borderRadius: "7px",
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
                            <Edit sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            onClick={() => { setConfirmModalOpen(true); setDeletingTag(tag); }}
                            sx={{
                              p: 0.55, borderRadius: "7px",
                              color: p.danger,
                              backgroundColor: alpha(p.danger, p.isDark ? 0.12 : 0.07),
                              border: `1px solid ${alpha(p.danger, p.isDark ? 0.22 : 0.14)}`,
                              transition: "all 0.16s",
                              "&:hover": {
                                backgroundColor: alpha(p.danger, p.isDark ? 0.22 : 0.14),
                                transform: "translateY(-1px)",
                              },
                            }}
                          >
                            <DeleteOutline sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

                {loading && <TableRowSkeleton key="skeleton" columns={4} />}

                {!loading && tags.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 0, borderBottom: "none" }}>
                      <EmptyState searchParam={searchParam} p={p} />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </SubPaper>
      </Box>
    </Box>
  );
};

export default Tags;